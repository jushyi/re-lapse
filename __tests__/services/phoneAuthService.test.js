/**
 * Phone Auth Service Unit Tests
 *
 * Tests for phone authentication service including:
 * - Phone number validation (using actual libphonenumber-js)
 * - Firebase error message mapping
 * - SMS verification code sending
 * - Code verification flow
 */

// Mock logger to prevent console output
jest.mock('../../src/utils/logger', () => ({
  debug: jest.fn(),
  info: jest.fn(),
  warn: jest.fn(),
  error: jest.fn(),
}));

// Create mock functions for Firebase auth at module level
const mockSignInWithPhoneNumber = jest.fn();
const mockSignOut = jest.fn();
const mockOnAuthStateChanged = jest.fn();
const mockCurrentUser = { uid: 'test-uid', email: 'test@example.com', phoneNumber: '+11234567890' };

// Mock @react-native-firebase/auth
jest.mock('@react-native-firebase/auth', () => ({
  __esModule: true,
  getAuth: () => ({
    signInWithPhoneNumber: (...args) => mockSignInWithPhoneNumber(...args),
    signOut: () => mockSignOut(),
    onAuthStateChanged: callback => mockOnAuthStateChanged(callback),
    currentUser: mockCurrentUser,
  }),
  signInWithPhoneNumber: (...args) => mockSignInWithPhoneNumber(...args),
}));

// Import service AFTER mocks are set up
// Note: libphonenumber-js is NOT mocked - we use the real library
const {
  validatePhoneNumber,
  getPhoneAuthErrorMessage,
  sendVerificationCode,
  verifyCode,
  getCurrentUser,
  signOut: signOutFn,
  onAuthStateChanged: onAuthStateChangedFn,
} = require('../../src/services/firebase/phoneAuthService');

