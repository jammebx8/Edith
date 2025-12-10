import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, ImageBackground, Image, StatusBar } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { Feather } from '@expo/vector-icons';
import { scale, verticalScale, moderateScale } from 'react-native-size-matters';
import imagepath from '../src/constants/imagepath';




const chaptersData = {

  "JEE Main": {
    "Physics": [
      { "title": "Units and Measurements.", "questions": 100 },
      { "title": "Kinematics.", "questions": 70 },
      { "title": "Laws of Motion.", "questions": 90 },
      { "title": "Work, Energy, and Power.", "questions": 80 },
      { "title": "Rotational Motion.", "questions": 110 },
      { "title": "Gravitation.", "questions": 70 },
      { "title": "Properties of Solids and Liquids.", "questions": 80 },
      { "title": "Thermodynamics.", "questions": 90 },
      { "title": "Behaviour of Perfect Gas and Kinetic Theory.", "questions": 90 },
      { "title": "Oscillations and Waves.", "questions": 90 },
      { "title": "Electrostatics.", "questions": 80 },
      { "title": "Current Electricity.", "questions": 90 },
      { "title": "Magnetic Effects of Current and Magnetism.", "questions": 80 },
      { "title": "Electromagnetic Induction and Alternating Currents.", "questions": 80 },
      { "title": "Electromagnetic Waves.", "questions": 90 },
      { "title": "Optics.", "questions": 90 },
      { "title": "Dual Nature of Matter and Radiation.", "questions": 70 },
      { "title": "Atoms and Nuclei.", "questions": 80 },
      { "title": "Semiconductors", "questions": 70 }
      
    ],
    "Chemistry": [
      { "title": "Some Basic Concepts of Chemistry.", "questions": 90 },
      { "title": "Structure of Atom.", "questions": 80 },
      { "title": "Classification of Elements and Periodicity in Properties.", "questions": 80 },
      { "title": "Chemical Bonding and Molecular Structure.", "questions": 90 },
        
      { "title": "Thermodynamics..", "questions": 100 },
      { "title": "Equilibrium.", "questions": 80 },
      { "title": "Redox Reactions.", "questions": 60 },
     
      { "title": "p-Block Elements.", "questions": 80 },
      { "title": "Organic Chemistry – Some Basic Principles and Techniques.", "questions": 80 },
      { "title": "Hydrocarbons.", "questions": 70 },
   
     
      { "title": "Coordination Compounds.", "questions": 80 },
      { "title": "Haloalkanes and Haloarenes.", "questions": 80 },
      { "title": "Aldehydes, Ketones and Carboxylic Acids.", "questions": 80 },
      { "title": "Biomolecules.", "questions": 80 }
    ],
    "Maths": [
      { "title": "Sets, Relations, and Functions.", "questions": 80 },
       { "title": "Quadratic Equations.", "questions": 70 },
      { "title": "Complex Numbers.", "questions": 80 },
      { "title": "Matrices and Determinants.", "questions": 80 },
      { "title": "Permutations and Combinations.", "questions": 80 },
      { "title": "Binomial Theorem and its Simple Applications.", "questions": 80 },
      { "title": "Sequences and Series.", "questions": 80 },
      { "title": "Limit, Continuity, and Differentiability.", "questions": 80 },
      { "title": "Integral Calculus.", "questions": 80 },
      { "title": "Differential Equations.", "questions": 80 },
      { "title": "Coordinate Geometry.", "questions": 80 },
      { "title": "Three Dimensional Geometry.", "questions": 80 },
      { "title": "Vector Algebra.", "questions": 80 },
      { "title": "Trigonometry.", "questions": 80 },
      { "title": "Probability.", "questions": 80 },
      { "title": "Statistics.", "questions": 80 },
     
    ]
  },
  
  "JEE Adv.": {
    "Physics": [
      { "title": "Units and Measurements", "questions": 80 },
      { "title": "Kinematics", "questions": 80 },
      { "title": "Laws of Motion", "questions": 80 },
      { "title": "Work, Energy, and Power", "questions": 80 },
      { "title": "Rotational Motion", "questions": 80 },
      { "title": "Gravitation", "questions": 80 },
      { "title": "Properties of Solids and Liquids", "questions": 80 },
      { "title": "Thermodynamics", "questions": 80 },
      { "title": "Behaviour of Perfect Gas and Kinetic Theory", "questions": 80 },
      { "title": "Oscillations and Waves", "questions": 80 },
      { "title": "Electrostatics", "questions": 80 },
      { "title": "Current Electricity", "questions": 80 },
      { "title": "Magnetic Effects of Current and Magnetism", "questions": 80 },
      { "title": "Electromagnetic Induction and Alternating Currents", "questions": 80 },
      { "title": "Electromagnetic Waves", "questions": 80 },
      { "title": "Optics", "questions": 80 },
      { "title": "Dual Nature of Matter and Radiation", "questions": 80 },
      { "title": "Atoms and Nuclei", "questions": 80 },
     { "title": "Semiconductors", "questions": 80 }
    ],
    "Chemistry": [
         { "title": "Some Basic Concepts of Chemistry", "questions": 80 },
      { "title": "Structure of Atom", "questions": 80 },
      { "title": "Classification of Elements and Periodicity in Properties", "questions": 80 },
      { "title": "Chemical Bonding and Molecular Structure", "questions": 80 },
       
      { "title": "Thermodynamics", "questions": 80 },
      { "title": "Equilibrium", "questions": 80 },
      { "title": "Redox Reactions", "questions": 80 },
     
      { "title": "p-Block Elements", "questions": 80 },
      { "title": "Organic Chemistry – Some Basic Principles and Techniques", "questions": 80 },
      { "title": "Hydrocarbons", "questions": 80 },
 
     
      { "title": "Coordination Compounds", "questions": 80 },
      { "title": "Haloalkanes and Haloarenes", "questions": 80 },
      { "title": "Aldehydes, Ketones and Carboxylic Acids", "questions": 80 },
      { "title": "Biomolecules", "questions": 80 }
    ],
    "Maths": [
       { "title": "Sets, Relations, and Functions", "questions": 80 },
       { "title": "Quadratic Equations", "questions": 80 },
      { "title": "Complex Numbers", "questions": 80 },
      { "title": "Matrices and Determinants", "questions": 80 },
      { "title": "Permutations and Combinations", "questions": 80 },
      { "title": "Binomial Theorem and its Simple Applications", "questions": 80 },
      { "title": "Sequences and Series", "questions": 80 },
      { "title": "Limit, Continuity, and Differentiability", "questions": 80 },
      { "title": "Integral Calculus", "questions": 80 },
      { "title": "Differential Equations", "questions": 80 },
      { "title": "Coordinate Geometry", "questions": 80 },
      { "title": "Three Dimensional Geometry", "questions": 80 },
      { "title": "Vector Algebra", "questions": 80 },
      { "title": "Trigonometry", "questions": 80 },
      { "title": "Probability", "questions": 80 },
      { "title": "Statistics", "questions": 80 },
    ]
    },





  "NEET": {
    "Physics": [
      { "title": "Units and Measurements", "questions": 100 },
      { "title": "Kinematics", "questions": 70 },
      { "title": "Laws of Motion", "questions": 90 },
      { "title": "Work, Energy, and Power", "questions": 80 },
      { "title": "Rotational Motion", "questions": 110 },
      { "title": "Gravitation", "questions": 70 },
      { "title": "Properties of Solids and Liquids", "questions": 80 },
      { "title": "Thermodynamics", "questions": 90 },
      { "title": "Behaviour of Perfect Gas and Kinetic Theory", "questions": 90 },
      { "title": "Oscillations and Waves", "questions": 90 },
      { "title": "Electrostatics", "questions": 80 },
      { "title": "Current Electricity", "questions": 90 },
      { "title": "Magnetic Effects of Current and Magnetism", "questions": 80 },
      { "title": "Electromagnetic Induction and Alternating Currents", "questions": 80 },
      { "title": "Electromagnetic Waves", "questions": 90 },
      { "title": "Optics", "questions": 90 },
      { "title": "Dual Nature of Matter and Radiation", "questions": 70 },
      { "title": "Atoms and Nuclei", "questions": 80 },
      { "title": "Semiconductors", "questions": 70 }
    ],
    "Chemistry": [
      { "title": "Some Basic Concepts of Chemistry", "questions": 90 },
      { "title": "Structure of Atom", "questions": 80 },
      { "title": "Classification of Elements and Periodicity in Properties", "questions": 210 },
      { "title": "Chemical Bonding and Molecular Structure", "questions": 220 },
       
      { "title": "Thermodynamics", "questions": 200 },
      { "title": "Equilibrium", "questions": 220 },
      { "title": "Redox Reactions", "questions": 210 },
     
      { "title": "p-Block Elements", "questions": 210 },
      { "title": "Organic Chemistry – Some Basic Principles and Techniques", "questions": 200 },
      { "title": "Hydrocarbons", "questions": 210 },
 
      { "title": "p-Block Elements", "questions": 200 },
      { "title": "Coordination Compounds", "questions": 210 },
      { "title": "Haloalkanes and Haloarenes", "questions": 180 },
      { "title": "Aldehydes, Ketones and Carboxylic Acids", "questions": 200 },
      { "title": "Biomolecules", "questions": 190 }
    ],
    "Biology": [
      { "title": "Diversity of Living Organisms", "questions": 240 },
      { "title": "Structural Organisation in Animals and Plants", "questions": 230 },
      { "title": "Cell Structure and Function", "questions": 290 },
      { "title": "Plant Physiology", "questions": 280 },
      { "title": "Human Physiology", "questions": 310 },
      { "title": "Reproduction", "questions": 290 },
      { "title": "Genetics and Evolution", "questions": 310 },
      { "title": "Biology and Human Welfare", "questions": 230 },
      { "title": "Biotechnology and Its Applications", "questions": 250 },
      { "title": "Ecology and Environment", "questions": 260 }
    ]
  }

}

