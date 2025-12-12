// app/layout.tsx
import React, { useCallback, useEffect, useState } from 'react';
import { Slot } from 'expo-router';
import { StatusBar, View } from 'react-native';
import * as SplashScreen from 'expo-splash-screen';
import * as Font from 'expo-font';

SplashScreen.preventAutoHideAsync();

export default function Layout() {
  const [fontsLoaded, setFontsLoaded] = useState(false);

  useEffect(() => {
    async function loadFonts() {
      await Font.loadAsync({
        Geist: require('../src/assets/fonts/ttf/gggg.ttf'), // ✅ Your .ttf font file
         Geistmono: require('../src/assets/fonts/ttf/mono.ttf'), // ✅ Your .ttf font file
      });
      setFontsLoaded(true);
    }

    loadFonts();
  }, []);

  const onLayoutRootView = useCallback(async () => {
    if (fontsLoaded) {
      await SplashScreen.hideAsync();
    }
  }, [fontsLoaded]);

  if (!fontsLoaded) return null;

  return (
    <View style={{ flex: 1 }} onLayout={onLayoutRootView}>
      <StatusBar barStyle="light-content" backgroundColor="#0a0517" />
      <Slot />
    </View>
  );
}



