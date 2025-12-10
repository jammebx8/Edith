import React, { useState, useEffect, useRef } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ScrollView, Animated, ImageBackground, Dimensions ,StatusBar } from 'react-native';
import { Ionicons, Feather } from '@expo/vector-icons';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { questionsData } from '../app/questions';
import axios from 'axios';
import { Image } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { ActivityIndicator } from 'react-native';
import imagepath from '../src/constants/imagepath';
import { moderateScale, scale } from 'react-native-size-matters';
import { LinearGradient } from 'expo-linear-gradient';
import { Modal } from 'react-native';
 



 <StatusBar barStyle="light-content" backgroundColor="#0a0517" />
const windowWidth = Dimensions.get('window').width;
const botGradient = ['#47006A', '#0031D0'];
const GROQ_API_KEY = 'REMOVED';
const WEAK_CONCEPTS_KEY = 'userWeakConcepts';

const getSubjectImage = (subjectName) => {
  if (subjectName === 'Physics') return imagepath.Physics;
  if (subjectName === 'Chemistry') return imagepath.Chemistry;
  if (subjectName === 'Maths') return imagepath.Maths;
  if (subjectName === 'Biology') return imagepath.Biology;
  return imagepath.Maths;
};

// Store a weak concept in async storage
const storeWeakConcept = async ({ concept, question }) => {
  try {
    const prev = await AsyncStorage.getItem(WEAK_CONCEPTS_KEY);
    let arr = [];
    if (prev) arr = JSON.parse(prev);
    arr.push({
      concept,
      question,
      date: new Date().toISOString(),
    });
    await AsyncStorage.setItem(WEAK_CONCEPTS_KEY, JSON.stringify(arr));
  } catch (err) {
    // Optionally handle error
  }
};

