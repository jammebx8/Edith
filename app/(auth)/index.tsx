import { View, Text, StyleSheet, Image, ImageBackground,StatusBar } from 'react-native';
import React, { useEffect, useState } from 'react';
import { router, useNavigation } from 'expo-router';
import imagepath from '../../src/constants/imagepath';
import { SafeAreaView } from 'react-native-safe-area-context';
import AsyncStorage from '@react-native-async-storage/async-storage';

const Auth = () => {
  const [isloading, setIsLoading] = useState(false);
  const gifDisplayTime = 3000; // Set the GIF display time in milliseconds (e.g., 5000 = 5 seconds)

  let navigate_to_welcome = () => {
    router.push('/terms_agree'); // Navigate to the Onboarding screen     ////     (auth)/Onboarding
  };

  const navigation = useNavigation();
  useEffect(() => {
    // If onboarding is already done, redirect to (tabs)
    const checkOnboarded = async () => {
      const onboarded = await AsyncStorage.getItem('@user_onboarded');
      if (onboarded === 'true') {
        navigation.reset({
          index: 0,
          routes: [{ name: "edith" }],
        });
      }
    };
    checkOnboarded();
  }, []);

  let loading_timeout = () => {
    setIsLoading(true);
    setTimeout(navigate_to_welcome, gifDisplayTime); // Use gifDisplayTime here
  };

  useEffect(() => {
    const timeout = setTimeout(loading_timeout, 0); // Initial delay before GIF starts
    return () => {
      clearTimeout(timeout);
    };
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
              source={require('../../src/assets/images/667.gif')} // Replace with your GIF path
              style={{ width: 60, height: 60}} // Adjust size as needed
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


