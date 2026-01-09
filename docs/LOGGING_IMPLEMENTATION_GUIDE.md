# Logging Implementation Guide

**Project:** Lapse Clone
**Created:** 2026-01-09
**Purpose:** Step-by-step guide to add comprehensive logging throughout the codebase

---

## 📋 Overview

This guide walks you through adding comprehensive logging to every layer of the Lapse Clone app. Follow the patterns and examples below to ensure consistent, thorough logging across all files.

**Estimated Time:** 1-2 hours for complete implementation

---

## 🎯 Quick Reference Pattern

```javascript
// Function entry (DEBUG)
logger.debug('ServiceName.functionName: Starting', { param1, param2 });

// Key operation steps (DEBUG)
logger.debug('ServiceName.functionName: Description of step', { relevantData });

// Successful completion (INFO)
logger.info('ServiceName.functionName: Success message', { results });

// Recoverable issues (WARN)
logger.warn('ServiceName.functionName: Warning message', { context });

// Errors (ERROR)
logger.error('ServiceName.functionName: Error description', { error: error.message });
```

---

## 📂 Implementation Checklist

### Priority 1: Services (Critical - Do First)

- [ ] **photoService.js** (PARTIALLY DONE - complete remaining functions)
- [ ] **friendshipService.js**
- [ ] **feedService.js**
- [ ] **darkroomService.js**
- [ ] **authService.js**
- [ ] **storageService.js**
- [ ] **userService.js**
- [ ] **notificationService.js**
- [ ] **firestoreService.js**

### Priority 2: Context & Hooks

- [ ] **AuthContext.js** (signIn, signUp, signOut, onAuthStateChanged)
- [ ] **useFeedPhotos.js**

### Priority 3: High-Traffic Screens

- [ ] **CameraScreen.js**
- [ ] **FeedScreen.js** (enhance existing logs)
- [ ] **DarkroomScreen.js** (enhance existing logs)
- [ ] **ProfileScreen.js** (enhance existing logs)

### Priority 4: Remaining Screens

- [ ] **LoginScreen.js**
- [ ] **SignUpScreen.js**
- [ ] **ForgotPasswordScreen.js**
- [ ] **ProfileSetupScreen.js**
- [ ] **UserSearchScreen.js**
- [ ] **FriendRequestsScreen.js**
- [ ] **FriendsListScreen.js**

---

## 🔧 Implementation Examples by Layer

### 1. Services Layer

Services are the most critical layer to log. Every Firebase operation should be logged.

#### **Pattern for Service Functions:**

```javascript
import logger from '../../utils/logger';

export const functionName = async (param1, param2) => {
  // 1. Log function entry with parameters (DEBUG)
  logger.debug('ServiceName.functionName: Starting', { param1, param2 });

  try {
    // 2. Log key steps (DEBUG)
    logger.debug('ServiceName.functionName: Fetching data from Firestore');

    const query = query(collection(db, 'collection'));
    const snapshot = await getDocs(query);

    logger.debug('ServiceName.functionName: Query executed', {
      resultCount: snapshot.size
    });

    // 3. Process data
    const results = snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));

    // 4. Log successful completion (INFO)
    logger.info('ServiceName.functionName: Operation successful', {
      resultCount: results.length,
      param1
    });

    return { success: true, data: results };
  } catch (error) {
    // 5. Log error (ERROR)
    logger.error('ServiceName.functionName: Operation failed', {
      param1,
      param2,
      error: error.message
    });
    return { success: false, error: error.message };
  }
};
```

#### **Example: friendshipService.js - sendFriendRequest()**