const QuestionViewer = () => {
  const { chapterTitle, subjectName = "Physics" } = useLocalSearchParams();
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [rookieCoins, setRookieCoins] = useState(0);
  const [showBackModal, setShowBackModal] = useState(false);
  const [questions, setQuestions] = useState([]);
  const [shownIndices, setShownIndices] = useState(new Set());
  const [currentIndex, setCurrentIndex] = useState(0);
  const [selectedOption, setSelectedOption] = useState(null);
  const [isCorrect, setIsCorrect] = useState(null);
  const [motivation, setMotivation] = useState('');
  const [timer, setTimer] = useState(0);
  const intervalRef = useRef(null);
  const [solution, setSolution] = useState('');
  const [buddy, setBuddy] = useState(null);
  const spinnerColorAnim = useRef(new Animated.Value(0)).current;
  const progressAnim = useState(new Animated.Value(0))[0];

  // For follow-up AI
  const [aiFollowup, setAIFollowup] = useState<string | null>(null);
  const [aiFollowupLoading, setAIFollowupLoading] = useState(false);

  // Dig Deeper Adaptive Concept Diagnostic
  const [isDigging, setIsDigging] = useState(false);
  const [conceptMCQ, setConceptMCQ] = useState<any>(null); // { concept, mcq, explanation, level }
  const [conceptHistory, setConceptHistory] = useState<any[]>([]);
  const [conceptLoading, setConceptLoading] = useState(false);
  const [conceptFeedback, setConceptFeedback] = useState('');
  const [conceptDone, setConceptDone] = useState(false);

  useEffect(() => {
    const chapterQuestions = questionsData[chapterTitle] || [];
    const sortedQuestions = chapterQuestions.slice().sort((a, b) => a.year - b.year);
    setQuestions(sortedQuestions);
    setShownIndices(new Set([0]));
    setCurrentIndex(0);
    Animated.timing(progressAnim, { toValue: 1, duration: 0, useNativeDriver: false }).start();
  }, [chapterTitle]);

  useEffect(() => {
    const loadRookieCoins = async () => {
      try {
        const savedCoins = await AsyncStorage.getItem('rookieCoins');
        setRookieCoins(savedCoins ? parseInt(savedCoins, 10) : 0);
      } catch (error) {
        console.error('Failed to load Rookie Coins:', error);
      }
    };
    loadRookieCoins();
  }, []);

  useEffect(() => {
    const saveRookieCoins = async () => {
      try {
        await AsyncStorage.setItem('rookieCoins', rookieCoins.toString());
      } catch (error) {
        console.error('Failed to save Rookie Coins:', error);
      }
    };
    saveRookieCoins();
  }, [rookieCoins]);

  useEffect(() => {
    AsyncStorage.setItem('rookieCoins', rookieCoins.toString());
  }, [rookieCoins]);

  const rcRewards = { easy: 10, medium: 20, hard: 30 };

  useEffect(() => {
    let animation;
    if (loading) {
      animation = Animated.loop(
        Animated.timing(spinnerColorAnim, {
          toValue: 1,
          duration: 1200,
          useNativeDriver: false,
        })
      );
      spinnerColorAnim.setValue(0);
      animation.start();
    } else {
      spinnerColorAnim.stopAnimation();
      spinnerColorAnim.setValue(0);
    }
    return () => animation && animation.stop();
  }, [loading]);

  useEffect(() => {
    const loadBuddy = async () => {
      try {
        const savedBuddy = await AsyncStorage.getItem('selectedBuddy');
        if (savedBuddy) {
          setBuddy(JSON.parse(savedBuddy));
        } else {
          const defaultBuddy = {
            id: 4,
            name: 'Ritu',
            description: 'A fun, Hinglish-speaking teenage girl who explains concepts like your bestie!',
            image: imagepath.Ritu,
            prompts: {
              onCorrect: "You are Ritu, a fun, teenage girl who replies in Hinglish. Avoid long responses. You never give boring answers. Be informal and talk like a high school girl from India. Give a short not more than 15 words, cheerful message for getting a question correct.encourage them to solve more questions.",
              onWrong: "You are Ritu, a fun, teenage girl who replies in Hinglish. Avoid long responses. You never give boring answers. Be informal and talk like a high school girl from India. Give a short not more than 15 words, supportive message for getting a question wrong. Encourage them casually.encourage them to solve more questions.",
              solutionPrefix: "You are Ritu, a fun, teenage girl who replies in Hinglish. Give a clear, concise, and simple step-by-step solution/explanation not more than 15 lines to the following question using plain text with Unicode math symbols (like ½, ×, √, ²) instead of LaTeX. Avoid using any dollar signs or LaTeX formatting. Write everything in plain, friendly text a high school student can understand. Avoid being too technical, keep it friendly and encouraging.",
            },
          };
          setBuddy(defaultBuddy);
          await AsyncStorage.setItem('selectedBuddy', JSON.stringify(defaultBuddy));
        }
      } catch (error) {
        console.error('Error loading buddy:', error);
      }
    };
    loadBuddy();
  }, []);

  useEffect(() => {
    setTimer(0);
    if (intervalRef.current) clearInterval(intervalRef.current);
    intervalRef.current = setInterval(() => {
      setTimer((prev) => prev + 1);
    }, 1000);
    return () => clearInterval(intervalRef.current);
  }, [currentIndex]);

  useEffect(() => {
    if (questions.length > 0) {
      const progress = shownIndices.size / questions.length;
      Animated.timing(progressAnim, {
        toValue: progress,
        duration: 300,
        useNativeDriver: false,
      }).start();
    }
  }, [shownIndices.size, questions.length]);

  const handleOptionPress = (option) => {
    setSelectedOption(option);
    setIsCorrect(null);
    setMotivation('');
  };

  const difficultyOrder = ['easy', 'medium', 'hard'];

  const getNextIndex = (wasCorrect) => {
    const currentQuestion = questions[currentIndex];
    const currentDifficulty = currentQuestion.difficulty;

    const filtered = questions
      .map((q, i) => ({ ...q, index: i }))
      .filter(q => !shownIndices.has(q.index));
    if (filtered.length === 0) return null;

    const next = filtered.reduce((best, q) => {
      const currentIndex = difficultyOrder.indexOf(currentDifficulty);
      const nextIndex = difficultyOrder.indexOf(q.difficulty);

      const isValid = wasCorrect
        ? nextIndex > currentIndex
        : nextIndex <= currentIndex;

      const isCloser = isValid && (!best || nextIndex < difficultyOrder.indexOf(best.difficulty));
      return isCloser ? q : best;
    }, null);

    return next?.index ?? filtered[0].index;
  };

  const handleNextAdaptive = async () => {
    setIsDigging(false);
    setConceptMCQ(null);
    setConceptHistory([]);
    setConceptFeedback('');
    setConceptDone(false);

    const nextIndex = getNextIndex(isCorrect);
    if (nextIndex != null) {
      setCurrentIndex(nextIndex);
      setShownIndices(new Set([...shownIndices, nextIndex]));
      setSelectedOption(null);
      setIsCorrect(null);
      setMotivation('');
      setSolution('');
      setAIFollowup(null);
    }
  };

  const handlePrev = () => {
    const allShown = Array.from(shownIndices);
    const currentPos = allShown.indexOf(currentIndex);
    const prevIndex = allShown[currentPos - 1];
    if (prevIndex !== undefined) {
      setCurrentIndex(prevIndex);
      setSelectedOption(null);
      setIsCorrect(null);
      setMotivation('');
      setSolution('');
      setAIFollowup(null);
    }
  };

  const handleCheckAnswer = async () => {
    if (selectedOption) {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
      setLoading(true);

      const correct = selectedOption === currentQuestion.correctAnswer;
      setIsCorrect(correct);

      if (correct) {
        const reward = rcRewards[currentQuestion.difficulty] || 0;
        setRookieCoins((prev) => prev + reward);
      }

      const msg = await getMotivation(correct);
      setMotivation(` ${msg.trim()}`);

      const sol = await getSolution(currentQuestion);
      setSolution(sol.trim());

      setLoading(false);
    }
  };

  const getMotivation = async (isCorrect) => {
    if (!buddy || !buddy.prompts) return '';
    try {
      const userProfile = await AsyncStorage.getItem('userData');
      const user = userProfile ? JSON.parse(userProfile) : {};
      const userContext = user?.name
        ? `You are talking to a ${user.age}-year-old ${user.gender} student named ${user.name}. `
        : '';
      const message = isCorrect
        ? `${userContext}${buddy.prompts.onCorrect}`
        : `${userContext}${buddy.prompts.onWrong}`;

      const res = await axios.post(
        'https://api.groq.com/openai/v1/chat/completions',
        {
          model: 'llama-3.3-70b-versatile',
          messages: [{ role: 'user', content: message }],
          temperature: 0.7,
          max_tokens: 50,
        },
        {
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${GROQ_API_KEY}`,
          },
        }
      );
      return res.data.choices?.[0]?.message?.content || '';
    } catch (error) {
      console.error('Motivation fetch failed:', error);
      return '';
    }
  };

  // AI followup handler
  const getSolution = async (questionObj, followupType?: 'dig' | '5yr') => {
    if (!buddy || !buddy.prompts) return '';
    try {
      const userProfile = await AsyncStorage.getItem('userData');
      const user = userProfile ? JSON.parse(userProfile) : {};
      const userContext = user?.name
        ? `You are talking to a ${user.age}-year-old ${user.gender} student named ${user.name}. `
        : '';

      const optionsList = questionObj.options
        .map((opt, idx) => `${String.fromCharCode(65 + idx)}. ${opt}`)
        .join('\n');
      let message = `${userContext}${buddy.prompts.solutionPrefix}
Question: "${questionObj.question}"
Options:
${optionsList}
Correct Answer: ${questionObj.correctAnswer}
Please provide a detailed solution to the question above in not more than 15 lines`;

      if (followupType === 'dig') {
        message +=
          '\nNow, dig deeper and provide more advanced insights, connections, or extra detailed solution.';
      }
      if (followupType === '5yr') {
        message +=
          '\nNow, explain the same solution as if you were talking to a 5-year-old child, using super simple language and analogies.';
      }

      const res = await axios.post(
        'https://api.groq.com/openai/v1/chat/completions',
        {
          model: 'llama-3.3-70b-versatile',
          messages: [{ role: 'user', content: message }],
          temperature: 0.7,
          max_tokens: 400,
        },
        {
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${GROQ_API_KEY}`,
          },
        }
      );
      return res.data.choices?.[0]?.message?.content || '';
    } catch (error) {
      console.error('Solution fetch failed:', error);
      return '';
    }
  };

  const handleAIFollowup = async (type: 'dig' | '5yr') => {
    setAIFollowupLoading(true);
    const result = await getSolution(questions[currentIndex], type);
    setAIFollowup(result.trim());
    setAIFollowupLoading(false);
  };

  // --------- DIG DEEPER: Concept-based Adaptive Diagnostic MCQ FLOW ---------
  const getConceptDiagnosticPrompt = (questionObj, history, lastConcept, lastLevel, lastWasCorrect, lastExplanation) => {
    if (history.length === 0) {
      return `
You are an expert teacher. Analyze the following question and its options to detect all the main concepts and sub-concepts required to solve it.
Then, pick the most important concept first, and generate a simple, fundamental MCQ (with 4 options and the correct answer) to test the user's root clarity. Make it focused on first principles. Output should be:
Concept: <concept>
Level: 1
Question: <mcq question>
A. <option1>
B. <option2>
C. <option3>
D. <option4>
Answer: <A/B/C/D>
No explanations yet. Only output as instructed.

Here is the question:
"${questionObj.question}"
Options:
${questionObj.options.map((opt, idx) => String.fromCharCode(65 + idx) + ". " + opt).join('\n')}
`;
    }
    if (lastWasCorrect) {
      return `
The user answered correctly to a fundamental MCQ on concept "${lastConcept}" (level ${lastLevel}).
Ask another MCQ on this concept, making it a bit more advanced or covering another important angle, but still focused on first principles. If the user has answered enough on this concept (3+ correct), pick the next most important concept from the original question and start at level 1 for that concept.
Output should be:
Concept: <concept>
Level: <level>
Question: <mcq question>
A. <option1>
B. <option2>
C. <option3>
D. <option4>
Answer: <A/B/C/D>
No explanations yet. Only output as instructed.

Original question:
"${questionObj.question}"
`;
    }
    return `
The user answered incorrectly to an MCQ about "${lastConcept}" (level ${lastLevel}).
First, give a 2 sentence explanation for the correct answer.
Then, break down "${lastConcept}" into a simpler or more fundamental sub-concept and generate a very basic MCQ (with 4 options and the correct answer) about this sub-concept to check user's root clarity.
Output should be:
Explanation: <your explanation>
Concept: <sub-concept>
Level: <level>
Question: <mcq question>
A. <option1>
B. <option2>
C. <option3>
D. <option4>
Answer: <A/B/C/D>

Only output as instructed.
Previous question: "${history[history.length-1].mcq.question}"
Previous MCQ correct answer: ${history[history.length-1].mcq.answer}
User's answer: ${history[history.length-1].userAnswer}
`;
  };

  // Parse concept MCQ (may have explanation if last was wrong)
  const parseConceptMCQ = (llmText) => {
    let explanation = '';
    let concept = '';
    let level = 1;
    let text = llmText.trim();

    if (text.startsWith('Explanation:')) {
      const explMatch = text.match(/^Explanation:\s*([^\n]*)\nConcept:/i);
      explanation = explMatch ? explMatch[1].trim() : '';
      text = text.replace(/^Explanation:[^\n]*\n/i, '');
    }
    const conceptMatch = text.match(/Concept:\s*(.*)\nLevel:\s*(\d+)/);
    if (conceptMatch) {
      concept = conceptMatch[1].trim();
      level = parseInt(conceptMatch[2].trim(), 10) || 1;
    }
    const questionMatch = text.match(/Question:\s*([\s\S]*?)\nA\.\s*(.*)\nB\.\s*(.*)\nC\.\s*(.*)\nD\.\s*(.*)\nAnswer:\s*([ABCD])/i);
    if (!questionMatch) return null;
    return {
      explanation,
      concept,
      level,
      question: questionMatch[1].trim(),
      options: [
        questionMatch[2].trim(),
        questionMatch[3].trim(),
        questionMatch[4].trim(),
        questionMatch[5].trim(),
      ],
      answer: questionMatch[6].trim(),
    };
  };

  const handleStartDigDeeper = async () => {
    setIsDigging(true);
    setConceptLoading(true);
    setConceptMCQ(null);
    setConceptHistory([]);
    setConceptFeedback('');
    setConceptDone(false);

    try {
      const prompt = getConceptDiagnosticPrompt(questions[currentIndex], [], null, 1, false, '');
      const res = await axios.post(
        'https://api.groq.com/openai/v1/chat/completions',
        {
          model: 'llama-3.3-70b-versatile',
          messages: [{ role: 'user', content: prompt }],
          temperature: 0.5,
          max_tokens: 500,
        },
        {
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${GROQ_API_KEY}`,
          },
        }
      );
      const mcq = parseConceptMCQ(res.data.choices?.[0]?.message?.content || '');
      setConceptMCQ({ mcq, numCorrect: 0 });
      setConceptLoading(false);
    } catch (err) {
      setConceptFeedback('Could not generate concept diagnostic question. Please try again.');
      setConceptLoading(false);
    }
  };

  // Handles both MCQ option and the two bottom buttons
  const handleConceptUserResponse = async (typeOrKey) => {
    if (!conceptMCQ || conceptDone) return;
    const mcq = conceptMCQ.mcq;
    let history = [...conceptHistory];

    // "I understood"
    if (typeOrKey === 'I_understood') {
      // Equivalent to correct answer, but not incrementing MCQ count
      history.push({
        mcq, userAnswer: 'I_understood', correct: true, concept: mcq.concept, level: mcq.level
      });
      setConceptHistory(history);
      setConceptFeedback('Super! You marked this as understood. Want to keep building your mastery or return to solution?');
      setConceptDone(true);
      return;
    }

    // "I'm not sure..." - Store weak concept and treat as incorrect
    if (typeOrKey === 'I_am_not_sure') {
      await storeWeakConcept({ concept: mcq.concept, question: mcq.question });
      history.push({
        mcq, userAnswer: 'I_am_not_sure', correct: false, concept: mcq.concept, level: mcq.level
      });
      setConceptHistory(history);
      setConceptFeedback('Thanks! We have saved this as your weak spot. Let\'s break it down further...');
      // Proceed as incorrect for breakdown
      setConceptLoading(true);
      try {
        const prompt = getConceptDiagnosticPrompt(
          questions[currentIndex],
          history,
          mcq.concept,
          mcq.level,
          false,
          ''
        );
        const res = await axios.post(
          'https://api.groq.com/openai/v1/chat/completions',
          {
            model: 'llama-3.3-70b-versatile',
            messages: [{ role: 'user', content: prompt }],
            temperature: 0.5,
            max_tokens: 500,
          },
          {
            headers: {
              'Content-Type': 'application/json',
              Authorization: `Bearer ${GROQ_API_KEY}`,
            },
          }
        );
        const newMcq = parseConceptMCQ(res.data.choices?.[0]?.message?.content || '');
        setConceptMCQ({ mcq: newMcq, numCorrect: 0 });
        setConceptLoading(false);
      } catch (err) {
        setConceptFeedback('Could not generate breakdown question. Please try again.');
        setConceptLoading(false);
      }
      return;
    }

    // MCQ option: treat as correct/incorrect
    const correct = typeOrKey === mcq.answer;
    let numCorrect = conceptMCQ.numCorrect || 0;
    history.push({
      mcq, userAnswer: typeOrKey, correct, concept: mcq.concept, level: mcq.level
    });
    setConceptHistory(history);

    if (correct) {
      numCorrect += 1;
      setConceptFeedback('Nice! You got it right. Building up your mastery...');
      if (numCorrect >= 3) {
        setConceptDone(true);
        setConceptFeedback('Awesome! You have built a strong foundation for this concept. You can return to the main solution or keep digging for other concepts.');
        return;
      }
      setConceptLoading(true);
      try {
        const prompt = getConceptDiagnosticPrompt(
          questions[currentIndex],
          history,
          mcq.concept,
          mcq.level + 1,
          true,
          ''
        );
        const res = await axios.post(
          'https://api.groq.com/openai/v1/chat/completions',
          {
            model: 'llama-3.3-70b-versatile',
            messages: [{ role: 'user', content: prompt }],
            temperature: 0.5,
            max_tokens: 500,
          },
          {
            headers: {
              'Content-Type': 'application/json',
              Authorization: `Bearer ${GROQ_API_KEY}`,
            },
          }
        );
        const newMcq = parseConceptMCQ(res.data.choices?.[0]?.message?.content || '');
        setConceptMCQ({ mcq: newMcq, numCorrect });
        setConceptLoading(false);
      } catch (err) {
        setConceptFeedback('Could not generate next concept question. Please try again.');
        setConceptLoading(false);
      }
    } else {
      setConceptLoading(true);
      setConceptFeedback('');
      try {
        const prompt = getConceptDiagnosticPrompt(
          questions[currentIndex],
          history,
          mcq.concept,
          mcq.level,
          false,
          ''
        );
        const res = await axios.post(
          'https://api.groq.com/openai/v1/chat/completions',
          {
            model: 'llama-3.3-70b-versatile',
            messages: [{ role: 'user', content: prompt }],
            temperature: 0.5,
            max_tokens: 500,
          },
          {
            headers: {
              'Content-Type': 'application/json',
              Authorization: `Bearer ${GROQ_API_KEY}`,
            },
          }
        );
        const newMcq = parseConceptMCQ(res.data.choices?.[0]?.message?.content || '');
        setConceptMCQ({ mcq: newMcq, numCorrect: 0 });
        setConceptLoading(false);
      } catch (err) {
        setConceptFeedback('Could not generate breakdown question. Please try again.');
        setConceptLoading(false);
      }
    }
  };

  const handleExitDigDeeper = () => {
    setIsDigging(false);
    setConceptMCQ(null);
    setConceptHistory([]);
    setConceptFeedback('');
    setConceptDone(false);
  };

  // ---------- UI Rendering ----------
  if (questions.length === 0) {
    return (
      <View style={styles.container}>
        <Text style={styles.headerText}>No questions found for {chapterTitle}</Text>
      </View>
    );
  }

  const currentQuestion = questions[currentIndex];
  const minutes = Math.floor(timer / 60);
  const seconds = timer % 60;
  const formattedTime = `${minutes.toString().padStart(1, '0')}:${seconds.toString().padStart(2, '0')}`;
  const subjectImage = getSubjectImage(subjectName);

  return (
    <View style={styles.outerContainer}>
      <StatusBar barStyle="light-content" backgroundColor="#0a0517" />
      <ScrollView
        style={styles.container}
        contentContainerStyle={[styles.scrollContent, { paddingBottom: 260 }]}
        showsVerticalScrollIndicator={false}
      >
        <ImageBackground
          source={subjectImage}
          style={styles.qHeaderBg}
          imageStyle={styles.qHeaderBgImg}
          resizeMode="cover"
        >
          <View style={styles.qHeaderRow}>
            <TouchableOpacity
              onPress={() => setShowBackModal(true)}
              style={styles.backButton}
              hitSlop={{ top: 30, bottom: 30, left: 30, right: 12 }}
            >
              <Image
                source={require('../src/assets/images/caret-left.png')}
                style={[styles.backIcon, { tintColor: '#FFFFFF' }]}
              />
              <Text style={styles.backText}>Back</Text>
            </TouchableOpacity>
            <View style={styles.qHeaderTimerSection}>
              <Ionicons name="time-outline" size={18} color="#fff" style={{ marginRight: 3 }} />
              <Text style={styles.qHeaderTimerText}>{formattedTime}</Text>
            </View>
            <Text style={styles.qHeaderCounterText}>
              Q{shownIndices.size}/{questions.length}
            </Text>
          </View>
        </ImageBackground>

        <View style={styles.progressContainer}>
          <Animated.View
            style={[
              styles.progressBar,
              {
                width: progressAnim.interpolate({
                  inputRange: [0, 1],
                  outputRange: ['0%', '100%'],
                }),
              },
            ]}
          />
        </View>

        <View style={styles.qBodyOuter}>
          {/* Breadcrumbs */}
          <View style={styles.breadcrumbRow}>
            <Text style={styles.breadcrumbSubject}>{subjectName}</Text>
            <Text style={styles.breadcrumbSeparator}>/</Text>
            <Text style={styles.breadcrumbChapter}>{chapterTitle}</Text>
            <Text style={styles.breadcrumbSeparator}>/</Text>
            <Text style={styles.breadcrumbQNum}>Q{currentIndex + 1}</Text>
          </View>

          {/* Question */}
          <Text style={styles.qText}>{currentQuestion.question}</Text>

          {/* Options */}
          <View style={styles.optionsWrap}>
            {currentQuestion.options.map((option, index) => {
              const isSelected = selectedOption === option;
              let optionStyle = styles.optionRowUnselected;
              let checkBoxStyle = styles.checkBoxUnchecked;
              let showCorrectBadge = false;

              if (isCorrect === null) {
                if (isSelected) {
                  optionStyle = styles.optionRowSelected;
                  checkBoxStyle = styles.checkBoxChecked;
                }
              } else {
                const isCorrectOption = option === currentQuestion.correctAnswer;
                if (isSelected && isCorrect) {
                  optionStyle = styles.optionRowCorrectGreen;
                  checkBoxStyle = styles.checkBoxCorrectGreen;
                } else if (isSelected && !isCorrect) {
                  optionStyle = styles.optionRowWrongRed;
                  checkBoxStyle = styles.checkBoxWrongRed;
                } else if (!isSelected && isCorrectOption && !isCorrect) {
                  optionStyle = styles.optionRowCorrectOutline;
                  checkBoxStyle = styles.checkBoxUnchecked;
                  showCorrectBadge = true;
                } else {
                  optionStyle = styles.optionRowUnselected;
                  checkBoxStyle = styles.checkBoxUnchecked;
                }
              }

              return (
                <TouchableOpacity
                  key={index}
                  style={[styles.optionRow, optionStyle]}
                  onPress={() => handleOptionPress(option)}
                  activeOpacity={0.9}
                  disabled={isCorrect !== null}
                >
                  <View style={[styles.checkBox, checkBoxStyle]}>
                    {isSelected && (
                      <Feather name="check" size={15} color="#fff" />
                    )}
                  </View>
                  <Text style={styles.optionLabel}>{option}</Text>
                  {showCorrectBadge && (
                    <View style={styles.correctBadge}>
                      <Text style={styles.correctBadgeText}>Correct</Text>
                    </View>
                  )}
                </TouchableOpacity>
              );
            })}
          </View>

          {/* Check Button */}
          {isCorrect === null && (
            <TouchableOpacity
              style={[
                styles.checkBtn,
                !selectedOption && styles.checkBtnDisabled,
              ]}
              onPress={handleCheckAnswer}
              disabled={!selectedOption}
              activeOpacity={selectedOption ? 0.8 : 1}
            >
              <Text style={styles.checkBtnText}>Check</Text>
            </TouchableOpacity>
          )}

          {/* Motivation and Solution AI Gradient, with follow-up buttons */}
          {isCorrect !== null && (
            <>
              {loading ? (
                <View style={{ alignItems: 'center', marginVertical: 10 }}>
                  <ActivityIndicator size="large" color="#00BFFF" />
                  <Text style={{ color: '#aaa', marginTop: 10 }}>Generating feedback...</Text>
                </View>
              ) : (
                <>
                  {motivation ? (
                    <LinearGradient
                      colors={botGradient}
                      start={{ x: 0, y: 0 }}
                      end={{ x: 1, y: 1 }}
                      style={styles.motivationGradientBox}
                    >
                      <View style={styles.characterNotificationInner}>
                        {buddy?.image && (
                          <Image source={buddy.image} style={styles.characterAvatar} />
                        )}
                        <View style={styles.characterBubble}>
                          <Text style={styles.characterName}>{buddy?.name}</Text>
                          <Text style={styles.characterMessage}>{motivation.replace(new RegExp(`^${buddy?.name}:\\s*`), '')}</Text>
                        </View>
                      </View>
                    </LinearGradient>
                  ) : null}

                  {solution ? (
                    <LinearGradient
                      colors={botGradient}
                      start={{ x: 0, y: 0 }}
                      end={{ x: 1, y: 1 }}
                      style={styles.solutionGradientBox}
                    >
                      <Text style={styles.solutionTitle}>Solution:</Text>
                      <Text style={styles.solutionText}>{solution}</Text>
                      {aiFollowup && (
                        <View style={styles.aiFollowupResponse}>
                          <Text style={styles.solutionText}>{aiFollowup}</Text>
                        </View>
                      )}
                      {!aiFollowup && (
                        <View style={styles.aiFollowupRow}>
                          <TouchableOpacity
                            style={styles.aiFollowupBtn}
                            onPress={handleStartDigDeeper}
                            disabled={aiFollowupLoading || isDigging}
                          >
                            <Feather name="search" size={18} color="#181C28" style={{ marginRight: 6 }} />
                            <Text style={styles.aiFollowupBtnText}>Dig deeper</Text>
                          </TouchableOpacity>
                          <TouchableOpacity
                            style={styles.aiFollowupBtn}
                            onPress={() => handleAIFollowup('5yr')}
                            disabled={aiFollowupLoading}
                          >
                            <Feather name="smile" size={18} color="#181C28" style={{ marginRight: 6 }} />
                            <Text style={styles.aiFollowupBtnText}>Explain like 5yr old</Text>
                          </TouchableOpacity>
                        </View>
                      )}
                      {aiFollowupLoading && (
                        <View style={styles.aiFollowupRow}>
                          <ActivityIndicator size="small" color="#fff" />
                        </View>
                      )}
                    </LinearGradient>
                  ) : null}
                </>
              )}
            </>
          )}

          {/* --- Dig Deeper Concept Adaptive Diagnostic Modal --- */}
          {isDigging && (
            <View style={{
              marginTop: 32,
              marginHorizontal: 0,
              padding: 16,
              borderRadius: 18,
              backgroundColor: '#181C28',
              borderWidth: 1.2,
              borderColor: '#3A4363',
              shadowColor: '#000',
              shadowOpacity: 0.15,
              shadowRadius: 12,
              elevation: 6,
            }}>
              <Text style={{ color: '#fff', fontWeight: 'bold', fontSize: 18, marginBottom: 8, fontFamily: 'Geist' }}>
                Let's build your core concept clarity! 💡
              </Text>
              {conceptLoading && (
                <View style={{ alignItems: 'center', marginVertical: 16 }}>
                  <ActivityIndicator size="large" color="#fff" />
                  <Text style={{ color: '#ccc', marginTop: 8 }}>Loading a targeted question...</Text>
                </View>
              )}
              {!conceptLoading && conceptMCQ && conceptMCQ.mcq && (
                <>
                  {conceptMCQ.mcq.explanation ? (
                    <Text style={{ color: '#FFD34E', fontSize: 15, marginBottom: 8, fontFamily: 'Geistmono' }}>{conceptMCQ.mcq.explanation}</Text>
                  ) : null}
                  <Text style={{ color: '#FFD34E', fontWeight: '600', fontSize: 15, marginBottom: 2 }}>{conceptMCQ.mcq.concept} (Level {conceptMCQ.mcq.level})</Text>
                  <Text style={{ color: '#fff', fontSize: 16, marginBottom: 18 }}>{conceptMCQ.mcq.question}</Text>
                  {conceptMCQ.mcq.options.map((opt, idx) => (
                    <TouchableOpacity
                      key={idx}
                      style={{
                        backgroundColor: '#262F4C',
                        borderRadius: 8,
                        borderWidth: 1.2,
                        borderColor: '#344054',
                        paddingVertical: 12,
                        paddingHorizontal: 16,
                        marginBottom: 10,
                        flexDirection: 'row',
                        alignItems: 'center',
                      }}
                      onPress={() => handleConceptUserResponse(['A', 'B', 'C', 'D'][idx])}
                      disabled={conceptDone}
                    >
                      <Text style={{ color: '#fff', fontSize: 16, fontWeight: '500', marginRight: 6 }}>{String.fromCharCode(65 + idx)}.</Text>
                      <Text style={{ color: '#fff', fontSize: 16 }}>{opt}</Text>
                    </TouchableOpacity>
                  ))}
                  {/* Two bottom buttons */}
                  <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginTop: 16 }}>
                    <TouchableOpacity
                      style={{ flex: 1, marginRight: 8, backgroundColor: '#1DC97A', borderRadius: 12, padding: 12, alignItems: 'center' }}
                      onPress={() => handleConceptUserResponse('I_understood')}
                      disabled={conceptDone}
                    >
                      <Text style={{ color: '#fff', fontWeight: 'bold' }}>I understood</Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                      style={{ flex: 1, marginLeft: 8, backgroundColor: '#B42323', borderRadius: 12, padding: 12, alignItems: 'center' }}
                      onPress={() => handleConceptUserResponse('I_am_not_sure')}
                      disabled={conceptDone}
                    >
                      <Text style={{ color: '#fff', fontWeight: 'bold' }}>I'm not sure how to answer this</Text>
                    </TouchableOpacity>
                  </View>
                </>
              )}
              {conceptFeedback ? (
                <Text style={{ color: conceptDone ? '#1DC97A' : '#FFD34E', marginTop: 12, fontSize: 15, fontFamily: 'Geistmono' }}>{conceptFeedback}</Text>
              ) : null}
              <View style={{ flexDirection: 'row', marginTop: 18, justifyContent: 'flex-end' }}>
                <TouchableOpacity
                  style={{
                    paddingVertical: 8,
                    paddingHorizontal: 18,
                    backgroundColor: '#fff',
                    borderRadius: 18,
                    marginRight: 12,
                  }}
                  onPress={handleExitDigDeeper}
                >
                  <Text style={{ color: '#181C28', fontWeight: 'bold', fontSize: 15 }}>Return to solution</Text>
                </TouchableOpacity>
                {conceptDone && (
                  <TouchableOpacity
                    style={{
                      paddingVertical: 8,
                      paddingHorizontal: 18,
                      backgroundColor: '#3270FF',
                      borderRadius: 18,
                    }}
                    onPress={handleStartDigDeeper}
                  >
                    <Text style={{ color: '#fff', fontWeight: 'bold', fontSize: 15 }}>More concepts</Text>
                  </TouchableOpacity>
                )}
              </View>
            </View>
          )}
        </View>
      </ScrollView>

      {/* Popup Modal */}
      <Modal
        visible={showBackModal}
        transparent
        animationType="fade"
        onRequestClose={() => setShowBackModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalIconBox}>
              <Feather name="alert-triangle" size={34} color="#FFFFFF" />
            </View>
            <Text style={styles.modalTitle}>This will discard your input</Text>
            <Text style={styles.modalSubtitle}>
              Keep the morale high, only few minutes are left
            </Text>
            <View style={styles.modalStatsRow}>
              <Text style={styles.modalStat}>Est. time left: 23m</Text>
              <Text style={styles.modalStatDot}>•</Text>
              <Text style={styles.modalStat}>JEE weightage: 12%</Text>
            </View>
            <View style={styles.modalBtnRow}>
              <TouchableOpacity
                style={styles.modalBtnOutline}
                onPress={() => setShowBackModal(false)}
              >
                <Text style={styles.modalBtnOutlineText}>Go Back</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.modalBtnSolid}
                onPress={() => {
                  setShowBackModal(false);
                  setTimeout(() => router.back(), 100);
                }}
              >
                <Text style={styles.modalBtnSolidText}>Delete</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {/* Fixed Footer Navigation */}
      <View style={styles.footerNav}>
        <TouchableOpacity
          style={styles.footerBtnCircle}
          onPress={handlePrev}
        >
          <Feather name="arrow-left" size={26} color="#fff" />
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.footerBtnMain}
          onPress={handleNextAdaptive}
        >
          <Text style={styles.footerBtnMainText}>Skip to next</Text>
          <Feather name="arrow-right" size={26} color="#fff" style={{ marginLeft: 10 }} />
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.footerBtnCircle}
        >
          <Feather name="bookmark" size={26} color="#fff" />
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  // ...existing styles...
  outerContainer: {
    flex: 1,
    backgroundColor: '#0C111D',
  },
  container: {
    flex: 1,
    backgroundColor: '#0C111D',
  },
  scrollContent: {
    padding: 0,
  },
  qHeaderBg: {
    width: '100%',
    height: 120,
    justifyContent: 'flex-end',
    backgroundColor: '#111B2A',
  },
  qHeaderBgImg: {
    width: '100%',
    height: '100%',
    resizeMode: 'cover',
    opacity: 0.5,
  },
  qHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 18,
    width: '100%',
    marginBottom: 18,
  },
  qHeaderBackBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
  },
  qHeaderBackText: {
    color: '#fff',
    fontSize: 16,
    marginLeft: 4,
    fontWeight: '400',
    opacity: 0.95,
    fontFamily: 'Geist',
  },
  qHeaderTimerSection: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'transparent',
    justifyContent: 'center',
    gap: 2,
  },
  qHeaderTimerText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '500',
    letterSpacing: 0.2,
    fontFamily: 'Geist',
  },
  qHeaderCounterText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '500',
    letterSpacing: 0.1,
    fontFamily: 'Geist',
  },
  headerText: {
    color: 'white',
    fontSize: 24,
    fontWeight: '800',
    marginLeft: 12,
    fontFamily: 'Geist',
  },
  progressContainer: {
    height: 8,
    backgroundColor: '#344054',
    borderRadius: 20,
    overflow: 'hidden',
  },
  progressBar: {
    height: '100%',
    backgroundColor: 'white',
    borderRadius: 20,
  },
  qBodyOuter: {
    paddingHorizontal: 12,
    paddingTop: 32,
    paddingBottom: 30,
  },
  breadcrumbRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 6,
    paddingHorizontal: 8,
  },
  breadcrumbSubject: {
    color: '#787C87',
    fontSize: 15,
    fontFamily: 'Geistmono',
    fontWeight: '500',
  },
  breadcrumbSeparator: {
    color: '#787C87',
    fontSize: 13,
    marginHorizontal: 5,
    fontFamily: 'Geistmono',
  },
  breadcrumbChapter: {
    color: '#787C87',
    fontSize: 15,
    fontFamily: 'Geistmono',
    fontWeight: '500',
  },
  breadcrumbQNum: {
    color: '#787C87',
    fontSize: 15,
    fontFamily: 'Geistmono',
    fontWeight: '500',
  },
  qText: {
    color: '#fff',
    fontSize: 20,
    fontFamily: 'Geist',
    fontWeight: '600',
    marginBottom: 30,
    marginTop: 3,
    paddingHorizontal: 8,
    lineHeight: 27,
  },
  optionsWrap: {
    marginBottom: 36,
    marginTop: 0,
  },
  optionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    minHeight: 52,
    borderRadius: 10,
    marginBottom: 15,
    paddingHorizontal: 16,
    backgroundColor: 'transparent',
    borderWidth: 1.2,
    position: 'relative',
  },
  optionRowUnselected: {
    borderColor: '#232323',
    backgroundColor: '#000',
  },
  optionRowSelected: {
    borderColor: '#3270FF',
    backgroundColor: '#0D162A',
  },
  optionRowCorrectGreen: {
    borderColor: '#1DC97A',
    backgroundColor: '#04271C',
  },
  optionRowWrongRed: {
    borderColor: '#B42323',
    backgroundColor: '#411818',
  },
  optionRowCorrectOutline: {
    borderColor: '#1DC97A',
    backgroundColor: '#000',
  },
  checkBox: {
    width: 24,
    height: 24,
    marginRight: 16,
    borderRadius: 5,
    borderWidth: 1.4,
    justifyContent: 'center',
    alignItems: 'center',
  },
  checkBoxUnchecked: {
    borderColor: '#414553',
    backgroundColor: '#181C28',
  },
  checkBoxChecked: {
    borderColor: '#3270FF',
    backgroundColor: '#3270FF',
  },
  checkBoxCorrectGreen: {
    borderColor: '#1DC97A',
    backgroundColor: '#1DC97A',
  },
  checkBoxWrongRed: {
    borderColor: '#B42323',
    backgroundColor: '#B42323',
  },
  optionLabel: {
    color: '#fff',
    fontSize: 16,
    fontFamily: 'Geist',
    fontWeight: '500',
  },
  correctBadge: {
    position: 'absolute',
    right: 16,
    backgroundColor: 'transparent',
    borderColor: '#1DC97A',
    borderWidth: 1,
    borderRadius: 12,
    paddingHorizontal: 10,
    paddingVertical: 2,
    alignItems: 'center',
    justifyContent: 'center',
  },
  correctBadgeText: {
    color: '#1DC97A',
    fontWeight: 'bold',
    fontSize: 13,
    fontFamily: 'Geistmono',
    letterSpacing: 0.2,
  },
  checkBtn: {
    alignSelf: 'center',
    paddingHorizontal: 36,
    paddingVertical: 12,
    backgroundColor: 'white',
    borderRadius: 28,
    minWidth: 140,
    alignItems: 'center',
    marginTop: 10,
  },
  checkBtnDisabled: {
    backgroundColor: '#667085',
  },
  checkBtnText: {
    color: '#181C28',
    fontSize: 18,
    fontWeight: 'bold',
    fontFamily: 'Geist',
  },

  // Linear gradient motivation and solution
  motivationGradientBox: {
    borderRadius: 16,
    marginTop: 20,
    marginHorizontal: 0,
    padding: 0,
    marginBottom: 0,
    overflow: 'hidden',
  },
  solutionGradientBox: {
    borderRadius: 16,
    marginTop: 20,
    marginHorizontal: 0,
    padding: 0,
    marginBottom: 0,
    overflow: 'hidden',
  },
  aiFollowupRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 16,
    marginBottom: 10,
    gap: 0,
  },
  aiFollowupBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 24,
    backgroundColor: '#fff',
    paddingHorizontal: 18,
    paddingVertical: 8,
    marginHorizontal: 2,
    borderWidth: 1.2,
    borderColor: '#DEE3F3',
    shadowColor: '#000',
    shadowOpacity: 0.06,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 2 },
  },
  aiFollowupBtnText: {
    color: '#181C28',
    fontSize: 15,
    fontWeight: '600',
    fontFamily: 'Geist',
    marginLeft: 2,
  },
  aiFollowupResponse: {
    marginTop: 10,
    marginBottom: 5,
    padding: 0,
    borderRadius: 11,
  },
  characterNotificationInner: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    padding: 16,
  },
  characterAvatar: {
    width: 48,
    height: 48,
    borderRadius: 24,
    marginRight: 12,
    borderWidth: 2,
    borderColor: '#475467',
  },
  characterBubble: {
    flex: 1,
  },
  characterName: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 16,
    marginBottom: 4,
    fontFamily: 'Geist',
  },
  characterMessage: {
    color: '#fff',
    fontSize: 15,
    fontStyle: 'italic',
    lineHeight: 22,
    fontFamily: 'Geist',
  },
  solutionTitle: {
    color: '#fff',
    fontWeight: '700',
    fontSize: 18,
    marginBottom: 8,
    paddingHorizontal: 16,
    paddingTop: 16,
    fontFamily: 'Geist',
  },
  solutionText: {
    color: 'white',
    fontSize: 16,
    lineHeight: 25,
    letterSpacing: 0.5,
    paddingHorizontal: 16,
    paddingBottom: 16,
    fontFamily: 'Geist',
  },

  feedbackText: {
    fontSize: 20,
    fontWeight: '700',
    textAlign: 'center',
    marginTop: 24,
    fontFamily: 'Geist',
  },
  solutionBox: {},
  rcContainer: {
    position: 'absolute',
    right: 20,
    top: 60,
    backgroundColor: '#1E1E3F',
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#FFD700',
    shadowColor: '#FFD700',
    shadowOpacity: 0.3,
    shadowRadius: 4,
    shadowOffset: { width: 0, height: 2 },
  },
  rcText: {
    color: '#FFD700',
    fontSize: 16,
    fontWeight: 'bold',
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
    fontFamily: 'Geist',
  },
  navButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 30,
    marginHorizontal: 20,
  },
  navButton: {
    backgroundColor: '#00BFFF',
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 12,
    shadowColor: '#00BFFF',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
  },
  navButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
    fontFamily: 'Geist',
  },
  disabledButton: {
    backgroundColor: '#3A3A50',
  },
  footerNav: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    height: 120,
    backgroundColor: '#000000',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-evenly',
    paddingBottom: 38,
    paddingTop: 8,
    borderTopWidth: 0.5,
    borderTopColor: '#232B3B',
    zIndex: 12,
  },
  footerBtnCircle: {
    width: 66,
    height: 46,
    borderRadius: 23,
    backgroundColor: '#151B27',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: '#1D2939',
  },
  footerBtnMain: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#151B27',
    borderRadius: 23,
    height: 46,
    minWidth: 170,
    justifyContent: 'center',
    paddingHorizontal: 20,
    borderWidth: 1,
    borderColor: '#1D2939',
  },
  footerBtnMainText: {
    color: '#fff',
    fontSize: 17,
    fontWeight: 'bold',
    fontFamily: 'Geist',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.72)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    width: '88%',
    paddingVertical: 32,
    paddingHorizontal: 20,
    backgroundColor: '#111B2A',
    borderRadius: 22,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOpacity: 0.25,
    shadowRadius: 20,
    elevation: 10,
    borderWidth: 1,
    borderColor: '#232B3B',
  },
  modalIconBox: {
    width: 54,
    height: 54,
    borderRadius: 27,
    backgroundColor: '#181C28',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
  },
  modalTitle: {
    color: '#fff',
    fontSize: 19,
    fontWeight: '700',
    marginBottom: 8,
    textAlign: 'center',
    fontFamily: 'Geist',
  },
  modalSubtitle: {
    color: '#A8A8B3',
    fontSize: 14,
    marginBottom: 18,
    textAlign: 'center',
    fontFamily: 'Geist',
  },
  modalStatsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 28,
  },
  modalStat: {
    color: '#E6E6F0',
    fontSize: 13,
    fontFamily: 'Geistmono',
  },
  modalStatDot: {
    color: '#E6E6F0',
    fontSize: 13,
    marginHorizontal: 7,
    opacity: 0.6,
  },
  modalBtnRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 12,
    marginTop: 0,
  },
  modalBtnOutline: {
    minWidth: 110,
    backgroundColor: '#181C28',
    borderRadius: 24,
    paddingVertical: 12,
    paddingHorizontal: 0,
    borderWidth: 1.4,
    borderColor: '#2C3343',
    marginRight: 8,
    alignItems: 'center',
  },
  modalBtnOutlineText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
    fontFamily: 'Geist',
  },
  modalBtnSolid: {
    minWidth: 110,
    backgroundColor: '#fff',
    borderRadius: 24,
    paddingVertical: 12,
    paddingHorizontal: 0,
    alignItems: 'center',
  },
  modalBtnSolidText: {
    color: '#111B2A',
    fontSize: 16,
    fontWeight: '700',
    fontFamily: 'Geist',
  },
});

export default QuestionViewer;


