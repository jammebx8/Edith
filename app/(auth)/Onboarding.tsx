import AsyncStorage from '@react-native-async-storage/async-storage';
import { useNavigation } from "@react-navigation/native";
import { makeRedirectUri } from 'expo-auth-session';
import * as WebBrowser from 'expo-web-browser'; // If using Expo
import React, { useEffect, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Image,
  ImageBackground,
  Platform,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { moderateScale, scale, verticalScale } from "react-native-size-matters";
import { supabase } from "../../src/utils/supabase"; // adjust path as needed


const GENDER_OPTIONS = ["Male", "Female", "Other"];
const EXAM_OPTIONS = ["JEE Mains", "NEET", "JEE Advanced", "Other"];

WebBrowser.maybeCompleteAuthSession(); // Needed for Expo Auth flows

export default function Onboarding() {
  const navigation = useNavigation();
  const [fullName, setFullName] = useState("");
  const [gender, setGender] = useState("");
  const [exam, setExam] = useState("");
  const [inputComplete, setInputComplete] = useState(false);
  const [loading, setLoading] = useState(false);
  const [authLoading, setAuthLoading] = useState(false);

  useEffect(() => {
    // Check if user is already onboarded
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

    // Listen for auth state changes (from Google OAuth redirect)
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        console.log('Auth state changed:', event, session?.user?.email);
        
        if (event === 'SIGNED_IN' && session?.user) {
          // User just signed in via Google
          const user = session.user;
          
          // Save user to AsyncStorage
          await AsyncStorage.setItem('@user', JSON.stringify({
            email: user.email,
            name: user.user_metadata?.full_name || "",
            avatar_url: user.user_metadata?.avatar_url || "",
          }));

          // Upsert into Supabase users table
          await supabase.from('users').upsert([{
            id: user.id,
            email: user.email,
            name: user.user_metadata?.full_name || "",
          }]);

          // Mark as onboarded and navigate to (tabs)
          await AsyncStorage.setItem('@user_onboarded', 'true');
          navigation.reset({
            index: 0,
            routes: [{ name: "edith" }],
          });
        }
      }
    );

    // Cleanup subscription on unmount
    return () => {
      subscription?.unsubscribe();
    };
  }, [navigation]);

  useEffect(() => {
    setInputComplete(fullName.trim().length > 0 && !!gender && !!exam);
  }, [fullName, gender, exam]);

  // === GOOGLE AUTHENTICATION ===
  const signInWithGoogle = async () => {
    try {
      setAuthLoading(true);
      
      // Determine redirect URL based on platform.
      // For web use the current origin so the same domain (dev/prod) works.
      const redirectUrl = Platform.OS === 'web'
      ? (typeof window !== 'undefined' ? `${window.location.origin}/api/auth/callback` : 'https://rookie-ai.vercel.app/api/auth/callback')
      : makeRedirectUri({ scheme: 'com.ttyyy', path: '/callback' });

      console.log('Redirect URL:', redirectUrl);

      // Start OAuth flow
      const { data, error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: redirectUrl,  // Use the computed redirect URL
          skipBrowserRedirect: false,
        },
      });

      if (error) {
        console.error('OAuth error:', error);
        throw error;
      }

      if (!data.url) {
        throw new Error('No OAuth URL received from Supabase');
      }

      console.log('OAuth URL:', data.url);

      // Open browser for OAuth
      if (Platform.OS === 'web') {
        // For web, open in same window
        // The onAuthStateChange listener will handle the redirect
        window.location.href = data.url;
      } else {
        // For mobile/Expo
        const result = await WebBrowser.openAuthSessionAsync(data.url, redirectUrl);
        console.log('WebBrowser result:', result);
        
        // The onAuthStateChange listener will handle the session
      }
      
      // Note: Don't check session here - the listener will handle it
    } catch (error) {
      console.error('Full error:', error);
      Alert.alert(
        "Authentication Error", 
        error.message || "Google Auth failed. Make sure redirect URL is configured in Supabase."
      );
      setAuthLoading(false);
    }
  };

  const handleContinue = async () => {
    setLoading(true);
    try {
      // Save in AsyncStorage first for local access (optional)
      await AsyncStorage.setItem('@user', JSON.stringify({
        name: fullName.trim(),
        gender,
        exam,
      }));

      // Save to Supabase
      // Get current auth user (if signed in, should have email)
      const { data: { session } } = await supabase.auth.getSession();
      const user = session?.user;

      let row = {
        name: fullName.trim(),
        gender,
        exam,
      };
      if (user) {
        row.email = user.email;
        row.id = user.id;
      }
      await supabase.from('users').upsert([row]);

      await AsyncStorage.setItem('@user_onboarded', 'true');
      navigation.reset({
        index: 0,
        routes: [{ name: "edith" }],
      });
    } catch (err) {
      Alert.alert("Error", "Something went wrong saving your data");
    }
    setLoading(false);
  };

  return (
    <ImageBackground
      source={require("../../src/assets/images/bg2.png")}
      style={styles.background}
      resizeMode="cover"
    >
      <StatusBar barStyle="light-content" backgroundColor="#000000" />
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        keyboardShouldPersistTaps="handled"
        bounces={false}
      >
        <View style={styles.container}>
          <Text style={styles.title}>Hey, kiddo!</Text>
          <Text style={styles.subtitle}>Let’s us know you</Text>
          {/* Google Sign-in Button */}
          <TouchableOpacity
            style={[styles.continueButton, authLoading && styles.continueButtonInactive]}
            onPress={signInWithGoogle}
            disabled={authLoading}
            activeOpacity={authLoading ? 1 : 0.8}
          >
            {authLoading ? (
              <ActivityIndicator size="small" color="#181f2b" />
            ) : (
              <Text style={styles.continueButtonText}>
                Continue with Google
              </Text>
            )}
          </TouchableOpacity>
          <Text style={{
            color: "#b5b6c9",
            marginVertical: moderateScale(8),
            fontFamily: 'Geist',
            fontSize: moderateScale(13),
          }}>
            OR
          </Text>
          <View style={styles.infoBox}>
            <Text style={styles.label}>Full Name</Text>
            <TextInput
              style={styles.input}
              value={fullName}
              onChangeText={setFullName}
              placeholder="Your full name"
              placeholderTextColor="#888"
            />
            <Text style={styles.label}>Gender</Text>
            <View style={styles.buttonGroup}>
              {GENDER_OPTIONS.map((g) => (
                <TouchableOpacity
                  key={g}
                  style={[
                    styles.selectButton,
                    gender === g && styles.selectedButton,
                  ]}
                  onPress={() => setGender(g)}
                >
                  <Text style={[
                    styles.selectButtonText,
                    gender === g && styles.selectedButtonText
                  ]}>{g}</Text>
                </TouchableOpacity>
              ))}
            </View>
            <Text style={styles.label}>Preparing for</Text>
            <View style={styles.buttonGroup}>
              {EXAM_OPTIONS.map((e) => (
                <TouchableOpacity
                  key={e}
                  style={[
                    styles.selectButton,
                    exam === e && styles.selectedButton,
                  ]}
                  onPress={() => setExam(e)}
                >
                  <Text style={[
                    styles.selectButtonText,
                    exam === e && styles.selectedButtonText
                  ]}>{e}</Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>
          <TouchableOpacity
            style={[
              styles.continueButton,
              (!inputComplete || loading) && styles.continueButtonInactive,
            ]}
            onPress={handleContinue}
            disabled={!inputComplete || loading}
            activeOpacity={inputComplete && !loading ? 0.8 : 1}
          >
            {loading ? (
              <ActivityIndicator size="small" color="#181f2b" />
            ) : (
              <Text style={[
                styles.continueButtonText,
                !inputComplete && styles.continueButtonTextInactive
              ]}>
                Continue
              </Text>
            )}
          </TouchableOpacity>
          <View style={styles.bottomSection}>
            <View style={styles.avatarRow}>
              <Image source={require('../../src/assets/images/avatar1.png')} style={styles.avatar} />
              <Image source={require('../../src/assets/images/avatar2.png')} style={styles.avatar} />
              <Image source={require('../../src/assets/images/avatar3.png')} style={styles.avatar} />
              <Image source={require('../../src/assets/images/avatar4.png')} style={styles.avatar} />
              <View style={styles.avatarPlus}>
                <Text style={styles.avatarPlusText}>+129</Text>
              </View>
            </View>
            <Text style={styles.studentStats}>
              Out of 15,00,000 students{"\n"}
              234+ Student are already practicing with us
            </Text>
          </View>
        </View>
      </ScrollView>
    </ImageBackground>
  );
}


const styles = StyleSheet.create({
  background: {
    flex: 1,
    width: "100%",
    height: "100%",
    backgroundColor: "#000",
  },
  scrollContent: {
    flexGrow: 1,
    justifyContent: "center",
  },
  container: {
    flex: 1,
    paddingTop: Platform.OS === "android" ? verticalScale(60) : verticalScale(80),
    alignItems: "center",
    justifyContent: "flex-start",
    paddingHorizontal: 0,
  },
  title: {
    color: "#fff",
    fontWeight: "bold",
    fontFamily: 'Geist',
    fontSize: moderateScale(32),
    marginTop: verticalScale(12),
    marginBottom: verticalScale(4),
    alignSelf: "flex-start",
    marginLeft: scale(25),
  },
  subtitle: {
    color: "#d2d2e0",
    fontSize: moderateScale(17),
    fontFamily: 'Geist',
    marginBottom: verticalScale(12),
    alignSelf: "flex-start",
    marginLeft: scale(25),
  },
  infoBox: {
    backgroundColor: "#000000",
    borderRadius: moderateScale(18),
    padding: moderateScale(24),
    width: "90%",
    marginBottom: verticalScale(18),
    borderWidth: 1,
    borderColor: "#1D2939",
    alignSelf: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: moderateScale(6),
    elevation: 3,
  },
  label: {
    color: "#fff",
    fontSize: moderateScale(16),
    fontFamily: 'Geist',
    fontWeight: "500",
    marginBottom: verticalScale(6),
    marginTop: verticalScale(14),
  },
  input: {
    backgroundColor: "#0C111D",
    borderRadius: moderateScale(10),
    color: "#fff",
    fontFamily: 'Geist',
    paddingHorizontal: scale(16),
    paddingVertical: verticalScale(10),
    fontSize: moderateScale(16),
    marginBottom: verticalScale(8),
    borderWidth: 1,
    borderColor: "#344054",
  },
  buttonGroup: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: scale(10),
    marginBottom: verticalScale(8),
    marginTop: verticalScale(4),
  },
  selectButton: {
    backgroundColor: "#0C111D",
    borderRadius: moderateScale(18),
    paddingHorizontal: scale(18),
    paddingVertical: verticalScale(8),
    marginRight: scale(10),
    marginBottom: verticalScale(8),
    borderWidth: 1,
    borderColor: "#262626",
    fontFamily: 'Geist',
  },
  selectedButton: {
    backgroundColor: "#fff",
    borderColor: "#344054",
  },
  selectButtonText: {
    color: "#fff",
    fontSize: moderateScale(15),
    fontWeight: "500",
    fontFamily: 'Geist',
  },
  selectedButtonText: {
    color: "#181f2b",
    fontWeight: "bold",
    fontFamily: 'Geist',
  },
  continueButton: {
    width: "90%",
    height: verticalScale(48),
    borderRadius: moderateScale(27),
    backgroundColor: "#fff",
    justifyContent: "center",
    alignItems: "center",
    marginTop: verticalScale(18),
    marginBottom: verticalScale(8),
    alignSelf: "center",
    shadowColor: "#000",
    shadowOpacity: 0.10,
    shadowRadius: moderateScale(8),
    shadowOffset: { width: 0, height: 2 },
    elevation: 2,
  },
  continueButtonInactive: {
    backgroundColor: "#F2F4F7",
  },
  continueButtonText: {
    color: "#181f2b",
    fontWeight: "bold",
    fontSize: moderateScale(19),
    fontFamily: 'Geist',
  },
  continueButtonTextInactive: {
    color: "#667085",
    fontFamily: 'Geist',
  },
  bottomSection: {
    alignItems: "center",
    marginTop: verticalScale(16),
  },
  avatarRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: verticalScale(8),
  },
  avatar: {
    width: scale(38),
    height: scale(38),
    borderRadius: scale(19),
    marginLeft: -scale(10),
    borderWidth: 2,
    borderColor: "#22223f",
    backgroundColor: "#22223f",
  },
  avatarPlus: {
    width: scale(38),
    height: scale(38),
    borderRadius: scale(19),
    backgroundColor: "#651a1a",
    justifyContent: "center",
    alignItems: "center",
    marginLeft: -scale(10),
    borderWidth: 2,
    borderColor: "#22223f",
  },
  avatarPlusText: {
    color: "#fff",
    fontWeight: "bold",
    fontSize: moderateScale(15),
    fontFamily: 'Geist',
  },
  studentStats: {
    color: "#fff",
    fontSize: moderateScale(15),
    textAlign: "center",
    marginTop: verticalScale(2),
    marginBottom: verticalScale(40),
    lineHeight: moderateScale(20),
    fontFamily: 'Geist',
  },
});