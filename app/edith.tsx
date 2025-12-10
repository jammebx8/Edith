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
  Modal,
  ScrollView,
  Animated,
  ImageBackground,
} from 'react-native';
import Ionicons from 'react-native-vector-icons/Ionicons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { verticalScale, scale, moderateScale } from 'react-native-size-matters';
import axios from 'axios';
import { supabase } from '../src/utils/supabase.js';
import { Dimensions } from "react-native";

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get("window");

const STARBG_GIF = require('../src/assets/images/dark_star_bg.gif');
const STAR_GIF_OPACITY = 0.9; // adjust as needed
const STAR_GIF_TINT = undefined; // e.g. '#5050ff' or any color for tint (undefined for original)
const STAR_GIF_OVERLAY = 'rgba(0, 0, 0, 0.76)' // overlay color, if you want to apply further transparency layer
// ---------------------- CONSTANTS ---------------------
const GROQ_API_KEY = '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';
// TODO: Replace with dynamic user in production
const USERNAME = "Dhruv Pathak";

const STORAGE_KEYS = {
  chatList: 'edith_chatList',
  selectedChatId: 'edith_selectedChatId',
  theme: 'edith_theme',
  readNotifications: 'edith_readNotifications',
  language: 'edith_language',
};

// Local notification images
const notificationImages = {
  dengue: require('../src/assets/images/dengue.jpg'),
  covid: require('../src/assets/images/covid (3).jpeg'),
  malaria: require('../src/assets/images/malaria.png'),
  awareness: require('../src/assets/images/awareness.png'), // add if you have
  vaccination: require('../src/assets/images/vaccination.jpeg'), // add if you have
  general: require('../src/assets/images/general.png'), // add if you have
  default: require('../src/assets/images/grey_screen.png'), // fallback for unknowns
};

// Local author images
const authorImages = {
  gov: require('../src/assets/images/govlogo.jpg'),
  healthmin: require('../src/assets/images/healthmin.png'),
  ngo: require('../src/assets/images/ngo.png'),
  doctor: require('../src/assets/images/doctor.jpg'),
  default: require('../src/assets/images/default.jpg'), // fallback for unknowns
};

// ---------------------- LANGUAGES -----------------------
const SUPPORTED_LANGUAGES = [
  { code: 'en', label: 'English' },
  { code: 'hi', label: 'हिन्दी' },
  { code: 'mr', label: 'मराठी' },
  { code: 'bn', label: 'বাংলা' },
  { code: 'ta', label: 'தமிழ்' },
  { code: 'te', label: 'తెలుగు' },
  { code: 'gu', label: 'ગુજરાતી' },
  { code: 'kn', label: 'ಕನ್ನಡ' },
  { code: 'pa', label: 'ਪੰਜਾਬੀ' },
  { code: 'or', label: 'ଓଡ଼ିଆ' },
  // Add more as needed
];

