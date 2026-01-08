/**
 * debugFriendship.js
 *
 * Debug utility to test friendship operations and Firestore permissions
 * Use this to identify permission issues
 */

import { generateFriendshipId } from '../services/firebase/friendshipService';
import { doc, getDoc, setDoc, serverTimestamp } from 'firebase/firestore';
import { db } from '../services/firebase/firebaseConfig';

/**
 * Debug friend request creation
 * Tests the exact same logic as sendFriendRequest but with detailed logging
 *
 * @param {string} fromUserId - Current user ID
 * @param {string} toUserId - Target user ID
 */
export const debugFriendRequest = async (fromUserId, toUserId) => {
  console.log('=== DEBUG FRIEND REQUEST ===');
  console.log('From User ID:', fromUserId);
  console.log('To User ID:', toUserId);

  // Generate friendship ID
  const friendshipId = generateFriendshipId(fromUserId, toUserId);
  console.log('Generated Friendship ID:', friendshipId);

  // Determine user1Id and user2Id
  const [user1Id, user2Id] = [fromUserId, toUserId].sort();
  console.log('user1Id (alphabetically first):', user1Id);
  console.log('user2Id (alphabetically second):', user2Id);
  console.log('requestedBy:', fromUserId);

  // Check if current user matches one of the IDs
  console.log('Does fromUserId match user1Id?', fromUserId === user1Id);
  console.log('Does fromUserId match user2Id?', fromUserId === user2Id);

  // The document we're trying to create
  const documentToCreate = {
    user1Id,
    user2Id,
    status: 'pending',
    requestedBy: fromUserId,
    createdAt: serverTimestamp(),
    acceptedAt: null,
  };

  console.log('Document to create:', JSON.stringify(documentToCreate, null, 2));

  try {
    // Check if friendship already exists
    const friendshipRef = doc(db, 'friendships', friendshipId);
    console.log('Checking if friendship exists...');

    const friendshipDoc = await getDoc(friendshipRef);
    console.log('Friendship exists?', friendshipDoc.exists());

    if (friendshipDoc.exists()) {
      console.log('Existing friendship data:', friendshipDoc.data());
      return {
        success: false,
        error: 'Friendship already exists',
        debug: {
          friendshipId,
          existingData: friendshipDoc.data(),
        },
      };
    }

    // Try to create the friendship
    console.log('Attempting to create friendship document...');
    await setDoc(friendshipRef, documentToCreate);
    console.log('✅ SUCCESS! Friendship document created.');

    return {
      success: true,
      friendshipId,
      debug: {
        friendshipId,
        user1Id,
        user2Id,
        requestedBy: fromUserId,
      },
    };
  } catch (error) {
    console.error('❌ ERROR:', error.code, error.message);
    console.error('Full error:', error);

    return {
      success: false,
      error: error.message,
      debug: {
        errorCode: error.code,
        errorMessage: error.message,
        friendshipId,
        user1Id,
        user2Id,
        requestedBy: fromUserId,
        authUid: fromUserId,
      },
    };
  }
};

/**
 * Test reading friendships collection to verify read permissions
 *
 * @param {string} userId - Current user ID
 */
export const debugReadFriendships = async (userId) => {
  console.log('=== DEBUG READ FRIENDSHIPS ===');
  console.log('User ID:', userId);

  try {
    const friendshipId = generateFriendshipId(userId, 'test_user_123');
    const friendshipRef = doc(db, 'friendships', friendshipId);

    console.log('Testing read access for friendship ID:', friendshipId);
    const friendshipDoc = await getDoc(friendshipRef);

    console.log('✅ Read permission granted');
    console.log('Document exists?', friendshipDoc.exists());

    if (friendshipDoc.exists()) {
      console.log('Document data:', friendshipDoc.data());
    }

    return { success: true };
  } catch (error) {
    console.error('❌ Read permission denied:', error.code, error.message);
    return { success: false, error: error.message };
  }
};

/**
 * Log current auth state
 */
export const debugAuthState = (user) => {
  console.log('=== DEBUG AUTH STATE ===');
  console.log('User authenticated?', !!user);

  if (user) {
    console.log('User UID:', user.uid);
    console.log('User Email:', user.email);
    console.log('User Display Name:', user.displayName);
  } else {
    console.log('❌ No user authenticated!');
  }
};
