import { useRouter } from 'expo-router';
import { useEffect } from 'react';
import { ActivityIndicator, StyleSheet, View } from 'react-native';

import { useApp } from '@/contexts/AppContext';

export default function IndexScreen() {
  const router = useRouter();
  const { isLoading, hasOnboarded } = useApp();

  useEffect(() => {
    if (isLoading) return;
    if (hasOnboarded) {
      router.replace('/(tabs)/words');
    } else {
      router.replace('/onboarding');
    }
  }, [isLoading, hasOnboarded, router]);

  return (
    <View style={styles.container}>
      <ActivityIndicator size="large" color="#0a7ea4" />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f5f5f5',
  },
});