// ------------- Multilingual GROQ Prompt Helper --------------
const getGroqReply = async (userMessage: string, language: string) => {
  try {
    const systemPrompt = `
You are a multilingual public health awareness chatbot for rural India. Respond in clear, structured, and conversational sentences, using arrows, short paragraphs, and relevant emojis.
Always use a warm, encouraging tone. 
- All answers should be in "${SUPPORTED_LANGUAGES.find(l => l.code === language)?.label || 'English'}" language.
- Educate users about preventive healthcare, disease symptoms, and vaccination schedules.
- If asked about a local outbreak, fetch real-time updates from the government health database API (simulate).
- Do not mention private/sensitive details.`;

    const res = await axios.post(
      'https://api.groq.com/openai/v1/chat/completions',
      {
        model: 'llama-3.3-70b-versatile',
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: userMessage }
        ],
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

const getGroqTitle = async (firstMessage: string, language: string) => {
  try {
    const res = await axios.post(
      'https://api.groq.com/openai/v1/chat/completions',
      {
        model: 'llama-3.3-70b-versatile',
        messages: [
          {
            role: 'system',
            content: `You are a helpful assistant. Given a user message, summarize it into a short chat title, maximum 5 words, in the same language as the input. Input language: ${SUPPORTED_LANGUAGES.find(l => l.code === language)?.label || 'English'}.`,
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

// ------------- Notification Helper (Add Outbreak API) -----------
// Only fetch fields Supabase
const fetchNotifications = async () => {
  const { data, error } = await supabase
    .from('notifications')
    .select('id, author, title, category, date')
    .order('date', { ascending: false });
  if (error) {
    console.error('Supabase fetchNotifications error:', error);
    return [];
  }
  // Simulate fetching outbreak alerts from government API
  const govAlerts = await fetchOutbreakAlerts();
  return [...(govAlerts || []), ...(data || [])];
};

// ------------- Simulate Government Outbreak Alerts API ----------
const fetchOutbreakAlerts = async () => {
  // These objects purposely DO NOT contain any image keys, only the allowed fields
  return [
   
  ];
};

const dismissNotification = async (notifId: string, readNotifications: string[], setReadNotifications: (x: string[]) => void) => {
  const newRead = [...readNotifications, notifId];
  setReadNotifications(newRead);
  await AsyncStorage.setItem(STORAGE_KEYS.readNotifications, JSON.stringify(newRead));
};

// --- IMAGE MAPPERS: assign local images based on notification content ---
const getNotificationImageKey = (notif) => {
  // Try to map by category first
  if (notif.category) {
    const cat = notif.category.toLowerCase();
    if (notificationImages[cat]) return cat;
  }
  // Fallback: try by keywords in title
  if (notif.title?.toLowerCase().includes('dengue')) return 'dengue';
  if (notif.title?.toLowerCase().includes('malaria')) return 'malaria';
  if (notif.title?.toLowerCase().includes('covid')) return 'covid';
  // ...add more custom logic as needed
  return 'default';
};

const getAuthorImageKey = (notif) => {
  const key = notif.author?.toLowerCase();
  if (!key) return 'default';
  if (key.includes('gov')) return 'gov';
  if (key.includes('health')) return 'healthmin';
  if (key.includes('ngo')) return 'ngo';
  if (key.includes('doctor')) return 'doctor';
  return 'default';
};

// -------------- Main Component ---------------
const Index = () => {
  // Sidebar state
  const [selectedChatId, setSelectedChatId] = useState(null);
  const [chatList, setChatList] = useState([]); // [{id, title, messages, language}]
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

  // Language state
  const [language, setLanguage] = useState('en');

  // Notification modal state
  const [modalVisible, setModalVisible] = useState(false);
  const [notifications, setNotifications] = useState([]);
  const [readNotifications, setReadNotifications] = useState<string[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [notifRefreshing, setNotifRefreshing] = useState(false);

  // For bell notification badge animation
  const badgeAnim = useRef(new Animated.Value(0)).current;

  // Load chats, theme, selected chat, language, read notifications from AsyncStorage
  useEffect(() => {
    (async () => {
      try {
        const [storedChats, storedSelId, storedTheme, storedRead, storedLang] = await Promise.all([
          AsyncStorage.getItem(STORAGE_KEYS.chatList),
          AsyncStorage.getItem(STORAGE_KEYS.selectedChatId),
          AsyncStorage.getItem(STORAGE_KEYS.theme),
          AsyncStorage.getItem(STORAGE_KEYS.readNotifications),
          AsyncStorage.getItem(STORAGE_KEYS.language),
        ]);
        if (storedChats) setChatList(JSON.parse(storedChats));
        if (storedSelId) {
          setSelectedChatId(storedSelId);
          const chat = JSON.parse(storedChats || '[]').find(c => c.id === storedSelId);
          if (chat) {
            setMessages(chat.messages);
            setChatStarted(true);
            setLanguage(chat.language || 'en');
          }
        }
        if (storedTheme === 'light') setIsWhite(true);
        else setIsWhite(false);
        if (storedRead) setReadNotifications(JSON.parse(storedRead));
        if (storedLang) setLanguage(storedLang);
      } catch (err) {
        console.error('Error loading from async storage:', err);
      }
    })();
  }, []);

  // Save chats, selected chat, theme, language to AsyncStorage whenever they change
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
  useEffect(() => {
    AsyncStorage.setItem(STORAGE_KEYS.language, language);
  }, [language]);

  // Save read notifications and update unread count
  useEffect(() => {
    AsyncStorage.setItem(STORAGE_KEYS.readNotifications, JSON.stringify(readNotifications));
    const unread = notifications.filter(n => !readNotifications.includes(n.id)).length;
    setUnreadCount(unread);
    if (unread > 0) {
      Animated.spring(badgeAnim, {
        toValue: 1,
        useNativeDriver: true,
        friction: 4,
      }).start();
    } else {
      badgeAnim.setValue(0);
    }
  }, [readNotifications, notifications]);

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

  // Notifications: fetch on mount & when modal opens
  useEffect(() => {
    (async () => {
      setNotifRefreshing(true);
      const notifs = await fetchNotifications();
      setNotifications(notifs);
      setNotifRefreshing(false);
    })();
  }, []);

  // Refresh notifications when modal opens
  useEffect(() => {
    if (modalVisible) {
      (async () => {
        setNotifRefreshing(true);
        const notifs = await fetchNotifications();
        setNotifications(notifs);
        setNotifRefreshing(false);
      })();
    }
  }, [modalVisible]);

  // Unread badge: update when notifications/readNotifications changes
  useEffect(() => {
    const unread = notifications.filter(n => !readNotifications.includes(n.id)).length;
    setUnreadCount(unread);
  }, [notifications, readNotifications]);

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
    setLanguage(chat?.language || 'en');
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

    // Generate AI title for chat (≤5 words) in selected language
    const chatTitle = await getGroqTitle(message, language);

    // AI reply
    const aiReply = await getGroqReply(message, language);
    const newMsgs = [firstMsg, { sender: 'ai', text: aiReply }];
    setMessages(newMsgs);
    setIsTyping(false);

    // Save chat in sidebar (prepend for recent on top)
    const chatId = Date.now().toString();
    const newChat = {
      id: chatId,
      title: chatTitle,
      messages: newMsgs,
      language,
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
    const aiReply = await getGroqReply(message, language);
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
      <Text style={styles.sidebarChatLang}>{SUPPORTED_LANGUAGES.find(l => l.code === item.language)?.label}</Text>
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

  // Notification: dismiss a notification
  const handleDismissNotif = async (notifId: string) => {
    await dismissNotification(notifId, readNotifications, setReadNotifications);
  };

  // Render notifications in modal
  const renderNotifications = () => {
    if (!notifications || notifications.length === 0) {
      return (
        <View style={styles.noNotificationsContainer}>
          <Ionicons name="notifications-off-outline" size={38} color="#aaa" style={{ marginBottom: 10 }} />
          <Text style={styles.noNotificationsText}>No recent notifications</Text>
        </View>
      );
    }
    return (
      <ScrollView style={{ maxHeight: 300 }} showsVerticalScrollIndicator={false}>
        {notifications.map((notif, idx) => {
          if (readNotifications.includes(notif.id)) return null;

          // Use local image mapping logic
          const notifImgKey = getNotificationImageKey(notif);
          const authorImgKey = getAuthorImageKey(notif);

          return (
            <View key={notif.id} style={styles.notificationItemContainer}>
              {/* Notification image - local, fallback to grey screen */}
              <Image
                source={notificationImages[notifImgKey] || notificationImages.default}
                style={styles.notificationImage}
                resizeMode="cover"
              />
              <View style={styles.notificationTextSection}>
                <Text style={styles.notificationCategory}>{notif.category}</Text>
                <Text style={styles.notificationTitle} numberOfLines={2}>{notif.title}</Text>
                <View style={styles.notificationRow}>
                  {/* Author image - local, fallback to default.jpg */}
                  <Image
                    source={authorImages[authorImgKey] || authorImages.default}
                    style={styles.notificationAvatar}
                  />
                  <Text style={styles.notificationAuthor}>{notif.author}</Text>
                  <Text style={styles.notificationDot}>•</Text>
                  <Text style={styles.notificationDate}>{notif.date && new Date(notif.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}</Text>
                </View>
              </View>
              <TouchableOpacity
                style={styles.notifCloseBtn}
                onPress={() => handleDismissNotif(notif.id)}
                hitSlop={{ top: 8, left: 8, right: 8, bottom: 8 }}
              >
                <Ionicons name="close" size={20} color="#888" />
              </TouchableOpacity>
            </View>
          );
        })}
        {/* If all notifications are dismissed */}
        {notifications.filter(n => !readNotifications.includes(n.id)).length === 0 && (
          <View style={styles.noNotificationsContainer}>
            <Ionicons name="notifications-off-outline" size={38} color="#aaa" style={{ marginBottom: 10 }} />
            <Text style={styles.noNotificationsText}>No recent notifications</Text>
          </View>
        )}
      </ScrollView>
    );
  };

  // Language picker for new chat
  const renderLanguagePicker = () => (
    <View style={styles.languagePickerCont}>
      <Text style={styles.languagePickerLabel}>Select Language:</Text>
      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ marginTop: 6 }}>
        {SUPPORTED_LANGUAGES.map(l => (
          <TouchableOpacity
            key={l.code}
            style={[
              styles.languageOption,
              language === l.code && styles.languageOptionSelected,
            ]}
            onPress={() => setLanguage(l.code)}
          >
            <Text style={[
              styles.languageOptionText,
              language === l.code && styles.languageOptionTextSelected,
            ]}>{l.label}</Text>
          </TouchableOpacity>
        ))}
      </ScrollView>
    </View>
  );

  return (
    <View style={{ flex: 1, flexDirection: 'row', backgroundColor: isWhite ? '#fff' : '#000' }}>
      {/* Sidebar */}
      <View style={styles.sidebar}>
        <View style={styles.sidebarTop}>
          <Image
            source={require('../src/assets/images/83d6b35a962a86a7cfabd7eabef55bd1.jpg')}
            style={styles.logoImage}
            resizeMode="contain"
          />
          {/* New Chat */}

          <TouchableOpacity style={styles.sidebarsearch} onPress={handleNewChat}>
            <Ionicons name="search" size={22} color="#fff"  />
            <Text style={styles.sidebarNewChatText}>Search</Text>
          </TouchableOpacity>

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
        {/* Dark/Light mode toggle and Bell Icon */}
        {(!chatStarted || newChatPending) && (
          <View style={styles.headerIconsRow}>
            {/* Bell Icon Button */}
            <TouchableOpacity
              style={styles.bellButton}
              onPress={() => setModalVisible(true)}
              activeOpacity={0.7}
            >
              <Ionicons name="notifications-outline" size={25} color={isWhite ? "#000" : "#fff"} />
              {unreadCount > 0 && (
                <Animated.View
                  style={[
                    styles.notifBadge,
                    {
                      transform: [
                        {
                          scale: badgeAnim.interpolate({
                            inputRange: [0, 1],
                            outputRange: [0.6, 1],
                          }),
                        },
                      ],
                    },
                  ]}
                >
                  <Text style={styles.notifBadgeText}>{unreadCount}</Text>
                </Animated.View>
              )}
            </TouchableOpacity>

            {/* Dark/Light Mode Toggle */}
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
          </View>
        )}

{(!chatStarted || newChatPending) ? (
  <View style={[styles.container, { backgroundColor: isWhite ? '#fff' : '#000', flex: 1 }]}>
    { !isWhite &&
      // Wrap everything in ImageBackground for dark mode only
      <ImageBackground
        source={STARBG_GIF}
        style={[styles.starBg, StyleSheet.absoluteFill]}
        imageStyle={{ opacity: STAR_GIF_OPACITY, tintColor: STAR_GIF_TINT }}
        resizeMode="cover"
      >
        {/* Optional: overlay for further dimming/transparency */}
        {STAR_GIF_OVERLAY &&
          <View style={{
            ...StyleSheet.absoluteFillObject,
            backgroundColor: STAR_GIF_OVERLAY,
          }} />
        }
      </ImageBackground>
    }

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
            {/* Language Picker */}
            {renderLanguagePicker()}
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
             {/* Chat background gif, only if dark */}
    { !isWhite &&
      <ImageBackground
        source={STARBG_GIF}
        style={[styles.starBg, StyleSheet.absoluteFill]}
        imageStyle={{ opacity: STAR_GIF_OPACITY, tintColor: STAR_GIF_TINT }}
        resizeMode="cover"
      >
        {STAR_GIF_OVERLAY &&
          <View style={{
            ...StyleSheet.absoluteFillObject,
            backgroundColor: STAR_GIF_OVERLAY,
          }} />
        }
      </ImageBackground>
    }
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

        {/* Modal for notifications */}
        <Modal
          animationType="fade"
          transparent={true}
          visible={modalVisible}
          onRequestClose={() => setModalVisible(false)}
        >
          <View style={styles.modalOverlay}>
            <View style={styles.modalView}>
              <View style={styles.modalHeader}>
                <Ionicons name="notifications-outline" size={22} color="#fff" style={{ marginRight: 8 }} />
                <Text style={styles.modalTitle}>Notifications</Text>
                <TouchableOpacity onPress={() => setModalVisible(false)} style={styles.modalCloseBtn}>
                  <Ionicons name="close" size={26} color="#fff" />
                </TouchableOpacity>
              </View>
              <View style={styles.modalDivider} />
              {notifRefreshing ? (
                <View style={{ alignItems: 'center', justifyContent: 'center', paddingVertical: 40 }}>
                  <LoaderGif />
                </View>
              ) : (
                renderNotifications()
              )}
            </View>
          </View>
        </Modal>
      </View>
    </View>
  );
};

// ---------- stylings -----------
const styles = StyleSheet.create({
  sidebar: {
    
      width: SCREEN_WIDTH > 850 ? 220 : 70,   // Desktop = full sidebar, Mobile = icon bar
    
    backgroundColor: '#000000',
    borderRightWidth: 1,
    borderColor: '#232323',
    justifyContent: 'space-between',
  },

  sidebarTop: {
    paddingHorizontal: scale(5),
    borderBottomWidth: 1,
    borderColor: '#232323',
  },
  sidebarNewChatBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: scale(4),
    borderRadius: scale(8),
    backgroundColor: '#000000',
    paddingHorizontal: scale(2),
    marginBottom: scale(6),
    
  },

  sidebarsearch:{
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: scale(4),
    borderRadius: scale(8),
    backgroundColor: '#000000',
    paddingHorizontal: scale(2),
    marginBottom: scale(4),

  },
  sidebarNewChatText: {
    color: '#fff',
    fontSize: moderateScale(12),
    marginLeft: scale(4),
    fontFamily: 'Geist',
  },
  sidebarChatList: {
    flex: 1,
    backgroundColor: '#000000',
    paddingVertical: scale(10),
  },
  sidebarChatItem: {
    paddingVertical: scale(2),
    paddingHorizontal: scale(4),
    borderRadius: scale(7),
    
   
    backgroundColor: 'transparent',
    marginBottom: scale(4),
  },
  sidebarChatItemSelected: {
    backgroundColor: '#232323',
  },
  sidebarChatTitle: {
    color: '#fff',
    fontSize: moderateScale(11),
    fontFamily: 'Geist',
  },
  sidebarChatLang: {
    color: '#bbb',
    fontSize: moderateScale(10),
    fontFamily: 'Geist',
    marginTop: 1,
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
    width: SCREEN_WIDTH > 700 ? "70%" : "90%",

    borderWidth: 1,
    marginTop: 10,
    marginBottom: 60,
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
    alignSelf: SCREEN_WIDTH < 500 ? "center" : "flex-end",

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
    width: SCREEN_WIDTH > 700 ? "70%" : "90%",

    borderWidth: 1,
    position: 'absolute',
    left: SCREEN_WIDTH > 600 ? 40 : 10,
    right: SCREEN_WIDTH > 600 ? 40 : 10,
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
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.2)',
    marginLeft: 8,
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
  logoImage: {
    width: 90,
    height:90,
    right:20
   
  },

  

  // Notification Modal Styles
  headerIconsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    position: "absolute",
    top: 20,
    right: 20,
    zIndex: 10,
  },
  bellButton: {
    backgroundColor: 'transparent',
    padding: 8,
    borderRadius: 18,
    marginRight: 6,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: 'rgba(200,200,200,0.16)',
  },
  notifBadge: {
    position: "absolute",
    top: 0,
    right: -2,
    minWidth: 22,
    height: 22,
    borderRadius: 13,
    backgroundColor: '#ff2d55',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#000',
    zIndex: 100,
  },
  notifBadgeText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 13,
    paddingHorizontal: 5,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.32)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalView: {
    modalView: {
      width: SCREEN_WIDTH > 900 ? 820 : SCREEN_WIDTH * 0.9,
      height: SCREEN_HEIGHT > 500 ? 350 : SCREEN_HEIGHT * 0.7,
    },
    
    backgroundColor: '#191818ff',
    borderRadius: 12,
    paddingVertical: 18,
    paddingHorizontal: 20,
    alignItems: 'center',
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.32,
    shadowRadius: 8,
    elevation: 8,
  },
  modalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    width: '100%',
    marginBottom: 8,
  },
  modalTitle: {
    fontSize: 19,
    fontWeight: 'bold',
    color: '#fff',
    flex: 1,
    fontFamily: 'Geist',
  },
  modalCloseBtn: {
    padding: 2,
    marginLeft: 8,
  },
  modalDivider: {
    height: 1,
    backgroundColor: '#eee',
    width: '105%',
    marginBottom: 15,
  },
  noNotificationsContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 35,
  },
  noNotificationsText: {
    color: '#fff',
    fontSize: 15,
    fontFamily: 'Geist',
  },
  // Notification Card styles (screenshot matching)
  notificationItemContainer: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    backgroundColor: '#232323',
    borderRadius: 18,
    marginBottom: 15,
    padding: 14,
    elevation: 3,
    shadowColor: '#000',
    shadowOpacity: 0.13,
    shadowRadius: 8,
    width: SCREEN_WIDTH > 800 ? 700 : "100%",
    alignSelf: "center",


    minHeight: 110,
    position: 'relative',
  },
  notificationImage: {
    width: 88,
    height: 88,
    borderRadius: 16,
    marginRight: 18,
    backgroundColor: '#444',
  },
  notificationTextSection: {
    flex: 1,
    justifyContent: 'center',
  },
  notificationCategory: {
    color: '#b3b3b3',
    fontSize: 14,
    marginBottom: 3,
    fontFamily: 'Geist',
    fontWeight: '600',
  },
  notificationTitle: {
    color: '#fff',
    fontSize: 18,
    fontFamily: 'Geist',
    marginBottom: 9,
    fontWeight: '500',
  },
  notificationRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 2,
  },
  notificationAvatar: {
    width: 28,
    height: 28,
    borderRadius: 14,
    marginRight: 7,
    backgroundColor: '#ddd',
  },
  notificationAuthor: {
    color: '#b3b3b3',
    fontSize: 15,
    fontFamily: 'Geist',
    fontWeight: '500',
    marginRight: 6,
  },
  notificationDot: {
    color: '#b3b3b3',
    fontSize: 17,
    marginRight: 6,
    marginLeft: 2,
  },
  notificationDate: {
    color: '#b3b3b3',
    fontSize: 15,
    fontFamily: 'Geist',
    fontWeight: '500',
  },
  notifCloseBtn: {
    position: "absolute",
    right: 10,
    top: 10,
    padding: 2,
    backgroundColor: 'transparent',
    borderRadius: 13,
    zIndex: 10,
  },
  // Language picker
  languagePickerCont: {
    flexDirection: 'column',
    alignItems: 'flex-start',
    marginBottom: 15,
    width: "auto",
  },
  languagePickerLabel: {
    fontSize: 16,
    color: '#777',
    fontWeight: '600',
    marginBottom: 4,
    fontFamily: 'Geist',
  },
  languageOption: {
    paddingHorizontal: 12,
    paddingVertical: 7,
    borderRadius: 15,
    borderWidth: 1,
    borderColor: '#444',
    backgroundColor: '#222',
    marginRight: 8,
    marginBottom: 2,
  },
  languageOptionSelected: {
    backgroundColor: '#2e72e6',
    borderColor: '#2e72e6',
  },
  languageOptionText: {
    color: '#fff',
    fontSize: 14,
    fontFamily: 'Geist',
  },
  languageOptionTextSelected: {
    color: '#fff',
    fontWeight: 'bold',
  },

  starBg: {
    position: 'absolute',
    top: 0, left: 0, right: 0, bottom: 0,
    width: '100%',
    height: '100%',
    zIndex: 0, // behind other items
  },
});

export default Index;