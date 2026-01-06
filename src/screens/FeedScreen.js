import React from 'react';
import { View, Text, StyleSheet, SafeAreaView, ScrollView } from 'react-native';
import { Card } from '../components';

const FeedScreen = () => {
  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Lapse</Text>
        <Text style={styles.notificationBadge}>🔔 (3)</Text>
      </View>

      <ScrollView style={styles.content}>
        {/* Friends Section Placeholder */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Friends</Text>
          <Text style={styles.placeholder}>
            Horizontal scrolling friend thumbnails will appear here
          </Text>
        </View>

        {/* Highlights Section Placeholder */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Highlights</Text>
          <Card>
            <Text style={styles.cardText}>Photo preview (1:1)</Text>
            <Text style={styles.cardSubtext}>@username • 2h ago</Text>
            <Text style={styles.cardSubtext}>😂 24  ❤️ 18  🔥 15</Text>
          </Card>
          <Card>
            <Text style={styles.cardText}>Photo preview (1:1)</Text>
            <Text style={styles.cardSubtext}>@friend2 • 5h ago</Text>
            <Text style={styles.cardSubtext}>❤️ 12  ✨ 8  💯 6</Text>
          </Card>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FAFAFA',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 24,
    paddingVertical: 16,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#E0E0E0',
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: 'bold',
  },
  notificationBadge: {
    fontSize: 16,
  },
  content: {
    flex: 1,
    paddingHorizontal: 16,
    paddingTop: 16,
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 12,
  },
  placeholder: {
    fontSize: 14,
    color: '#666666',
    fontStyle: 'italic',
    padding: 16,
    backgroundColor: '#F0F0F0',
    borderRadius: 8,
  },
  cardText: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 8,
  },
  cardSubtext: {
    fontSize: 14,
    color: '#666666',
    marginTop: 4,
  },
});

export default FeedScreen;