import React, { useState, useRef, useEffect } from 'react';
import { useLocalSearchParams, useRouter } from 'expo-router';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  FlatList,
  KeyboardAvoidingView,
  Platform,
  LayoutAnimation,
  UIManager,
  Image as RNImage,
  Alert,
  Image,
  StatusBar,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import AsyncStorage from '@react-native-async-storage/async-storage';
import axios from 'axios';
import { scale, verticalScale, moderateScale } from 'react-native-size-matters';
import { Ionicons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import * as FileSystem from 'expo-file-system';
import images from '../src/constants/imagepath';
import { LinearGradient } from 'expo-linear-gradient';



if (Platform.OS === 'android' && UIManager.setLayoutAnimationEnabledExperimental) {
  UIManager.setLayoutAnimationEnabledExperimental(true);
}

const GROQ_API_KEY = 'REMOVED';
const OCR_API_KEY = 'K88346068688957';

const getGroqReply = async (
  characterPrompt: string | string[],
  chatMessages: any[],
  imageText: undefined
) => {
  try {
    const userProfile = await AsyncStorage.getItem('userData');
    const user = userProfile ? JSON.parse(userProfile) : {};

    const userContext = `You are chatting with a ${user.age}-year-old ${user.gender} student named ${user.name}. `;

    const messages = [
      {
        role: 'system',
        content: `${userContext}${characterPrompt}`,
      },
      ...chatMessages
        .filter((msg) => msg.type === 'text')
        .map((msg) => ({
          role: msg.sender === 'user' ? 'user' : 'assistant',
          content: msg.text,
        })),
    ];

    if (imageText) {
      messages.push({
        role: 'user',
        content: `Please solve this question: ${imageText}`,
      });
    }

    const res = await axios.post(
      'https://api.groq.com/openai/v1/chat/completions',
      {
        model: 'llama-3.3-70b-versatile',
        messages,
        temperature: 0.4,
        max_tokens: 400,
      },
      {
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${GROQ_API_KEY}`,
        },
      }
    );

    return res.data.choices?.[0]?.message?.content || "Sorry, I didn’t get that.";
  } catch (err) {
    console.error('Groq error:', err.response?.data || err);
    return 'Error...try again.';
  }
};

const getTextFromImage = async (imageUri: string) => {
  try {
    const base64 = await FileSystem.readAsStringAsync(imageUri, {
      encoding: FileSystem.EncodingType.Base64,
    });

    const formData = new FormData();
    formData.append('apikey', OCR_API_KEY);
    formData.append('language', 'eng');
    formData.append('isOverlayRequired', 'false');
    formData.append('base64image', `data:image/jpeg;base64,${base64}`);

    const res = await axios.post('https://api.ocr.space/parse/image', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });

    const text = res.data?.ParsedResults?.[0]?.ParsedText?.trim();
    return text || '';
  } catch (err) {
    console.error('OCR error:', err.response?.data || err);
    return '';
  }
};

const getRelativeTime = (dateString: string | number | Date) => {
  const now = new Date();
  const past = new Date(dateString);
  const diffMs = now.getTime() - past.getTime();

  const seconds = Math.floor(diffMs / 1000);
  if (seconds < 60) return `just now`;

  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return `${minutes} minutes ago`;

  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours} hours ago`;

  const days = Math.floor(hours / 24);
  return `${days} day${days > 1 ? 's' : ''} ago`;
};

export default function MessageScreen() {
  const { name, prompt, text } = useLocalSearchParams();
  const router = useRouter();

  const [message, setMessage] = useState('');
  const [messages, setMessages] = useState([]);
  const flatListRef = useRef(null);
  const [isTyping, setIsTyping] = useState(false);

  // Only AI chat - load from AsyncStorage
  useEffect(() => {
    const loadAIChat = async () => {
      try {
        const saved = await AsyncStorage.getItem(`chat_${name}`);
        if (saved) {
          setMessages(JSON.parse(saved));
        } else {
          setMessages([{ sender: 'bot', text: `${text}`, timestamp: new Date().toISOString(), type: 'text' }]);
        }
      } catch (e) {
        console.error('Error loading chat:', e);
        setMessages([{ sender: 'bot', text: `${text}`, timestamp: new Date().toISOString(), type: 'text' }]);
      }
    };
    loadAIChat();
  }, [name, text]);

  // Send message
  const handleSend = async () => {
    if (message.trim() === '') return;

    const nowISOString = new Date().toISOString();

    // AI chat: append locally and get AI reply
    const newMessage = { sender: 'user', text: message, timestamp: nowISOString, type: 'text' };
    const updatedMessages = [...messages, newMessage];

    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
    setMessages(updatedMessages);
    setMessage('');
    setIsTyping(true);

    const botReply = await getGroqReply(prompt, updatedMessages);
    const botMessage = { sender: 'bot', text: botReply, timestamp: new Date().toISOString(), type: 'text' };

    const finalMessages = [...updatedMessages, botMessage];
    setMessages(finalMessages);
    setIsTyping(false);

    try {
      await AsyncStorage.setItem(`chat_${name}`, JSON.stringify(finalMessages));
    } catch (e) {
      console.error('Failed to save chat:', e);
    }
  };

  const pickImageAndSend = async () => {
    const permissionResult = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!permissionResult.granted) {
      Alert.alert('Permission required', 'Please allow gallery access.');
      return;
    }

    const pickerResult = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      base64: false,
    });

    if (!pickerResult.canceled && pickerResult.assets?.[0]?.uri) {
      const imageUri = pickerResult.assets[0].uri;
      const nowISOString = new Date().toISOString();

      const imageMessage = { sender: 'user', text: imageUri, timestamp: nowISOString, type: 'image' };
      const updatedMessages = [...messages, imageMessage];

      LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
      setMessages(updatedMessages);
      setIsTyping(true);

      const extractedText = await getTextFromImage(imageUri);

      if (!extractedText) {
        const errorMsg = { sender: 'bot', text: 'Could not extract any text from the image.', timestamp: new Date().toISOString(), type: 'text' };
        setMessages([...updatedMessages, errorMsg]);
        setIsTyping(false);
        return;
      }

      const aiReply = await getGroqReply(prompt, updatedMessages, extractedText);
      const botMessage = { sender: 'bot', text: aiReply, timestamp: new Date().toISOString(), type: 'text' };

      const finalMessages = [...updatedMessages, botMessage];
      setMessages(finalMessages);
      setIsTyping(false);

      try {
        await AsyncStorage.setItem(`chat_${name}`, JSON.stringify(finalMessages));
      } catch (e) {
        console.error('Failed to save chat:', e);
      }
    }
  };

  const TypingIndicator = () => {
    const [dots, setDots] = useState('');
    useEffect(() => {
      const interval = setInterval(() => {
        setDots((prev) => (prev.length < 3 ? prev + '.' : ''));
      }, 500);
      return () => clearInterval(interval);
    }, []);
    return <Text style={styles.messageText}>Typing{dots}</Text>;
  };

  useEffect(() => {
    flatListRef.current?.scrollToEnd({ animated: true });
  }, [messages]);

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: '#0B0B28' }}>
      <StatusBar barStyle="light-content" backgroundColor="#0a0517" />
      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 0 :0}
      >
        <View style={styles.container}>
          {/* Header */}
          <View style={styles.header}>
            {/* Back Button */}
            <TouchableOpacity
              onPress={() =>  router.replace('/chats')}
              style={styles.backButton}
              hitSlop={{ top: 30, bottom: 30, left: 30, right: 12 }}
            >
              <Image
                source={require('../src/assets/images/caret-left.png')}
                style={[styles.backIcon, { tintColor: '#FFFFFF' }]}
              />
              <Text style={styles.backText}>Back</Text>
            </TouchableOpacity>

            {/* Title */}
            <Text style={styles.headerTitle}>{name}</Text>

            {/* Info Icon */}
            <TouchableOpacity style={styles.infoButton}>
              <Ionicons name="information-circle-outline" size={24} color="#FFFFFF" />
            </TouchableOpacity>
          </View>

          {/* Chat Content */}
          <FlatList
            ref={flatListRef}
            data={isTyping ? [...messages, { sender: 'bot', text: 'Typing...', type: 'text' }] : messages}
            keyExtractor={(_, index) => index.toString()}
            renderItem={({ item, index }) => {
              const isLast = isTyping && index === messages.length;
              const isUser = item.sender === 'user';
              const bubbleStyle = isUser ? styles.userMessage : styles.botMessage;

              if (isUser) {
                return (
                  <View style={bubbleStyle}>
                    {isLast ? (
                      <TypingIndicator />
                    ) : item.type === 'image' ? (
                      <RNImage source={{ uri: item.text }} style={{ width: 200, height: 200, borderRadius: 10 }} />
                    ) : (
                      <>
                        <Text style={styles.messageText}>{item.text}</Text>
                        {item.timestamp && <Text style={styles.timestamp}>{getRelativeTime(item.timestamp)}</Text>}
                      </>
                    )}
                  </View>
                );
              } else {
                return (
                  <LinearGradient
                    colors={['#47006A', '#0031D0']}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 1 }}
                    style={styles.botMessage}
                  >
                    {isLast ? (
                      <TypingIndicator />
                    ) : item.type === 'image' ? (
                      <RNImage source={{ uri: item.text }} style={{ width: 200, height: 200, borderRadius: 10 }} />
                    ) : (
                      <>
                        <Text style={styles.messageText}>{item.text}</Text>
                        {item.timestamp && <Text style={styles.timestamp}>{getRelativeTime(item.timestamp)}</Text>}
                      </>
                    )}
                  </LinearGradient>
                );
              }
            }}
            contentContainerStyle={{ paddingVertical: 10 }}
            style={styles.chatBox}
            keyboardShouldPersistTaps="handled"
          />

          <View style={styles.inputContainer}>
            {/* Attachment Icon */}
            <TouchableOpacity onPress={pickImageAndSend} style={styles.attachmentButton}>
              <Image
                source={require('../src/assets/images/image-square.png')}
                style={styles.attachmentIcon}
              />
            </TouchableOpacity>

            {/* Text Input */}
            <TextInput
              style={styles.input}
              value={message}
              onChangeText={setMessage}
              placeholder="Chat with character..."
              placeholderTextColor="#aaa"
            />

            {/* Send Button */}
            <TouchableOpacity style={styles.sendButton} onPress={handleSend}>
              <Image
                source={require('../src/assets/images/paper-plane-right.png')}
                style={styles.sendIcon}
              />
            </TouchableOpacity>
          </View>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0B0B28',
  },
  header: {
    flexDirection: 'row',
    height: verticalScale(60),
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#000000',
    paddingHorizontal: scale(15),
    paddingVertical: verticalScale(10),
  },
  backButton: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  backIcon: {
    width: scale(20),
    height: scale(20),
    resizeMode: 'contain',
  },
  backText: {
    fontSize: moderateScale(16),
    color: '#FFFFFF',
    marginLeft: scale(5),
  },
  headerTitle: {
    fontSize: moderateScale(18),
    color: '#FFFFFF',
    fontWeight: 'bold',
    textAlign: 'center',
  },
  infoButton: {
    padding: scale(5),
  },
  chatBox: {
    flex: 1,
    marginBottom: verticalScale(10),
    paddingHorizontal: scale(10),
    borderWidth: 1,
    borderBottomColor: '#262626',
  },
  messageText: {
    color: '#fff',
    fontSize: moderateScale(16),
  },
  timestamp: {
    fontSize: moderateScale(10),
    color: '#aaa',
    marginTop: verticalScale(4),
    alignSelf: 'flex-end',
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#1D1C22',
    borderRadius: scale(20),
    paddingHorizontal: scale(15),
    height: verticalScale(60),
    borderWidth: 1,
    borderColor: '#262626',
  },
  attachmentButton: {
    marginRight: scale(10),
  },
  attachmentIcon: {
    width: scale(20),
    height: scale(20),
    resizeMode: 'contain',
    tintColor: '#FFFFFF',
  },
  input: {
    flex: 1,
    color: '#FFFFFF',
    fontSize: moderateScale(16),
    paddingVertical: verticalScale(10),
  },
  sendButton: {
    marginLeft: scale(10),
  },
  sendIcon: {
    width: scale(20),
    height: scale(20),
    resizeMode: 'contain',
    tintColor: '#FFFFFF',
  },
  userMessage: {
    alignSelf: 'flex-end',
    backgroundColor: '#000000',
    padding: scale(12),
    borderRadius: scale(16),
    marginVertical: verticalScale(4),
    maxWidth: '75%',
    borderWidth: 1,
    borderColor: '#262626',
  },
  botMessage: {
    alignSelf: 'flex-start',
    padding: scale(12),
    borderRadius: scale(16),
    marginVertical: verticalScale(4),
    maxWidth: '75%',
    borderWidth: 1,
    borderColor: '#262626',
  },
});