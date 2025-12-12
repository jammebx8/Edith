import React, { useEffect, useState, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Image,
  TextInput,
  Keyboard,
  FlatList,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import Ionicons from 'react-native-vector-icons/Ionicons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { verticalScale, scale, moderateScale } from 'react-native-size-matters';
import axios from 'axios';

const GROQ_API_KEY = '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';
const USERNAME = "Dhruv Pathak"; // Replace with dynamic user if needed

const STORAGE_KEYS = {
  chatList: 'edith_chatList',
  selectedChatId: 'edith_selectedChatId',
  theme: 'edith_theme',
};

const getGroqReply = async (userMessage: string) => {
  try {
    const res = await axios.post(
      'https://api.groq.com/openai/v1/chat/completions',
      {
        model: 'llama-3.3-70b-versatile',
        messages: [{ role: 'user', content: userMessage }],
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

const getGroqTitle = async (firstMessage: string) => {
  try {
    const res = await axios.post(
      'https://api.groq.com/openai/v1/chat/completions',
      {
        model: 'llama-3.3-70b-versatile',
        messages: [
          {
            role: 'system',
            content: 'You are a helpful assistant. Given a user message, summarize it into a short chat title, maximum 5 words.',
          },
          {
            role: 'user',
            content: `Summarize this message into a chat title of at most 5 words: "${firstMessage}"`,
          }
        ],
        temperature: 0.3,
        max_tokens: 12,
      },
      {
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${GROQ_API_KEY}`,
        },
      }
    );
    return res.data.choices?.[0]?.message?.content?.replace(/\n/g, '').trim() || "New Chat";
  } catch (err) {
    console.error('Groq title error:', err.response?.data || err);
    return 'New Chat';
  }
};

const Index = () => {
  // Sidebar state
  const [selectedChatId, setSelectedChatId] = useState(null);
  const [chatList, setChatList] = useState([]); // [{id, title, messages}]
  const [newChatPending, setNewChatPending] = useState(false);

  // Main chat state
  const [isWhite, setIsWhite] = useState(false); // light/dark mode
  const [greeting, setGreeting] = useState('');
  const [message, setMessage] = useState('');
  const [inputFocused, setInputFocused] = useState(false);
  const [chatStarted, setChatStarted] = useState(false);
  const [messages, setMessages] = useState([]);
  const [isTyping, setIsTyping] = useState(false);
  const flatListRef = useRef(null);

  // Load chats, theme, selected chat from AsyncStorage
  useEffect(() => {
    (async () => {
      try {
        const [storedChats, storedSelId, storedTheme] = await Promise.all([
          AsyncStorage.getItem(STORAGE_KEYS.chatList),
          AsyncStorage.getItem(STORAGE_KEYS.selectedChatId),
          AsyncStorage.getItem(STORAGE_KEYS.theme),
        ]);
        if (storedChats) setChatList(JSON.parse(storedChats));
        if (storedSelId) {
          setSelectedChatId(storedSelId);
          const chat = JSON.parse(storedChats || '[]').find(c => c.id === storedSelId);
          if (chat) {
            setMessages(chat.messages);
            setChatStarted(true);
          }
        }
        if (storedTheme === 'light') setIsWhite(true);
        else setIsWhite(false);
      } catch (err) {
        console.error('Error loading from async storage:', err);
      }
    })();
  }, []);

  // Save chats, selected chat, and theme to AsyncStorage whenever they change
  useEffect(() => {
    AsyncStorage.setItem(STORAGE_KEYS.chatList, JSON.stringify(chatList));
  }, [chatList]);
  useEffect(() => {
    if (selectedChatId)
      AsyncStorage.setItem(STORAGE_KEYS.selectedChatId, selectedChatId);
  }, [selectedChatId]);
  useEffect(() => {
    AsyncStorage.setItem(STORAGE_KEYS.theme, isWhite ? 'light' : 'dark');
  }, [isWhite]);

  // Set greeting based on current time
  useEffect(() => {
    const hour = new Date().getHours();
    if (hour < 12) {
      setGreeting('Good Morning');
    } else if (hour < 18) {
      setGreeting('Good Afternoon');
    } else {
      setGreeting('Good Evening');
    }
  }, []);

  useEffect(() => {
    if (chatStarted) {
      flatListRef.current?.scrollToEnd({ animated: true });
    }
  }, [messages, isTyping, chatStarted]);

  // Sidebar: New Chat
  const handleNewChat = () => {
    setSelectedChatId(null);
    setChatStarted(false);
    setMessages([]);
    setNewChatPending(true);
    setMessage('');
  };

  // Sidebar: Select chat from list
  const handleSelectChat = (chatId) => {
    const chat = chatList.find(c => c.id === chatId);
    setSelectedChatId(chatId);
    setMessages(chat ? chat.messages : []);
    setChatStarted(true);
    setNewChatPending(false);
    setMessage('');
  };

  // Initial send handler - starts chat and saves to sidebar
  const handleFirstSend = async () => {
    if (!message.trim()) return;
    setChatStarted(true);
    setNewChatPending(false);

    const firstMsg = { sender: 'user', text: message };
    setMessages([firstMsg]);
    setIsTyping(true);
    setMessage('');
    Keyboard.dismiss();

    // Generate AI title for chat (≤5 words)
    const chatTitle = await getGroqTitle(message);

    // AI reply
    const aiReply = await getGroqReply(message);
    const newMsgs = [firstMsg, { sender: 'ai', text: aiReply }];
    setMessages(newMsgs);
    setIsTyping(false);

    // Save chat in sidebar (prepend for recent on top)
    const chatId = Date.now().toString();
    const newChat = {
      id: chatId,
      title: chatTitle,
      messages: newMsgs,
    };
    setChatList(prev => [newChat, ...prev]);
    setSelectedChatId(chatId);
    setNewChatPending(false);
  };

  // Chat mode send handler
  const handleChatSend = async () => {
    if (!message.trim()) return;
    const newMsgs = [...messages, { sender: 'user', text: message }];
    setMessages(newMsgs);
    setIsTyping(true);
    setMessage('');
    Keyboard.dismiss();

    // AI reply
    const aiReply = await getGroqReply(message);
    const allMsgs = [...newMsgs, { sender: 'ai', text: aiReply }];
    setMessages(allMsgs);
    setIsTyping(false);

    // Update chat in sidebar
    if (selectedChatId) {
      setChatList(prev =>
        prev.map(chat =>
          chat.id === selectedChatId ? { ...chat, messages: allMsgs } : chat
        )
      );
    }
  };

  // Mode toggle
  const changeBackground = () => {
    setIsWhite(prev => !prev);
  };

  // Render chat message bubble
  const renderChatMessage = ({ item }) => {
    if (item.sender === "user") {
      return (
        <View style={[styles.messageBubble, styles.messageRight]}>
          <Text style={styles.messageText}>{item.text}</Text>
        </View>
      );
    } else if (item.sender === "ai") {
      return (
        <View style={[styles.aiBubble, isWhite ? styles.aiBubbleLight : styles.aiBubbleDark]}>
          <Text style={[styles.aiMessageText, isWhite ? styles.aiMessageTextwhite : styles.MessageTextdark]}>{item.text}</Text>
        </View>
      );
    }
    return null;
  };

  // Sidebar: render chat list
  const renderSidebarItem = ({ item }) => (
    <TouchableOpacity
      style={[
        styles.sidebarChatItem,
        selectedChatId === item.id && styles.sidebarChatItemSelected,
      ]}
      onPress={() => handleSelectChat(item.id)}
    >
      <Text style={styles.sidebarChatTitle} numberOfLines={1}>{item.title}</Text>
    </TouchableOpacity>
  );

  // Loader gif for AI typing
  const LoaderGif = () => (
    <View style={styles.loaderContainer}>
      <Image
        source={require('../src/assets/images/loader.gif')}
        style={styles.loaderGif}
      />
    </View>
  );

  return (
    <View style={{ flex: 1, flexDirection: 'row', backgroundColor: isWhite ? '#fff' : '#000' }}>
      {/* Sidebar */}
      <View style={styles.sidebar}>
        <View style={styles.sidebarTop}>
          {/* New Chat */}
          <TouchableOpacity style={styles.sidebarNewChatBtn} onPress={handleNewChat}>
            <Ionicons name="add" size={22} color="#fff" />
            <Text style={styles.sidebarNewChatText}>New chat</Text>
          </TouchableOpacity>
        </View>
        {/* Chats List */}
        <FlatList
          showsVerticalScrollIndicator={false}
          data={chatList}
          renderItem={renderSidebarItem}
          keyExtractor={(item) => item.id}
          style={styles.sidebarChatList}
          contentContainerStyle={{ paddingBottom: 10 }}
        />
        {/* Username at bottom */}
        <View style={styles.sidebarBottom}>
          <View style={styles.userAvatarCircle}>
            <Text style={styles.userAvatarText}>{USERNAME[0]}</Text>
          </View>
          <View>
            <Text style={styles.sidebarUserName}>{USERNAME}</Text>
            <Text style={styles.sidebarUserType}>Free</Text>
          </View>
        </View>
      </View>

      {/* Main Edith */}
      <View style={{ flex: 1 }}>
        {(!chatStarted || newChatPending) ? (
          <View style={[styles.container, { backgroundColor: isWhite ? '#fff' : '#000', flex: 1 }]}>
            {/* Dark/Light mode toggle button - top right */}
            <TouchableOpacity
              style={[
                styles.modeButton,
                { borderColor: isWhite ? '#000' : 'rgba(255,255,255,0.2)' },
              ]}
              onPress={changeBackground}
            >
              <Ionicons
                name={isWhite ? 'sunny-outline' : 'moon-outline'}
                size={20}
                color={isWhite ? '#000' : '#fff'}
                style={{ marginRight: 6 }}
              />
              <Text style={[styles.modeButtonText, { color: isWhite ? '#000' : '#fff' }]}>
                {isWhite ? 'Light Mode' : 'Dark Mode'}
              </Text>
            </TouchableOpacity>
            {/* Circular GIF container */}
            <View style={styles.gifContainer}>
              <Image
                source={require('../src/assets/images/gif.gif')}
                style={styles.gifImage}
              />
            </View>
            {/* Greeting */}
            <View style={styles.header}>
              <Text style={[styles.headertext, { color: isWhite ? '#000' : '#fff' }]}>
                {greeting}, Dhruv
              </Text>
            </View>
            {/* Input at center */}
            <View
              style={[
                styles.inputContainerInitial,
                {
                  borderColor: inputFocused ? '#262626' : '#262626',
                  backgroundColor: isWhite ? '#fff' : '#1D1C22',
                },
              ]}
            >
              <TextInput
                style={[
                  styles.input,
                  { color: isWhite ? '#000' : '#fff' }
                ]}
                placeholder="Ask anything"
                placeholderTextColor={isWhite ? "#888" : "#aaa"}
                value={message}
                onChangeText={setMessage}
                onFocus={() => setInputFocused(true)}
                onBlur={() => setInputFocused(false)}
                onSubmitEditing={handleFirstSend}
                returnKeyType="send"
                multiline={false}
              />
              <TouchableOpacity style={styles.sendButton} onPress={handleFirstSend}>
                <Ionicons name="send" size={20} color={isWhite ? "#000" : "#fff"} />
              </TouchableOpacity>
            </View>
          </View>
        ) : (
          <View style={[styles.chatContainer, { backgroundColor: isWhite ? '#fff' : '#000' }]}>
            <FlatList
              showsVerticalScrollIndicator={false}
              ref={flatListRef}
              data={
                isTyping
                  ? [
                      ...messages,
                      { sender: 'ai', text: '', showGif: true }
                    ]
                  : messages
              }
              renderItem={({ item }) => {
                if (item.showGif) {
                  // Loader gif while waiting for AI
                  return <LoaderGif />;
                }
                return renderChatMessage({ item });
              }}
              keyExtractor={(_, idx) => idx.toString()}
              contentContainerStyle={styles.chatContent}
              style={styles.chatList}
            />
            <KeyboardAvoidingView
              behavior={Platform.OS === 'ios' ? 'padding' : undefined}
              keyboardVerticalOffset={Platform.OS === 'ios' ? 0 : 40}
            >
              <View
                style={[
                  styles.inputContainerChat,
                  {
                    backgroundColor: isWhite ? '#fff' : '#18181c',
                  },
                ]}
              >
                <TextInput
                  style={[
                    styles.input,
                    { color: isWhite ? '#000' : '#fff' }
                  ]}
                  placeholder="Ask anything"
                  placeholderTextColor={isWhite ? "#888" : "#aaa"}
                  value={message}
                  onChangeText={setMessage}
                  onFocus={() => setInputFocused(true)}
                  onBlur={() => setInputFocused(false)}
                  onSubmitEditing={handleChatSend}
                  returnKeyType="send"
                  multiline={false}
                />
                <TouchableOpacity style={styles.sendButton} onPress={handleChatSend}>
                  <Ionicons name="send" size={20} color={isWhite ? "#000" : "#fff"} />
                </TouchableOpacity>
              </View>
            </KeyboardAvoidingView>
          </View>
        )}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  sidebar: {
    width: scale(140),
    backgroundColor: '#18181c',
    borderRightWidth: 1,
    borderColor: '#232323',
    justifyContent: 'space-between',

  },
  sidebarTop: {
    paddingVertical: scale(15),
    paddingHorizontal: scale(5),
    borderBottomWidth: 1,
    borderColor: '#232323',
  },
  sidebarNewChatBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: scale(10),
    borderRadius: scale(8),
    backgroundColor: '#232323',
    paddingHorizontal: scale(8),
  },
  sidebarNewChatText: {
    color: '#fff',
    fontSize: moderateScale(12),
    marginLeft: scale(9),
    fontFamily: 'Geist',
  },
  sidebarChatList: {
    flex: 1,
    backgroundColor: '#18181c',
    paddingVertical: scale(10),
   // paddingHorizontal: scale(8),
  },
  sidebarChatItem: {
    paddingVertical: scale(9),
    paddingHorizontal: scale(6),
    borderRadius: scale(7),
    marginBottom: scale(3),
    backgroundColor: 'transparent',
  },
  sidebarChatItemSelected: {
    backgroundColor: '#232323',
  },
  sidebarChatTitle: {
    color: '#fff',
    fontSize: moderateScale(12),
    fontFamily: 'Geist',
  },
  sidebarBottom: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: scale(8),
    borderTopWidth: 1,
    borderColor: '#232323',
    backgroundColor: '#18181c',
  },
  userAvatarCircle: {
    width: scale(24),
    height: scale(24),
    borderRadius: scale(17),
    backgroundColor: '#232323',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: scale(10),
  },
  userAvatarText: {
    color: '#fff',
    fontSize: moderateScale(12),
    fontWeight: 'bold',
    fontFamily: 'Geist',
  },
  sidebarUserName: {
    color: '#fff',
    fontSize: moderateScale(10),
    fontFamily: 'Geist',
    fontWeight: 'bold',
  },
  sidebarUserType: {
    color: '#aaa',
    fontSize: moderateScale(11),
    fontFamily: 'Geist',
  },
  // Initial Edith layout
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  gifContainer: {
    width: 100,
    height: 100,
    borderRadius: 200,
    overflow: 'hidden',
    marginBottom: 10,
  },
  gifImage: {
    width: '200%',
    height: '100%',
  },
  header: {
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 10,
  },
  headertext: {
    fontSize: 36,
  },
  inputContainerInitial: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: scale(20),
    paddingHorizontal: scale(15),
    height: verticalScale(35),
    width: scale(400),
    borderWidth: 1,
    marginTop: 10,
    marginBottom: 100,
    borderColor: '#262626',
  },
  // Chat layout styles
  chatContainer: {
    flex: 1,
  },
  chatList: {
    flex: 1,
  },
  chatContent: {
    paddingVertical: verticalScale(16),
    paddingHorizontal: scale(20),
    paddingBottom: verticalScale(80),
  },
  messageBubble: {
    backgroundColor: '#18181c',
    borderRadius: scale(14),
    paddingVertical: verticalScale(12),
    paddingHorizontal: scale(16),
    marginBottom: verticalScale(10),
    maxWidth: '85%',
  },
  messageRight: {
    alignSelf: 'flex-end',
    backgroundColor: '#18181c',
    borderWidth: 1,
    borderColor: '#262626',
  },
  aiBubble: {
    alignSelf: 'flex-start',
    paddingVertical: verticalScale(12),
    paddingHorizontal: scale(16),
    marginBottom: verticalScale(10),
    maxWidth: '100%',
    borderRadius: scale(14),
    borderWidth: 1,
  },
  aiBubbleDark: {
    borderColor: '#000',
  },
  aiBubbleLight: {
    borderColor: '#fff',
  },
  aiMessageText: {
    color: '#b6b6b6',
    fontSize: moderateScale(16),
    fontFamily: 'Geist',
  },
  messageText: {
    color: '#fff',
    fontSize: moderateScale(16),
    fontFamily: 'Geist',
  },
  aiMessageTextwhite:{
    color: '#000',
  },
  MessageTextdark:{
    color: '#fff',
  },
  inputContainerChat: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: scale(20),
    paddingHorizontal: scale(15),
    height: verticalScale(35),
    width: scale(400),
    borderWidth: 1,
    position: 'absolute',
    left: scale(50),
    right: scale(10),
    bottom: verticalScale(20),

    borderColor: '#262626',
    elevation: 2,
    shadowColor: '#000',
    shadowOpacity: 0.10,
    shadowRadius: 8,
  },
  input: {
    flex: 1,
    fontSize: moderateScale(16),
    paddingVertical: verticalScale(8),
    fontFamily: 'Geist',
  },
  sendButton: {
    marginLeft: scale(8),
  },
  modeButtonText: {
    fontSize: 14,
  },
  modeButton: {
    position: 'absolute',
    top: 20,
    right: 20,
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.2)',
  },
  loaderContainer: {
    alignItems: 'flex-start',
    justifyContent: 'center',
    marginBottom: verticalScale(10),
    paddingLeft: scale(4),
  },
  loaderGif: {
    width: 56,
    height: 56,
  },
});

export default Index;