```javascript
export const sendFriendRequest = async (fromUserId, toUserId) => {
  logger.debug('FriendshipService.sendFriendRequest: Starting', {
    fromUserId,
    toUserId
  });

  try {
    // Generate friendship ID
    const friendshipId = generateFriendshipId(fromUserId, toUserId);
    logger.debug('FriendshipService.sendFriendRequest: Generated friendship ID', {
      friendshipId
    });

    // Check if friendship already exists
    const friendshipRef = doc(db, 'friendships', friendshipId);
    const friendshipDoc = await getDoc(friendshipRef);

    if (friendshipDoc.exists()) {
      logger.warn('FriendshipService.sendFriendRequest: Friendship already exists', {
        friendshipId,
        status: friendshipDoc.data().status
      });
      return { success: false, error: 'Friendship already exists' };
    }

    logger.debug('FriendshipService.sendFriendRequest: Creating friendship document');

    // Create friendship
    await setDoc(friendshipRef, {
      user1Id: [fromUserId, toUserId].sort()[0],
      user2Id: [fromUserId, toUserId].sort()[1],
      status: 'pending',
      requestedBy: fromUserId,
      createdAt: serverTimestamp(),
      acceptedAt: null,
    });

    logger.info('FriendshipService.sendFriendRequest: Friend request sent', {
      friendshipId,
      fromUserId,
      toUserId
    });

    return { success: true, friendshipId };
  } catch (error) {
    logger.error('FriendshipService.sendFriendRequest: Failed', {
      fromUserId,
      toUserId,
      error: error.message
    });
    return { success: false, error: error.message };
  }
};
```

#### **Example: feedService.js - getFeedPhotos()**

```javascript
export const getFeedPhotos = async (friendIds, limit = 20, lastDoc = null) => {
  logger.debug('FeedService.getFeedPhotos: Starting', {
    friendCount: friendIds.length,
    limit,
    hasLastDoc: !!lastDoc
  });

  try {
    logger.debug('FeedService.getFeedPhotos: Building Firestore query');

    let feedQuery = query(
      collection(db, 'photos'),
      where('photoState', '==', 'journal'),
      limit(limit)
    );

    if (lastDoc) {
      feedQuery = query(feedQuery, startAfter(lastDoc));
    }

    logger.debug('FeedService.getFeedPhotos: Executing query');
    const snapshot = await getDocs(feedQuery);

    const photos = snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));

    // Client-side filter by friend IDs
    const filteredPhotos = photos.filter(photo =>
      friendIds.includes(photo.userId)
    );

    logger.info('FeedService.getFeedPhotos: Retrieved photos', {
      totalPhotos: photos.length,
      filteredPhotos: filteredPhotos.length,
      hasMore: snapshot.docs.length === limit
    });

    return {
      success: true,
      photos: filteredPhotos,
      lastDoc: snapshot.docs[snapshot.docs.length - 1] || null,
      hasMore: snapshot.docs.length === limit
    };
  } catch (error) {
    logger.error('FeedService.getFeedPhotos: Failed', {
      friendCount: friendIds.length,
      error: error.message
    });
    return { success: false, error: error.message };
  }
};
```

---

### 2. Context Layer

Log all authentication state changes and user actions.

#### **Example: AuthContext.js**

