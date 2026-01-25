/**
 * Mock for @react-native-firebase/auth
 *
 * CRITICAL: Mock functions are defined OUTSIDE the module export
 * so they can be imported and used for test assertions.
 */

// Define mock functions OUTSIDE - this allows tests to access them
const mockSignInWithEmailAndPassword = jest.fn(() =>
  Promise.resolve({
    user: { uid: 'test-uid', email: 'test@example.com' },
  })
);

const mockSignOut = jest.fn(() => Promise.resolve());

const mockOnAuthStateChanged = jest.fn(callback => {
  // Return unsubscribe function
  return jest.fn();
});

const mockCreateUserWithEmailAndPassword = jest.fn(() =>
  Promise.resolve({
    user: { uid: 'new-user-uid', email: 'new@example.com' },
  })
);

const mockSendPasswordResetEmail = jest.fn(() => Promise.resolve());

const mockSignInWithPhoneNumber = jest.fn(() =>
  Promise.resolve({
    verificationId: 'test-verification-id',
    confirm: jest.fn(() =>
      Promise.resolve({
        user: { uid: 'phone-user-uid', phoneNumber: '+11234567890' },
      })
    ),
  })
);

const mockVerifyPhoneNumber = jest.fn(() => Promise.resolve('test-verification-id'));

const mockSignInWithCredential = jest.fn(() =>
  Promise.resolve({
    user: { uid: 'credential-user-uid' },
  })
);

const mockReauthenticateWithCredential = jest.fn(() => Promise.resolve());

const mockDeleteUser = jest.fn(() => Promise.resolve());

const mockCurrentUser = {
  uid: 'test-uid',
  email: 'test@example.com',
  phoneNumber: '+11234567890',
  delete: mockDeleteUser,
  reauthenticateWithCredential: mockReauthenticateWithCredential,
};

// Auth factory function (default export pattern for RN Firebase)
const auth = () => ({
  signInWithEmailAndPassword: mockSignInWithEmailAndPassword,
  signOut: mockSignOut,
  onAuthStateChanged: mockOnAuthStateChanged,
  createUserWithEmailAndPassword: mockCreateUserWithEmailAndPassword,
  sendPasswordResetEmail: mockSendPasswordResetEmail,
  signInWithPhoneNumber: mockSignInWithPhoneNumber,
  verifyPhoneNumber: mockVerifyPhoneNumber,
  signInWithCredential: mockSignInWithCredential,
  currentUser: mockCurrentUser,
});

// PhoneAuthProvider static property
auth.PhoneAuthProvider = {
  PROVIDER_ID: 'phone',
  credential: jest.fn((verificationId, code) => ({
    providerId: 'phone',
    verificationId,
    code,
  })),
};

// Export the factory function as default
module.exports = auth;

// Export mock functions for test assertions
module.exports.mockSignInWithEmailAndPassword = mockSignInWithEmailAndPassword;
module.exports.mockSignOut = mockSignOut;
module.exports.mockOnAuthStateChanged = mockOnAuthStateChanged;
module.exports.mockCreateUserWithEmailAndPassword = mockCreateUserWithEmailAndPassword;
module.exports.mockSendPasswordResetEmail = mockSendPasswordResetEmail;
module.exports.mockSignInWithPhoneNumber = mockSignInWithPhoneNumber;
module.exports.mockVerifyPhoneNumber = mockVerifyPhoneNumber;
module.exports.mockSignInWithCredential = mockSignInWithCredential;
module.exports.mockCurrentUser = mockCurrentUser;
module.exports.mockDeleteUser = mockDeleteUser;
module.exports.mockReauthenticateWithCredential = mockReauthenticateWithCredential;
