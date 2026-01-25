/**
 * Smoke Test
 *
 * Verifies that Jest is configured correctly and Firebase mocks load without errors.
 * This is the first test to run to confirm the test infrastructure works.
 */

describe('Jest Setup', () => {
  test('jest runs correctly', () => {
    expect(1 + 1).toBe(2);
  });

  test('firebase app mock loads without errors', () => {
    const app = require('@react-native-firebase/app');
    expect(app).toBeDefined();
    // App mock is an object with default function export
    expect(app.default || app).toBeDefined();
  });

  test('firebase auth mock loads without errors', () => {
    const auth = require('@react-native-firebase/auth');
    expect(auth).toBeDefined();
    expect(typeof auth).toBe('function');

    // Verify auth instance has expected methods
    const authInstance = auth();
    expect(authInstance.signInWithEmailAndPassword).toBeDefined();
    expect(authInstance.signOut).toBeDefined();
    expect(authInstance.onAuthStateChanged).toBeDefined();
  });

  test('firebase firestore mock loads without errors', () => {
    const firestore = require('@react-native-firebase/firestore');
    expect(firestore).toBeDefined();
    expect(typeof firestore).toBe('function');

    // Verify firestore instance has expected methods
    const firestoreInstance = firestore();
    expect(firestoreInstance.collection).toBeDefined();
    expect(firestoreInstance.doc).toBeDefined();

    // Verify static properties
    expect(firestore.FieldValue).toBeDefined();
    expect(firestore.FieldValue.serverTimestamp).toBeDefined();
    expect(firestore.Timestamp).toBeDefined();
  });

  test('firebase storage mock loads without errors', () => {
    const storage = require('@react-native-firebase/storage');
    expect(storage).toBeDefined();
    expect(typeof storage).toBe('function');

    // Verify storage instance has expected methods
    const storageInstance = storage();
    expect(storageInstance.ref).toBeDefined();
  });

  test('expo-secure-store mock loads without errors', () => {
    const SecureStore = require('expo-secure-store');
    expect(SecureStore).toBeDefined();
    expect(SecureStore.getItemAsync).toBeDefined();
    expect(SecureStore.setItemAsync).toBeDefined();
    expect(SecureStore.deleteItemAsync).toBeDefined();
  });

  test('expo-haptics mock loads without errors', () => {
    const Haptics = require('expo-haptics');
    expect(Haptics).toBeDefined();
    expect(Haptics.impactAsync).toBeDefined();
    expect(Haptics.notificationAsync).toBeDefined();
    expect(Haptics.selectionAsync).toBeDefined();
  });
});