```javascript
import logger from '../utils/logger';

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [userProfile, setUserProfile] = useState(null);

  // Listen to auth state changes
  useEffect(() => {
    logger.debug('AuthContext: Setting up auth state listener');

    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      if (firebaseUser) {
        logger.info('AuthContext: User authenticated', { userId: firebaseUser.uid });
        setUser(firebaseUser);

        // Fetch user profile
        logger.debug('AuthContext: Fetching user profile', { userId: firebaseUser.uid });
        const profileResult = await getUserDocument(firebaseUser.uid);

        if (profileResult.success) {
          logger.debug('AuthContext: User profile loaded', {
            userId: firebaseUser.uid,
            username: profileResult.data.username
          });
          setUserProfile(profileResult.data);
        } else {
          logger.warn('AuthContext: Failed to load user profile', {
            userId: firebaseUser.uid,
            error: profileResult.error
          });
        }
      } else {
        logger.info('AuthContext: User signed out');
        setUser(null);
        setUserProfile(null);
      }
    });

    return unsubscribe;
  }, []);

  const signIn = async (email, password) => {
    logger.info('AuthContext: Sign in attempt', { email });

    try {
      setLoading(true);
      const result = await signInWithEmail(email, password);

      if (result.success) {
        logger.info('AuthContext: Sign in successful', {
          userId: result.user.uid,
          email
        });
      } else {
        logger.warn('AuthContext: Sign in failed', {
          email,
          error: result.error
        });
      }

      return result;
    } catch (error) {
      logger.error('AuthContext: Sign in error', {
        email,
        error: error.message
      });
      return { success: false, error: error.message };
    } finally {
      setLoading(false);
    }
  };

  const signUp = async (email, password, username) => {
    logger.info('AuthContext: Sign up attempt', { email, username });

    try {
      setLoading(true);

      logger.debug('AuthContext: Creating Firebase Auth account');
      const result = await signUpWithEmail(email, password);

      if (!result.success) {
        logger.warn('AuthContext: Sign up failed at auth step', {
          email,
          error: result.error
        });
        return { success: false, error: result.error };
      }

      logger.debug('AuthContext: Creating user document', {
        userId: result.user.uid
      });

      const userDoc = {
        uid: result.user.uid,
        email: email.toLowerCase(),
        username: username,
        displayName: username,
        photoURL: null,
        bio: '',
        friends: [],
        profileSetupCompleted: false,
        createdAt: new Date(),
      };

      const createDocResult = await createUserDocument(result.user.uid, userDoc);

      if (!createDocResult.success) {
        logger.error('AuthContext: Failed to create user document', {
          userId: result.user.uid,
          error: createDocResult.error
        });
        return { success: false, error: 'Account created but profile setup failed' };
      }

      logger.info('AuthContext: Sign up successful', {
        userId: result.user.uid,
        username
      });

      return { success: true, user: result.user, needsProfileSetup: true };
    } catch (error) {
      logger.error('AuthContext: Sign up error', {
        email,
        username,
        error: error.message
      });
      return { success: false, error: error.message };
    } finally {
      setLoading(false);
    }
  };

  const signOut = async () => {
    logger.info('AuthContext: Sign out initiated', { userId: user?.uid });

    try {
      await signOutUser();
      logger.info('AuthContext: Sign out successful');
    } catch (error) {
      logger.error('AuthContext: Sign out failed', {
        userId: user?.uid,
        error: error.message
      });
    }
  };

  // ... rest of context
};
```

---

### 3. Custom Hooks

Log data fetching, state changes, and side effects.

#### **Example: useFeedPhotos.js**

