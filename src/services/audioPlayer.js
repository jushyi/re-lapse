/**
 * Audio Player Service
 *
 * Provides audio preview playback for profile songs with:
 * - Clip range support (start/end positions)
 * - Progress callbacks
 *
 * Uses expo-av for cross-platform audio support.
 */

import { Audio } from 'expo-av';
import logger from '../utils/logger';

// Configure audio to play even in silent mode (like music apps)
// This must be called before any sound is played
Audio.setAudioModeAsync({
  allowsRecordingIOS: false,
  staysActiveInBackground: false, // Songs stop when navigating away
  playsInSilentModeIOS: true, // Key setting: play through speakers regardless of silent switch
  shouldDuckAndroid: true,
  playThroughEarpieceAndroid: false,
}).catch(error => {
  logger.error('audioPlayer: Failed to set audio mode', { error: error?.message });
});

// Module-level state for single sound instance
let currentSound = null;
let clipEndTimeout = null;

/**
 * Play a preview clip with optional start/end positions and fade out.
 *
 * @param {string} previewUrl - URL of the audio preview
 * @param {Object} options - Playback options
 * @param {number} options.clipStart - Start position in seconds (default 0)
 * @param {number} options.clipEnd - End position in seconds (default 30)
 * @param {function} options.onProgress - Progress callback (receives 0-1)
 * @param {function} options.onComplete - Called when playback ends
 * @returns {Promise<Audio.Sound|null>} Sound object for external control
 */
export const playPreview = async (previewUrl, options = {}) => {
  const { clipStart = 0, clipEnd = 30, onProgress, onComplete } = options;

  logger.debug('audioPlayer: Starting playback', { previewUrl, clipStart, clipEnd });

  // Stop any existing playback first
  await stopPreview();

  try {
    // Create new sound instance
    const { sound } = await Audio.Sound.createAsync({ uri: previewUrl }, { shouldPlay: false });

    currentSound = sound;

    // Seek to clip start position
    if (clipStart > 0) {
      await sound.setPositionAsync(clipStart * 1000);
    }

    // Set progress update interval for smooth animations (50ms = 20 updates/sec)
    await sound.setProgressUpdateIntervalAsync(50);

    // Set up playback status update handler
    sound.setOnPlaybackStatusUpdate(status => {
      if (!status.isLoaded) return;

      const currentPositionSec = status.positionMillis / 1000;
      const clipDuration = clipEnd - clipStart;
      const elapsed = currentPositionSec - clipStart;

      // Calculate progress within clip range (0-1)
      const progress = Math.min(Math.max(elapsed / clipDuration, 0), 1);

      if (onProgress) {
        onProgress(progress);
      }

      // Stop at clip end (immediate cut, no fade)
      if (currentPositionSec >= clipEnd) {
        logger.debug('audioPlayer: Reached clip end, stopping');
        cleanupSound(sound);
        if (onComplete) {
          onComplete();
        }
      }

      // Handle natural playback completion
      if (status.didJustFinish) {
        logger.debug('audioPlayer: Playback finished naturally');
        cleanupSound(sound);
        if (onComplete) {
          onComplete();
        }
      }
    });

    // Start playback
    await sound.playAsync();
    logger.info('audioPlayer: Playback started');

    // Backup timeout to ensure playback stops at clipEnd
    const clipDurationMs = (clipEnd - clipStart) * 1000;
    clipEndTimeout = setTimeout(() => {
      logger.debug('audioPlayer: Clip end timeout triggered');
      stopPreview();
      if (onComplete) {
        onComplete();
      }
    }, clipDurationMs + 100); // Small buffer

    return sound;
  } catch (error) {
    logger.error('audioPlayer: Failed to start playback', { error: error?.message });
    return null;
  }
};

/**
 * Stop current preview playback immediately.
 */
export const stopPreview = async () => {
  logger.debug('audioPlayer: Stopping playback');

  // Clear timeout
  if (clipEndTimeout) {
    clearTimeout(clipEndTimeout);
    clipEndTimeout = null;
  }

  // Stop immediately (no fade)
  if (currentSound) {
    const sound = currentSound;
    currentSound = null;
    await cleanupSound(sound);
  }
};

/**
 * Clean up a sound instance (stop and unload).
 *
 * @param {Audio.Sound} sound - Sound instance to cleanup
 */
const cleanupSound = async sound => {
  if (!sound) return;

  try {
    await sound.stopAsync();
  } catch (_error) {
    // Ignore - may already be stopped
  }

  try {
    await sound.unloadAsync();
  } catch (_error) {
    // Ignore - may already be unloaded
  }
};

/**
 * Pause current preview playback.
 */
export const pausePreview = async () => {
  if (currentSound) {
    try {
      await currentSound.pauseAsync();
      logger.debug('audioPlayer: Paused');
    } catch (error) {
      logger.debug('audioPlayer: Pause failed', { error: error?.message });
    }
  }
};

/**
 * Resume current preview playback.
 */
export const resumePreview = async () => {
  if (currentSound) {
    try {
      await currentSound.playAsync();
      logger.debug('audioPlayer: Resumed');
    } catch (error) {
      logger.debug('audioPlayer: Resume failed', { error: error?.message });
    }
  }
};

/**
 * Seek to a specific position in the preview.
 *
 * @param {number} seconds - Position to seek to in seconds
 */
export const seekTo = async seconds => {
  if (currentSound) {
    try {
      await currentSound.setPositionAsync(seconds * 1000);
      logger.debug('audioPlayer: Seeked to', { seconds });
    } catch (error) {
      logger.debug('audioPlayer: Seek failed', { error: error?.message });
    }
  }
};