describe('Test Factories', () => {
  const {
    createTestUser,
    createTestPhoto,
    createRevealedPhoto,
    createJournaledPhoto,
    createTestFriendship,
    createPendingFriendRequest,
    createTestDarkroom,
    createReadyDarkroom,
    generateFriendshipId,
    createTimestamp,
  } = require('../setup/testFactories');

  test('createTestUser returns valid user object', () => {
    const user = createTestUser();

    expect(user.uid).toBe('test-user-123');
    expect(user.displayName).toBe('Test User');
    expect(user.username).toBe('testuser');
    expect(user.profileSetupCompleted).toBe(true);
  });

  test('createTestUser accepts overrides', () => {
    const user = createTestUser({
      uid: 'custom-uid',
      displayName: 'Custom Name',
    });

    expect(user.uid).toBe('custom-uid');
    expect(user.displayName).toBe('Custom Name');
    expect(user.username).toBe('testuser'); // Default preserved
  });

  test('createTestPhoto returns valid photo object', () => {
    const photo = createTestPhoto();

    expect(photo.id).toBe('photo-123');
    expect(photo.status).toBe('developing');
    expect(photo.photoState).toBeNull();
    expect(photo.visibility).toBe('friends-only');
  });

  test('createRevealedPhoto returns revealed photo', () => {
    const photo = createRevealedPhoto();

    expect(photo.status).toBe('revealed');
    expect(photo.revealedAt).not.toBeNull();
    expect(photo.photoState).toBeNull();
  });

  test('createJournaledPhoto returns triaged journal photo', () => {
    const photo = createJournaledPhoto();

    expect(photo.status).toBe('triaged');
    expect(photo.photoState).toBe('journal');
    expect(photo.revealedAt).not.toBeNull();
  });

  test('createTestFriendship returns valid friendship with sorted IDs', () => {
    const friendship = createTestFriendship({
      user1Id: 'zebra',
      user2Id: 'apple',
    });

    // IDs should be alphabetically sorted
    expect(friendship.user1Id).toBe('apple');
    expect(friendship.user2Id).toBe('zebra');
    expect(friendship.status).toBe('accepted');
  });

  test('createPendingFriendRequest returns pending friendship', () => {
    const request = createPendingFriendRequest();

    expect(request.status).toBe('pending');
    expect(request.acceptedAt).toBeNull();
  });

  test('createTestDarkroom returns darkroom with future reveal time', () => {
    const darkroom = createTestDarkroom();

    expect(darkroom.userId).toBe('test-user-123');
    expect(darkroom.nextRevealAt._seconds).toBeGreaterThan(Date.now() / 1000);
  });

  test('createReadyDarkroom returns darkroom ready to reveal', () => {
    const darkroom = createReadyDarkroom();

    expect(darkroom.nextRevealAt._seconds).toBeLessThan(Date.now() / 1000);
  });

  test('generateFriendshipId creates deterministic ID', () => {
    const id1 = generateFriendshipId('user-a', 'user-b');
    const id2 = generateFriendshipId('user-b', 'user-a');

    expect(id1).toBe(id2);
    expect(id1).toBe('user-a_user-b');
  });

  test('createTimestamp creates valid timestamp object', () => {
    const ts = createTimestamp(1704067200000); // 2024-01-01 00:00:00 UTC

    expect(ts._seconds).toBe(1704067200);
    expect(ts._nanoseconds).toBe(0);
    expect(ts.toDate()).toEqual(new Date(1704067200000));
  });
});

describe('Mock Function Assertions', () => {
  test('auth mock functions can be configured and asserted', async () => {
    global.mockSignInWithEmailAndPassword.mockResolvedValueOnce({
      user: { uid: 'custom-uid', email: 'custom@test.com' },
    });

    const auth = require('@react-native-firebase/auth');
    const result = await auth().signInWithEmailAndPassword('custom@test.com', 'password');

    expect(result.user.uid).toBe('custom-uid');
    expect(global.mockSignInWithEmailAndPassword).toHaveBeenCalledWith(
      'custom@test.com',
      'password'
    );
  });

  test('firestore mock functions can be configured and asserted', async () => {
    const mockData = { id: 'doc-1', name: 'Custom Doc' };
    global.mockGetDoc.mockResolvedValueOnce({
      exists: () => true,
      data: () => mockData,
      id: 'doc-1',
    });

    const firestore = require('@react-native-firebase/firestore');
    const docRef = firestore().doc('collection/doc-1');
    const result = await docRef.get();

    expect(result.exists()).toBe(true);
    expect(result.data()).toEqual(mockData);
  });

  test('storage mock functions can be configured and asserted', async () => {
    const customUrl = 'https://custom-storage.com/custom-photo.jpg';
    global.mockGetDownloadURL.mockResolvedValueOnce(customUrl);

    const storage = require('@react-native-firebase/storage');
    const ref = storage().ref('photos/custom-photo.jpg');
    const url = await ref.getDownloadURL();

    expect(url).toBe(customUrl);
    expect(global.mockStorageRef).toHaveBeenCalledWith('photos/custom-photo.jpg');
  });

  test('mocks are cleared between tests', () => {
    // This test runs after the previous tests
    // Mocks should be cleared by beforeEach in jest.setup.js
    expect(global.mockSignInWithEmailAndPassword).not.toHaveBeenCalled();
    expect(global.mockGetDoc).not.toHaveBeenCalled();
    expect(global.mockStorageRef).not.toHaveBeenCalled();
  });
});
