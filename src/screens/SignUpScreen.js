import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Button, Input } from '../components';
import { useAuth } from '../context/AuthContext';
import {
  validateEmail,
  validateUsername,
  validatePassword,
  validatePasswordMatch,
} from '../utils/validation';

const SignUpScreen = ({ navigation }) => {
  const { signUp, signInWithApple, loading } = useAuth();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [username, setUsername] = useState('');

  const [errors, setErrors] = useState({});

  const validate = () => {
    const newErrors = {};

    // Email validation using centralized utility
    const emailError = validateEmail(email.trim());
    if (emailError) {
      newErrors.email = emailError;
    }

    // Username validation using centralized utility
    const usernameError = validateUsername(username.trim());
    if (usernameError) {
      newErrors.username = usernameError;
    }

    // Password validation using centralized utility
    const passwordError = validatePassword(password);
    if (passwordError) {
      newErrors.password = passwordError;
    }

    // Password confirmation validation
    const confirmError = validatePasswordMatch(password, confirmPassword);
    if (confirmError) {
      newErrors.confirmPassword = confirmError;
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSignUp = async () => {
    if (!validate()) {
      return;
    }

    const result = await signUp(email.trim(), password, username.trim());

    if (result.success) {
      // Navigation will be handled by AuthContext state change
      // If needsProfileSetup, navigator will show ProfileSetupScreen
    } else {
      Alert.alert('Sign Up Failed', result.error || 'An error occurred during sign up');
    }
  };

  const handleAppleSignIn = async () => {
    const result = await signInWithApple();

    if (!result.success) {
      Alert.alert('Apple Sign In Failed', result.error || 'An error occurred');
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.keyboardAvoid}
      >
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          keyboardShouldPersistTaps="handled"
        >
          <View style={styles.content}>
            <Text style={styles.logo}>LAPSE</Text>
            <Text style={styles.subtitle}>Create your account</Text>

            <View style={styles.form}>
              <Input
                label="Email"
                placeholder="Email"
                value={email}
                onChangeText={(text) => {
                  setEmail(text);
                  if (errors.email) setErrors({ ...errors, email: null });
                }}
                keyboardType="email-address"
                autoCapitalize="none"
                error={errors.email}
              />

              <Input
                label="Username"
                placeholder="Username"
                value={username}
                onChangeText={(text) => {
                  setUsername(text);
                  if (errors.username) setErrors({ ...errors, username: null });
                }}
                autoCapitalize="none"
                error={errors.username}
              />

              <Input
                label="Password"
                placeholder="Password"
                value={password}
                onChangeText={(text) => {
                  setPassword(text);
                  if (errors.password) setErrors({ ...errors, password: null });
                }}
                secureTextEntry
                showPasswordToggle
                error={errors.password}
              />

              <Input
                label="Confirm Password"
                placeholder="Re-enter your password"
                value={confirmPassword}
                onChangeText={(text) => {
                  setConfirmPassword(text);
                  if (errors.confirmPassword) setErrors({ ...errors, confirmPassword: null });
                }}
                secureTextEntry
                showPasswordToggle
                error={errors.confirmPassword}
              />

              <Button
                title="Sign Up"
                variant="primary"
                onPress={handleSignUp}
                loading={loading}
                style={styles.signUpButton}
              />

              <View style={styles.divider}>
                <View style={styles.dividerLine} />
                <Text style={styles.dividerText}>OR</Text>
                <View style={styles.dividerLine} />
              </View>

              <Button
                title="Sign in with Apple"
                variant="secondary"
                onPress={handleAppleSignIn}
                loading={loading}
              />

              <Text style={styles.termsText}>
                By signing up, you agree to our Terms of Service and Privacy Policy
              </Text>
            </View>

            <View style={styles.footer}>
              <Text style={styles.footerText}>Already have an account? </Text>
              <Text
                style={styles.loginLink}
                onPress={() => navigation.navigate('Login')}
              >
                Log In
              </Text>
            </View>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  keyboardAvoid: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
  },
  content: {
    flex: 1,
    paddingHorizontal: 24,
    paddingTop: 40,
    paddingBottom: 24,
    justifyContent: 'center',
  },
  logo: {
    fontSize: 48,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 8,
    letterSpacing: 4,
  },
  subtitle: {
    fontSize: 16,
    textAlign: 'center',
    color: '#666666',
    marginBottom: 40,
  },
  form: {
    width: '100%',
  },
  signUpButton: {
    marginTop: 8,
  },
  divider: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 24,
  },
  dividerLine: {
    flex: 1,
    height: 1,
    backgroundColor: '#E0E0E0',
  },
  dividerText: {
    marginHorizontal: 16,
    color: '#666666',
    fontSize: 14,
  },
  termsText: {
    fontSize: 12,
    color: '#999999',
    textAlign: 'center',
    marginTop: 24,
    lineHeight: 18,
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop: 24,
  },
  footerText: {
    fontSize: 14,
    color: '#666666',
  },
  loginLink: {
    fontSize: 14,
    color: '#000000',
    fontWeight: '600',
  },
});

export default SignUpScreen;