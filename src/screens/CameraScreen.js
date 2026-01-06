import React from 'react';
import { View, Text, StyleSheet, SafeAreaView } from 'react-native';
import { Button } from '../components';

const CameraScreen = () => {
  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.content}>
        <Text style={styles.title}>Camera Screen</Text>
        <Text style={styles.subtitle}>📷</Text>
        <Text style={styles.description}>
          Full-screen camera interface will be implemented in Week 5-6
        </Text>

        <View style={styles.info}>
          <Text style={styles.infoText}>Features to implement:</Text>
          <Text style={styles.bulletPoint}>• Flash toggle (OFF/ON/AUTO)</Text>
          <Text style={styles.bulletPoint}>• Camera flip (front/back)</Text>
          <Text style={styles.bulletPoint}>• Photo capture with preview</Text>
          <Text style={styles.bulletPoint}>• Daily shot counter (X / 36)</Text>
          <Text style={styles.bulletPoint}>• Upload to Firebase Storage</Text>
        </View>

        <Button
          title="Close (placeholder)"
          variant="outline"
          onPress={() => console.log('Close camera')}
        />
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000000',
  },
  content: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 24,
  },
  title: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 64,
    marginBottom: 24,
  },
  description: {
    fontSize: 16,
    color: '#CCCCCC',
    textAlign: 'center',
    marginBottom: 32,
  },
  info: {
    backgroundColor: '#1A1A1A',
    padding: 24,
    borderRadius: 16,
    marginBottom: 32,
    width: '100%',
  },
  infoText: {
    fontSize: 16,
    color: '#FFFFFF',
    fontWeight: '600',
    marginBottom: 12,
  },
  bulletPoint: {
    fontSize: 14,
    color: '#CCCCCC',
    marginBottom: 8,
  },
});

export default CameraScreen;