```javascript
import logger from '../utils/logger';

const useFeedPhotos = (enableRealtime = false) => {
  const { user } = useAuth();
  const [photos, setPhotos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const loadFeedPhotos = async () => {
    logger.debug('useFeedPhotos: Loading feed photos', {
      userId: user?.uid,
      currentPhotoCount: photos.length
    });

    try {
      setLoading(true);
      setError(null);

      // Get friend IDs
      logger.debug('useFeedPhotos: Fetching friend list');
      const friendIds = await getFriendUserIds(user.uid);

      logger.debug('useFeedPhotos: Friend list retrieved', {
        friendCount: friendIds.length
      });

      if (friendIds.length === 0) {
        logger.info('useFeedPhotos: No friends found, empty feed');
        setPhotos([]);
        return;
      }

      // Fetch feed photos
      logger.debug('useFeedPhotos: Fetching feed photos from Firestore');
      const result = await getFeedPhotos(friendIds, PHOTOS_PER_PAGE);

      if (result.success) {
        logger.info('useFeedPhotos: Feed photos loaded', {
          photoCount: result.photos.length,
          hasMore: result.hasMore
        });
        setPhotos(result.photos);
        setLastDoc(result.lastDoc);
        setHasMore(result.hasMore);
      } else {
        logger.error('useFeedPhotos: Failed to load feed photos', {
          error: result.error
        });
        setError(result.error);
      }
    } catch (error) {
      logger.error('useFeedPhotos: Error loading feed', {
        userId: user?.uid,
        error: error.message
      });
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  const loadMorePhotos = async () => {
    if (loadingMore || !hasMore) {
      logger.debug('useFeedPhotos: Skipping load more', {
        loadingMore,
        hasMore
      });
      return;
    }

    logger.debug('useFeedPhotos: Loading more photos', {
      currentCount: photos.length,
      hasMore
    });

    try {
      setLoadingMore(true);

      const friendIds = await getFriendUserIds(user.uid);
      const result = await getFeedPhotos(friendIds, PHOTOS_PER_PAGE, lastDoc);

      if (result.success) {
        logger.info('useFeedPhotos: More photos loaded', {
          newCount: result.photos.length,
          totalCount: photos.length + result.photos.length
        });

        setPhotos(prev => [...prev, ...result.photos]);
        setLastDoc(result.lastDoc);
        setHasMore(result.hasMore);
      }
    } catch (error) {
      logger.error('useFeedPhotos: Error loading more photos', {
        error: error.message
      });
    } finally {
      setLoadingMore(false);
    }
  };

  const refreshFeed = async () => {
    logger.info('useFeedPhotos: Refreshing feed');
    setRefreshing(true);
    await loadFeedPhotos();
    setRefreshing(false);
  };

  // Initial load
  useEffect(() => {
    if (user) {
      logger.debug('useFeedPhotos: Initial feed load triggered');
      loadFeedPhotos();
    }
  }, [user]);

  return {
    photos,
    loading,
    refreshing,
    loadingMore,
    error,
    hasMore,
    loadMorePhotos,
    refreshFeed,
    updatePhotoInState,
  };
};
```

---

### 4. Screens Layer

Log lifecycle events, user interactions, and navigation.

#### **Example: CameraScreen.js**

```javascript
import logger from '../utils/logger';

const CameraScreen = () => {
  const { user } = useAuth();
  const [hasPermission, setHasPermission] = useState(null);
  const [isCapturing, setIsCapturing] = useState(false);

  // Request camera permission on mount
  useEffect(() => {
    logger.debug('CameraScreen: Mounted, requesting camera permission');

    (async () => {
      const { status } = await Camera.requestCameraPermissionsAsync();
      logger.info('CameraScreen: Camera permission result', { status });
      setHasPermission(status === 'granted');
    })();

    return () => {
      logger.debug('CameraScreen: Unmounted');
    };
  }, []);

  const handleCapturePhoto = async () => {
    logger.info('CameraScreen: User pressed capture button', { userId: user?.uid });

    if (!cameraRef.current) {
      logger.warn('CameraScreen: Camera ref not available');
      return;
    }

    try {
      setIsCapturing(true);
      logger.debug('CameraScreen: Taking photo');

      const photo = await cameraRef.current.takePictureAsync({
        quality: 0.8,
        skipProcessing: true,
      });

      logger.info('CameraScreen: Photo captured', {
        uri: photo.uri.substring(0, 50) + '...',
        width: photo.width,
        height: photo.height
      });

      // Compress and resize
      logger.debug('CameraScreen: Compressing photo');
      const compressedPhoto = await ImageManipulator.manipulateAsync(
        photo.uri,
        [{ resize: { width: 1080 } }],
        { compress: 0.8, format: ImageManipulator.SaveFormat.JPEG }
      );

      logger.debug('CameraScreen: Photo compressed', {
        originalSize: photo.width,
        newSize: compressedPhoto.width
      });

      // Upload to Firebase
      logger.debug('CameraScreen: Uploading photo to Firebase');
      const result = await createPhoto(user.uid, compressedPhoto.uri);

      if (result.success) {
        logger.info('CameraScreen: Photo uploaded successfully', {
          photoId: result.photoId,
          userId: user.uid
        });

        // Animate snapshot going to darkroom
        logger.debug('CameraScreen: Triggering snapshot animation');
        animateSnapshot();

        Alert.alert('Photo Captured!', 'Your photo is developing in the darkroom.');
      } else {
        logger.error('CameraScreen: Photo upload failed', {
          error: result.error
        });
        Alert.alert('Upload Failed', result.error);
      }
    } catch (error) {
      logger.error('CameraScreen: Photo capture failed', {
        userId: user?.uid,
        error: error.message
      });
      Alert.alert('Error', 'Failed to capture photo');
    } finally {
      setIsCapturing(false);
    }
  };

  const handleFlipCamera = () => {
    logger.debug('CameraScreen: Flipping camera', {
      from: cameraType,
      to: cameraType === CameraType.back ? 'front' : 'back'
    });
    setCameraType(current =>
      current === CameraType.back ? CameraType.front : CameraType.back
    );
  };

  // ... rest of component
};
```

