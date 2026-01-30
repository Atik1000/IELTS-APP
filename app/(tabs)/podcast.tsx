import { Ionicons } from '@expo/vector-icons';
import { Audio } from 'expo-av';
import { LinearGradient } from 'expo-linear-gradient';
import React, { useCallback, useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Platform,
  StyleSheet,
  Text,
  View,
} from 'react-native';

import { AnimatedPressable, FadeIn, PulsingView } from '@/components/animations';
import { useApp } from '@/contexts/AppContext';
import { getTodayPodcast } from '@/lib/firestore';
import type { PodcastDoc } from '@/lib/firestore';
import { PLACEHOLDER_PODCAST } from '@/lib/data';
import { Colors } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';

function useDailyPodcast() {
  const [podcast, setPodcast] = useState<PodcastDoc | null>(null);
  const [loading, setLoading] = useState(true);
  useEffect(() => {
    let cancelled = false;
    getTodayPodcast()
      .then((p) => {
        if (!cancelled) setPodcast(p);
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => { cancelled = true; };
  }, []);
  return { podcast, loading };
}

export default function DailyPodcastScreen() {
  const { todayKey, podcastListened, markPodcastListened } = useApp();
  const { podcast: dbPodcast, loading } = useDailyPodcast();
  const listened = podcastListened[todayKey] ?? false;
  const colorScheme = useColorScheme();
  const c = Colors[colorScheme ?? 'light'];

  const podcast = dbPodcast ?? {
    id: PLACEHOLDER_PODCAST.id,
    title: PLACEHOLDER_PODCAST.title,
    description: PLACEHOLDER_PODCAST.description,
    duration: PLACEHOLDER_PODCAST.duration,
    audioUrl: PLACEHOLDER_PODCAST.audioUri,
    order: 0,
  };

  const [sound, setSound] = useState<Audio.Sound | null>(null);
  const [playing, setPlaying] = useState(false);
  const [audioLoading, setAudioLoading] = useState(false);
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
        if (playing) await sound.pauseAsync();
        else await sound.playAsync();
        setPlaying(!playing);
        return;
      }
      setAudioLoading(true);
      setError(null);
      const { sound: newSound } = await Audio.Sound.createAsync(
        { uri: podcast.audioUrl },
        { shouldPlay: true }
      );
      setSound(newSound);
      setPlaying(true);
      newSound.setOnPlaybackStatusUpdate((status) => {
        if (status.isLoaded && status.didJustFinish) setPlaying(false);
      });
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Failed to load audio');
    } finally {
      setAudioLoading(false);
    }
  };

  if (loading) {
    return (
      <View style={[styles.container, { backgroundColor: c.background }]}>
        <ActivityIndicator size="large" color={c.tint} style={styles.loader} />
      </View>
    );
  }

  return (
    <View style={[styles.container, { backgroundColor: c.background }]}>
      <FadeIn duration={500} style={styles.fadeWrap}>
        <View style={[styles.card, { backgroundColor: c.surface, borderColor: c.border }]}>
          <LinearGradient
            colors={[c.tint, c.accent]}
            style={styles.cardHeader}
          >
            <Ionicons name="headset" size={40} color="#fff" />
            <Text style={styles.title}>{podcast.title}</Text>
            <Text style={styles.duration}>{podcast.duration}</Text>
          </LinearGradient>
          <Text style={[styles.description, { color: c.textSecondary }]}>{podcast.description}</Text>

          {error && <Text style={styles.error}>{error}</Text>}

          <PulsingView isActive={playing && !audioLoading} style={styles.playWrap}>
            <AnimatedPressable
              style={[
                styles.playButton,
                { backgroundColor: c.tint },
                audioLoading && styles.playButtonDisabled,
              ]}
              onPress={togglePlay}
              disabled={audioLoading}
              scaleDown={0.92}
            >
              {audioLoading ? (
                <ActivityIndicator color="#fff" />
              ) : (
                <Ionicons name={playing ? 'pause' : 'play'} size={40} color="#fff" />
              )}
            </AnimatedPressable>
          </PulsingView>
          <Text style={[styles.playLabel, { color: c.textSecondary }]}>
            {playing ? 'Pause' : 'Play'} audio
          </Text>

          <AnimatedPressable
            style={[styles.listenedBtn, listened && { backgroundColor: c.tint }]}
            onPress={() => markPodcastListened()}
            disabled={listened}
            scaleDown={0.96}
          >
            <Text style={[styles.listenedBtnText, listened && styles.listenedBtnTextActive]}>
              {listened ? '✓ Listened' : 'Mark as listened'}
            </Text>
          </AnimatedPressable>
        </View>
      </FadeIn>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
  },
  loader: {
    marginTop: 48,
  },
  fadeWrap: {
    flex: 1,
  },
  playWrap: {
    alignSelf: 'center',
  },
  card: {
    borderRadius: 20,
    overflow: 'hidden',
    borderWidth: 1,
    ...(Platform.OS === 'ios'
      ? { shadowColor: '#000', shadowOffset: { width: 0, height: 6 }, shadowOpacity: 0.08, shadowRadius: 16 }
      : { elevation: 6 }),
  },
  cardHeader: {
    padding: 24,
    alignItems: 'center',
  },
  title: {
    fontSize: 22,
    fontWeight: '700',
    color: '#fff',
    textAlign: 'center',
    marginTop: 12,
    marginBottom: 4,
  },
  duration: {
    fontSize: 14,
    color: 'rgba(255,255,255,0.9)',
  },
  description: {
    fontSize: 16,
    textAlign: 'center',
    lineHeight: 24,
    marginHorizontal: 20,
    marginTop: 20,
    marginBottom: 24,
  },
  error: {
    fontSize: 14,
    color: '#ef4444',
    marginBottom: 12,
    textAlign: 'center',
  },
  playButton: {
    width: 88,
    height: 88,
    borderRadius: 44,
    justifyContent: 'center',
    alignItems: 'center',
    alignSelf: 'center',
    marginBottom: 8,
    ...(Platform.OS === 'ios'
      ? { shadowColor: '#6366f1', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.3, shadowRadius: 8 }
      : { elevation: 6 }),
  },
  playButtonDisabled: {
    opacity: 0.8,
  },
  playLabel: {
    fontSize: 14,
    marginBottom: 28,
    textAlign: 'center',
  },
  listenedBtn: {
    paddingVertical: 14,
    paddingHorizontal: 28,
    borderRadius: 12,
    backgroundColor: '#e2e8f0',
    alignSelf: 'center',
    marginBottom: 24,
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
