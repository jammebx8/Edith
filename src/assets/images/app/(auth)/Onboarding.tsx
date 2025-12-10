import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Alert,
  ImageBackground,
  StatusBar,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import DropDownPicker from 'react-native-dropdown-picker';
import { useRouter } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import { verticalScale } from 'react-native-size-matters';

const OnboardingScreen = () => {
  const [name, setName] = useState('');
  const [age, setAge] = useState('');
  const [gender, setGender] = useState('');
  const [open, setOpen] = useState(false);
  const [items, setItems] = useState([
    { label: 'Male', value: 'male' },
    { label: 'Female', value: 'female' },
  ]);

  const router = useRouter();

  // Check if onboarding is already complete
  useEffect(() => {
    const checkOnboardingStatus = async () => {
      const completed = await AsyncStorage.getItem('onboardingComplete');
      if (completed === 'true') {
        router.replace('/(tabs)');
      }
    };

    checkOnboardingStatus();
  }, []);

  const handleContinue = async () => {
    if (!name || !age || !gender) {
      Alert.alert('Please fill all fields');
      return;
    }

    // Save only to local storage, not to Supabase
    const userData = { name, age, gender };
    await AsyncStorage.setItem('userData', JSON.stringify(userData));
    await AsyncStorage.setItem('onboardingComplete', 'true');

    router.replace('/(tabs)');
  };

  return (
    <ImageBackground
      source={require('../../src/assets/images/download (34).jpeg')}
      style={styles.backgroundImage}
    >
      <StatusBar barStyle="light-content" backgroundColor="#0a0517" />
      <View style={styles.container}>
        <Text style={styles.title}>Let’s Get to Know You ✨</Text>
        <Text style={styles.subtitle}>
          This helps us personalize your learning journey 🎯
        </Text>

        <View style={styles.card}>
          <TextInput
            style={styles.input}
            placeholder="your first name"
            placeholderTextColor="#aaa"
            value={name}
            onChangeText={setName}
          />

          <TextInput
            style={styles.input}
            placeholder="your age"
            placeholderTextColor="#aaa"
            keyboardType="numeric"
            value={age}
            onChangeText={setAge}
          />

          <DropDownPicker
            open={open}
            value={gender}
            items={items}
            setOpen={setOpen}
            setValue={setGender}
            setItems={setItems}
            placeholder="Select your gender"
            containerStyle={{ marginBottom: 10 }}
            style={styles.dropdown}
            dropDownContainerStyle={styles.dropdownContainer}
            textStyle={{ color: '#fff' }}
            placeholderStyle={{ color: '#aaa' }}
          />
        </View>

        <TouchableOpacity style={styles.button} onPress={handleContinue}>
          <LinearGradient
            colors={['#D500F9', '#3B82F6']}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={styles.gradientButton}
          >
            <Text style={styles.buttonText}>Continue</Text>
          </LinearGradient>
        </TouchableOpacity>
      </View>
    </ImageBackground>
  );
};

export default OnboardingScreen;

const styles = StyleSheet.create({
  backgroundImage: {
    flex: 1,
    resizeMode: 'cover',
    width: '100%',
    height: '100%',
  },
  container: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    padding: 20,
    justifyContent: 'center',
  },
  title: {
    color: '#fff',
    fontSize: 26,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 8,
  },
  subtitle: {
    color: '#bbb',
    fontSize: 14,
    textAlign: 'center',
    marginBottom: 30,
  },
  card: {
    backgroundColor: '#1E1E3F',
    borderRadius: 15,
    padding: 20,
    marginBottom: 30,
    shadowColor: '#000',
    shadowOpacity: 0.4,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 4 },
    elevation: 5,
  },
  input: {
    backgroundColor: '#2A2A4D',
    color: '#fff',
    borderRadius: 10,
    paddingHorizontal: 15,
    paddingVertical: 12,
    marginBottom: 15,
    fontSize: 16,
  },
  dropdown: {
    backgroundColor: '#2A2A4D',
    borderColor: '#444',
  },
  dropdownContainer: {
    backgroundColor: '#2A2A4D',
    borderColor: '#444',
  },
  button: {
    alignItems: 'center',
    marginTop: verticalScale(40),
  },
  gradientButton: {
    paddingVertical: 14,
    paddingHorizontal: 25,
    borderRadius: 12,
    width: '100%',
    alignItems: 'center',
  },
  buttonText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 16,
  },
});
