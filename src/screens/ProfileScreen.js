import { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Image,
  ActivityIndicator,
  TouchableOpacity,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import { Button } from '../components';
import { useAuth } from '../context/AuthContext';
import { getFirestore, collection, query, where, getDocs } from '@react-native-firebase/firestore';
import { getFriendUserIds } from '../services/firebase/friendshipService';
import { colors } from '../constants/colors';
import logger from '../utils/logger';

// Initialize Firestore
const db = getFirestore();

const ProfileScreen = () => {
  const navigation = useNavigation();
  const { signOut, user, userProfile } = useAuth();
  const [stats, setStats] = useState({ posts: 0, friends: 0, reactions: 0 });
  const [loading, setLoading] = useState(true);

  // Load user stats on mount
  useEffect(() => {
    const loadStats = async () => {
      if (!user) return;

      try {
        setLoading(true);

        // Get total photos (journaled + archived)
        const photosQuery = query(
          collection(db, 'photos'),
          where('userId', '==', user.uid),
          where('status', '==', 'triaged')
        );
        const photosSnapshot = await getDocs(photosQuery);
        const postsCount = photosSnapshot.size;

        // Get friends count
        const friendIds = await getFriendUserIds(user.uid);
        const friendsCount = friendIds.length;

        // Get total reactions received on user's photos
        let reactionsCount = 0;
        photosSnapshot.docs.forEach(doc => {
          const photoData = doc.data();
          reactionsCount += photoData.reactionCount || 0;
        });

        setStats({
          posts: postsCount,
          friends: friendsCount,
          reactions: reactionsCount,
        });
      } catch (error) {
        logger.error('Error loading profile stats', error);
      } finally {
        setLoading(false);
      }
    };

    loadStats();
  }, [user]);

  const handleSignOut = async () => {
    await signOut();
  };

  // Show loading state while fetching data
  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={colors.text.primary} />
          <Text style={styles.loadingText}>Loading profile...</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView style={styles.content}>
        <View style={styles.header}>
          <View style={styles.headerSpacer} />
          <Text style={styles.headerTitle}>Profile</Text>
          <TouchableOpacity
            onPress={() => {
              logger.debug('ProfileScreen: Settings button pressed');
              navigation.navigate('Settings');
            }}
            style={styles.settingsButton}
          >
            <Ionicons name="settings-outline" size={24} color={colors.text.primary} />
          </TouchableOpacity>
        </View>

        <View style={styles.profileSection}>
          {userProfile?.profilePhotoURL ? (
            <Image source={{ uri: userProfile.profilePhotoURL }} style={styles.profilePhoto} />
          ) : (
            <View style={styles.profilePhoto}>
              <Text style={styles.profilePhotoText}>
                {userProfile?.displayName?.charAt(0).toUpperCase() || '👤'}
              </Text>
            </View>
          )}
          <Text style={styles.username}>@{userProfile?.username || 'username'}</Text>
          <Text style={styles.bio}>
            {userProfile?.bio || 'No bio yet. Tap Edit Profile to add one.'}
          </Text>

          <View style={styles.stats}>
            <View style={styles.statItem}>
              <Text style={styles.statValue}>{stats.posts}</Text>
              <Text style={styles.statLabel}>Photos</Text>
            </View>
            <View style={styles.statItem}>
              <Text style={styles.statValue}>{stats.friends}</Text>
              <Text style={styles.statLabel}>Friends</Text>
            </View>
            <View style={styles.statItem}>
              <Text style={styles.statValue}>{stats.reactions}</Text>
              <Text style={styles.statLabel}>Reactions</Text>
            </View>
          </View>
        </View>

        <View style={styles.comingSoonSection}>
          <Text style={styles.comingSoonIcon}>📸</Text>
          <Text style={styles.comingSoonTitle}>Photo Gallery</Text>
          <Text style={styles.comingSoonText}>
            Your photo gallery and filters will be available in the next update
          </Text>
        </View>

        <Button
          title="Edit Profile"
          variant="outline"
          onPress={() => logger.debug('Edit profile button pressed')}
          style={styles.editButton}
        />

        <Button
          title="Sign Out"
          variant="secondary"
          onPress={handleSignOut}
          style={styles.signOutButton}
        />
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background.primary,
  },
  content: {
    flex: 1,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: colors.background.primary,
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    color: colors.text.secondary,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 16,
    backgroundColor: colors.background.secondary,
    borderBottomWidth: 1,
    borderBottomColor: colors.border.subtle,
  },
  headerSpacer: {
    width: 40,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: colors.text.primary,
  },
  settingsButton: {
    padding: 8,
  },
  profileSection: {
    alignItems: 'center',
    paddingVertical: 32,
    backgroundColor: colors.background.secondary,
  },
  profilePhoto: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: colors.background.tertiary,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
    overflow: 'hidden',
  },
  profilePhotoText: {
    fontSize: 48,
  },
  username: {
    fontSize: 20,
    fontWeight: '600',
    color: colors.text.primary,
    marginBottom: 8,
  },
  bio: {
    fontSize: 14,
    color: colors.text.secondary,
    marginBottom: 24,
    textAlign: 'center',
  },
  stats: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    width: '80%',
  },
  statItem: {
    alignItems: 'center',
  },
  statValue: {
    fontSize: 18,
    fontWeight: 'bold',
    color: colors.text.primary,
  },
  statLabel: {
    fontSize: 12,
    color: colors.text.secondary,
    marginTop: 4,
  },
  comingSoonSection: {
    alignItems: 'center',
    paddingVertical: 40,
    paddingHorizontal: 32,
    backgroundColor: colors.background.secondary,
    marginTop: 16,
    marginHorizontal: 16,
    borderRadius: 12,
  },
  comingSoonIcon: {
    fontSize: 48,
    marginBottom: 12,
  },
  comingSoonTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: colors.text.primary,
    marginBottom: 8,
  },
  comingSoonText: {
    fontSize: 14,
    color: colors.text.secondary,
    textAlign: 'center',
    lineHeight: 20,
  },
  editButton: {
    marginHorizontal: 24,
    marginBottom: 16,
  },
  signOutButton: {
    marginHorizontal: 24,
    marginBottom: 24,
  },
});

export default ProfileScreen;
