import {
  GoogleAuthProvider,
  onAuthStateChanged,
  signInWithCredential,
  signOut as firebaseSignOut,
  type User,
} from 'firebase/auth';
import * as AuthSession from 'expo-auth-session';
import * as WebBrowser from 'expo-web-browser';
import React, { createContext, useCallback, useContext, useEffect, useState } from 'react';
import { Platform } from 'react-native';

import { auth } from '@/lib/firebase';

WebBrowser.maybeCompleteAuthSession();

type AuthState = {
  user: User | null;
  isLoading: boolean;
};

type AuthContextType = AuthState & {
  signInWithGoogle: () => Promise<void>;
  signOut: () => Promise<void>;
};

const AuthContext = createContext<AuthContextType | null>(null);

const GOOGLE_WEB_CLIENT_ID = process.env.EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID ?? '';

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, (u) => {
      setUser(u ?? null);
      setIsLoading(false);
    });
    return unsub;
  }, []);

  const signInWithGoogle = useCallback(async () => {
    if (!GOOGLE_WEB_CLIENT_ID) {
      console.warn('EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID not set. Add it to .env or app config.');
      return;
    }
    try {
      const redirectUri = AuthSession.makeRedirectUri({
        scheme: 'ieltsapp',
        path: 'redirect',
        useProxy: Platform.OS === 'web' ? false : true,
      });

      const request = new AuthSession.AuthRequest({
        clientId: GOOGLE_WEB_CLIENT_ID,
        scopes: ['openid', 'email', 'profile'],
        redirectUri,
        responseType: AuthSession.ResponseType.IdToken,
        usePKCE: true,
      });

      await request.makeAuthUrlAsync();
      const result = await request.promptAsync({
        useProxy: Platform.OS === 'web' ? false : true,
        showInRecents: true,
      });

      if (result.type !== 'success') return;

      const { id_token } = result.params;
      if (!id_token) {
        console.warn('No id_token in response. Try using token exchange (code flow).');
        return;
      }

      const credential = GoogleAuthProvider.credential(id_token);
      await signInWithCredential(auth, credential);
    } catch (e) {
      console.error('Google sign-in error:', e);
    }
  }, []);

  const signOut = useCallback(async () => {
    await firebaseSignOut(auth);
  }, []);

  const value: AuthContextType = {
    user,
    isLoading,
    signInWithGoogle,
    signOut,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}
