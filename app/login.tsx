import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import React, { useState } from 'react';
import {
  ActivityIndicator,
  Platform,
  StyleSheet,
  Text,
  View,
} from 'react-native';

import { AnimatedPressable, FadeIn } from '@/components/animations';
import { useAuth } from '@/contexts/AuthContext';
import { Colors } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';

export default function LoginScreen() {
  const { signInWithGoogle, isLoading: authLoading } = useAuth();
  const colorScheme = useColorScheme();
  const [loading, setLoading] = useState(false);
  const c = Colors[colorScheme ?? 'light'];

  const handleGoogleSignIn = async () => {
    setLoading(true);
    try {
      await signInWithGoogle();
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={[styles.container, { backgroundColor: c.background }]}>
      <FadeIn duration={500}>
        <LinearGradient
          colors={colorScheme === 'dark' ? ['#312e81', '#1e1b4b'] : ['#6366f1', '#22d3ee']}
          style={styles.gradient}
        >
          <View style={styles.hero}>
            <View style={styles.iconWrap}>
              <Ionicons name="book" size={56} color="#fff" />
            </View>
            <Text style={styles.title}>IELTS Learn</Text>
            <Text style={styles.subtitle}>
              Build vocabulary, listen to lessons, and track your progress every day.
            </Text>
          </View>
        </LinearGradient>
      </FadeIn>

      <FadeIn delay={200} duration={450}>
        <View style={styles.content}>
          <AnimatedPressable
            style={[styles.googleBtn, (loading || authLoading) && styles.googleBtnDisabled]}
            onPress={handleGoogleSignIn}
            disabled={loading || authLoading}
            scaleDown={0.97}
          >
            {(loading || authLoading) ? (
              <ActivityIndicator color="#333" />
            ) : (
              <>
                <Ionicons name="logo-google" size={24} color="#333" />
                <Text style={styles.googleBtnText}>Continue with Google</Text>
              </>
            )}
          </AnimatedPressable>
          <Text style={[styles.hint, { color: c.textSecondary }]}>
            Sign in to save your progress across devices
          </Text>
        </View>
      </FadeIn>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  gradient: {
    paddingTop: 80,
    paddingBottom: 48,
    paddingHorizontal: 24,
    borderBottomLeftRadius: 32,
    borderBottomRightRadius: 32,
  },
  hero: {
    alignItems: 'center',
  },
  iconWrap: {
    width: 100,
    height: 100,
    borderRadius: 24,
    backgroundColor: 'rgba(255,255,255,0.2)',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 24,
  },
  title: {
    fontSize: 32,
    fontWeight: '800',
    color: '#fff',
    marginBottom: 12,
    letterSpacing: 0.5,
  },
  subtitle: {
    fontSize: 16,
    color: 'rgba(255,255,255,0.9)',
    textAlign: 'center',
    lineHeight: 24,
    paddingHorizontal: 16,
  },
  content: {
    flex: 1,
    padding: 24,
    paddingTop: 48,
  },
  googleBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 12,
    alignSelf: 'stretch',
    backgroundColor: '#fff',
    paddingVertical: 16,
    paddingHorizontal: 24,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: '#e2e8f0',
    ...(Platform.OS === 'ios'
      ? {
          shadowColor: '#000',
          shadowOffset: { width: 0, height: 4 },
          shadowOpacity: 0.1,
          shadowRadius: 12,
        }
      : { elevation: 4 }),
  },
  googleBtnDisabled: {
    opacity: 0.8,
  },
  googleBtnText: {
    fontSize: 17,
    fontWeight: '600',
    color: '#333',
  },
  hint: {
    fontSize: 14,
    textAlign: 'center',
    marginTop: 24,
    lineHeight: 20,
  },
});
