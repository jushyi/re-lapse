const functions = require('firebase-functions');
const admin = require('firebase-admin');

// Initialize Firebase Admin SDK
admin.initializeApp();

/**
 * Reveal all developing photos for a user and schedule next reveal
 * @param {string} userId - User ID
 * @param {Timestamp} now - Current timestamp
 * @returns {Promise<object>} - Result of reveal operation
 */
async function revealUserPhotos(userId, now) {
  console.log(`revealUserPhotos: Processing user ${userId}`);

  // Query developing photos for this user
  const photosSnapshot = await admin.firestore()
    .collection('photos')
    .where('userId', '==', userId)
    .where('status', '==', 'developing')
    .get();

  if (photosSnapshot.empty) {
    console.log(`revealUserPhotos: No developing photos for user ${userId}`);
  } else {
    console.log(`revealUserPhotos: Revealing ${photosSnapshot.size} photos for user ${userId}`);

    // Update all photos to revealed
    const batch = admin.firestore().batch();
    photosSnapshot.docs.forEach((doc) => {
      batch.update(doc.ref, {
        status: 'revealed',
        revealedAt: admin.firestore.FieldValue.serverTimestamp(),
      });
    });
    await batch.commit();
  }

  // Calculate next reveal time (0-5 minutes from now)
  const randomMinutes = Math.floor(Math.random() * 6); // 0-5 minutes
  const nextRevealMs = now.toMillis() + (randomMinutes * 60 * 1000);
  const nextRevealAt = admin.firestore.Timestamp.fromMillis(nextRevealMs);

  // Update darkroom with new reveal time
  // This update triggers sendPhotoRevealNotification via onUpdate
  await admin.firestore().collection('darkrooms').doc(userId).update({
    nextRevealAt: nextRevealAt,
    lastRevealedAt: admin.firestore.FieldValue.serverTimestamp(),
  });

  console.log(`revealUserPhotos: User ${userId} - ${photosSnapshot.size} photos revealed, next reveal at ${nextRevealAt.toDate()}`);

  return {
    userId,
    success: true,
    photosRevealed: photosSnapshot.size,
    nextRevealAt: nextRevealAt.toDate(),
  };
}

/**
 * Cloud Function: Process darkroom reveals on schedule
 * Runs every 2 minutes to check all darkrooms and reveal overdue photos
 * This ensures photos reveal at scheduled time even when app is closed
 */
exports.processDarkroomReveals = functions.pubsub
  .schedule('every 2 minutes')
  .onRun(async (context) => {
    try {
      const now = admin.firestore.Timestamp.now();
      console.log('processDarkroomReveals: Starting scheduled reveal check at', now.toDate());

      // Query all darkrooms where nextRevealAt has passed
      const darkroomsSnapshot = await admin.firestore()
        .collection('darkrooms')
        .where('nextRevealAt', '<=', now)
        .get();

      if (darkroomsSnapshot.empty) {
        console.log('processDarkroomReveals: No darkrooms ready to reveal');
        return null;
      }

      console.log(`processDarkroomReveals: Found ${darkroomsSnapshot.size} darkrooms ready to reveal`);

      // Process each darkroom
      const results = await Promise.all(
        darkroomsSnapshot.docs.map(async (darkroomDoc) => {
          const userId = darkroomDoc.id;
          try {
            return await revealUserPhotos(userId, now);
          } catch (error) {
            console.error(`processDarkroomReveals: Error for user ${userId}:`, error);
            return { userId, success: false, error: error.message };
          }
        })
      );

      const successCount = results.filter(r => r.success).length;
      const revealedCount = results.reduce((sum, r) => sum + (r.photosRevealed || 0), 0);
      console.log(`processDarkroomReveals: Completed. ${successCount}/${darkroomsSnapshot.size} users processed, ${revealedCount} photos revealed`);

      return { processed: darkroomsSnapshot.size, successful: successCount, photosRevealed: revealedCount };
    } catch (error) {
      console.error('processDarkroomReveals: Fatal error:', error);
      return null;
    }
  });

/**
 * Send push notification to a user via Expo Push Token
 * @param {string} fcmToken - User's Expo Push Token
 * @param {string} title - Notification title
 * @param {string} body - Notification body
 * @param {object} data - Additional data payload for deep linking
 * @returns {Promise<object>} - Result of notification send
 */
