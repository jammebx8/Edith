import { View, Text, StyleSheet, Image, StatusBar } from 'react-native';
import React, { useEffect, useState } from 'react';
import { router, useNavigation } from 'expo-router';
import imagepath from '../../src/constants/imagepath';
import { SafeAreaView } from 'react-native-safe-area-context';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { supabase } from '../../src/utils/supabase';

const Auth = () => {
  const [isloading, setIsLoading] = useState(false);
  const gifDisplayTime = 3000; // GIF display time in milliseconds

  let navigate_to_terms = () => {
    router.push('/terms_agree');
  };

  const navigation = useNavigation();

  // Show the GIF and after gifDisplayTime navigate to terms_agree
  let loading_timeout = () => {
    setIsLoading(true);
    setTimeout(navigate_to_terms, gifDisplayTime);
  };

  useEffect(() => {
    let subscription: any;

    const init = async () => {
      try {
        // 1) If there is already a Supabase session, go to Onboarding to let it finish processing
        const { data: { session } } = await supabase.auth.getSession();
        if (session?.user) {
          // Let Onboarding handle DB rows / AsyncStorage / final redirect to (tabs)
          router.replace('/Onboarding');
          return;
        }
      } catch (err) {
        console.warn('Error checking supabase session on splash:', err);
      }

      try {
        // 2) If local onboard flag already set, go straight to (tabs)
        const onboarded = await AsyncStorage.getItem('@user_onboarded');
        if (onboarded === 'true') {
          navigation.reset({
            index: 0,
            routes: [{ name: "(tabs)" }],
          });
          return;
        }
      } catch (err) {
        console.warn('Error reading @user_onboarded in splash:', err);
      }

      // 3) No session and not onboarded: show GIF then push to terms_agree
      loading_timeout();
    };

    init();

    // Listen for auth state changes while splash is visible.
    // This catches the SIGNED_IN event from a redirect flow and prevents the app from routing to terms_agree prematurely.
    const { data } = supabase.auth.onAuthStateChange((event, session) => {
      if (event === 'SIGNED_IN' && session?.user) {
        // send to Onboarding which contains flow to upsert user and navigate to (tabs) if ready
        router.replace('/Onboarding');
      }
    });
    subscription = data?.subscription;

    return () => {
      subscription?.unsubscribe?.();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <SafeAreaView style={style.container}>
      <StatusBar barStyle="light-content" backgroundColor="#000000" />

      <View style={style.header}></View>

      <View style={style.body}>
        <Image source={imagepath.homelogo} style={style.logo_style} resizeMode="contain" />
      </View>

      <View style={style.footer}>
        {isloading ? (
          <View style={{ alignItems: 'center' }}>
            <Image
              source={require('../../src/assets/images/667.gif')}
              style={{ width: 60, height: 60 }}
            />
          </View>
        ) : (
          <View style={{ alignItems: 'center' }}>
            <Text style={style.from_text}>From</Text>
            <Text style={style.pookie_text}>Dhruv Pathak</Text>
          </View>
        )}
      </View>

    </SafeAreaView>
  );
};

const style = StyleSheet.create({
  background_image: {
    flex: 1,
    width: 'auto',
    height: 'auto',
  },

  container: {
    flex: 1,
    backgroundColor: '#000000',
  },
  header: {},
  body: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  footer: {
    height: 100,
    alignItems: 'center',
  },
  from_text: {
    fontSize: 12,
    color: 'white',
  },
  pookie_text: {
    color: 'white',
    paddingTop: 20,
    fontWeight: 'bold',
    marginBottom: 40,
  },
  logo_style: {
    width: 200,
    height: 200,
  },
  loading_text: {
    color: 'white',
    marginTop: 15,
  },
});

export default Auth;
