import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  FlatList,
  StyleSheet,
  LayoutAnimation,
  Platform,
  UIManager,
  KeyboardAvoidingView,
  Image as RNImage,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import axios from 'axios';
import { Ionicons } from '@expo/vector-icons';
import { router, useLocalSearchParams } from 'expo-router';
import { verticalScale, scale, moderateScale } from 'react-native-size-matters';
import { LinearGradient } from 'expo-linear-gradient';

if (Platform.OS === 'android' && UIManager.setLayoutAnimationEnabledExperimental) {
  UIManager.setLayoutAnimationEnabledExperimental(true);
}

const GROQ_API_KEY = 'REMOVED';

const getGroqReply = async (characterPrompt, chatMessages, chapterQuery) => {
  try {
    const userProfile = await AsyncStorage.getItem('userData');
    const user = userProfile ? JSON.parse(userProfile) : {};

    // Personal context
    const userContext = `You are chatting with a ${user.age}-year-old ${user.gender} student named ${user.name}. `;

    const chapterContext = chapterQuery
      ? `Explain the following chapter in detail: ${chapterQuery}.`
      : '';

    const messages = [
      {
        role: 'system',
        content: `${userContext}${characterPrompt} ${chapterContext}`,
      },
      ...chatMessages
        .filter((msg) => msg.type === 'text')
        .map((msg) => ({
          role: msg.sender === 'user' ? 'user' : 'assistant',
          content: msg.text,
        })),
    ];

    const res = await axios.post(
      'https://api.groq.com/openai/v1/chat/completions',
      {
        model: 'llama-3.3-70b-versatile',
        messages,
        temperature: 0.4,
        max_tokens: 1000,
      },
      {
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${GROQ_API_KEY}`,
        },
      }
    );

    return res.data.choices?.[0]?.message?.content || 'Sorry, I didn’t get that.';
  } catch (err) {
    console.error('Groq error:', err.response?.data || err);
    return 'Error...try again.';
  }
};

function getRelativeTime(dateString) {
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
}

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

export default function Playground() {
  const { question, options } = useLocalSearchParams();
  const [messages, setMessages] = useState([]);
  const [message, setMessage] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const prompt =  'You are Ritu, a fun, teenage girl who replies in Hinglish.avoid giving long responses. You never give boring answers. Be informal and talk like a high school girl from India. Give a clear, concise, and simple step-by-step solution/explanation not more than 15 lines to the following question using plain text with Unicode math symbols (like ½, ×, √, ²) instead of LaTeX. Avoid using any dollar signs or LaTeX formatting. Write everything in plain, friendly text a high school student can understand. Avoid being too technical, keep it friendly and encouraging.';
  const flatListRef = useRef(null);

  // Auto-fetch concepts if question/options are present
  useEffect(() => {
    if (question && options) {
      const opts = JSON.parse(options);
      const aiPrompt = `You are Ritu, a fun, teenage girl who replies in Hinglish.List the key concepts or topics required to solve this question, and explain each concept in simple terms for a high school student.
Question: "${question}"
Options: ${opts.map((opt, idx) => `${String.fromCharCode(65 + idx)}. ${opt}`).join(' ')}
Return the answer as a list of concepts with a short explanation for each.`;

      const fetchConcepts = async () => {
        setIsTyping(true);
        try {
          const res = await axios.post(
            'https://api.groq.com/openai/v1/chat/completions',
            {
              model: 'llama-3.3-70b-versatile',
              messages: [{ role: 'user', content: aiPrompt }],
              temperature: 0.4,
              max_tokens: 600,
            },
            {
              headers: {
                'Content-Type': 'application/json',
                Authorization: `Bearer ${GROQ_API_KEY}`,
              },
            }
          );
          const aiText = res.data.choices?.[0]?.message?.content || 'No info found.';
          setMessages([
            {
              sender: 'bot',
              text: aiText,
              timestamp: new Date().toISOString(),
              type: 'text',
            },
          ]);
        } catch (err) {
          setMessages([
            {
              sender: 'bot',
              text: 'Error fetching concepts. Please try again.',
              timestamp: new Date().toISOString(),
              type: 'text',
            },
          ]);
        }
        setIsTyping(false);
      };

      fetchConcepts();
    }
  }, [question, options]);

  const handleSend = async () => {
    if (message.trim() === '') return;

    const nowISOString = new Date().toISOString();
    const newMessage = { sender: 'user', text: message, timestamp: nowISOString, type: 'text' };
    const updatedMessages = [...messages, newMessage];

    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
    setMessages(updatedMessages);
    setMessage('');
    setIsTyping(true);

    // Detect chapter-related queries
    const chapterQuery = message.toLowerCase().includes('chapter') ? message : null;

    const botReply = await getGroqReply(prompt, updatedMessages, chapterQuery);
    const botMessage = { sender: 'bot', text: botReply, timestamp: new Date().toISOString(), type: 'text' };

    const finalMessages = [...updatedMessages, botMessage];
    setMessages(finalMessages);
    setIsTyping(false);

    saveChatHistory(finalMessages);
  };

  const saveChatHistory = async (chatHistory) => {
    try {
      await AsyncStorage.setItem('chatHistory', JSON.stringify(chatHistory));
    } catch (err) {
      console.error('Error saving chat history:', err);
    }
  };

  useEffect(() => {
    flatListRef.current?.scrollToEnd({ animated: true });
  }, [messages]);

  return (
    <View style={styles.container}>
      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 60 : 30}
      >
        <View style={styles.header}>
          <Ionicons
            name="arrow-back"
            size={28}
            color="white"
            onPress={() => router.back()}
          />
        </View>
        <FlatList
          ref={flatListRef}
          data={isTyping ? [...messages, { sender: 'bot', text: 'Typing...', type: 'text' }] : messages}
          keyExtractor={(_item, index) => index.toString()}
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
          <TextInput
            style={styles.input}
            placeholder="Type your message..."
            placeholderTextColor="#aaa"
            value={message}
            onChangeText={setMessage}
          />
          <TouchableOpacity style={styles.sendButton} onPress={handleSend}>
            <Ionicons name="send" size={20} color="#fff" />
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0B0B28',
    padding: scale(10),
  },
  chatBox: {
    flex: 1,
    marginBottom: verticalScale(10),
  },
  userMessage: {
    alignSelf: 'flex-end',
    backgroundColor: '#1E1E3F',
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
  typingIndicator: {
    textAlign: 'center',
    color: '#aaa',
    marginBottom: 10,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#2A2A4D',
    borderRadius: scale(20),
    paddingHorizontal: scale(15),
    height: verticalScale(50),
    borderWidth: 1,
    borderColor: '#262626',
    marginBottom: verticalScale(10),
  },
  input: {
    flex: 1,
    color: '#fff',
    fontSize: moderateScale(16),
    paddingVertical: verticalScale(10),
  },
  sendButton: {
    backgroundColor: '#D500F9',
    padding: scale(10),
    borderRadius: scale(30),
    marginLeft: scale(5),
  },
  sendButtonText: {
    color: '#000',
    fontWeight: 'bold',
    fontSize: 16,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: verticalScale(25),
    marginBottom: verticalScale(10),
  },
});