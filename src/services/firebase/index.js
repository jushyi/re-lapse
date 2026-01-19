// Export Firebase configuration and instances
// Note: 'auth' is not exported - authentication uses React Native Firebase directly
export { app, db, storage } from './firebaseConfig';

// Export Firestore service functions
export {
  createUserDocument,
  getUserDocument,
  updateUserDocument,
  createPhotoDocument,
  getUserPhotos,
  updatePhotoDocument,
  deletePhotoDocument,
  createFriendship,
  acceptFriendship,
  getUserFriends,
  createNotification,
  markNotificationAsRead,
  createPhotoView,
  hasUserViewedPhoto,
} from './firestoreService';

// Export Storage service functions
export {
  uploadProfilePhoto,
  uploadPhoto,
  deleteProfilePhoto,
  deletePhoto,
  getPhotoURL,
} from './storageService';

// Export Notification service functions
export {
  initializeNotifications,
  requestNotificationPermission,
  getNotificationToken,
  storeNotificationToken,
  handleNotificationReceived,
  handleNotificationTapped,
  checkNotificationPermissions,
  scheduleTestNotification,
} from './notificationService';

// Export Phone Auth service functions (React Native Firebase)
export {
  validatePhoneNumber,
  sendVerificationCode,
  verifyCode,
  getCurrentUser as getPhoneAuthCurrentUser,
  signOut as phoneAuthSignOut,
  onAuthStateChanged as phoneAuthOnAuthStateChanged,
  getPhoneAuthErrorMessage,
} from './phoneAuthService';