#### **Example: FeedScreen.js (Enhance Existing)**

Add these logs to existing FeedScreen:

```javascript
const FeedScreen = () => {
  const { user } = useAuth();

  // Add to useEffect for focus listener
  useEffect(() => {
    const unsubscribe = navigation.addListener('focus', () => {
      logger.info('FeedScreen: Screen focused, refreshing feed');
      refreshFeed();
    });

    return unsubscribe;
  }, [navigation, refreshFeed]);

  // Enhance handlePhotoPress
  const handlePhotoPress = (photo) => {
    logger.debug('FeedScreen: User tapped photo', {
      photoId: photo.id,
      userId: photo.userId
    });
    setSelectedPhoto(photo);
    setShowPhotoModal(true);
  };

  // Enhance handleClosePhotoModal
  const handleClosePhotoModal = () => {
    logger.debug('FeedScreen: Closing photo modal');
    setShowPhotoModal(false);
    setSelectedPhoto(null);
  };

  // Enhance handleReactionToggle (add at start)
  const handleReactionToggle = async (emoji, currentCount) => {
    logger.info('FeedScreen: User toggled reaction', {
      photoId: selectedPhoto?.id,
      emoji,
      currentCount,
      newCount: currentCount + 1
    });

    // ... existing implementation
  };

  // Add at component mount
  useEffect(() => {
    logger.debug('FeedScreen: Component mounted');
    return () => {
      logger.debug('FeedScreen: Component unmounted');
    };
  }, []);

  // ... rest of component
};
```

#### **Example: ProfileScreen.js (Enhance Existing)**

Add these logs to existing ProfileScreen:

```javascript
const ProfileScreen = () => {
  const { signOut, user, userProfile } = useAuth();

  // Enhance existing useEffect
  useEffect(() => {
    const loadStats = async () => {
      if (!user) {
        logger.debug('ProfileScreen: No user, skipping stats load');
        return;
      }

      logger.debug('ProfileScreen: Loading user stats', { userId: user.uid });

      try {
        setLoading(true);

        // Get total photos
        logger.debug('ProfileScreen: Querying user photos');
        const photosQuery = query(
          collection(db, 'photos'),
          where('userId', '==', user.uid),
          where('status', '==', 'triaged')
        );
        const photosSnapshot = await getDocs(photosQuery);
        const postsCount = photosSnapshot.size;

        logger.debug('ProfileScreen: Photos counted', { postsCount });

        // Get friends count
        logger.debug('ProfileScreen: Fetching friends list');
        const friendIds = await getFriendUserIds(user.uid);
        const friendsCount = friendIds.length;

        logger.debug('ProfileScreen: Friends counted', { friendsCount });

        // Get reactions
        let reactionsCount = 0;
        photosSnapshot.docs.forEach((doc) => {
          const photoData = doc.data();
          reactionsCount += photoData.reactionCount || 0;
        });

        logger.info('ProfileScreen: Stats loaded successfully', {
          userId: user.uid,
          postsCount,
          friendsCount,
          reactionsCount
        });

        setStats({
          posts: postsCount,
          friends: friendsCount,
          reactions: reactionsCount,
        });
      } catch (error) {
        logger.error('ProfileScreen: Failed to load stats', {
          userId: user.uid,
          error: error.message
        });
      } finally {
        setLoading(false);
      }
    };

    loadStats();
  }, [user]);

  // Enhance handleSignOut
  const handleSignOut = async () => {
    logger.info('ProfileScreen: User initiated sign out', { userId: user?.uid });
    await signOut();
  };

  // Add at component mount
  useEffect(() => {
    logger.debug('ProfileScreen: Component mounted', { userId: user?.uid });
    return () => {
      logger.debug('ProfileScreen: Component unmounted');
    };
  }, []);

  // ... rest of component
};
```

