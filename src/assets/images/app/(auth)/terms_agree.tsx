import { View, Text, StyleSheet, ImageBackground,StatusBar } from 'react-native';
import React, { useEffect } from 'react';
import { SafeAreaView } from 'react-native-safe-area-context';

import imagepath from '../../src/constants/imagepath';
import ButtonComp from "../../src/components/atoms/ButtonComp";
import { useRouter } from 'expo-router';
import AsyncStorage from '@react-native-async-storage/async-storage';

import { scale, verticalScale, moderateScale } from 'react-native-size-matters';


const TermsAgree = () => {
  const router = useRouter();

  useEffect(() => {
    const checkAgreement = async () => {
      const agreed = await AsyncStorage.getItem('userAgreedToTerms');
      if (agreed === 'true') {
        router.replace('/Onboarding'); // Skip this screen
      }
    };
    checkAgreement();
  }, []);

  const onAgree = async () => {
    await AsyncStorage.setItem('userAgreedToTerms', 'true');
    router.push('/Onboarding');
  };

  return (

    
    <SafeAreaView style={{ backgroundColor: "#0B0B28", flex: 1 }}>
      <StatusBar barStyle="light-content" backgroundColor="#0a0517" />
      <ImageBackground 
        source={imagepath.welcome} 
        style={styles.background_image}
        resizeMode='cover'
      >
        <View style={styles.overlay}>
          <Text style={styles.welcome_text}>Welcome to Rookie</Text>

          <Text style={styles.description_text}>
            Read our <Text style={styles.link_text}>Privacy Policy</Text>. Tap "Agree and continue" to accept the
            <Text style={styles.link_text}> Terms of Service</Text>
          </Text>

          <ButtonComp title="AGREE AND CONTINUE" onPress={onAgree} />

          <View style={styles.footer}>
            <Text style={styles.from_text}>From</Text>
            <Text style={styles.pookie_text}>Dhruv Pathak</Text>
          </View>
        </View>
      </ImageBackground>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  background_image: {
    flex: 1,
    width: '100%',
    height: '100%',
  },
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(11, 11, 40, 0.5)',
    paddingVertical: verticalScale(65),
    paddingHorizontal: scale(20),
    justifyContent: 'space-between',
  },
  footer: {
    alignItems: "center",
  },
  from_text: {
    fontSize: moderateScale(12),
    color: "white",
    paddingBottom: verticalScale(10),
  },
  pookie_text: {
    paddingTop: verticalScale(10),
    color: "white",
    fontWeight: "bold",
    fontSize: moderateScale(14),
  },
  welcome_text: {
    color: "white",
    fontWeight: "bold",
    fontSize: moderateScale(30),
    textAlign: "center",
    marginTop: verticalScale(20),
  },
  description_text: {
    color: "white",
    textAlign: "center",
    fontSize: moderateScale(13),
  },
  link_text: {
    color: "#34B7F1"
  }
});

export default TermsAgree;







