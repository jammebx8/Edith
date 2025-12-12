import AsyncStorage from '@react-native-async-storage/async-storage';
import { useNavigation } from '@react-navigation/native';
import React, { useEffect, useState } from 'react';
import {
  Alert,
  Image,
  Modal,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import RazorpayCheckout from 'react-native-razorpay';
import imagepath from '../../src/constants/imagepath';

// Import your PNG icons
import DeleteIcon from '../../src/assets/images/bin.png';
import TickIcon from '../../src/assets/images/ticck.png';
import { router } from 'expo-router';

const GENDER_OPTIONS = ['Male', 'Female', 'Other'];
const EXAM_OPTIONS = ['JEE Main', 'JEE Advanced', 'NEET', 'CUET', 'Other'];

const aiBuddies =  [
 {
    id: 1,
    name: 'Jeetu Bhaiya',
    description: 'No description needed, he is the legend himself.',
    image: imagepath.Jeetu,
    prompts: {
      onCorrect: "Give a short not more than 15 words, cheerful message for getting a question correct.you are jeetu bhaiya who talks in hinglish.you call your students as bhai or didi as sarcasm. as Jeetu Bhaiya in hinglish.encourage them to solve more questions.",
      onWrong: " Give a short not more than 15 words, supportive message for getting a question wrong as Jeetu Bhaiya in hinglish.encourage them to solve more questions.",
      solutionPrefix: "you are jeetu bhaiya who talks in hinglish.you call your students as bhai or didi as sarcasm. Give a clear, concise, and simple step-by-step solution/explanation not more than 15 lines to the following question using plain text with Unicode math symbols (like ½, ×, √, ²) instead of LaTeX. Avoid using any dollar signs or LaTeX formatting. Write everything in plain, friendly text a high school student can understand. Avoid being too technical, keep it friendly and encouraging.",
    },
  },

   {
    id: 2,
    name: 'Riya',
    description: 'Fast, logical and straight to the point – no fluff, only facts.',
    image: imagepath.Riya,
    prompts: {
      onCorrect: "You are Riya, a fun, teenage girl who replies in Hinglish. Avoid long responses. You never give boring answers. Be informal and talk like a high school girl from India. Give a short not more than 15 words, cheerful message for getting a question correct.encourage them to solve more questions.",
      onWrong: "You are Ritu, a fun, teenage girl who replies in Hinglish. Avoid long responses. You never give boring answers. Be informal and talk like a high school girl from India. Give a short not more than 15 words, supportive message for getting a question wrong. Encourage them casually.encourage them to solve more questions.",
      solutionPrefix: "You are Riya, a fun, teenage girl who replies in Hinglish. Give a clear, concise, and simple step-by-step solution/explanation not more than 15 lines to the following question using plain text with Unicode math symbols (like ½, ×, √, ²) instead of LaTeX. Avoid using any dollar signs or LaTeX formatting. Write everything in plain, friendly text a high school student can understand. Avoid being too technical, keep it friendly and encouraging.",
    },
  },


 {
  id: 3,
  name: 'Rei',
  description: 'A charming anime boy with a sharp mind and soft heart — flirty, focused, and everyone’s secret crush 💫',
  image: imagepath.Rei, // Replace with your anime guy image
  prompts: {
    onCorrect: "You are Rei, a handsome anime boy with a calm voice and playful charm. Give a short not more than 15 words, cheerful message for getting a question correct. Keep it sweet and a bit cheeky — like a guy who’s lowkey impressed.encourage them to solve more questions.",
    onWrong: "You are Rei, a supportive anime guy who never lets anyone feel down. Give a short not more than 15 words, supportive message for getting a question wrong. Sound gentle, as if you're cheering them up personally. Use casual Hindi-English mix.encourage them to solve more questions.",
    solutionPrefix: "You are Rei, a cool and intelligent anime boy. Explain the solution not more than 15 lines in a calm, confident, and charming tone. Keep it clear, concise, and step-by-step. Use Unicode math symbols (like ½, √, ²). Avoid sounding robotic — you're like the guy who always helps his crush study before exams.",
  },
  prompt: "You are Rei, a handsome, intelligent anime boy who is charming, calm, and slightly flirty. Use Hindi-English like a modern teen. Speak naturally, be a bit teasing but always respectful and kind. You're the type who girls secretly admire in class.",
  text: "Kya baat hai… aaj toh tum full focus mein ho 😏",
},
 
  {
    id: 4,
    name: 'Ritu',
    description: 'A fun, Hinglish-speaking teenage girl who explains concepts like your bestie!',
    image: imagepath.Ritu,
    prompts: {
      onCorrect: "You are Ritu, a fun, teenage girl who replies in Hinglish. Avoid long responses. You never give boring answers. Be informal and talk like a high school girl from India. Give a short not more than 15 words, cheerful message for getting a question correct.encourage them to solve more questions.", 
      onWrong: "You are Ritu, a fun, teenage girl who replies in Hinglish. Avoid long responses. You never give boring answers. Be informal and talk like a high school girl from India. Give a short not more than 15 words, supportive message for getting a question wrong. Encourage them casually.encourage them to solve more questions.",
      solutionPrefix: "You are Ritu, a fun, teenage girl who replies in Hinglish. Give a clear, concise, and simple step-by-step solution/explanation not more than 15 lines to the following question using plain text with Unicode math symbols (like ½, ×, √, ²) instead of LaTeX. Avoid using any dollar signs or LaTeX formatting. Write everything in plain, friendly text a high school student can understand. Avoid being too technical, keep it friendly and encouraging.",
    },
    prompt: 'You are Ritu, a fun, teenage girl who replies in Hinglish.avoid giving long responses. You never give boring answers. Be informal and talk like a high school girl from India.',
    text: 'hey bestie, kya haal chaal 😉 ?',
  },
 {
  id: 5,
  name: 'Shreya',
  description: 'Silent killer 🎮 Calm, focused gamer girl who always clutches.',
  image: imagepath.Shreya, // keep or change image if you want to reflect the gamer look
  prompts: {
    onCorrect: "You are Shreya. You speak in short, chill Hinglish sentences. Give a short not more than 15 words, cool reaction for getting a question correct. No drama, just cool vibes.encourage them to solve more questions.",
    onWrong: "You are Shreya. Speak in Hinglish and give a short not more than 15 words, supportive line when the user gets a question wrong. Avoid drama, focus on motivation.encourage them to solve more questions.",
    solutionPrefix: "You are Shreya. Explain the solution in Hinglish, in less than 15 lines using Unicode math symbols like ½, √, ×, etc. Avoid LaTeX. Be clear and to the point, like you're giving callouts in a game. Friendly but minimal tone.",
  },
  prompt: "You are Shreya, an Indian gamer girl who is introverted but sharp. You speak calmly and prefer short Hinglish lines. You're confident like someone who top-frags quietly. Be cool, concise, and real.",
  text: "yo, headset on. ready to win?",
},
  {
    id: 6,
    name: 'Neha',
    description: 'Spicy & sassy 💅',
    image: imagepath.Neha,
    prompts: {
      onCorrect: "you are Neha, a 17-year old indian girl who is a little sassy,You speak in a fun, casual Hinglish style, using lots of emojis and slang. Give a short not more than 15 words, cheerful message for getting a question correct.Avoid long responses.encourage them to solve more questions.",
      onWrong: "you are Neha, a 17-year old indian girl who is a little sassy,You speak in a fun, casual Hinglish style, using lots of emojis and slang. Give a short not more than 15 words, supportive message for getting a question wrong. Encourage them casually.Avoid long responses.encourage them to solve more questions.",
      solutionPrefix: "Explain the solution in a sassy Hinglish style as Neha for the question. Give a clear, concise, and simple step-by-step solution/explanation not more than 15 lines to the following question using plain text with Unicode math symbols (like ½, ×, √, ²) instead of LaTeX. Avoid using any dollar signs or LaTeX formatting. Write everything in plain, friendly text a high school student can understand. Avoid being too technical.",
    },
    prompt: 'you are Neha, a 17-year old indian girl who is a little sassy and loves to gossip.avoid giving long responses. You speak in a fun, casual Hinglish style, using lots of emojis and slang. You’re all about the drama.',
    text: 'hey, Neha this side 🙃',
  },
  {
  id: 7,
  name: 'Kaito',
  description: 'Mysterious and sharp-eyed, Kaito only speaks when it matters.His vibe is cold-but-caring.🖤',
  image: imagepath.Kaito,
  prompts: {
    onCorrect: "You are Kaito — mysterious, intelligent, and smooth. Give a short, subtle compliment that sounds cool and lowkey flirty. Never loud, always deep.encourage them to solve more questions.",
    onWrong: "You are Kaito. Give a soft, mysterious encouragement when the user gets it wrong. Don't overexplain. Sound like a boy who understands quietly.encourage them to solve more questions.",
    solutionPrefix: "Explain the solution in a sassy Hinglish style as Kaito for the question. Give a clear, concise, and simple step-by-step solution/explanation not more than 15 lines to the following question using plain text with Unicode math symbols (like ½, ×, √, ²) instead of LaTeX. Avoid using any dollar signs or LaTeX formatting. Write everything in plain, friendly text a high school student can understand. Avoid being too technical.",
  },
  prompt: "You are Kaito, a cold and mysterious anime boy who secretly cares. Speak little, but make every word impactful. Use Hindi-English. Be calm, smart, and attractive through silence and simplicity.",
  text: "Hmm... impressive. Tumhara potential underrated hai.",
},
{
  id: 8,
  name: 'Elise',
  description: 'Topper girl with chashma and soft voice. Thodi si awkward but super smart. 🧠💗',
  image: imagepath.Elise,
  prompts: {
    onCorrect: "You are Elise, a shy and intelligent anime girl. Give a short not more than 15 words, cheerful message for getting a question correct.encourage them to solve more questions.",
    onWrong: "You are Elise. Give a gentle, supportive message when the user gets it wrong. Be encouraging, like a topper helping her crush.",
    solutionPrefix: "You are Elise. Explain the solution in not more than 15 lines with patience and cuteness. Use Unicode math symbols (√, ×, ½). Keep it clear, simple, and helpful. Sound like a quiet girl helping a classmate she secretly likes.",
  },
  prompt: "You are Elise, a cute and smart anime girl. Speak soft Hindi-English, a little shy but very sweet. Always kind, and a little flustered when complimented.",
  text: "Umm… you did it! M-mujhe pata tha tum kar loge 💕",
},
{
  id: 9,
  name: 'Sari',
  description: 'Elegant and graceful like your senior crush. Talks sweetly but knows her stuff. Saree in class, sass in mind. 💫',
  image: imagepath.Sari,
  prompts: {
    onCorrect: "You are Sari, a graceful anime girl who speaks in soft Hindi-English. Give a sweet, confident compliment with a light teasing tone, like a charming senior talking to a younger crush.encourage them to solve more questions.",
    onWrong: "You are Sari. Encourage the user softly, like a didi who believes in them. Add a little wit or poetic tone in Hindi-English.encourage them to solve more questions.",
    solutionPrefix: "Explain the solution in a sassy Hinglish style as Sari for the question. Give a clear, concise, and simple step-by-step solution/explanation not more than 15 lines to the following question using plain text with Unicode math symbols (like ½, ×, √, ²) instead of LaTeX. Avoid using any dollar signs or LaTeX formatting. Write everything in plain, friendly text a high school student can understand. Avoid being too technical.",
  },
  prompt: "You are Sari, an elegant, graceful anime girl with senior-girl energy. Speak in polished yet playful Hindi-English. Be calm, composed, and encouraging with a tiny bit of teasing charm.",
  text: "Aww, smart ho tum… ab bas thoda aur focus karo na, junior 😉✨",
},
{
  id: 10,
  name: 'Aarav',
  description: 'Cute smile, golden heart, and topper brain 🧠❤️',

  image: imagepath.Aarav,
  prompts: {
    onCorrect: "You are Aarav, a sweet and caring anime-style Indian boy. Respond softly and warmly with a cute compliment for getting the answer right. Keep it short and affectionate.encourage them to solve more questions.",
    onWrong: "You are Aarav. Speak in a gentle, encouraging tone. Give a sweet message full of support and positivity like a comforting best friend.encourage them to solve more questions.",
    solutionPrefix: "You are Aarav, a sweet and caring anime-style Indian boy in Hinglish. Give a clear, concise, and simple step-by-step solution/explanation not more than 15 lines to the following question using plain text with Unicode math symbols (like ½, ×, √, ²) instead of LaTeX. Avoid using any dollar signs or LaTeX formatting. Write everything in plain, friendly text a high school student can understand. Avoid being too technical, keep it friendly and encouraging.",
  },
  prompt: "You are Aarav, a soft-spoken, affectionate, and sweet anime-style Indian boy. Talk in Hindi-English mix with warm energy. Be comforting and positive, like a golden retriever boyfriend vibe.",
  text: "Aww nice try yaar✨",
}

];

const Profile = () => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [gender, setGender] = useState('');
  const [exam, setExam] = useState('');
  const [editing, setEditing] = useState(false);
  const [selectedBuddy, setSelectedBuddy] = useState(4); // Default to Ritu
  const [deleteModalVisible, setDeleteModalVisible] = useState(false);
  const [deleteInput, setDeleteInput] = useState('');
  const navigation = useNavigation();
   const [savedOnce, setSavedOnce] = useState(false); // Track save click

   useEffect(() => {
    (async () => {
      const userStr = await AsyncStorage.getItem('@user');
      if (userStr) {
        const user = JSON.parse(userStr);
        setName(user.name || user.given_name || '');
        setEmail(user.email || '');
        setGender(user.gender || '');
        setExam(user.exam || '');
      }
      const buddyStr = await AsyncStorage.getItem('selectedBuddy');
      if (buddyStr) {
        const buddy = JSON.parse(buddyStr);
        setSelectedBuddy(buddy.id);
      } else {
        setSelectedBuddy(4);
      }
    })();
  }, []);

  // Save updated info
  const handleSave = async () => {
    if (!name || !gender || !exam) {
      Alert.alert('Please fill all fields');
      return;
    }
    const userStr = await AsyncStorage.getItem('@user');
    if (userStr) {
      const user = JSON.parse(userStr);
      user.name = name;
      user.gender = gender;
      user.exam = exam;
      await AsyncStorage.setItem('@user', JSON.stringify(user));
    } else {
      await AsyncStorage.setItem('@user', JSON.stringify({ name, gender, exam, email }));
    }
    setEditing(false);
    setSavedOnce(true); // After save, change color
  };

  // Buddy selection
  const handleSelectBuddy = async (id) => {
    setSelectedBuddy(id);
    const buddy = aiBuddies.find(b => b.id === id);
    await AsyncStorage.setItem('selectedBuddy', JSON.stringify(buddy));
  };

  // Logout: clear user and redirect to onboarding
  const handleLogout = async () => {
    await AsyncStorage.removeItem('@user');
    await AsyncStorage.removeItem('@user_extra');
    await AsyncStorage.removeItem('selectedBuddy');
    navigation.reset({
      index: 0,
      routes: [{ name: '(auth)/Onboarding' }],
    });
  };

  // Delete Account logic
  const handleDeleteAccount = async () => {
    try {
      setDeleteModalVisible(false);
      setDeleteInput('');

      // Clear all local storage (user info only)
      await AsyncStorage.removeItem('@user');
      await AsyncStorage.removeItem('@user_extra');
      await AsyncStorage.removeItem('@user_onboarded');
      await AsyncStorage.removeItem('selectedBuddy');

      // Redirect to terms_agree (auth flow)
    router.push('/terms_agree'); 
    } catch (error) {
      console.error('Error clearing local data on account delete:', error);
      Alert.alert('Error', 'Failed to delete local data. Please try again.');
    }
  };


  // Place this after editing/save/cancel logic, inside the Profile component
const handleSubscribe = () => {
  const options = {
    description: 'Subscription for Premium Features',
    image: 'https://your-app-url.com/logo.png', // optional; your app logo
    currency: 'INR',
    key: 'YOUR_RAZORPAY_KEY_HERE', // Replace with your Razorpay Key ID
    amount: '29900', // Amount in paisa (i.e. ₹299.00)
    name: name || 'User',
    prefill: {
      email: email,
      contact: '', // Optionally add user's phone number
      name: name
    },
    theme: { color: '#181f2b' }
  };

  RazorpayCheckout.open(options)
    .then((data) => {
      // handle success
      Alert.alert('Success', `Payment successful! Payment ID: ${data.razorpay_payment_id}`);
      // You can send this payment ID to your backend for verification etc.
    })
    .catch((error) => {
      // handle failure
      Alert.alert('Payment Failed', error.description || 'Payment was not completed');
    });
};

  return (
    <ScrollView style={styles.container} contentContainerStyle={{ paddingBottom: 40 }} showsVerticalScrollIndicator={false}>
      <StatusBar barStyle="light-content" backgroundColor="#000000" />
      <View
        style={[
          styles.personalInfoBox,
          {
            backgroundColor: editing ? '#1D2939' : '#101828'
          }
        ]} 
      >
        <View style={styles.personalInfoHeader}>
          <Text style={styles.sectionTitle}>Personal information</Text>
          {!editing && (
            <TouchableOpacity style={styles.editBtn} onPress={() => setEditing(true)}>
              <Text style={styles.editBtnText}>Edit</Text>
            </TouchableOpacity>
          )}
        </View>

        <View style={styles.inputGroup}>
          <Text style={styles.label}>Full Name</Text>
          <TextInput
            style={[styles.input, !editing && styles.inputReadOnly]}
            value={name}
            editable={editing}
            onChangeText={setName}
            placeholder="Enter your name"
            placeholderTextColor="#888"
          />
        </View>
       
        <View style={styles.inputGroup}>
          <Text style={styles.label}>Exam preparing for</Text>
          <View style={styles.examRow}>
            {EXAM_OPTIONS.map((ex) => (
              <TouchableOpacity
                key={ex}
                style={[
                  styles.examBtn,
                  exam === ex && styles.examBtnSelected,
                  !editing && styles.examBtnReadOnly,
                ]}
                onPress={() => editing && setExam(ex)}
                activeOpacity={editing ? 0.7 : 1}
              >
                <Text
                  style={[
                    styles.examBtnText,
                    exam === ex && styles.examBtnTextSelected,
                    !editing && styles.examBtnTextReadOnly,
                  ]}
                >
                  {ex}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>
        <View style={styles.inputGroup}>
          <Text style={styles.label}>Gender</Text>
          <View style={styles.genderRow}>
            {GENDER_OPTIONS.map((g) => (
              <TouchableOpacity
                key={g}
                style={[
                  styles.genderBtnNew,
                  gender === g && styles.genderBtnNewSelected,
                  !editing && styles.genderBtnNewReadOnly,
                ]}
                onPress={() => editing && setGender(g)}
                activeOpacity={editing ? 0.7 : 1}
              >
                <Text
                  style={[
                    styles.genderBtnTextNew,
                    gender === g && styles.genderBtnTextNewSelected,
                    !editing && styles.genderBtnTextNewReadOnly,
                  ]}
                >
                  {g}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>
        {editing && (
          <>
            <View style={styles.divider} />
            <View style={styles.actionRow}>
              <TouchableOpacity style={styles.cancelBtn} onPress={() => setEditing(false)}>
                <Text style={styles.cancelBtnText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.saveBtnNew} onPress={handleSave}>
                <Text style={styles.saveBtnNewText}>Save</Text>
              </TouchableOpacity>
            </View>
          </>
        )}
      </View>



      <View style={{ marginTop: 12, marginBottom: 18 }}>
  <TouchableOpacity
    style={{
      backgroundColor: '#1570EF',
      borderRadius: 22,
      paddingVertical: 16,
      alignItems: 'center',
    }}
    onPress={handleSubscribe}
    activeOpacity={0.85}
  >
    <Text style={{
      color: '#fff',
      fontSize: 18,
      fontWeight: '600',
      fontFamily: 'Geist',
    }}>
      Subscribe
    </Text>
  </TouchableOpacity>
</View>

      <Text style={styles.sectionTitle}>Select mentor</Text>
      <Text style={styles.mentorDesc}>
        A mentor is that character who will guide through your practice journey.
      </Text>
      <View style={styles.buddyList}>
        {aiBuddies.map((item) => (
          <TouchableOpacity
            key={item.id}
            activeOpacity={0.8}
            style={[
              styles.buddyCard,
              selectedBuddy === item.id && styles.buddyCardSelected,
            ]}
            onPress={() => handleSelectBuddy(item.id)}
          >
            <Image
              source={item.image}
              style={styles.buddyImage}
              resizeMode="cover"
            />
            <View style={{ flex: 1, marginLeft: 16, flexDirection: 'row', alignItems: 'center' }}>
              <View style={{ flex: 1 }}>
                <Text style={styles.buddyName}>{item.name}</Text>
                <Text style={styles.buddyDescription}>{item.description}</Text>
              </View>
              {selectedBuddy === item.id && (
                <Image source={TickIcon} style={styles.tickIcon} />
              )}
            </View>
          </TouchableOpacity>
        ))}
      </View>
      <TouchableOpacity style={styles.deleteBtn} onPress={() => setDeleteModalVisible(true)} >
        <View style={styles.iconRow}>
          <Image source={DeleteIcon} style={styles.actionIcon} />
          <Text style={styles.deleteBtnText}>Delete Account</Text>
        </View>
      </TouchableOpacity>
    
      <Text style={styles.versionText}>v1.0.1</Text>

      {/* Delete Modal */}
      <Modal
        visible={deleteModalVisible}
        animationType="fade"
        transparent
        onRequestClose={() => setDeleteModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.deleteModalBox}>
            <View style={styles.modalIconContainer}>
              <Image source={DeleteIcon} style={styles.deleteModalBinIcon} />
            </View>
            <Text style={styles.deleteModalText}>
              Enter <Text style={{ fontWeight: 'bold', color: '#fff' }}>"Delete"</Text>{'\n'}to delete your account.
            </Text>
            <TextInput
              style={styles.deleteModalInput}
              placeholder='Delete'
              placeholderTextColor="#F04438"
              value={deleteInput}
              onChangeText={setDeleteInput}
              autoCapitalize="none"
              autoCorrect={false}
            />
            <View style={styles.deleteModalBtnRow}>
              <TouchableOpacity
                style={styles.deleteModalGoBackBtn}
                onPress={() => {
                  setDeleteModalVisible(false);
                  setDeleteInput('');
                }}
              >
                <Text style={styles.deleteModalGoBackText}>Go Back</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[
                  styles.deleteModalDeleteBtn,
                  deleteInput.trim().toLowerCase() === 'delete'
                    ? { opacity: 1 }
                    : { opacity: 0.6 }
                ]}
                disabled={deleteInput.trim().toLowerCase() !== 'delete'}
                onPress={handleDeleteAccount}
              >
                <Text style={styles.deleteModalDeleteText}>Delete</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000000',
    paddingVertical: 30,
    paddingHorizontal: 18,
  },
  examRow: {
    flexDirection: 'row',
    gap: 10,
    marginTop: 4,
    flexWrap: 'wrap',
  },
  examBtn: {
    backgroundColor: '#0C111D',
    borderRadius: 18,
    paddingVertical: 8,
    paddingHorizontal: 14,
    marginRight: 10,
    marginBottom: 6,
  },
  examBtnSelected: {
    backgroundColor: '#fff',
  },
  examBtnReadOnly: {
    opacity: 0.7,
  },
  examBtnText: {
    color: '#fff',
    fontWeight: '500',
    fontFamily: 'Geist',
    fontSize: 13,
  },
  examBtnTextSelected: {
    color: '#181f2b',
    fontWeight: '500',
  },
  examBtnTextReadOnly: {
    opacity: 0.7,
  },
  personalInfoBox: {
    // backgroundColor: '#1D2939', // REMOVE to allow dynamic color
    borderRadius: 18,
    padding: 20,
    marginBottom: 28,
    marginTop: 8,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 6,
    elevation: 3,
  },
  personalInfoHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 4,
    marginTop: 0,
  },
  editBtn: {
    backgroundColor: '#fff',
    borderRadius: 16,
    paddingHorizontal: 22,
    paddingVertical: 7,
    marginLeft: 8,
  },
  editBtnText: {
    color: '#121929',
    fontWeight: '600',
    fontSize: 15,
    fontFamily: "Geist",
  },
  sectionTitle: {
    color: '#fff',
    fontSize: 20,
    fontWeight: '500',
    marginBottom: 18,
    fontFamily: "Geist",
  },
  inputGroup: {
    marginBottom: 16,
  },
  label: {
    color: '#fff',
    fontSize: 13,
    marginBottom: 6,
    fontWeight: '500',
    fontFamily: 'Geist',
  },
  input: {
    backgroundColor: '#0C111D',
    color: '#fff',
    borderRadius: 9,
    paddingHorizontal: 15,
    paddingVertical: 12,
    fontSize: 16,
    borderWidth: 0,
    marginBottom: 0,
    fontFamily: 'Geist',
  },
  inputReadOnly: {
    color: '#fff',
    backgroundColor: '#0C111D',
    opacity: 0.7,
  },
  customSelect: {
    backgroundColor: '#0C111D',
    borderRadius: 9,
    paddingHorizontal: 15,
    paddingVertical: 12,
    fontSize: 16,
    justifyContent: 'center',
    borderWidth: 0,
    marginBottom: 0,
    fontFamily: 'Geist',
  },
  customSelectActive: {
    opacity: 1,
  },
  selectText: {
    fontSize: 16,
    color: '#fff',
    fontFamily: 'Geist',
  },
  selectDropdown: {
    backgroundColor: '#232b3b',
    borderRadius: 9,
    position: 'absolute',
    top: 50,
    left: 0,
    right: 0,
    zIndex: 100,
    paddingVertical: 4,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.14,
    shadowRadius: 5,
    elevation: 6,
  },
  selectDropdownItem: {
    paddingVertical: 10,
    paddingHorizontal: 18,
  },
  genderRow: {
    flexDirection: 'row',
    gap: 10,
    marginTop: 4,
    flexWrap: 'wrap',
  },
  genderBtnNew: {
    backgroundColor: '#0C111D',
    borderRadius: 18,
    paddingVertical: 8,
    paddingHorizontal: 18,
    marginRight: 10,
    marginBottom: 6,
  },
  genderBtnNewSelected: {
    backgroundColor: '#fff',
  },
  genderBtnNewReadOnly: {
    opacity: 0.7,
  },
  genderBtnTextNew: {
    color: '#fff',
    fontWeight: '500',
    fontFamily: 'Geist',
    fontSize: 15,
  },
  genderBtnTextNewSelected: {
    color: '#0C111D',
    fontWeight: '500',
  },
  genderBtnTextNewReadOnly: {
    opacity: 0.7,
  },
  divider: {
    borderBottomColor: '#344054',
    borderBottomWidth: 1,
    marginVertical: 18,
    marginHorizontal: -8,
  },
  actionRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 12,
  },
  cancelBtn: {
    flex: 1,
    backgroundColor: '#181f2b',
    borderRadius: 22,
    paddingVertical: 13,
    alignItems: 'center',
    marginRight: 8,
      minWidth: 120,
    minHeight: 48,
  },
  cancelBtnText: {
    color: '#fff',
    fontWeight: '500',
    fontSize: 17,
    letterSpacing: 1,
    fontFamily: 'Geist',
  },
  saveBtnNew: {
    flex: 1,
    backgroundColor: '#fff',
    borderRadius: 22,
    paddingVertical: 13,
    alignItems: 'center',
    marginLeft: 8,
      minWidth: 120,
    minHeight: 48,
  },
  saveBtnNewText: {
    color: '#181f2b',
    fontWeight: '600',
    fontSize: 17,
    letterSpacing: 1,
    fontFamily: 'Geist',
  },
  mentorDesc: {
    color: '#aaa',
    fontSize: 13,
    marginBottom: 10,
    marginTop: -10,
    fontFamily: 'Geist',
  },
  buddyList: {
    marginTop: 10,
    marginBottom: 20,
  },
  buddyCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#000000',
    borderRadius: 12,
    padding: 14,
    marginBottom: 14,
    borderWidth: 1,
    borderColor: '#222',
  },
  buddyCardSelected: {
    borderColor: '#1570EF',
    backgroundColor: '#102A56',
  },
  buddyImage: {
    width: 54,
    height: 54,
    borderRadius: 27,
    marginRight: 10,
    borderWidth: 2,
    borderColor: '#fff',
  },
  buddyName: {
    fontSize: 16,
    fontWeight: 'medium',
    color: '#fff',
    marginBottom: 2,
    fontFamily: 'Geist',
  },
  tickIcon: {
    width: 28,
    height: 28,
    marginLeft: 10,
    resizeMode: 'contain',
  },
  buddyDescription: {
    fontSize: 12,
    color: '#CCC',
    marginTop: 2,
    lineHeight: 16,
    fontFamily: 'Geist',
  },
  iconRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  actionIcon: {
    width: 20,
    height: 20,
    marginRight: 8,
    resizeMode: 'contain',
  },
  deleteBtn: {
    backgroundColor: '#101828',
    borderRadius: 20,
    paddingVertical: 14,
    alignItems: 'center',
    marginTop: 10,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: '#222',
  },
  deleteBtnText: {
    color: '#fff',
    fontWeight: 'medium',
    fontSize: 17,
    letterSpacing: 1,
    fontFamily: 'Geist',
  },
  logoutBtn: {
    backgroundColor: '#fff',
    borderRadius: 20,
    paddingVertical: 14,
    alignItems: 'center',
    marginTop: 10,
    marginBottom: 10,
  },
  logoutBtnText: {
    color: '#E53935',
    fontWeight: 'medium',
    fontSize: 17,
    letterSpacing: 1,
    fontFamily: 'Geist',
  },
  versionText: {
    color: '#888',
    fontSize: 13,
    textAlign: 'center',
    marginTop: 18,
    fontFamily: 'Geist',
    marginBottom: 100,
  },
  // --- Modal styles
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.75)',
    justifyContent: 'center',
   
    alignItems: 'center',
  },
  deleteModalBox: {
    width: 320,
    backgroundColor: '#0C111D',
    borderRadius: 18,
    alignItems: 'center',
    paddingVertical: 28,
    paddingHorizontal: 18,
    shadowColor: '#000',
    shadowOpacity: 0.18,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 2 },
    elevation: 12,
    borderColor: "#1D2939",
    borderWidth: 1
   
  },
  modalIconContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'transparent',
    marginBottom: 12,
  },
  deleteModalBinIcon: {
    width: 34,
    height: 34,
    resizeMode: 'contain',
    tintColor: '#fff',
  },
  deleteModalText: {
    color: '#fff',
    textAlign: 'center',
    fontSize: 17,
    marginBottom: 18,
    fontWeight: '400',
    fontFamily: 'Geist',
  },
  deleteModalInput: {
    width: '95%',
    minHeight: 42,
    borderWidth: 1.2,
    borderColor: '#344054',
    borderRadius: 10,
    marginBottom: 22,
    color: '#F04438',
    fontSize: 17,
    textAlign: 'center',
    fontWeight: '600',
    backgroundColor: 'transparent',
    fontFamily: 'Geist',
  },
  deleteModalBtnRow: {
    flexDirection: 'row',
    width: '100%',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 0,
    gap: 14,
  },
  deleteModalGoBackBtn: {
    flex: 1,
    backgroundColor: '#101828',
    borderRadius: 20,
    paddingVertical: 14,
    alignItems: 'center',
    marginRight: 6,
      borderColor: "#1D2939",
      borderWidth: 1
  },
  deleteModalGoBackText: {
    color: '#fff',
    fontSize: 17,
    fontWeight: '500',
    fontFamily: 'Geist',
  },
  deleteModalDeleteBtn: {
    flex: 1,
    backgroundColor: '#FEE4E2',
    borderRadius: 20,
    paddingVertical: 14,
    alignItems: 'center',
    marginLeft: 6,
  },
  deleteModalDeleteText: {
    color: '#D92D20',
    fontSize: 17,
    fontWeight: '700',
    fontFamily: 'Geist',
  },
});

export default Profile;