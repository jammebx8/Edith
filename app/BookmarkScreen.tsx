import React, { useEffect, useState, useRef } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  ImageBackground,
  StatusBar,
  Animated,
  ActivityIndicator,
} from 'react-native';
import { Ionicons, Feather } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useRouter } from 'expo-router';
import imagepath from '../src/constants/imagepath';

const BOOKMARKS_KEY = 'bookmarkedQuestions';

const getSubjectImage = (subjectName) => {
  if (subjectName === 'Physics') return imagepath.Physics;
  if (subjectName === 'Chemistry') return imagepath.Chemistry;
  if (subjectName === 'Maths') return imagepath.Maths;
  if (subjectName === 'Biology') return imagepath.Biology;
  return imagepath.Maths;
};

const BookmarkScreen = () => {
  const router = useRouter();
  const [bookmarks, setBookmarks] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [selectedOption, setSelectedOption] = useState(null);
  const [isCorrect, setIsCorrect] = useState(null);
  const [checking, setChecking] = useState(false);

  useEffect(() => {
    const fetchBookmarks = async () => {
      const stored = await AsyncStorage.getItem(BOOKMARKS_KEY);
      if (stored) {
        setBookmarks(JSON.parse(stored));
      } else {
        setBookmarks([]);
      }
    };
    fetchBookmarks();
  }, []);

  const handleCheck = () => {
    if (!selectedOption) return;
    setChecking(true);
    setTimeout(() => {
      const isAnsCorrect = selectedOption === current.correctAnswer;
      setIsCorrect(isAnsCorrect);
      setChecking(false);
    }, ); // Simulate some delay for feedback effect if desired
  };

  const handleOptionPress = (option) => {
    setSelectedOption(option);
    setIsCorrect(null);
  };

  const handleNext = () => {
    if (currentIndex < bookmarks.length - 1) {
      setCurrentIndex((prev) => prev + 1);
      setSelectedOption(null);
      setIsCorrect(null);
    }
  };

  const handlePrev = () => {
    if (currentIndex > 0) {
      setCurrentIndex((prev) => prev - 1);
      setSelectedOption(null);
      setIsCorrect(null);
    }
  };

  if (bookmarks.length === 0) {
    return (
      <View style={styles.container}>
        <StatusBar barStyle="light-content" backgroundColor="#000000" />
        <View style={styles.header}>
          <TouchableOpacity onPress={() => router.back()} style={styles.headerBackBtn}>
            <Ionicons name="chevron-back" size={26} color="#fff" />
            <Text style={styles.headerBackText}>Back</Text>
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Bookmarks</Text>
          <Text style={styles.headerCounter}>0/0</Text>
        </View>
        <View style={styles.emptyContainer}>
          <Text style={styles.emptyText}>No bookmarks yet.</Text>
        </View>
      </View>
    );
  }

  const current = bookmarks[currentIndex];
  const subjectImage = getSubjectImage(current.subjectName);

  return (
    <View style={styles.outerContainer}>
      <StatusBar barStyle="light-content" backgroundColor="#0a0517" />
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.headerBackBtn}>
          <Ionicons name="chevron-back" size={26} color="#fff" />
          <Text style={styles.headerBackText}>Back</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Bookmarks</Text>
        <Text style={styles.headerCounter}>
          {currentIndex + 1}/{bookmarks.length}
        </Text>
      </View>

      <ScrollView
        style={styles.container}
        contentContainerStyle={{ paddingBottom: 100 }}
        showsVerticalScrollIndicator={false}
      >
        <ImageBackground
          source={subjectImage}
          style={styles.qHeaderBg}
          imageStyle={styles.qHeaderBgImg}
          resizeMode="cover"
        >
        
        </ImageBackground>
          <View style={styles.breadcrumbRow}>
            <Text style={styles.breadcrumbSubject}>{current.subjectName}</Text>
            <Text style={styles.breadcrumbSeparator}>/</Text>
            <Text style={styles.breadcrumbChapter}>{current.chapterTitle}</Text>
            <Text style={styles.breadcrumbSeparator}>/</Text>
            <Text style={styles.breadcrumbQNum}>Q{current.index + 1 || 1}</Text>
          </View>

        <View style={styles.qBodyOuter}>
          <Text style={styles.qText}>{current.question}</Text>
          <View style={styles.optionsWrap}>
            {current.options.map((option, idx) => {
              let optionStyle = styles.optionRowUnselected;
              let checkBoxStyle = styles.checkBoxUnchecked;
              let showCorrectBadge = false;
              const isSelected = selectedOption === option;

              if (isCorrect === null) {
                if (isSelected) {
                  optionStyle = styles.optionRowSelected;
                  checkBoxStyle = styles.checkBoxChecked;
                }
              } else {
                const isCorrectOption = option === current.correctAnswer;
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
                  key={idx}
                  style={[styles.optionRow, optionStyle]}
                  onPress={() => handleOptionPress(option)}
                  activeOpacity={0.9}
                  disabled={isCorrect !== null}
                >
                  <View style={[styles.checkBox, checkBoxStyle]}>
                    {isSelected && <Feather name="check" size={15} color="#fff" />}
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
          {isCorrect === null ? (
            <TouchableOpacity
              style={[
                styles.checkBtn,
                !selectedOption && styles.checkBtnDisabled,
              ]}
              onPress={handleCheck}
              disabled={!selectedOption || checking}
              activeOpacity={selectedOption ? 0.8 : 1}
            >
              {checking ? (
                <ActivityIndicator size="small" color="#181C28" />
              ) : (
                <Text style={styles.checkBtnText}>Check</Text>
              )}
            </TouchableOpacity>
          ) : null}
        </View>
      </ScrollView>
      {/* Footer Navigation */}
      <View style={styles.footerNav}>
        <TouchableOpacity
          style={[
            styles.footerBtnCircle,
            currentIndex === 0 && styles.disabledButton,
          ]}
          onPress={handlePrev}
          disabled={currentIndex === 0}
        >
          <Feather name="arrow-left" size={26} color="#fff" />
        </TouchableOpacity>
        <TouchableOpacity
          style={[
            styles.footerBtnMain,
            currentIndex === bookmarks.length - 1 && styles.disabledButton,
          ]}
          onPress={handleNext}
          disabled={currentIndex === bookmarks.length - 1}
        >
          <Text style={styles.footerBtnMainText}>Skip to next</Text>
          <Feather name="arrow-right" size={26} color="#fff" style={{ marginLeft: 10 }} />
        </TouchableOpacity>
       
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  outerContainer: {
    flex: 1,
    backgroundColor: '#0C111D',
  },
  container: { flex: 1, backgroundColor: '#0C111D' },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingTop: 44,
    paddingBottom: 16,
    paddingHorizontal: 12,
    justifyContent: 'space-between',
    backgroundColor: '#000000',
    zIndex: 10,
  },
  headerBackBtn: { flexDirection: 'row', alignItems: 'center', gap: 0 },
  headerBackText: { color: '#fff', fontSize: 16, marginLeft: 2, fontWeight: '400', fontFamily: 'Geist' },
  headerTitle: { color: '#fff', fontSize: 28, fontWeight: 'medium', fontFamily: 'Geist', paddingRight: 30 },
  headerCounter: { color: '#fff', fontSize: 15, fontFamily: 'Geistmono', fontWeight: '400' },
  qHeaderBg: { width: '100%', height: 100, justifyContent: 'flex-end', backgroundColor: '#111B2A' },
  qHeaderBgImg: { width: '100%', height: '100%', resizeMode: 'cover', opacity: 0.5 },
  breadcrumbRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 6, paddingHorizontal: 18, paddingTop: 16 },
  breadcrumbSubject: { color: '#787C87', fontSize: 15, fontFamily: 'Geistmono', fontWeight: '500' },
  breadcrumbSeparator: { color: '#787C87', fontSize: 13, marginHorizontal: 5, fontFamily: 'Geistmono' },
  breadcrumbChapter: { color: '#787C87', fontSize: 15, fontFamily: 'Geistmono', fontWeight: '500' },
  breadcrumbQNum: { color: '#787C87', fontSize: 15, fontFamily: 'Geistmono', fontWeight: '500' },
  qBodyOuter: { paddingHorizontal: 12, paddingTop: 12, paddingBottom: 30 },
  qText: { color: '#fff', fontSize: 20, fontFamily: 'Geist', fontWeight: '600', marginBottom: 30, marginTop: 3, paddingHorizontal: 8, lineHeight: 27 },
  optionsWrap: { marginBottom: 36, marginTop: 0 },
  optionRow: { flexDirection: 'row', alignItems: 'center', minHeight: 52, borderRadius: 10, marginBottom: 15, paddingHorizontal: 16, borderWidth: 1.2, position: 'relative' },
  optionRowUnselected: { borderColor: '#232323', backgroundColor: '#000' },
  optionRowSelected: { borderColor: '#3270FF', backgroundColor: '#0D162A' },
  optionRowCorrectGreen: { borderColor: '#1DC97A', backgroundColor: '#04271C' },
  optionRowWrongRed: { borderColor: '#B42323', backgroundColor: '#411818' },
  optionRowCorrectOutline: { borderColor: '#1DC97A', backgroundColor: '#000' },
  checkBox: { width: 24, height: 24, marginRight: 16, borderRadius: 5, borderWidth: 1.4, justifyContent: 'center', alignItems: 'center' },
  checkBoxUnchecked: { borderColor: '#414553', backgroundColor: '#181C28' },
  checkBoxChecked: { borderColor: '#3270FF', backgroundColor: '#3270FF' },
  checkBoxCorrectGreen: { borderColor: '#1DC97A', backgroundColor: '#1DC97A' },
  checkBoxWrongRed: { borderColor: '#B42323', backgroundColor: '#B42323' },
  optionLabel: { color: '#fff', fontSize: 16, fontFamily: 'Geist', fontWeight: '500' },
  correctBadge: { position: 'absolute', right: 16, backgroundColor: 'transparent', borderColor: '#1DC97A', borderWidth: 1, borderRadius: 12, paddingHorizontal: 10, paddingVertical: 2, alignItems: 'center', justifyContent: 'center' },
  correctBadgeText: { color: '#1DC97A', fontWeight: 'medium', fontSize: 13, fontFamily: 'Geistmono', letterSpacing: 0.2 },
  checkBtn: { alignSelf: 'center', paddingHorizontal: 36, paddingVertical: 12, backgroundColor: 'white', borderRadius: 28, minWidth: 140, alignItems: 'center', marginTop: 10 },
  checkBtnDisabled: { backgroundColor: '#667085' },
  checkBtnText: { color: '#181C28', fontSize: 18, fontWeight: 'bold', fontFamily: 'Geist' },
  footerNav: { position: 'absolute', left: 0, right: 0, bottom: 0, height: 100, backgroundColor: '#000000', flexDirection: 'row', alignItems: 'center', justifyContent: 'space-evenly', paddingBottom: 38, paddingTop: 48, borderTopWidth: 0.5, borderTopColor: '#232B3B', zIndex: 12 },
  footerBtnCircle: { width: 66, height: 46, borderRadius: 23, backgroundColor: '#151B27', alignItems: 'center', justifyContent: 'center', borderWidth: 1, borderColor: '#1D2939' },
  footerBtnMain: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#151B27', borderRadius: 23, height: 46, minWidth: 270, justifyContent: 'center', paddingHorizontal: 20, borderWidth: 1, borderColor: '#1D2939' },
  footerBtnMainText: { color: '#fff', fontSize: 17, fontWeight: 'medium', fontFamily: 'Geist' },
  disabledButton: { opacity: 0.5 },
  emptyContainer: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  emptyText: { color: '#aaa', fontSize: 16, fontFamily: 'Geist' },
});

export default BookmarkScreen;