describe('phoneAuthService', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  // ===========================================================================
  // validatePhoneNumber tests (using real libphonenumber-js)
  // ===========================================================================
  describe('validatePhoneNumber', () => {
    it('should return valid:true for correct US phone number', () => {
      const result = validatePhoneNumber('4155551234', 'US');

      expect(result.valid).toBe(true);
      expect(result.e164).toBe('+14155551234');
      expect(result.formatted).toBeDefined();
      expect(result.country).toBe('US');
    });

    it('should return valid:true for correct UK phone number', () => {
      // Use full international format to ensure correct parsing
      const result = validatePhoneNumber('+442071234567', undefined);

      expect(result.valid).toBe(true);
      expect(result.e164).toBe('+442071234567');
      expect(result.country).toBe('GB');
    });

    it('should return valid:false with error for empty phone number', () => {
      const result = validatePhoneNumber('', 'US');

      expect(result.valid).toBe(false);
      expect(result.error).toBe('Please enter your phone number.');
    });

    it('should return valid:false with error for null phone number', () => {
      const result = validatePhoneNumber(null, 'US');

      expect(result.valid).toBe(false);
      expect(result.error).toBe('Please enter your phone number.');
    });

    it('should return valid:false with error for undefined phone number', () => {
      const result = validatePhoneNumber(undefined, 'US');

      expect(result.valid).toBe(false);
      expect(result.error).toBe('Please enter your phone number.');
    });

    it('should return valid:false with error for whitespace-only phone number', () => {
      const result = validatePhoneNumber('   ', 'US');

      expect(result.valid).toBe(false);
      expect(result.error).toBe('Please enter your phone number.');
    });

    it('should return valid:false for invalid phone format', () => {
      const result = validatePhoneNumber('abc123', 'US');

      expect(result.valid).toBe(false);
      expect(result.error).toBeDefined();
    });

    it('should return valid:false for too short phone number', () => {
      const result = validatePhoneNumber('123', 'US');

      expect(result.valid).toBe(false);
      expect(result.error).toBeDefined();
    });

    it('should handle phone number with international format', () => {
      const result = validatePhoneNumber('+14155551234', 'US');

      expect(result.valid).toBe(true);
      expect(result.e164).toBe('+14155551234');
    });
  });

  // ===========================================================================
  // getPhoneAuthErrorMessage tests
  // ===========================================================================
  describe('getPhoneAuthErrorMessage', () => {
    it('should map auth/invalid-phone-number to user-friendly message', () => {
      const message = getPhoneAuthErrorMessage('auth/invalid-phone-number');
      expect(message).toBe('Invalid phone number. Please check the number and try again.');
    });

    it('should map auth/missing-phone-number to user-friendly message', () => {
      const message = getPhoneAuthErrorMessage('auth/missing-phone-number');
      expect(message).toBe('Please enter your phone number.');
    });

    it('should map auth/code-expired to user-friendly message', () => {
      const message = getPhoneAuthErrorMessage('auth/code-expired');
      expect(message).toBe('Code expired. Please go back and request a new code.');
    });

    it('should map auth/session-expired to same message as code-expired', () => {
      const message = getPhoneAuthErrorMessage('auth/session-expired');
      expect(message).toBe('Code expired. Please go back and request a new code.');
    });

    it('should map auth/too-many-requests to user-friendly message', () => {
      const message = getPhoneAuthErrorMessage('auth/too-many-requests');
      expect(message).toBe('Too many attempts. Please wait a few minutes before trying again.');
    });

    it('should map auth/quota-exceeded to user-friendly message', () => {
      const message = getPhoneAuthErrorMessage('auth/quota-exceeded');
      expect(message).toBe('Too many SMS requests. Please wait a few minutes and try again.');
    });

    it('should map auth/invalid-verification-code to user-friendly message', () => {
      const message = getPhoneAuthErrorMessage('auth/invalid-verification-code');
      expect(message).toBe('Incorrect code. Please check and try again.');
    });

    it('should map auth/network-request-failed to user-friendly message', () => {
      const message = getPhoneAuthErrorMessage('auth/network-request-failed');
      expect(message).toBe('Network error. Please check your internet connection and try again.');
    });

    it('should map auth/operation-not-allowed to user-friendly message', () => {
      const message = getPhoneAuthErrorMessage('auth/operation-not-allowed');
      expect(message).toBe('Phone sign-in is not enabled. Please contact support.');
    });

    it('should map auth/user-disabled to user-friendly message', () => {
      const message = getPhoneAuthErrorMessage('auth/user-disabled');
      expect(message).toBe('This account has been disabled. Please contact support.');
    });

    it('should map auth/captcha-check-failed to user-friendly message', () => {
      const message = getPhoneAuthErrorMessage('auth/captcha-check-failed');
      expect(message).toBe('Verification check failed. Please try again.');
    });

    it('should map auth/internal-error to user-friendly message', () => {
      const message = getPhoneAuthErrorMessage('auth/internal-error');
      expect(message).toBe('Something went wrong. Please try again.');
    });

    it('should return generic message for unknown error code', () => {
      const message = getPhoneAuthErrorMessage('auth/unknown-error');
      expect(message).toBe('Something went wrong. Please try again.');
    });

    it('should return generic message for null error code', () => {
      const message = getPhoneAuthErrorMessage(null);
      expect(message).toBe('Something went wrong. Please try again.');
    });

    it('should return generic message for undefined error code', () => {
      const message = getPhoneAuthErrorMessage(undefined);
      expect(message).toBe('Something went wrong. Please try again.');
    });
  });

  // ===========================================================================
  // sendVerificationCode tests
  // ===========================================================================
  describe('sendVerificationCode', () => {
    it('should call Firebase signInWithPhoneNumber with E.164 formatted number', async () => {
      mockSignInWithPhoneNumber.mockResolvedValueOnce({
        verificationId: 'test-verification-id',
        confirm: jest.fn(),
      });

      const result = await sendVerificationCode('4155551234', 'US');

      expect(result.success).toBe(true);
      expect(result.confirmation).toBeDefined();
      expect(mockSignInWithPhoneNumber).toHaveBeenCalledWith(
        expect.anything(), // auth instance
        '+14155551234'
      );
    });

    it('should return formatted number on success', async () => {
      mockSignInWithPhoneNumber.mockResolvedValueOnce({
        verificationId: 'test-verification-id',
        confirm: jest.fn(),
      });

      const result = await sendVerificationCode('4155551234', 'US');

      expect(result.success).toBe(true);
      expect(result.formattedNumber).toBeDefined();
      expect(result.e164).toBe('+14155551234');
    });

    it('should return error when phone validation fails', async () => {
      const result = await sendVerificationCode('invalid', 'US');

      expect(result.success).toBe(false);
      expect(result.error).toBeDefined();
      expect(mockSignInWithPhoneNumber).not.toHaveBeenCalled();
    });

    it('should return user-friendly error on Firebase error', async () => {
      const firebaseError = new Error('Firebase error');
      firebaseError.code = 'auth/invalid-phone-number';
      mockSignInWithPhoneNumber.mockRejectedValueOnce(firebaseError);

      const result = await sendVerificationCode('4155551234', 'US');

      expect(result.success).toBe(false);
      expect(result.error).toBe('Invalid phone number. Please check the number and try again.');
    });

    it('should handle network errors gracefully', async () => {
      const networkError = new Error('Network error');
      networkError.code = 'auth/network-request-failed';
      mockSignInWithPhoneNumber.mockRejectedValueOnce(networkError);

      const result = await sendVerificationCode('4155551234', 'US');

      expect(result.success).toBe(false);
      expect(result.error).toBe(
        'Network error. Please check your internet connection and try again.'
      );
    });

    it('should handle empty phone number without calling Firebase', async () => {
      const result = await sendVerificationCode('', 'US');

      expect(result.success).toBe(false);
      expect(result.error).toBe('Please enter your phone number.');
      expect(mockSignInWithPhoneNumber).not.toHaveBeenCalled();
    });

    it('should handle too-many-requests error', async () => {
      const rateLimitError = new Error('Too many requests');
      rateLimitError.code = 'auth/too-many-requests';
      mockSignInWithPhoneNumber.mockRejectedValueOnce(rateLimitError);

      const result = await sendVerificationCode('4155551234', 'US');

      expect(result.success).toBe(false);
      expect(result.error).toBe(
        'Too many attempts. Please wait a few minutes before trying again.'
      );
    });
  });

  // ===========================================================================
  // verifyCode tests
  // ===========================================================================
  describe('verifyCode', () => {
    const createMockConfirmation = () => ({
      verificationId: 'test-verification-id',
      confirm: jest.fn(),
    });

    it('should call confirm() with valid 6-digit code', async () => {
      const mockConfirmation = createMockConfirmation();
      mockConfirmation.confirm.mockResolvedValueOnce({
        user: { uid: 'phone-user-uid', phoneNumber: '+14155551234' },
      });

      const result = await verifyCode(mockConfirmation, '123456');

      expect(result.success).toBe(true);
      expect(result.user).toBeDefined();
      expect(result.user.uid).toBe('phone-user-uid');
      expect(mockConfirmation.confirm).toHaveBeenCalledWith('123456');
    });

    it('should return error when confirmation object is null', async () => {
      const result = await verifyCode(null, '123456');

      expect(result.success).toBe(false);
      expect(result.error).toBe('Verification session expired. Please request a new code.');
    });

    it('should return error when confirmation object is undefined', async () => {
      const result = await verifyCode(undefined, '123456');

      expect(result.success).toBe(false);
      expect(result.error).toBe('Verification session expired. Please request a new code.');
    });

    it('should return error for code shorter than 6 digits', async () => {
      const mockConfirmation = createMockConfirmation();

      const result = await verifyCode(mockConfirmation, '12345');

      expect(result.success).toBe(false);
      expect(result.error).toBe('Please enter the 6-digit code.');
      expect(mockConfirmation.confirm).not.toHaveBeenCalled();
    });

    it('should return error for code longer than 6 digits', async () => {
      const mockConfirmation = createMockConfirmation();

      const result = await verifyCode(mockConfirmation, '1234567');

      expect(result.success).toBe(false);
      expect(result.error).toBe('Please enter the 6-digit code.');
      expect(mockConfirmation.confirm).not.toHaveBeenCalled();
    });

    it('should return error for non-numeric code', async () => {
      const mockConfirmation = createMockConfirmation();

      const result = await verifyCode(mockConfirmation, 'abcdef');

      expect(result.success).toBe(false);
      expect(result.error).toBe('Please enter the 6-digit code.');
      expect(mockConfirmation.confirm).not.toHaveBeenCalled();
    });

    it('should return error for null code', async () => {
      const mockConfirmation = createMockConfirmation();

      const result = await verifyCode(mockConfirmation, null);

      expect(result.success).toBe(false);
      expect(result.error).toBe('Please enter the 6-digit code.');
    });

    it('should return error for empty code', async () => {
      const mockConfirmation = createMockConfirmation();

      const result = await verifyCode(mockConfirmation, '');

      expect(result.success).toBe(false);
      expect(result.error).toBe('Please enter the 6-digit code.');
    });

    it('should return error for mixed alphanumeric code', async () => {
      const mockConfirmation = createMockConfirmation();

      const result = await verifyCode(mockConfirmation, '123abc');

      expect(result.success).toBe(false);
      expect(result.error).toBe('Please enter the 6-digit code.');
    });

    it('should return user-friendly error on invalid verification code', async () => {
      const mockConfirmation = createMockConfirmation();
      const verificationError = new Error('Invalid code');
      verificationError.code = 'auth/invalid-verification-code';
      mockConfirmation.confirm.mockRejectedValueOnce(verificationError);

      const result = await verifyCode(mockConfirmation, '123456');

      expect(result.success).toBe(false);
      expect(result.error).toBe('Incorrect code. Please check and try again.');
    });

    it('should return user-friendly error on expired session', async () => {
      const mockConfirmation = createMockConfirmation();
      const sessionError = new Error('Session expired');
      sessionError.code = 'auth/session-expired';
      mockConfirmation.confirm.mockRejectedValueOnce(sessionError);

      const result = await verifyCode(mockConfirmation, '123456');

      expect(result.success).toBe(false);
      expect(result.error).toBe('Code expired. Please go back and request a new code.');
    });
  });

  // ===========================================================================
  // getCurrentUser tests
  // ===========================================================================
  describe('getCurrentUser', () => {
    it('should return current user when authenticated', () => {
      const user = getCurrentUser();

      expect(user).toBeDefined();
      expect(user.uid).toBe('test-uid');
    });
  });

  // ===========================================================================
  // signOut tests
  // ===========================================================================
  describe('signOut', () => {
    it('should call Firebase signOut and return success', async () => {
      mockSignOut.mockResolvedValueOnce();

      const result = await signOutFn();

      expect(result.success).toBe(true);
      expect(mockSignOut).toHaveBeenCalled();
    });

    it('should return error on signOut failure', async () => {
      const signOutError = new Error('Sign out failed');
      signOutError.code = 'auth/internal-error';
      mockSignOut.mockRejectedValueOnce(signOutError);

      const result = await signOutFn();

      expect(result.success).toBe(false);
      expect(result.error).toBe('Sign out failed');
    });
  });

  // ===========================================================================
  // onAuthStateChanged tests
  // ===========================================================================
  describe('onAuthStateChanged', () => {
    it('should subscribe to auth state changes and return unsubscribe function', () => {
      const callback = jest.fn();
      const mockUnsubscribe = jest.fn();
      mockOnAuthStateChanged.mockReturnValueOnce(mockUnsubscribe);

      const unsubscribe = onAuthStateChangedFn(callback);

      expect(mockOnAuthStateChanged).toHaveBeenCalledWith(callback);
      expect(typeof unsubscribe).toBe('function');
    });
  });
});