async function sendPushNotification(fcmToken, title, body, data = {}) {
  try {
    // Expo push tokens start with "ExponentPushToken["
    if (!fcmToken || !fcmToken.startsWith('ExponentPushToken[')) {
      console.error('Invalid Expo Push Token:', fcmToken);
      return { success: false, error: 'Invalid token format' };
    }

    // For Expo push tokens, we use the Expo Push Notification service
    // The token is already in the correct format
    const message = {
      to: fcmToken,
      sound: 'default',
      title: title,
      body: body,
      data: data,
      priority: 'high',
      channelId: 'default',
    };

    // Send notification via Expo's push notification service
    const response = await fetch('https://exp.host/--/api/v2/push/send', {
      method: 'POST',
      headers: {
        'Accept': 'application/json',
        'Accept-Encoding': 'gzip, deflate',
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(message),
    });

    const responseData = await response.json();
    console.log('Expo push notification sent:', responseData);

    return { success: true, data: responseData };
  } catch (error) {
    console.error('Error sending push notification:', error);
    return { success: false, error: error.message };
  }
}

/**
 * Cloud Function: Send notification when photos are revealed in darkroom
 * Triggered when darkroom document is updated with new revealedAt timestamp
 *
 * IMPORTANT: Uses lastNotifiedAt to ensure only ONE notification per reveal batch.
 * This prevents spam when the scheduled function runs frequently.
 */
exports.sendPhotoRevealNotification = functions.firestore
  .document('darkrooms/{userId}')
  .onUpdate(async (change, context) => {
    try {
      const userId = context.params.userId;
      const before = change.before.data();
      const after = change.after.data();

      // Check if this is a reveal event (lastRevealedAt changed)
      const lastRevealedAtBefore = before.lastRevealedAt?.toMillis() || 0;
      const lastRevealedAtAfter = after.lastRevealedAt?.toMillis() || 0;
      const wasRevealed = lastRevealedAtAfter > lastRevealedAtBefore;

      if (!wasRevealed) {
        console.log('sendPhotoRevealNotification: No new reveal, skipping notification');
        return null;
      }

      // Check if we already notified for this batch (lastNotifiedAt >= lastRevealedAt)
      const lastNotifiedAt = after.lastNotifiedAt?.toMillis() || 0;
      if (lastNotifiedAt >= lastRevealedAtAfter) {
        console.log('sendPhotoRevealNotification: Already notified for this batch, skipping');
        return null;
      }

      // Count photos revealed in THIS batch (revealedAt within 5 seconds of lastRevealedAt)
      // This tolerance accounts for batch commit timing differences
      const toleranceMs = 5000;
      const batchStartTime = lastRevealedAtAfter - toleranceMs;
      const batchEndTime = lastRevealedAtAfter + toleranceMs;

      const photosSnapshot = await admin.firestore()
        .collection('photos')
        .where('userId', '==', userId)
        .where('status', '==', 'revealed')
        .get();

      // Filter photos by revealedAt timestamp within the batch window
      const photosInBatch = photosSnapshot.docs.filter((doc) => {
        const revealedAt = doc.data().revealedAt?.toMillis() || 0;
        return revealedAt >= batchStartTime && revealedAt <= batchEndTime;
      });

      const photosRevealed = photosInBatch.length;

      if (photosRevealed === 0) {
        console.log('sendPhotoRevealNotification: No photos revealed in this batch, skipping notification');
        // Still update lastNotifiedAt to prevent future checks for this batch
        await admin.firestore().collection('darkrooms').doc(userId).update({
          lastNotifiedAt: admin.firestore.FieldValue.serverTimestamp(),
        });
        return null;
      }

      // Get user's FCM token
      const userDoc = await admin.firestore().collection('users').doc(userId).get();
      if (!userDoc.exists) {
        console.error('sendPhotoRevealNotification: User not found:', userId);
        return null;
      }

      const userData = userDoc.data();
      const fcmToken = userData.fcmToken;

      if (!fcmToken) {
        console.log('sendPhotoRevealNotification: User has no FCM token, skipping:', userId);
        return null;
      }

      // Send notification with reveal data
      const title = '📸 Photos Ready!';
      const body = photosRevealed === 1
        ? 'Your photo is ready to view in the darkroom'
        : `${photosRevealed} photos are ready to view in the darkroom`;

      const result = await sendPushNotification(
        fcmToken,
        title,
        body,
        {
          type: 'photo_reveal',
          revealedCount: String(photosRevealed),
          revealAll: 'true',
        }
      );

      // Update lastNotifiedAt AFTER successfully sending notification
      await admin.firestore().collection('darkrooms').doc(userId).update({
        lastNotifiedAt: admin.firestore.FieldValue.serverTimestamp(),
      });

      console.log('sendPhotoRevealNotification: Notification sent to', userId, {
        photosRevealed,
        result,
      });
      return result;
    } catch (error) {
      console.error('sendPhotoRevealNotification: Error:', error);
      return null;
    }
  });

/**
 * Cloud Function: Send notification when friend request is received
 * Triggered when friendship document is created with status 'pending'
 */
exports.sendFriendRequestNotification = functions.firestore
  .document('friendships/{friendshipId}')
  .onCreate(async (snap, context) => {
    try {
      const friendshipId = context.params.friendshipId;
      const friendshipData = snap.data();

      // Only send notification for pending friend requests
      if (friendshipData.status !== 'pending') {
        console.log('Friendship not pending, skipping notification');
        return null;
      }

      const requestedBy = friendshipData.requestedBy;
      const recipientId = friendshipData.user1Id === requestedBy
        ? friendshipData.user2Id
        : friendshipData.user1Id;

      // Get recipient's FCM token
      const recipientDoc = await admin.firestore()
        .collection('users')
        .doc(recipientId)
        .get();

      if (!recipientDoc.exists) {
        console.error('Recipient not found:', recipientId);
        return null;
      }

      const recipientData = recipientDoc.data();
      const fcmToken = recipientData.fcmToken;

      if (!fcmToken) {
        console.log('Recipient has no FCM token, skipping notification:', recipientId);
        return null;
      }

      // Get sender's display name
      const senderDoc = await admin.firestore()
        .collection('users')
        .doc(requestedBy)
        .get();

      const senderName = senderDoc.exists
        ? senderDoc.data().displayName || senderDoc.data().username
        : 'Someone';

      // Send notification
      const title = '👋 Friend Request';
      const body = `${senderName} sent you a friend request`;

      const result = await sendPushNotification(
        fcmToken,
        title,
        body,
        {
          type: 'friend_request',
          friendshipId: friendshipId,
        }
      );

      console.log('Friend request notification sent to:', recipientId, result);
      return result;
    } catch (error) {
      console.error('Error in sendFriendRequestNotification:', error);
      return null;
    }
  });

/**
 * Cloud Function: Send notification when someone reacts to user's photo
 * Triggered when photo document is updated with new reactions
 */
exports.sendReactionNotification = functions.firestore
  .document('photos/{photoId}')
  .onUpdate(async (change, context) => {
    try {
      const photoId = context.params.photoId;
      const before = change.before.data();
      const after = change.after.data();

      // Check if reactions were added (reactionCount increased)
      if (!after.reactionCount || after.reactionCount <= (before.reactionCount || 0)) {
        console.log('No new reactions, skipping notification');
        return null;
      }

      // Get photo owner's ID
      const photoOwnerId = after.userId;

      // Determine who added the reaction (newest reactant)
      const beforeReactions = before.reactions || {};
      const afterReactions = after.reactions || {};

      let reactorId = null;
      for (const [userId, emojis] of Object.entries(afterReactions)) {
        // Skip if this is the photo owner (don't notify yourself)
        if (userId === photoOwnerId) continue;

        // Check if this user's reactions changed
        const beforeUserReactions = beforeReactions[userId] || {};
        const afterUserReactions = emojis;

        for (const [emoji, count] of Object.entries(afterUserReactions)) {
          const beforeCount = beforeUserReactions[emoji] || 0;
          if (count > beforeCount) {
            reactorId = userId;
            break;
          }
        }

        if (reactorId) break;
      }

      // If no reactor found or reactor is the owner, skip
      if (!reactorId || reactorId === photoOwnerId) {
        console.log('No valid reactor found, skipping notification');
        return null;
      }

      // Get photo owner's FCM token
      const ownerDoc = await admin.firestore()
        .collection('users')
        .doc(photoOwnerId)
        .get();

      if (!ownerDoc.exists) {
        console.error('Photo owner not found:', photoOwnerId);
        return null;
      }

      const ownerData = ownerDoc.data();
      const fcmToken = ownerData.fcmToken;

      if (!fcmToken) {
        console.log('Photo owner has no FCM token, skipping notification:', photoOwnerId);
        return null;
      }

      // Get reactor's display name
      const reactorDoc = await admin.firestore()
        .collection('users')
        .doc(reactorId)
        .get();

      const reactorName = reactorDoc.exists
        ? reactorDoc.data().displayName || reactorDoc.data().username
        : 'Someone';

      // Send notification
      const title = '❤️ New Reaction';
      const body = `${reactorName} reacted to your photo`;

      const result = await sendPushNotification(
        fcmToken,
        title,
        body,
        {
          type: 'reaction',
          photoId: photoId,
        }
      );

      console.log('Reaction notification sent to:', photoOwnerId, result);
      return result;
    } catch (error) {
      console.error('Error in sendReactionNotification:', error);
      return null;
    }
  });
