import React from 'react';
import { Tabs } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import Fontisto from '@expo/vector-icons/Fontisto';
import Entypo from '@expo/vector-icons/Entypo';
import FontAwesome5 from '@expo/vector-icons/FontAwesome5';
import { Platform, View, Dimensions } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import Feather from '@expo/vector-icons/Feather';
const { width } = Dimensions.get('window');
import { Image } from 'react-native';
import { StatusBar } from 'react-native';

import MaterialIcons from '@expo/vector-icons/MaterialIcons';
export default function TabLayout() {
  return (
    <>
     <StatusBar barStyle="light-content" backgroundColor="#0a0517" />
      <Tabs
        screenOptions={{
          headerShown: true,
          tabBarHideOnKeyboard: true,
          tabBarActiveTintColor: 'white',
          tabBarInactiveTintColor: 'rgb(144, 144, 144)',
          tabBarStyle: {
            position: 'absolute',
            height: 60,
            paddingBottom: 10, // Add padding to the bottom of the tab bar
            elevation: 10,
            shadowColor: '#000',
            shadowOffset: { width: 0, height: 6 },
            shadowOpacity: 0.15,
            shadowRadius: 10,
          },
          tabBarBackground: () => (
            <LinearGradient
              colors={['rgba(11,11,40,0.95)', 'rgba(0,0,0,0.95)']}
              style={{
                flex: 1,
              }}
            />
          ),
          headerStyle: {
            backgroundColor: '#0a0517',
            borderBottomWidth: 1, // Add bottom border width
            borderBottomColor: '#262626', // Add bottom border color
          },
          headerTitleStyle: {
            color: '#e5e7eb',
            fontSize: 24,
            fontWeight: 'bold',
            letterSpacing: 1.2,
          },
          headerTintColor: '#E0B3FF',
        }}
      >
    <Tabs.Screen
          name="index"
          options={{
            headerTitle: () => (
              <Image
                source={require('../../src/assets/images/lg.png')} // Path to logo.png
                style={{
                  width: 100, // Adjust width as needed
                  height: 100, // Adjust height as needed
                  resizeMode: 'contain',
                }}
              />
            ),
            title: 'Home',
            tabBarIcon: ({ color, focused }) => (
              <Image
                source={require('../../src/assets/images/home_14424222.png')} // Path to home icon
                style={{
                  width: 24,
                  height: 24,
                  tintColor: focused ? 'white' : 'rgb(144, 144, 144)',
                }}
                resizeMode="contain"
              />
            ),
          }}
        />

          <Tabs.Screen
  name="chats"
  options={{
         headerTitle: () => (
              <Image
                source={require('../../src/assets/images/lg.png')} // Path to logo.png
                style={{
                  width: 100, // Adjust width as needed
                  height: 100, // Adjust height as needed
                  resizeMode: 'contain',
                }}
              />
            ),
    title: 'Chats',
    tabBarIcon: ({ color, focused }) => (
      <Image
        source={require('../../src/assets/images/chat-circle-text.png')} // adjust path as needed
        style={{
          width: 24,
          height: 24,
          tintColor: focused ? 'white' : 'rgb(144, 144, 144)', // applies color tint
        }}
        resizeMode="contain"
      />
    ),

    
  }}
/>
        <Tabs.Screen
          name="explore"
          options={{
            title: 'Practice',
            tabBarIcon: ({ color, size, focused }) => (
               <Image
        source={require('../../src/assets/images/book.png')} // adjust path as needed
        style={{
          width: 24,
          height: 24,
          tintColor: focused ? 'white' : 'rgb(144, 144, 144)', // applies color tint
        }}
        resizeMode="contain"
      />
            ),
                headerTitle: () => (
              <Image
                source={require('../../src/assets/images/lg.png')} // Path to logo.png
                style={{
                  width: 100, // Adjust width as needed
                  height: 100, // Adjust height as needed
                  resizeMode: 'contain',
                }}
              />
            ),
       
          }}
        />
        <Tabs.Screen
          name="profile"
          options={{
            title: 'Profile',
            tabBarIcon: ({ color, size, focused }) => (
                 <Image
        source={require('../../src/assets/images/user-circle.png')} // adjust path as needed
        style={{
          width: 24,
          height: 24,
          tintColor: focused ? 'white' : 'rgb(144, 144, 144)', // applies color tint
        }}
        resizeMode="contain"
      />
            ),
          }}
        />
      </Tabs>
    </>
  );
}