export default function ChapterScreen() {
  const router = useRouter();
  const {
    examName = '',
    subjectName = '',
    subjectColor = '#00FFB0',
    badge = '#1', // default to #1 if not provided
    badgeColor = '#00FFB0',
  } = useLocalSearchParams();

  const subjectImage =
    subjectName === 'Physics'
      ? imagepath.Physics
      : subjectName === 'Chemistry'
      ? imagepath.Chemistry
      : subjectName === 'Maths'
      ? imagepath.Maths
      : imagepath.Biology || imagepath.Maths;

  const chapterList = chaptersData[examName]?.[subjectName] || [];
  const totalQuestions = chapterList.reduce((sum, ch) => sum + ch.questions, 0);

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#0a0517" />
      {/* Header with background image */}
      <ImageBackground source={subjectImage} style={styles.headerBg} imageStyle={styles.headerBgImg}>
        {/* Top Row: Back and Info */}
        <View style={styles.headerTopRow}>
          <TouchableOpacity
            onPress={() => router.replace('/explore')}
            style={styles.backButton}
            hitSlop={{ top: 30, bottom: 30, left: 30, right: 12 }}
          >
            <Image
              source={require('../src/assets/images/caret-left.png')}
              style={[styles.backIcon, { tintColor: '#FFFFFF' }]}
            />
            <Text style={styles.backText}>Back</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.headerIconBtn}>
            <Feather name="info" size={22} color="#fff" />
          </TouchableOpacity>
        </View>
        {/* Centered Subject Name and Badge */}
        <View style={styles.headerCenterRow}>
          <Text style={styles.headerTitle}>{subjectName}</Text>
          <View style={[styles.badge, { borderColor: badgeColor }]}>
            <Text style={[styles.badgeText, { color: badgeColor }]}>{badge}</Text>
          </View>
        </View>
        {/* Stats Row */}
        <View style={styles.headerStatsRow}>
          <Text style={styles.headerStat}>{chapterList.length} Chapters</Text>
          <Text style={styles.headerDot}>•</Text>
          <Text style={styles.headerStat}>{totalQuestions.toLocaleString()} Questions</Text>
          <Text style={styles.headerDot}>•</Text>
          <Text style={styles.headerStat}>34% Weightage</Text>
        </View>
      </ImageBackground>

      {/* Chapters Title Row */}
      <View style={styles.chaptersRow}>
        <Text style={styles.chaptersTitle}>Chapters</Text>
        <TouchableOpacity style={styles.filterBtn}>
          <Text style={styles.filterBtnText}>Filter</Text>
          <Feather name="chevron-down" size={16} color="#fff" style={{ marginLeft: 4 }} />
        </TouchableOpacity>
      </View>

      <View style={styles.listBg}>
        <ScrollView contentContainerStyle={styles.chapterList}  showsVerticalScrollIndicator={false}>
          {chapterList.map((chapter, idx) => (
            <TouchableOpacity
              key={idx}
              style={styles.chapterCard}
              activeOpacity={0.8}
              onPress={() =>
                router.push({
                  pathname: '/QuestionViewer',
                  params: { chapterTitle: chapter.title , subjectName },
                })
              }
            >
              <View style={styles.chapterNumCircle}>
                <Text style={styles.chapterNumText}>{idx + 1}</Text>
              </View>
              <View style={styles.chapterCardContent}>
                <Text style={styles.chapterCardTitle} numberOfLines={1}>{chapter.title.replace(/\.$/, '')}</Text>
                <View style={styles.chapterCardInfoRow}>
                  <Text style={styles.chapterCardInfo}>{chapter.questions} Ques •</Text>
                  <Text style={styles.chapterCardInfo}>Sub. weight 34% •</Text>
                  <Text style={styles.chapterCardInfo}>Exam weight 2%</Text>
                </View>
              </View>
              <Feather name="chevron-right" size={22} color="#fff" />
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#181C29",
  },
  headerBg: {
    width: '100%',
    height: verticalScale(140),
    paddingBottom: verticalScale(12),
    position: 'relative',
    backgroundColor: "#0B0B28",
  },
  headerBgImg: {
    resizeMode: 'cover',
    opacity: 0.5,
  },
  headerTopRow: {
    position: 'absolute',
    top: verticalScale(60),
    left: 0,
    right: 0,
    zIndex: 2,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: scale(16),
  },
  headerIconBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  headerBackText: {
    color: '#fff',
    fontSize: moderateScale(15),
    marginLeft: 4,
    fontWeight: '400',
    opacity: 0.85,
    fontFamily: 'Geist',
  },
  headerCenterRow: {
    position: 'absolute',
    top: verticalScale(54),
    left: 0,
    right: 0,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 1,
  },
  headerTitle: {
    color: '#fff',
    fontSize: moderateScale(28),
    fontWeight: 'medium',
    marginRight: 10,
    letterSpacing: 0.2,
    fontFamily: 'Geist',
  },
  badge: {
    borderWidth: 1.5,
    borderRadius: 99,
    paddingHorizontal: 10,
    paddingVertical: 2,
    backgroundColor: 'rgba(11,11,40,0.7)',
    marginLeft: 0,
  },
  badgeText: {
    fontSize: moderateScale(10),
    fontWeight: 'medium',
    fontFamily: 'Geistmono',
  },
  headerStatsRow: {
    position: 'absolute',
    bottom: verticalScale(12),
    left: 0,
    right: 0,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 0,
  },
  headerStat: {
    color: '#fff',
    fontSize: moderateScale(12),
    fontWeight: 'regular',
    opacity: 0.7,
    marginHorizontal: 4,
    fontFamily: 'Geist',
  },
  headerDot: {
    color: '#fff',
    fontSize: moderateScale(13),
    opacity: 0.5,
    marginHorizontal: 4,
    marginBottom: 1,
    fontFamily: 'Geist',
  },
  chaptersRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: verticalScale(18),
    marginBottom: verticalScale(8),
    paddingHorizontal: scale(16),
  },
  chaptersTitle: {
    color: '#fff',
    fontSize: moderateScale(22),
    fontWeight: 'medium',
    fontFamily: 'Geist',
  },
  filterBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#000000',
    borderRadius: 18,
    borderColor: '#262626',
    paddingHorizontal: 16,
    paddingVertical: 6,
  },
  filterBtnText: {
    color: '#fff',
    fontSize: moderateScale(15),
    fontWeight: '500',
    fontFamily: 'Geist',
  },
  listBg: {
    flex: 1,
    backgroundColor: "#181C29",
    borderTopLeftRadius: 0,
    borderTopRightRadius: 0,
    paddingTop: 0,
  },
  chapterList: {
    paddingHorizontal: scale(10),
    paddingBottom: verticalScale(20),
    paddingTop: 0,
  },
  chapterCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#000000',
    borderRadius: 14,
    paddingVertical: verticalScale(16),
    paddingHorizontal: scale(16),
    marginBottom: verticalScale(16),
    borderWidth: 1,
    borderColor: '#262626',
    paddingLeft: scale(28),
    shadowColor: '#000',
    shadowOpacity: 0.10,
    shadowRadius: 6,
    shadowOffset: { width: 0, height: 2 },
  },
  chapterNumCircle: {
    width: 32,
    height: 32,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#444',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: scale(14),
    backgroundColor: '#000000',
    position: 'absolute',
    padding: 4,
    left: -scale(8),
  },
  chapterNumText: {
    color: '#fff',
    fontSize: moderateScale(15),
    fontWeight: '500',
  },
  chapterCardContent: {
    flex: 1,
    flexDirection: 'column',
    justifyContent: 'center',
  },
  chapterCardTitle: {
    color: '#fff',
    fontSize: moderateScale(17),
    fontWeight: '500',
    marginBottom: 4,
    letterSpacing: 0.1,
    fontFamily: 'Geist',
  },
  chapterCardInfoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 0,
  },
  chapterCardInfo: {
    color: '#aaa',
    fontSize: moderateScale(12),
    marginRight: 10,
    fontWeight: '400',
    fontFamily: 'Geist',
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
});
