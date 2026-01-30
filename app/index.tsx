import { useRouter } from 'expo-router';
import { useEffect } from 'react';
import { ActivityIndicator, StyleSheet, View } from 'react-native';

import { useAuth } from '@/contexts/AuthContext';
import { useApp } from '@/contexts/AppContext';
import { Colors } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';

export default function IndexScreen() {
  const router = useRouter();
  const { user, isLoading: authLoading } = useAuth();
  const { isLoading: appLoading, hasOnboarded } = useApp();
  const colorScheme = useColorScheme();
  const tint = Colors[colorScheme ?? 'light'].tint;

  useEffect(() => {
    if (authLoading) return;
    if (!user) {
      router.replace('/login');
      return;
    }
    if (appLoading) return;
    if (hasOnboarded) {
      router.replace('/(tabs)/words');
    } else {
      router.replace('/onboarding');
    }
  }, [user, authLoading, appLoading, hasOnboarded, router]);

  return (
    <View style={[styles.container, { backgroundColor: Colors[colorScheme ?? 'light'].background }]}>
      <ActivityIndicator size="large" color={tint} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
});