---

## ✅ Testing Your Logging

After adding logs, test them by:

1. **Run the app in development mode:**
   ```bash
   npm start
   ```

2. **Monitor console output:**
   - Look for logs with emoji prefixes: 🔍 [DEBUG], ℹ️ [INFO], ⚠️ [WARN], ❌ [ERROR]
   - Verify logs appear at key points (function entry, success, errors)

3. **Test critical flows:**
   - Sign up new user → Check AuthContext logs
   - Capture photo → Check CameraScreen + photoService logs
   - View feed → Check FeedScreen + feedService + useFeedPhotos logs
   - Send friend request → Check friendshipService logs
   - React to photo → Check feedService.toggleReaction logs

4. **Verify log levels:**
   - DEBUG logs should only appear in development
   - INFO logs show user actions
   - ERROR logs appear for failures
   - WARN logs appear for recoverable issues

---

## 🚫 Common Mistakes to Avoid

1. **❌ Don't use console.log directly**
   ```javascript
   // BAD
   console.log('User signed in:', userId);

   // GOOD
   logger.info('AuthContext: User signed in', { userId });
   ```

2. **❌ Don't log sensitive data**
   ```javascript
   // BAD - password will be logged!
   logger.debug('Signing in', { email, password });

   // GOOD - logger auto-sanitizes, but still avoid
   logger.debug('Signing in', { email });
   ```

3. **❌ Don't use generic messages**
   ```javascript
   // BAD
   logger.error('Error occurred', error);

   // GOOD
   logger.error('FeedService.getFeedPhotos: Failed to fetch photos', {
     friendCount: friendIds.length,
     error: error.message
   });
   ```

4. **❌ Don't forget to log errors in catch blocks**
   ```javascript
   // BAD
   try {
     await someOperation();
   } catch (error) {
     return { success: false, error: error.message };
   }

   // GOOD
   try {
     await someOperation();
   } catch (error) {
     logger.error('ServiceName.functionName: Operation failed', {
       params,
       error: error.message
     });
     return { success: false, error: error.message };
   }
   ```

5. **❌ Don't log in tight loops**
   ```javascript
   // BAD - will spam console
   photos.forEach(photo => {
     logger.debug('Processing photo', { photoId: photo.id });
     processPhoto(photo);
   });

   // GOOD - log summary
   logger.debug('Processing photos', { count: photos.length });
   photos.forEach(photo => processPhoto(photo));
   logger.debug('Photos processed', { count: photos.length });
   ```

---

## 📝 Completion Checklist

When finished, verify:

- [ ] All service functions have entry/success/error logs
- [ ] All try/catch blocks include error logging
- [ ] AuthContext has comprehensive auth flow logs
- [ ] All screens log lifecycle events (mount/unmount)
- [ ] All user interactions are logged (button presses, navigation)
- [ ] All Firebase operations are logged (queries, updates, deletes)
- [ ] No direct console.log usage remains
- [ ] Logs follow consistent naming: `ServiceName.functionName: Description`
- [ ] All logs include relevant context data
- [ ] Tested in development mode and verified output

---

## 🎉 After Completion

Once all logging is added:

1. **Test the app thoroughly** - Perform all user flows and check logs
2. **Review console output** - Ensure logs are helpful and not excessive
3. **Update CLAUDE.md** - Add note that logging is complete
4. **Commit changes** - Create commit: "Add comprehensive logging throughout codebase"

---

**Questions or issues?** Refer back to CLAUDE.md "Development Best Practices → Logging Guidelines" section for full reference.
