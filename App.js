import { StatusBar } from 'expo-status-bar';
import { StyleSheet, Text, View } from 'react-native';
import { app } from './src/services/firebase';

export default function App() {
  // Test Firebase connection
  const isFirebaseConnected = app ? 'Firebase Connected!' : 'Firebase Connection Failed';

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Lapse Clone</Text>
      <Text style={styles.subtitle}>{isFirebaseConnected}</Text>
      <Text style={styles.status}>Week 2: Setup Complete</Text>
      <StatusBar style="auto" />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    alignItems: 'center',
    justifyContent: 'center',
  },
  title: {
    fontSize: 32,
    fontWeight: 'bold',
    marginBottom: 16,
  },
  subtitle: {
    fontSize: 18,
    color: '#00AA00',
    marginBottom: 8,
  },
  status: {
    fontSize: 14,
    color: '#666',
  },
});
