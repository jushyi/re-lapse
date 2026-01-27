import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Image, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import { Button } from '../components';
import { useAuth } from '../context/AuthContext';
import { colors } from '../constants/colors';
import logger from '../utils/logger';

const MAX_SELECTS = 5;

const SelectsScreen = ({ navigation }) => {
  const { user, userProfile, updateUserProfile, updateUserDocumentNative } = useAuth();

  const [selectedPhotos, setSelectedPhotos] = useState([]);
  const [uploading, setUploading] = useState(false);

  const handleAddPhotos = async () => {
    logger.debug('SelectsScreen: Opening photo picker');

    const permissionResult = await ImagePicker.requestMediaLibraryPermissionsAsync();

    if (!permissionResult.granted) {
      Alert.alert('Permission Required', 'Please allow access to your photo library');
      return;
    }

    // Calculate how many more photos can be added
    const remaining = MAX_SELECTS - selectedPhotos.length;

    if (remaining <= 0) {
      Alert.alert('Limit Reached', `You can only select up to ${MAX_SELECTS} photos`);
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ['images'],
      allowsMultipleSelection: true,
      selectionLimit: remaining,
      quality: 0.8,
    });

    if (!result.canceled && result.assets) {
      logger.info('SelectsScreen: Photos selected', { count: result.assets.length });

      const newPhotos = result.assets.map(asset => ({
        uri: asset.uri,
        assetId: asset.assetId || asset.uri,
      }));

      setSelectedPhotos(prev => [...prev, ...newPhotos].slice(0, MAX_SELECTS));
    }
  };

  const handleRemovePhoto = index => {
    logger.debug('SelectsScreen: Removing photo', { index });
    setSelectedPhotos(prev => prev.filter((_, i) => i !== index));
  };

  const handleComplete = async () => {
    logger.info('SelectsScreen: Completing with photos', { count: selectedPhotos.length });
    setUploading(true);

    try {
      // Store selected photo URIs to user profile
      const selectsData = selectedPhotos.map(photo => photo.uri);

      const updateData = {
        selects: selectsData,
        selectsCompleted: true,
      };

      const result = await updateUserDocumentNative(user.uid, updateData);

      if (result.success) {
        // Update local profile state - triggers navigation via AppNavigator
        updateUserProfile({
          ...userProfile,
          ...updateData,
        });
        logger.info('SelectsScreen: Profile updated with selects');
        // Navigation will be handled automatically by AuthContext state change
      } else {
        Alert.alert('Error', 'Could not save your selects. Please try again.');
      }
    } catch (error) {
      logger.error('SelectsScreen: Failed to complete', { error: error.message });
      Alert.alert('Error', error.message || 'An error occurred');
    } finally {
      setUploading(false);
    }
  };

  const handleSkip = async () => {
    logger.info('SelectsScreen: Skipping selects');
    setUploading(true);

    try {
      const updateData = {
        selects: [],
        selectsCompleted: true,
      };

      const result = await updateUserDocumentNative(user.uid, updateData);

      if (result.success) {
        updateUserProfile({
          ...userProfile,
          ...updateData,
        });
        logger.info('SelectsScreen: Skipped selects, profile updated');
        // Navigation will be handled automatically by AuthContext state change
      } else {
        Alert.alert('Error', 'Could not save your profile. Please try again.');
      }
    } catch (error) {
      logger.error('SelectsScreen: Failed to skip', { error: error.message });
      Alert.alert('Error', error.message || 'An error occurred');
    } finally {
      setUploading(false);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContent} keyboardShouldPersistTaps="handled">
        <View style={styles.content}>
          <Text style={styles.title}>Pick Your Selects</Text>
          <Text style={styles.subtitle}>
            Choose up to {MAX_SELECTS} photos to highlight on your profile
          </Text>

          {/* Add Photos Button/Area */}
          <TouchableOpacity style={styles.addPhotosContainer} onPress={handleAddPhotos}>
            <Ionicons name="images-outline" size={48} color={colors.text.secondary} />
            <Text style={styles.addPhotosText}>
              {selectedPhotos.length === 0 ? 'Tap to add photos' : 'Add more photos'}
            </Text>
            <Text style={styles.photoCountText}>
              {selectedPhotos.length} / {MAX_SELECTS} selected
            </Text>
          </TouchableOpacity>

          {/* Selected Photos Preview */}
          {selectedPhotos.length > 0 && (
            <View style={styles.previewSection}>
              <Text style={styles.previewLabel}>Selected:</Text>
              <ScrollView
                horizontal
                showsHorizontalScrollIndicator={false}
                style={styles.previewScroll}
                contentContainerStyle={styles.previewContainer}
              >
                {selectedPhotos.map((photo, index) => (
                  <View key={photo.assetId || index} style={styles.previewItem}>
                    <Image source={{ uri: photo.uri }} style={styles.previewImage} />
                    <TouchableOpacity
                      style={styles.removeButton}
                      onPress={() => handleRemovePhoto(index)}
                    >
                      <Ionicons name="close-circle" size={24} color={colors.status.danger} />
                    </TouchableOpacity>
                  </View>
                ))}
              </ScrollView>
            </View>
          )}

          {/* Action Buttons */}
          <View style={styles.buttonContainer}>
            <Button
              title="Complete"
              variant="primary"
              onPress={handleComplete}
              loading={uploading}
              style={styles.completeButton}
            />

            <Text style={styles.skipText} onPress={handleSkip}>
              Skip for now
            </Text>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background.primary,
  },
  scrollContent: {
    flexGrow: 1,
  },
  content: {
    flex: 1,
    paddingHorizontal: 24,
    paddingTop: 40,
    paddingBottom: 24,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 8,
    color: colors.text.primary,
  },
  subtitle: {
    fontSize: 16,
    textAlign: 'center',
    color: colors.text.secondary,
    marginBottom: 32,
  },
  addPhotosContainer: {
    backgroundColor: colors.background.tertiary,
    borderRadius: 16,
    borderWidth: 2,
    borderColor: colors.border.subtle,
    borderStyle: 'dashed',
    paddingVertical: 48,
    alignItems: 'center',
    justifyContent: 'center',
  },
  addPhotosText: {
    fontSize: 16,
    color: colors.text.secondary,
    marginTop: 12,
  },
  photoCountText: {
    fontSize: 14,
    color: colors.text.tertiary,
    marginTop: 8,
  },
  previewSection: {
    marginTop: 24,
  },
  previewLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.text.secondary,
    marginBottom: 12,
  },
  previewScroll: {
    flexGrow: 0,
  },
  previewContainer: {
    paddingRight: 16,
  },
  previewItem: {
    marginRight: 12,
    position: 'relative',
  },
  previewImage: {
    width: 80,
    height: 80,
    borderRadius: 12,
    backgroundColor: colors.background.tertiary,
  },
  removeButton: {
    position: 'absolute',
    top: -8,
    right: -8,
    backgroundColor: colors.background.primary,
    borderRadius: 12,
  },
  buttonContainer: {
    marginTop: 'auto',
    paddingTop: 24,
  },
  completeButton: {
    marginTop: 8,
  },
  skipText: {
    fontSize: 14,
    color: colors.text.secondary,
    textAlign: 'center',
    marginTop: 16,
    textDecorationLine: 'underline',
  },
});

export default SelectsScreen;
