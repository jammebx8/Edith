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
  Modal,
  ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import AsyncStorage from '@react-native-async-storage/async-storage';
import axios from 'axios';
import { scale, verticalScale, moderateScale } from 'react-native-size-matters';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import * as FileSystem from 'expo-file-system';
import images from '../src/constants/imagepath';
import { LinearGradient } from 'expo-linear-gradient';
import { createClient } from '@supabase/supabase-js';

if (Platform.OS === 'android' && UIManager.setLayoutAnimationEnabledExperimental) {
  UIManager.setLayoutAnimationEnabledExperimental(true);
}

// TODO: Replace with your actual Supabase keys
const SUPABASE_URL = 'https://rzcizwacjexolkjjczbt.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InJ6Y2l6d2FjamV4b2xrampjemJ0Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDU0MTA2ODMsImV4cCI6MjA2MDk4NjY4M30.I5TO7lLOuBwe6T5wllcx3FK_is0pammMtVw-oevfTws';
const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

const GROQ_API_KEY = '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';
const OCR_API_KEY = 'K88346068688957';

const REPORT_REASONS = [
  'offensive',
  'sexual',
  'hate speech',
  'misleading',
  'other',
];

const getGroqReply = async (
  characterPrompt,
  chatMessages,
  imageText
) => {
  try {
    const userProfile = await AsyncStorage.getItem('userData');
    const userStr = await AsyncStorage.getItem('@user');
    const user = userStr ? JSON.parse(userStr) : {};
    const userContext = `You are chatting with an 18-year-old ${user.gender || 'student'} named ${user.name || ''}, who is preparing for ${user.exam || 'an exam'}. `;
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
    return res.data.choices?.[0]?.message?.content || "Sorry, I didn't get that.";
  } catch (err) {
    console.error('Groq error:', err.response?.data || err);
    return 'Error...try again.';
  }
};

