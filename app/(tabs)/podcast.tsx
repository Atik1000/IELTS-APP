import { Ionicons } from '@expo/vector-icons';
import { Audio } from 'expo-av';
import React, { useCallback, useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Pressable,
  StyleSheet,
  Text,
  View,
} from 'react-native';

import { useApp } from '@/contexts/AppContext';
import { PLACEHOLDER_PODCAST } from '@/lib/data';

export default function DailyPodcastScreen() {
  const { todayKey, podcastListened, markPodcastListened } = useApp();
  const listened = podcastListened[todayKey] ?? false;

  const [sound, setSound] = useState<Audio.Sound | null>(null);
  const [playing, setPlaying] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const unloadSound = useCallback(async () => {
    if (sound) {
      await sound.unloadAsync();
      setSound(null);
    }
    setPlaying(false);
  }, [sound]);

  useEffect(() => {
    return () => {
      unloadSound();
    };
  }, [unloadSound]);

  const togglePlay = async () => {
    try {
      if (sound) {
        if (playing) {
          await sound.pauseAsync();
        } else {
          await sound.playAsync();
        }
        setPlaying(!playing);
        return;
      }

      setLoading(true);
      setError(null);
      const { sound: newSound } = await Audio.Sound.createAsync(
        { uri: PLACEHOLDER_PODCAST.audioUri },
        { shouldPlay: true }
      );
      setSound(newSound);
      setPlaying(true);

      newSound.setOnPlaybackStatusUpdate((status) => {
        if (status.isLoaded && status.didJustFinish) {
          setPlaying(false);
        }
      });
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Failed to load audio');
    } finally {
      setLoading(false);
    }
  };

  const handleMarkListened = async () => {
    await markPodcastListened();
  };

  return (
    <View style={styles.container}>
      <View style={styles.card}>
        <Text style={styles.title}>{PLACEHOLDER_PODCAST.title}</Text>
        <Text style={styles.duration}>{PLACEHOLDER_PODCAST.duration}</Text>
        <Text style={styles.description}>{PLACEHOLDER_PODCAST.description}</Text>

        {error && <Text style={styles.error}>{error}</Text>}

        <Pressable
          style={[styles.playButton, loading && styles.playButtonDisabled]}
          onPress={togglePlay}
          disabled={loading}
        >
          {loading ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <Ionicons
              name={playing ? 'pause' : 'play'}
              size={40}
              color="#fff"
            />
          )}
        </Pressable>
        <Text style={styles.playLabel}>{playing ? 'Pause' : 'Play'} audio</Text>

        <Pressable
          style={[styles.listenedBtn, listened && styles.listenedBtnActive]}
          onPress={handleMarkListened}
          disabled={listened}
        >
          <Text style={[styles.listenedBtnText, listened && styles.listenedBtnTextActive]}>
            {listened ? '✓ Listened' : 'Mark as listened'}
          </Text>
        </Pressable>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
    padding: 16,
  },
  card: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 24,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#e0e0e0',
  },
  title: {
    fontSize: 22,
    fontWeight: '700',
    color: '#1a1a1a',
    textAlign: 'center',
    marginBottom: 8,
  },
  duration: {
    fontSize: 14,
    color: '#666',
    marginBottom: 16,
  },
  description: {
    fontSize: 16,
    color: '#333',
    textAlign: 'center',
    lineHeight: 24,
    marginBottom: 24,
  },
  error: {
    fontSize: 14,
    color: '#c00',
    marginBottom: 12,
  },
  playButton: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: '#0a7ea4',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 8,
  },
  playButtonDisabled: {
    opacity: 0.7,
  },
  playLabel: {
    fontSize: 14,
    color: '#666',
    marginBottom: 24,
  },
  listenedBtn: {
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 8,
    backgroundColor: '#e0e0e0',
  },
  listenedBtnActive: {
    backgroundColor: '#0a7ea4',
  },
  listenedBtnText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
  },
  listenedBtnTextActive: {
    color: '#fff',
  },
});
