import React, { createContext, useContext, useRef } from 'react';
import logger from '../utils/logger';

/**
 * PhoneAuthContext
 *
 * Provides a way to share the Firebase ConfirmationResult between
 * PhoneInputScreen and VerificationScreen without serialization.
 *
 * Firebase ConfirmationResult contains functions (like .confirm()) that cannot
 * be serialized through React Navigation params. Using a ref stored in context
 * allows us to pass this object by reference instead.
 *
 * Usage:
 * - Wrap auth screens with <PhoneAuthProvider>
 * - In PhoneInputScreen: confirmationRef.current = result.confirmation
 * - In VerificationScreen: const confirmation = confirmationRef.current
 */
const PhoneAuthContext = createContext(null);

/**
 * PhoneAuthProvider
 * Provides confirmationRef to child components via context.
 * The ref is used to store Firebase ConfirmationResult without serialization.
 */
export const PhoneAuthProvider = ({ children }) => {
  const confirmationRef = useRef(null);

  logger.debug('PhoneAuthProvider: Mounted');

  return (
    <PhoneAuthContext.Provider value={{ confirmationRef }}>{children}</PhoneAuthContext.Provider>
  );
};

/**
 * usePhoneAuth hook
 * Access the phone auth context containing confirmationRef.
 * Must be used within a PhoneAuthProvider.
 *
 * @returns {{ confirmationRef: React.MutableRefObject<any> }}
 */
export const usePhoneAuth = () => {
  const context = useContext(PhoneAuthContext);
  if (!context) {
    logger.error('usePhoneAuth: Must be used within PhoneAuthProvider');
    throw new Error('usePhoneAuth must be used within PhoneAuthProvider');
  }
  return context;
};

export default PhoneAuthContext;
