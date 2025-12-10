import { FontAwesome } from '@expo/vector-icons';
import { router } from 'expo-router';
import React, { useState } from 'react';
import { ImageBackground, ScrollView, StatusBar, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { moderateScale, scale, verticalScale } from 'react-native-size-matters';
import imagepath from '../../src/constants/imagepath';

const EXAMS = [
  { name: 'JEE Main' },
  { name: 'JEE Adv.' },
  { name: 'NEET' }
];

const SUBJECTS = {
  'JEE Main': [
    {
      name: 'Physics',
    chapters: 19,
     questions: 1600,
      weightage: '34%',
      badge: '#1 Subject',
      badgeColor: '#00FFB0',
      image: imagepath.Physics,
      color: '#1E90FF',
    },
    {
      name: 'Chemistry',
     chapters: 14, 
     questions: 1130,
      weightage: '34%',
      badge: '#3 Subject',
      badgeColor: '#FF4D00',
      image: imagepath.Chemistry,
      color: '#FFA500',
    },
    {
      name: 'Maths',
     chapters: 16,
      questions: 1270,
      weightage: '34%',
      badge: '#2 Subject',
      badgeColor: '#FFD700',
      image: imagepath.Maths,
      color: '#D32F8D',
    },
  ],
  'JEE Adv.': [
    {
      name: 'Physics',
     chapters: 19, questions: 1520,
      weightage: '34%',
      badge: '#1 Subject',
      badgeColor: '#00FFB0',
      image: imagepath.Physics,
      color: '#1E90FF',
    },
    {
      name: 'Chemistry',
     chapters: 14, questions: 1120,
      weightage: '34%',
      badge: '#3 Subject',
      badgeColor: '#FF4D00',
      image: imagepath.Chemistry,
      color: '#FFA500',
    },
    {
      name: 'Maths',
      chapters: 16, questions: 1270,
      weightage: '34%',
      badge: '#2 Subject',
      badgeColor: '#FFD700',
      image: imagepath.Maths,
      color: '#D32F8D',
    },
  ],
  'NEET': [
    {
      name: 'Physics',
     chapters: 28, questions: 4100,
      weightage: '34%',
      badge: '#1 Subject',
      badgeColor: '#00FFB0',
      image: imagepath.Physics,
      color: '#1E90FF',
    },
    {
      name: 'Chemistry',
       chapters: 30, questions: 3900,
      weightage: '34%',
      badge: '#3 Subject',
      badgeColor: '#FF4D00',
      image: imagepath.Chemistry,
      color: '#FFA500',
    },
    {
      name: 'Biology',
      chapters: 45, questions: 7300,
      weightage: '34%',
      badge: '#2 Subject',
      badgeColor: '#FFD700',
      image: imagepath.Maths, // Replace with imagepath.Biology if you have it
      color: '#32CD32',
    },
  ],
};

export default function ExploreScreen() {
  const [selectedExam, setSelectedExam] = useState(EXAMS[0].name);
  const [showDropdown, setShowDropdown] = useState(false);

  // Redirect directly to chapterpage with subject color
// ...existing code...
const handleSubjectPress = (subject) => {
  router.push({
    pathname: '/chapterpage',
    params: {
      examName: selectedExam,
      subjectName: subject.name,
      subjectColor: subject.color,
      badge: subject.badge.split(' ')[0], // Pass only '#1', '#2', etc.
      badgeColor: subject.badgeColor,
    },
  });
};
// ...existing code...

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#0a0517" />
      <ScrollView  showsVerticalScrollIndicator={false}>
        {/* Practice Title & Exam Toggle */}
        <View style={styles.practiceRow}>
          <Text style={styles.practiceTitle}>Practice</Text>
          <View>
            <TouchableOpacity style={styles.examToggle} onPress={() => setShowDropdown(!showDropdown)}>
              <Text style={styles.examToggleText}>{selectedExam}</Text>
              <FontAwesome name={showDropdown ? "chevron-up" : "chevron-down"} size={16} color="#fff" style={{ marginLeft: 6 }} />
            </TouchableOpacity>
            {showDropdown && (
              <View style={styles.dropdown}>
                {EXAMS.map((exam) => (
                  <TouchableOpacity key={exam.name} style={styles.dropdownItem} onPress={() => { setSelectedExam(exam.name); setShowDropdown(false); }}>
                    <Text style={styles.dropdownText}>{exam.name}</Text>
                  </TouchableOpacity>
                ))}
              </View>
            )}
          </View>
        </View>

        {/* Subject Cards */}
        <View style={styles.cardList}>
          {SUBJECTS[selectedExam]?.map((subject) => (
            <TouchableOpacity key={subject.name} style={styles.subjectCard} onPress={() => handleSubjectPress(subject)}>
              <ImageBackground source={subject.image} style={styles.subjectImage} imageStyle={styles.subjectImageStyle}>
                {/* No overlay for more vibrancy */}
              </ImageBackground>
              <View style={styles.subjectContent}>
                <View style={styles.subjectNameRow}>
                  <Text style={styles.subjectName}>{subject.name}</Text>
                  <View style={[styles.subjectBadge, { borderColor: subject.badgeColor }]}>
                    <Text style={[styles.subjectBadgeText, { color: subject.badgeColor }]}>{subject.badge}</Text>
                  </View>
                </View>
                <View style={styles.subjectInfoRow}>
                  <Text style={styles.subjectInfo}>{subject.chapters} Chapters</Text>
                  <Text style={styles.subjectInfo}>{subject.questions.toLocaleString()} Questions</Text>
                  <Text style={styles.subjectInfo}>{subject.weightage} Weightage</Text>
                </View>
              </View>
            </TouchableOpacity>
          ))}
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#0C111D",
paddingBottom: verticalScale(30),

  },
  practiceRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: verticalScale(15),
    marginHorizontal: scale(16),
    marginBottom: verticalScale(10),
   
  },
  practiceTitle: {
    color: '#fff',
    fontSize: moderateScale(28),
    fontWeight: 'medium',
    letterSpacing: 0.5,
      fontFamily: 'Geist',
  },
  examToggle: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#000000',
    borderRadius: 18,
    paddingHorizontal: 18,
    paddingVertical: 8,
    borderWidth: 1,
    borderColor: '#262626',
  },
  examToggleText: {
    color: '#fff',
    fontSize: moderateScale(16),
    fontWeight: '500',
      fontFamily: 'Geist',
  },
  dropdown: {
    backgroundColor: '#18183A',
    borderRadius: 12,
    marginTop: 4,
    overflow: 'hidden',
    position: 'absolute',
    right: 0,
    top: 44,
    zIndex: 10,
    width: 140,
    borderWidth: 1,
    borderColor: '#22223A',
  },
  dropdownItem: {
    paddingVertical: 12,
    paddingHorizontal: 18,
  },
  dropdownText: {
    color: '#fff',
    fontSize: moderateScale(15),
  },
  cardList: {
    marginTop: verticalScale(8),
    marginHorizontal: scale(8),
    marginBottom: verticalScale(16),
     paddingBottom: 40,
  },
  subjectCard: {
    borderRadius: 16,
    overflow: 'hidden',
    marginBottom: verticalScale(18),
    backgroundColor: '#000000',
    borderWidth: 1,
    borderColor: '#262626',
    shadowColor: '#000',
    shadowOpacity: 0.13,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 4 },
  },
  subjectImage: {
    width: '100%',
    height: verticalScale(80),
    backgroundColor: '#222', 
  },
  subjectImageStyle: {
    resizeMode: 'cover',
  },
  subjectContent: {
    paddingHorizontal: scale(16),
    paddingTop: verticalScale(12),
    paddingBottom: verticalScale(10),
  },
  subjectNameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  subjectName: {
    color: '#fff',
    fontSize: moderateScale(22),
    fontWeight: 'bold',
    letterSpacing: 0.2,
      fontFamily: 'Geist',
  },
  subjectBadge: {
    borderWidth: 1.5,
    borderRadius: 12,
    paddingHorizontal: 10,
    paddingVertical: 2,
    marginLeft: 8,
    backgroundColor: '#18183A',
  },
  subjectBadgeText: {
    fontSize: moderateScale(13),
    fontWeight: 'bold',
      fontFamily: 'Geist',
  },
  subjectInfoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 2,
  },
  subjectInfo: {
    color: '#C0C0C0',
    fontSize: moderateScale(13),
    fontWeight: '500',
      fontFamily: 'Geist',
  },
});

  