const getTextFromImage = async (imageUri) => {
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

const getRelativeTime = (dateString) => {
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
  const { name, prompt, text, image } = useLocalSearchParams();
  const router = useRouter();

  const [message, setMessage] = useState('');
  const [messages, setMessages] = useState([]);
  const flatListRef = useRef(null);
  const [isTyping, setIsTyping] = useState(false);

  // Report Modal related state
  const [reportModalVisible, setReportModalVisible] = useState(false);
  const [reportMessage, setReportMessage] = useState(null);
  const [reportReason, setReportReason] = useState(REPORT_REASONS[0]);
  const [reportDescription, setReportDescription] = useState('');
  const [isReporting, setIsReporting] = useState(false);

  const [toast, setToast] = useState({
    visible: false,
    message: '',
    type: 'success',
  });

  // Avoid resetting reportReason and reportDescription on each open
  const openReportModal = (msg) => {
    setReportMessage(msg);
    setReportModalVisible(true);
    // Do NOT reset reportReason/reportDescription here; users might be switching between modal opens
  };

  const closeReportModal = () => {
    setReportModalVisible(false);
    setReportMessage(null);
    setReportReason(REPORT_REASONS[0]);
    setReportDescription('');
    setIsReporting(false);
  };

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

  const getImageSource = (imageParam) => {
    if (typeof imageParam === 'string') {
      try {
        return JSON.parse(imageParam);
      } catch {
        return { uri: imageParam };
      }
    }
    return imageParam;
  };

  const showToast = (message, type) => {
    setToast({ visible: true, message, type });
    setTimeout(() => {
      setToast({ visible: false, message: '', type: 'success' });
    }, 2500);
  };

  // Handle submit report
  const handleSubmitReport = async () => {
    if (!reportMessage || !reportReason) return;
    setIsReporting(true);
    try {
      const { error } = await supabase
        .from('reports')
        .insert({
          message_text: reportMessage.text,
          reason: reportReason,
          description: reportDescription,
          reported_at: new Date().toISOString(),
        });
      if (error) throw error;
      console.log('Success', 'Report submitted successfully');
      closeReportModal();
    } catch (error) {
      console.error('Error submitting report:', error);
      console.log('Error', 'Failed to submit report. Please try again.');
    } finally {
      setIsReporting(false);
    }
  };

  // Inline JSX for Modal (not a function)
  const reportModalElement = (
    <Modal
      visible={reportModalVisible}
      transparent={true}
      animationType="fade"
      onRequestClose={closeReportModal}
    >
      <View style={styles.modalOverlay}>
        <View style={styles.modalBackground}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Report Message</Text>
            <Text style={styles.modalMsgPreview} numberOfLines={2}>
              "{reportMessage?.text}"
            </Text>
            <Text style={styles.modalLabel}>Reason:</Text>
            <View style={styles.dropdown}>
              {REPORT_REASONS.map((reason) => (
                <TouchableOpacity
                  key={reason}
                  onPress={() => setReportReason(reason)}
                  style={[
                    styles.dropdownItem,
                    reason === reportReason && styles.dropdownItemSelected,
                  ]}
                >
                  <Text
                    style={[
                      styles.dropdownText,
                      reason === reportReason && styles.dropdownTextSelected,
                    ]}
                  >
                    {reason}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
            <Text style={[styles.modalLabel, { marginTop: 10 }]}>
              Additional Details:
            </Text>
            <TextInput
              style={styles.modalInput}
              multiline
              value={reportDescription}
              onChangeText={setReportDescription}
              placeholder="Describe the issue..."
              placeholderTextColor="#666"
            />
            <View style={styles.modalButtonRow}>
              <TouchableOpacity
                onPress={closeReportModal}
                style={[styles.modalButton, { backgroundColor: '#2D2D3A' }]}
              >
                <Text style={{ color: '#fff' }}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity
                onPress={handleSubmitReport}
                disabled={isReporting}
                style={[
                  styles.modalButton,
                  { backgroundColor: isReporting ? '#666' : '#47006A' },
                ]}
              >
                <Text style={{ color: '#fff' }}>
                  {isReporting ? 'Submitting...' : 'Submit'}
                </Text>
              </TouchableOpacity>
            </View>
          </View >
        </View >
      </View>
    </Modal>
  );

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: '#0B0B28' }}>
      <StatusBar barStyle="light-content" backgroundColor="#000000" />
      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === 'ios' ? 'padding' : 'padding'}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 0 : 40}
      >
        <View style={styles.container}>
          <View style={styles.header}>
            <TouchableOpacity
              onPress={() => router.replace('/chats')}
              style={styles.backButton}
              hitSlop={{ top: 30, bottom: 30, left: 30, right: 12 }}
            >
              <Image
                source={require('../src/assets/images/caret-left.png')}
                style={[styles.backIcon, { tintColor: '#FFFFFF' }]}
              />
              <Text style={styles.backText}>Back</Text>
            </TouchableOpacity>
            {image && (
              <Image
                source={getImageSource(image)}
                style={styles.characterImage}
                resizeMode="cover"
              />
            )}
            <Text style={styles.headerTitle}>{name}</Text>
            <TouchableOpacity style={styles.infoButton}>
              <Ionicons name="information-circle-outline" size={24} color="#FFFFFF" />
            </TouchableOpacity>
          </View>

          <FlatList
            ref={flatListRef}
            data={isTyping ? [...messages, { sender: 'bot', text: 'Typing...', type: 'text' }] : messages}
            keyExtractor={(_, index) => index.toString()}
            renderItem={({ item, index }) => {
              const isLast = isTyping && index === messages.length;
              const isUser = item.sender === 'user';
              const bubbleStyle = isUser ? styles.userMessage : styles.botMessage;
              const showReport = !isUser && item.type === 'text' && !isLast && !!item.text;

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
                    style={[styles.botMessage, { flexDirection: 'row', alignItems: 'flex-start' }]}
                  >
                    <View style={{ flex: 1, minWidth: 0 }}>
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
                    {showReport && (
                      <TouchableOpacity
                        style={styles.reportIconButton}
                        hitSlop={{ top: 10, bottom: 10, left: 5, right: 5 }}
                        onPress={() => openReportModal(item)}
                      >
                        <MaterialCommunityIcons name="dots-horizontal" size={20} color="#fff" />
                      </TouchableOpacity>
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
            <TouchableOpacity onPress={pickImageAndSend} style={styles.attachmentButton}>
              <Image
                source={require('../src/assets/images/image-square.png')}
                style={styles.attachmentIcon}
              />
            </TouchableOpacity>
            <TextInput
            
              style={styles.input}
              multiline
              value={message}
              onChangeText={setMessage}
              placeholder="Chat with character..."
              placeholderTextColor="#aaa"
            
            />
            <TouchableOpacity style={styles.sendButton} onPress={handleSend}>
              <Image
                source={require('../src/assets/images/paper-plane-right.png')}
                style={styles.sendIcon}
              />
            </TouchableOpacity>
          </View>
          <Text style={styles.disclaimer}>
            ⚠️ AI-generated responses may be inaccurate or inappropriate. Please use the Report option if you find any issues.
          </Text>
          {reportModalElement}
          {toast.visible && (
            <View
              style={[
                styles.toast,
                toast.type === 'error' ? styles.toastError : styles.toastSuccess,
              ]}
            >
              <Text style={styles.toastText}>{toast.message}</Text>
            </View>
          )}
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
    fontFamily: "Geist"
  },
  characterImage: {
    width: scale(30),
    height: scale(30),
    borderRadius: scale(20),
    marginLeft: scale(40),
    borderWidth: 1,
    borderColor: '#FFFFFF',
  },
  headerTitle: {
    fontSize: moderateScale(18),
    color: '#FFFFFF',
    fontWeight: '500',
    textAlign: 'center',
    flex: 1,
    marginRight: scale(40),
    fontFamily: "Geist"
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
    fontFamily: "Geist"
  },
  timestamp: {
    fontSize: moderateScale(10),
    color: '#aaa',
    marginTop: verticalScale(4),
    alignSelf: 'flex-end',
    fontFamily: "Geist"
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
    fontFamily: "Geist"
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
  reportIconButton: {
    marginLeft: scale(8),
    marginTop: 2,
    padding: 4,
    alignSelf: 'flex-start',
  },
  disclaimer: {
    color: '#FFD600',
    fontSize: moderateScale(12),
    backgroundColor: '#13133D',
    paddingVertical: 8,
    paddingHorizontal: 18,
    borderTopWidth: 1,
    borderTopColor: '#282871',
    textAlign: "center",
    fontFamily: "Geist"
  },
  modalOverlay: {
    flex: 1,
    justifyContent: 'flex-end',
    backgroundColor: 'rgba(10,10,20,0.7)'
  },
  modalContent: {
    backgroundColor: 'black',
    borderRadius: 10,
    padding: 20,
    width: '90%',
    maxWidth: 400,
  },
  modalTitle: {
    fontSize: moderateScale(18),
    fontWeight: '700',
    color: '#fff',
    marginBottom: 4,
    fontFamily: "Geist"
  },
  modalMsgPreview: {
    color: '#eee',
    fontStyle: 'italic',
    marginBottom: 18,
    fontFamily: "Geist"
  },
  modalLabel: {
    color: '#b6b7bb',
    fontSize: moderateScale(12),
    marginBottom: 2,
    fontFamily: "Geist"
  },
  modalDropdownContainer: {
    marginBottom: 2,
  },
  dropdown: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
    marginVertical: 4,
  },
  dropdownItem: {
    paddingVertical: 4,
    paddingHorizontal: 13,
    borderRadius: 12,
    backgroundColor: '#21203a',
    marginRight: 7,
    marginBottom: 7,
    borderWidth: 1,
    borderColor: '#333162',
  },
  dropdownItemSelected: {
    backgroundColor: '#47006A',
    borderColor: '#cbbcfc',
  },
  dropdownText: {
    color: '#eee'
  },
  dropdownTextSelected: {
    color: '#fff',
    fontWeight: '700'
  },
  modalInput: {
    minHeight: 50,
    maxHeight: 90,
    borderColor: '#2D3052',
    borderWidth: 1,
    borderRadius: 10,
    color: '#fff',
    fontFamily: "Geist",
    padding: 8,
    marginBottom: 16,
    backgroundColor: '#120f1f',
  },
  modalButtonRow: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    marginTop: 5,
    gap: 9,
  },
  modalButton: {
    paddingVertical: 9,
    paddingHorizontal: 19,
    borderRadius: 13,
    elevation: 2,
    minWidth: 92,
    alignItems: 'center'
  },
  toast: {
    position: 'absolute',
    bottom: 94,
    alignSelf: 'center',
    minWidth: '50%',
    paddingVertical: 10,
    paddingHorizontal: 21,
    borderRadius: 14,
    zIndex: 100,
    elevation: 12,
    opacity: 0.95,
  },
  toastSuccess: {
    backgroundColor: '#1ec276'
  },
  toastError: {
    backgroundColor: '#E75552'
  },
  toastText: {
    color: '#fff',
    fontFamily: "Geist"
  },

  modalBackground: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
});