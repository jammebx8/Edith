import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, FlatList, Image, ScrollView, StatusBar } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import imagepath from '../../src/constants/imagepath'; // adjust your import path accordingly
import { scale, verticalScale } from 'react-native-size-matters';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';

const aiBuddies = [
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
  const [selectedBuddy, setSelectedBuddy] = useState(null);
  const STORAGE_KEY = 'selectedBuddy';
  const router = useRouter();

  const handleSelect = async (id) => {
    const buddy = aiBuddies.find(b => b.id === id);
    setSelectedBuddy(id);
    try {
      await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(buddy));
    } catch (error) {
      console.log('Error saving selected buddy:', error);
    }
  };

  useEffect(() => {
    const loadSelectedBuddy = async () => {
      try {
        const savedBuddy = await AsyncStorage.getItem(STORAGE_KEY);
        if (savedBuddy) {
          const parsedBuddy = JSON.parse(savedBuddy);
          setSelectedBuddy(parsedBuddy.id);
        } else {
          setSelectedBuddy(4); // default to Ritu
        }
      } catch (error) {
        console.log('Error loading selected buddy:', error);
      }
    };
    loadSelectedBuddy();
  }, []);

  return (
    <ScrollView style={styles.container} contentContainerStyle={{ paddingBottom: 40 }}>
      <StatusBar barStyle="light-content" backgroundColor="#0a0517" />
      <Text style={styles.title}>Choose Your AI Study Buddy</Text>
      <FlatList
        data={aiBuddies}
        keyExtractor={(item) => item.id.toString()}
        horizontal={true}
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={{ paddingHorizontal: 10 }}
        renderItem={({ item }) => (
          <LinearGradient
            colors={['#ff00cc', '#333399']}
            start={{ x: 1, y: 0 }}
            end={{ x: 1, y: 0.8 }}
            style={[
              styles.gradientWrapper,
              {
                borderRadius: 10,
                marginHorizontal: 8,
                width: scale(150),
                height: verticalScale(270),
              },
            ]}
          >
            <TouchableOpacity
              activeOpacity={1}
              style={[
                styles.buddyCard,
                {
                  backgroundColor: selectedBuddy === item.id ? 'transparent' : '#1A1A40',
                  borderRadius: 10,
                  borderWidth: selectedBuddy === item.id ? 3 : 0,
                  borderColor: '#fff',
                  padding: 10,
                },
              ]}
              onPress={() => handleSelect(item.id)}
            >
              {item.image && (
                <Image source={item.image} style={styles.buddyImage} resizeMode="cover" />
              )}
              <Text style={styles.buddyName}>{item.name}</Text>
              <Text style={styles.buddyDescription}>{item.description}</Text>
            </TouchableOpacity>
          </LinearGradient>
        )}
      />
      <View style={styles.selectionBox}>
        <Text style={styles.selectionText}>
          Selected Buddy:{' '}
          <Text style={{ fontWeight: 'bold', color: '#fff' }}>
            {selectedBuddy ? aiBuddies.find(b => b.id === selectedBuddy)?.name : 'None'}
          </Text>
        </Text>
      </View>

      {/* Donation Section */}
      <View style={styles.donateContainer}>
        <Text style={styles.donateTitle}>Support Our Mission ❤️</Text>
        <Text style={styles.donateText}>
          If you like the app, scan this UPI QR to donate. Every ₹ helps us build more free tools for students!
        </Text>
        <Image
          source={require('../../src/assets/images/WhatsApp Image 2025-06-02 at 20.25.34_b1298f9d.jpg')}
          style={styles.qrImage}
          resizeMode="contain"
        />
        <Text style={styles.upiIdText}>UPI ID: <Text style={{ fontWeight: 'bold' }}>dhruvpathak2006@okaxis</Text></Text>
      </View>

      {/* Subscription Section */}
      <View style={styles.subscriptionContainer}>
        <Text style={styles.subscriptionTitle}>Want Unlimited Access?</Text>
        <Text style={styles.subscriptionText}>
          Get all premium features and unlimited questions for just ₹199/month!
        </Text>
        <TouchableOpacity
          style={styles.subscriptionButton}
          onPress={() => router.push('/payment')}
        >
          <Text style={styles.subscriptionButtonText}>Subscribe Now</Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0B0B28',
    paddingVertical: 20,
  },
  title: {
    fontSize: 22,
    color: 'white',
    marginBottom: 20,
    fontWeight: 'bold',
    textAlign: 'center',
  },
  buddyCard: {
    backgroundColor: '#1A1A40',
    paddingVertical: 20,
    paddingHorizontal: 15,
    borderRadius: 20,
    alignItems: 'center',
    width: scale(150),
    height: verticalScale(270),
    marginRight: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 6,
  },
  buddyImage: {
    width: 120,
    height: 120,
    borderRadius: 60,
    marginBottom: 15,
    borderWidth: 3,
    borderColor: '#FFD700',
  },
  buddyName: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#FFD700',
    marginBottom: 6,
    textAlign: 'center',
  },
  buddyDescription: {
    fontSize: 14,
    color: '#CCC',
    textAlign: 'center',
    lineHeight: 18,
  },
  selectionBox: {
    marginTop: 30,
    padding: 15,
    borderRadius: 12,
    backgroundColor: '#1A1A40',
    alignItems: 'center',
  },
  selectionText: {
    fontSize: 16,
    color: '#fff',
  },
  gradientWrapper: {},
  donateContainer: {
    marginTop: 40,
    marginHorizontal: 20,
    padding: 15,
    backgroundColor: '#1A1A40',
    borderRadius: 12,
    alignItems: 'center',
  },
  donateTitle: {
    color: '#ff00cc',
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  donateText: {
    color: '#ddd',
    fontSize: 14,
    textAlign: 'center',
    marginBottom: 20,
  },
  qrImage: {
    width: 200,
    height: 200,
    marginBottom: 15,
  },
  upiIdText: {
    color: '#fff',
    fontSize: 16,
    marginBottom: 30,
  },
  // Subscription styles
  subscriptionContainer: {
    marginTop: 10,
    marginHorizontal: 20,
    padding: 18,
    backgroundColor: '#181830',
    borderRadius: 12,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#00FFAA',
    marginBottom: 40,
  },
  subscriptionTitle: {
    color: '#00FFAA',
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  subscriptionText: {
    color: '#fff',
    fontSize: 14,
    textAlign: 'center',
    marginBottom: 16,
  },
  subscriptionButton: {
    backgroundColor: '#00FFAA',
    paddingVertical: 12,
    paddingHorizontal: 32,
    borderRadius: 8,
  },
  subscriptionButtonText: {
    color: '#0B0B28',
    fontWeight: 'bold',
    fontSize: 16,
  },
});

export default Profile;



