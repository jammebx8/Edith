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

WebBrowser.maybeCompleteAuthSession(); // Needed for Expo Auth flows

const GENDER_OPTIONS = ["Male", "Female", "Other"];
const EXAM_OPTIONS = ["JEE Mains", "NEET", "JEE Advanced", "Other"];

export default function Onboarding() {
  const navigation = useNavigation();
  const [fullName, setFullName] = useState("");
  const [gender, setGender] = useState("");
  const [exam, setExam] = useState("");
  const [inputComplete, setInputComplete] = useState(false);
  const [loading, setLoading] = useState(false);
  const [authLoading, setAuthLoading] = useState(false);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  // Helper: when a signed-in user is detected, ensure DB row exists,
  // then if onboarding fields present, persist to AsyncStorage and navigate.
  const handleSignedInUser = async (user) => {
    if (!user) return;
    try {
      // Try to read user from users table
      const { data: existingUser, error: selectErr } = await supabase
        .from('users')
        .select('*')
        .eq('id', user.id)
        .maybeSingle();

      if (selectErr) {
        console.warn('Error selecting user from DB', selectErr);
      }

      // If user not present in users table, create a minimal record
      if (!existingUser) {
        const minimal = {
          id: user.id,
          email: user.email,
          name: user.user_metadata?.full_name || user.user_metadata?.name || '',
          avatar_url: user.user_metadata?.avatar_url || user.user_metadata?.picture || null,
          created_at: new Date().toISOString(),
        };
        const { error: upsertErr } = await supabase.from('users').upsert([minimal]);
        if (upsertErr) {
          console.warn('Error upserting minimal user', upsertErr);
          // still show onboarding if upsert fails
          setFullName(minimal.name);
          setIsAuthenticated(true);
          setAuthLoading(false);
          return;
        }

        // If the Gmail id/email was successfully stored (upsert succeeded), treat the user as onboarded per requirement:
        const toSave = {
          id: minimal.id,
          email: minimal.email,
          name: minimal.name,
          avatar_url: minimal.avatar_url || null,
        };
        try {
          await AsyncStorage.setItem('@user', JSON.stringify(toSave));
          await AsyncStorage.setItem('@user_onboarded', 'true');
          console.log('Saved @user and @user_onboarded after Google sign-in; navigating to (tabs)');
          setIsAuthenticated(true);
          setAuthLoading(false);
          // Navigate to tabs (reset stack)
          navigation.reset({
            index: 0,
            routes: [{ name: "(tabs)" }],
          });
          return;
        } catch (storageErr) {
          console.warn('Error saving user onboarded flag locally', storageErr);
          setAuthLoading(false);
          return;
        }
      }

      // If DB row exists and onboarding fields are present, save locally & navigate
      if (existingUser.gender && existingUser.exam) {
        const toSave = {
          id: existingUser.id,
          email: existingUser.email,
          name: existingUser.name,
          gender: existingUser.gender,
          exam: existingUser.exam,
          avatar_url: existingUser.avatar_url || null,
        };
        await AsyncStorage.setItem('@user', JSON.stringify(toSave));
        await AsyncStorage.setItem('@user_onboarded', 'true');
        console.log('Saved @user and @user_onboarded; navigating to (tabs)');
        setIsAuthenticated(true);
        setAuthLoading(false);
        // Navigate to tabs (reset stack)
        navigation.reset({
          index: 0,
          routes: [{ name: "(tabs)" }],
        });
        return;
      }

      // Otherwise user exists but onboarding not complete: prefill name and show form
      setFullName(existingUser.name || user.user_metadata?.full_name || '');
      setIsAuthenticated(true);
      setAuthLoading(false);
    } catch (err) {
      console.error('handleSignedInUser error', err);
      setAuthLoading(false);
    }
  };

  useEffect(() => {
    // On mount: check local onboard flag and also check existing Supabase session.
    // Important: For web we first attempt to process the redirect URL (getSessionFromUrl)
    // so the Supabase client will have session stored. After that we read session and if
    // a Google-authenticated session exists we send the user to (tabs).
    const init = async () => {
      try {
        // If already marked onboarded locally, go straight to tabs
        const onboarded = await AsyncStorage.getItem('@user_onboarded');
        if (onboarded === 'true') {
          navigation.reset({
            index: 0,
            routes: [{ name: "(tabs)" }],
          });
          return;
        }
      } catch (e) {
        console.warn('Error reading onboarding flag', e);
      }

      // WEB OAuth redirect handling: if Google redirected back with tokens in URL,
      // we must parse & store the session with getSessionFromUrl() so the client knows we're signed in.
      if (Platform.OS === 'web' && typeof window !== 'undefined') {
        try {
          const url = window.location.href;
          // crude detection — adjust if you have a different redirect param pattern
          if (url.includes('access_token') || url.includes('refresh_token') || url.includes('code') || url.includes('provider_token')) {
            console.log('Detected OAuth tokens in URL, calling getSessionFromUrl()');
            const { data, error } = await supabase.auth.getSessionFromUrl({ storeSession: true });
            if (error) {
              console.warn('getSessionFromUrl error', error);
            } else if (data?.session?.user) {
              // handle the just-signed-in user (this will upsert / set AsyncStorage and navigate if ready)
              await handleSignedInUser(data.session.user);
              return; // handleSignedInUser will navigate if appropriate
            }
            // clean the URL so tokens are not re-processed on reload
            try {
              const cleanUrl = window.location.origin + window.location.pathname + window.location.search;
              window.history.replaceState({}, document.title, cleanUrl);
            } catch (e) {
              // ignore if replaceState fails in some envs
            }
          }
        } catch (err) {
          console.warn('Error during getSessionFromUrl flow', err);
        }
      }

      // If there's an active session already (user returned after OAuth or cached), send them to (tabs).
      // NOTE: This implements "if user is authenticated already by Google then send user to (tabs)".
      try {
        const { data: { session }, error: sessionErr } = await supabase.auth.getSession();
        if (sessionErr) {
          console.warn('getSession error', sessionErr);
        }
        const sessionUser = session?.user;
        if (sessionUser) {
          // If you want to require profile completion (gender/exam) before allowing to use the app,
          // replace the navigation.reset below with await handleSignedInUser(sessionUser) instead.
          navigation.reset({
            index: 0,
            routes: [{ name: "(tabs)" }],
          });
          return;
        }
      } catch (err) {
        console.warn('Error checking existing session', err);
      }

      // Listen for auth state changes (Google OAuth redirect etc.)
      const { data: { subscription } } = supabase.auth.onAuthStateChange(
        async (event, session) => {
          console.log('Auth state changed:', event, session?.user?.email);
          if (event === 'SIGNED_IN' && session?.user) {
            // If a sign-in event occurs while on this screen, immediately send to tabs
            navigation.reset({
              index: 0,
              routes: [{ name: "(tabs)" }],
            });
          } else if (event === 'SIGNED_OUT') {
            setIsAuthenticated(false);
            setFullName("");
            setGender("");
            setExam("");
            // Clear local user info on sign out (optional)
            await AsyncStorage.removeItem('@user');
            await AsyncStorage.removeItem('@user_onboarded');
          }
        }
      );

      return () => subscription?.unsubscribe();
    };

    init();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    setInputComplete(fullName.trim().length > 0 && !!gender && !!exam);
  }, [fullName, gender, exam]);

  // === GOOGLE AUTHENTICATION ===
  const signInWithGoogle = async () => {
    try {
      setAuthLoading(true);

      // For web we should redirect back to the app origin so Onboarding can call getSessionFromUrl().
      const redirectUrl = Platform.OS === 'web'
        ? (typeof window !== 'undefined' ? `${window.location.origin}` : 'https://rookie-ai.vercel.app')
        : makeRedirectUri({ scheme: 'com.ttyyy', path: '/(tabs)', useProxy: true }); // useProxy helps with Expo Go/dev client testing

      console.log('Redirect URL:', redirectUrl);

      // Start OAuth flow
      const { data, error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: redirectUrl,
          // skipBrowserRedirect: false (default)
        },
      });

      if (error) {
        console.error('OAuth error:', error);
        throw error;
      }

      if (!data?.url) {
        throw new Error('No OAuth URL received from Supabase');
      }

      console.log('OAuth URL:', data.url);

      // For web: navigate to the Supabase OAuth URL.
      if (Platform.OS === 'web') {
        window.location.href = data.url;
      } else {
        // Mobile/Expo: open auth session
        await WebBrowser.openAuthSessionAsync(data.url, redirectUrl);
        // authLoading will be cleared in the auth state change handler when SIGNED_IN is received
      }
    } catch (error: any) {
      console.error('Full error:', error);
      Alert.alert(
        "Authentication Error",
        error?.message || "Google Auth failed. Make sure redirect URL is configured in Supabase."
      );
      setAuthLoading(false);
    }
  };

  const handleContinue = async () => {
    // Save profile (for both Google-authenticated users and manual flows)
    if (!fullName.trim() || !gender || !exam) {
      Alert.alert('Please fill all fields');
      return;
    }

    setLoading(true);
    try {
      // Check if there's an authenticated user (Google)
      const { data: { session }, error: sessionError } = await supabase.auth.getSession();
      const user = session?.user;

      if (sessionError) {
        console.warn('Session error', sessionError);
      }

      if (user) {
        const userProfile = {
          id: user.id,
          email: user.email,
          name: fullName.trim(),
          gender,
          exam,
          avatar_url: user.user_metadata?.avatar_url || user.user_metadata?.picture || null,
          updated_at: new Date().toISOString(),
        };

        // Upsert into Supabase users table
        const { error: upsertError } = await supabase.from('users').upsert([userProfile]);
        if (upsertError) {
          console.error('Supabase upsert error:', upsertError);
          Alert.alert("Error", "Failed to save profile to database: " + upsertError.message);
          setLoading(false);
          return;
        }

        // Save to AsyncStorage
        await AsyncStorage.setItem('@user', JSON.stringify(userProfile));
        await AsyncStorage.setItem('@user_onboarded', 'true');
        setIsAuthenticated(true);
      } else {
        // Manual signup (no auth user)
        const userProfile = {
          name: fullName.trim(),
          gender,
          exam,
          created_at: new Date().toISOString(),
        };

        const { data: insertedData, error: insertError } = await supabase
          .from('users')
          .insert([userProfile])
          .select();
        if (insertError) {
          console.error('Supabase insert error:', insertError);
          Alert.alert("Error", "Failed to save profile to database: " + insertError.message);
          setLoading(false);
          return;
        }

        // Ensure we store an id if returned
        const saved = insertedData?.[0] ? { ...userProfile, id: insertedData[0].id } : userProfile;
        await AsyncStorage.setItem('@user', JSON.stringify(saved));
        await AsyncStorage.setItem('@user_onboarded', 'true');
      }

      // Navigate to tabs after saving
      navigation.reset({
        index: 0,
        routes: [{ name: "(tabs)" }],
      });
    } catch (err) {
      console.error('Error saving user data:', err);
      Alert.alert("Error", (err as any)?.message || "Something went wrong saving your data");
    } finally {
      setLoading(false);
    }
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
                {isAuthenticated ? 'Complete Profile' : 'Continue'}
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

// ...styles kept identical to your existing file...
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