import React from 'react';
import { View, Text, StyleSheet, SafeAreaView } from 'react-native';
import { Button, Input } from '../components';

const LoginScreen = ({ navigation }) => {
  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.content}>
        <Text style={styles.logo}>LAPSE</Text>
        <Text style={styles.subtitle}>Capture the moment</Text>

        <View style={styles.form}>
          <Input
            label="Email"
            placeholder="your@email.com"
            keyboardType="email-address"
            autoCapitalize="none"
          />

          <Input
            label="Password"
            placeholder="Enter your password"
            secureTextEntry
            showPasswordToggle
          />

          <Text style={styles.forgotPassword}>Forgot Password?</Text>

          <Button
            title="Login"
            variant="primary"
            onPress={() => {
              // TODO: Implement login logic in Week 3-4
              console.log('Login pressed');
            }}
          />

          <Button
            title="Sign in with Apple 🍎"
            variant="secondary"
            onPress={() => {
              // TODO: Implement Apple Sign-In in Week 3-4
              console.log('Apple Sign-In pressed');
            }}
            style={styles.appleButton}
          />

          <Text style={styles.signupText}>
            Don't have an account?{' '}
            <Text style={styles.signupLink}>Sign Up</Text>
          </Text>
        </View>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FAFAFA',
  },
  content: {
    flex: 1,
    justifyContent: 'center',
    paddingHorizontal: 24,
  },
  logo: {
    fontSize: 32,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: '#666666',
    textAlign: 'center',
    marginBottom: 48,
  },
  form: {
    width: '100%',
  },
  forgotPassword: {
    fontSize: 14,
    color: '#666666',
    textAlign: 'center',
    marginBottom: 24,
  },
  appleButton: {
    marginTop: 16,
  },
  signupText: {
    fontSize: 14,
    color: '#666666',
    textAlign: 'center',
    marginTop: 24,
  },
  signupLink: {
    color: '#000000',
    fontWeight: '600',
    textDecorationLine: 'underline',
  },
});

export default LoginScreen;