import AsyncStorage from '@react-native-async-storage/async-storage';
import { useRouter } from 'expo-router';
import { useEffect } from 'react';
import { ActivityIndicator, Text, View } from 'react-native';
import { supabase } from '../../src/utils/supabase';
import React from 'react';

export default function AuthCallback() {
  const router = useRouter();

  useEffect(() => {
    const handleAuthCallback = async () => {
      try {
        // Parse the session from the URL after OAuth redirect and store it
        // This ensures the Supabase client processes the access token returned
        // in the redirect URL (hash or query params) for web flows.
        const { data, error } = await supabase.auth.getSessionFromUrl();
        const session = data?.session;

        if (error) {
          console.error('Auth callback error:', error);
          console.log('Redirecting to auth due to error');
          router.replace('/(auth)/index');
          return;
        }

        if (session?.user) {
          const user = session.user;

          // Save to AsyncStorage
          await AsyncStorage.setItem(
            '@user',
            JSON.stringify({
              email: user.email,
              name: user.user_metadata?.full_name || '',
              avatar_url: user.user_metadata?.avatar_url || '',
            })
          );

          // Save to Supabase users table
          await supabase.from('users').upsert([
            {
              id: user.id,
              email: user.email,
              name: user.user_metadata?.full_name || '',
            },
          ]);

          await AsyncStorage.setItem('@user_onboarded', 'true');

          console.log('Auth successful, redirecting to tabs...');
          // Navigate to tabs using full href for web compatibility
          router.replace('/(tabs)/index');
        } else {
          // No session, go back to onboarding
          console.log('No session found, redirecting to auth');
          router.replace('/(auth)/index');
        }
      } catch (err) {
        console.error('Error in auth callback:', err);
        console.log('Redirecting to auth due to error');
        router.replace('/(auth)/index');
      }
    };

    handleAuthCallback();
  }, [router]);

  return (
    <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#000' }}>
      <ActivityIndicator size="large" color="#fff" />
      <Text style={{ color: '#fff', marginTop: 16 }}>Completing sign-in...</Text>
    </View>
  );
}
