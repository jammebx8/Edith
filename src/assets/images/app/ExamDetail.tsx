import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, StatusBar } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { MaterialCommunityIcons, Ionicons } from '@expo/vector-icons';
import { scale, verticalScale, moderateScale } from 'react-native-size-matters';


// Static subject data for all exams
const examData = {
  "JEE Main": {
    subjects: [
      { name: "Physics", chapters: 19, questions: 1530, color: "#1E90FF", icon: "atom" },
      { name: "Chemistry", chapters: 14, questions: 1130, color: "#FFA500", icon: "flask" },
      { name: "Maths", chapters: 16, questions: 1270, color: "#D32F8D", icon: "calculator" },
    ]
  },




    "JEE Adv.": {
        subjects: [
        { name: "Physics", chapters: 19, questions: 1520, color: "#1E90FF", icon: "atom" },
        { name: "Chemistry", chapters: 14, questions: 1120, color: "#FFA500", icon: "flask" },
        { name: "Maths", chapters: 16, questions: 1270, color: "#D32F8D", icon: "calculator" },
        ]
    },




  "NEET": {
    subjects: [
      { name: "Physics", chapters: 28, questions: 4100, color: "#1E90FF", icon: "atom" },
      { name: "Chemistry", chapters: 30, questions: 3900, color: "#FFA500", icon: "flask" },
      { name: "Biology", chapters: 45, questions: 7300, color: "#32CD32", icon: "leaf" },
    ]
  }
};

const iconMap = {
  "atom": MaterialCommunityIcons,
  "flask": MaterialCommunityIcons,
  "calculator": Ionicons,
  "leaf": MaterialCommunityIcons,
};

export default function ExamDetail() {
  const { examName } = useLocalSearchParams();
  const data = examData[examName] || { subjects: [] };
  const totalChapters = data.subjects.reduce((sum, s) => sum + s.chapters, 0);
  const totalQuestions = data.subjects.reduce((sum, s) => sum + s.questions, 0);
const router = useRouter();
  return (
    <ScrollView style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#0a0517" />
          <View style={styles.headerRow}>
      <TouchableOpacity onPress={() => router.back()}  >
        <Ionicons name="arrow-back" size={28} color="white" />
      </TouchableOpacity>
        
      <Text style={styles.examTitle}>{examName}</Text>    </View>
      <Text style={styles.stats}>     {data.subjects.length}  Subjects   |   {totalQuestions} Questions</Text>

      {data.subjects.map((subject, index) => {
        const Icon = iconMap[subject.icon];
        return (
         <TouchableOpacity
  key={index}
  style={[styles.card, { borderLeftColor: subject.color }]}
  onPress={() =>
    router.push({
      pathname: "/chapterpage",
      params: {
        examName,
        subjectName: subject.name,
        subjectColor: subject.color,
        chapters: subject.chapters,
        questions: subject.questions,
      },
    })
  }
>

            <View style={styles.row}>
              <Icon name={subject.icon} size={24} color={subject.color} />
              <Text style={styles.subjectName}>{subject.name}   </Text>
            </View>
            <Text style={styles.subDetails}>{subject.chapters} Chapters   |   {subject.questions} Questions</Text>
          </TouchableOpacity>
        );
      })}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0B0B28',
    padding: scale(16),
       
  },

  stats: {
    fontSize: moderateScale(13),
    color: '#aaa',
    marginBottom: verticalScale(20),
  },
  card: {
    backgroundColor: '#161B3D',
    borderRadius: scale(12),
    padding: scale(14),
    marginBottom: verticalScale(15),
    borderLeftWidth: 5,
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 1, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 3,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  subjectName: {
    color: 'white',
    fontSize: moderateScale(18),
    fontWeight: '600',
    marginLeft: scale(12),
  },
  subDetails: {
    color: '#aaa',
    fontSize: moderateScale(13),
    marginTop: verticalScale(6),
  },
  headerRow: {
  flexDirection: 'row',
  alignItems: 'center',
  marginBottom: verticalScale(8),
paddingTop: verticalScale(20),
},
examTitle: {
  fontSize: moderateScale(22),
  color: 'white',
  fontWeight: 'bold',
  marginLeft: scale(12),
},


});


