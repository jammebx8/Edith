import React from 'react';
import { Tabs, useRouter } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import { View, TouchableOpacity, StyleSheet, Dimensions, Image, StatusBar } from 'react-native';

const { width } = Dimensions.get('window');

export default function TabLayout() {
  const router = useRouter();

  // Bookmark button component
  const BookmarkButton = () => (
    <TouchableOpacity
      style={styles.bookmarkButton}
      onPress={() => router.push('/BookmarkScreen')}
      activeOpacity={0.7}
      hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
      testID="bookmark-btn"
    >
      <View>
        <Image
          source={require('../../src/assets/images/bookmarkicon.png')}
          style={{ width: 52, height: 36 }}
          resizeMode="contain"
        />
      </View>
    </TouchableOpacity>
  );

  return (
    <>
      <StatusBar barStyle="light-content" backgroundColor="#000000" />
      <Tabs
        screenOptions={{
          headerShown: true,
          tabBarHideOnKeyboard: true,
           
          tabBarActiveTintColor: 'white',
          tabBarInactiveTintColor: 'rgb(144, 144, 144)',
          tabBarStyle: {
            position: 'absolute',
            height: 60,
            paddingBottom: 10,

    
           
            elevation: 10,
            shadowColor: '#000',
            shadowOffset: { width: 0, height: 6 },
            shadowOpacity: 0.15,
            shadowRadius: 10,
            backgroundColor: '#000000', // <-- Tabs background color
          },
          tabBarBackground: () => (
            <View style={{ flex: 1, backgroundColor: '#000000', }} /> // <-- Tabs background color
          ),
          headerStyle: {
            backgroundColor: '#000000', // <-- Header background color
            borderBottomWidth: 1,
            borderBottomColor: '#262626',
          },
          headerTitleStyle: {
            color: '#e5e7eb',
            fontSize: 24,
            fontWeight: 'bold',
            letterSpacing: 1.2,
          },
          headerTintColor: '#E0B3FF',

                    tabBarLabelStyle: {
      fontSize: 14, // <-- Increase this value as you like
     
    },
        }}
      >
        {/* Home Tab */}
        <Tabs.Screen
          name="index"
          options={{
            headerTitle: () => (
              <Image
                source={require('../../src/assets/images/lg.png')}
                style={{
                  width: 100,
                  height: 100,
                  resizeMode: 'contain',
                }}
              />
            ),
            headerRight: () => <BookmarkButton />,
            title: 'Home',
            tabBarIcon: ({ focused }) => (
              <Image
                source={
                  focused
                    ? require('../../src/assets/images/home_filled.png')
                    : require('../../src/assets/images/home_unfilled.png')
                }
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

        {/* Chats Tab */}
        <Tabs.Screen
          name="chats"
          options={{
            headerTitle: () => (
              <Image
                source={require('../../src/assets/images/lg.png')}
                style={{
                  width: 100,
                  height: 100,
                  resizeMode: 'contain',
                }}
              />
            ),
            title: 'Chats',
            tabBarIcon: ({ focused }) => (
              <Image
                source={
                  focused
                    ? require('../../src/assets/images/chat_filled.png')
                    : require('../../src/assets/images/chat_unfilled.png')
                }
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

        {/* Practice Tab */}
        <Tabs.Screen
          name="explore"
          options={{
            title: 'Practice',
            tabBarIcon: ({ focused }) => (
              <Image
                source={
                  focused
                    ? require('../../src/assets/images/book_filled.png')
                    : require('../../src/assets/images/book_unfilled.png')
                }
                style={{
                  width: 24,
                  height: 24,
                  tintColor: focused ? 'white' : 'rgb(144, 144, 144)',
                }}
                resizeMode="contain"
              />
            ),
            headerTitle: () => (
              <Image
                source={require('../../src/assets/images/lg.png')}
                style={{
                  width: 100,
                  height: 100,
                  resizeMode: 'contain',
                }}
              />
            ),
            headerRight: () => <BookmarkButton />,
          }}
        />

        {/* Settings/Profile Tab */}
        <Tabs.Screen
          name="profile"
          options={{
            title: 'Settings',
            tabBarIcon: ({ focused }) => (
              <Image
                source={
                  focused
                    ? require('../../src/assets/images/set_filled.png')
                    : require('../../src/assets/images/set_unfilled.png')
                }
                style={{
                  width: 24,
                  height: 24,
                  tintColor: focused ? 'white' : 'rgb(144, 144, 144)',
                }}
                resizeMode="contain"
              />
            ),
              headerTitle: () => (
              <Image
                source={require('../../src/assets/images/lg.png')}
                style={{
                  width: 100,
                  height: 100,
                  resizeMode: 'contain',
                }}
              />
            ),
          }}
        />
      </Tabs>
    </>
  );
}





const styles = StyleSheet.create({
  bookmarkButton: {
    marginRight: 16,
  },
});