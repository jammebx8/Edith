import React, { useState, useRef } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  Image,
  Modal,
  Linking,
  Dimensions,
  Platform,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import imagepath from '@/src/constants/imagepath';
import { supabase } from "../../src/utils/supabase"; // adjust the import path as needed


const { width: SCREEN_WIDTH } = Dimensions.get('window');

const socialMediaLinks = [
  {
    label: 'Instagram',
    icon: require('../../src/assets/images/instagram 1.png'),
    url: 'https://www.instagram.com/rookie_ai.2006?igsh=ajB6YXRnNnJ4OGZ2',
  },
  {
    label: 'LinkedIn',
    icon: require('../../src/assets/images/linkedin (2) 1.png'),
    url: 'https://www.linkedin.com/in/dhruv-pathak-437a56365/',
  },
  {
    label: 'Reddit',
    icon: require('../../src/assets/images/reddit 3.png'),
    url: 'https://www.reddit.com/u/Possible_Loss4995/s/pcBd7G86Ic',
  },
  {
    label: 'Discord',
    icon: require('../../src/assets/images/discord 1.png'),
    url: 'https://discord.gg/snh7kFPV',
  },
];

const chaptersData = {
  Physics: [
    { title: "Units and Measurements.", questions: 90, playlist: "https://www.youtube.com/watch?v=D_rUfEM4dTE&list=PLxb0SzPSaqZ4zV2ftv64MaL7ObQCG6a-6" },
    { title: "Kinematics.", questions: 70, playlist: "https://www.youtube.com/watch?v=yhFzjaUAdeo&list=PLxb0SzPSaqZ6LMU4Rztz3yA8yBbd2UUt4" },
    { title: "Laws of Motion.", questions: 90, playlist: "https://www.youtube.com/watch?v=INZqSEouxCY&list=PLxb0SzPSaqZ7x5iGKofjH8BGnsgXP65RT" },
    { title: "Work, Energy, and Power.", questions: 80, playlist: "https://www.youtube.com/watch?v=4pld8yj68vs&list=PLxb0SzPSaqZ5tSjiht1Lz5-QzERPGi1KI" },
    { title: "Rotational Motion.", questions: 90, playlist: "https://www.youtube.com/watch?v=R3-6NlNnaMs&list=PLxb0SzPSaqZ4RJbNiRcBafYSf_QOVQ6FD" },
    { title: "Gravitation.", questions: 70, playlist: "https://www.youtube.com/watch?v=X7rNZWs7zjk&list=PLxb0SzPSaqZ66IFag0KJ2z7ZfSE1nnErI" },
    { title: "Properties of Solids and Liquids.", questions: 80, playlist: "https://www.youtube.com/watch?v=GacgTcykZjY&list=PLxb0SzPSaqZ42kmbKPGQ4koK88Z7ht_EP&index=8" },
    { title: "Thermodynamics.", questions: 90, playlist: "https://www.youtube.com/watch?v=GacgTcykZjY&list=PLxb0SzPSaqZ42kmbKPGQ4koK88Z7ht_EP&index=8" },
    { title: "Behaviour of Perfect Gas and Kinetic Theory.", questions: 90, playlist: "https://www.youtube.com/watch?v=GacgTcykZjY&list=PLxb0SzPSaqZ42kmbKPGQ4koK88Z7ht_EP&index=8" },
    { title: "Oscillations and Waves.", questions: 90, playlist: "https://www.youtube.com/watch?v=2QeOSndOGVM&list=PLxb0SzPSaqZ5dBN_ul6VREQ_tp2EaEMH_" },
    { title: "Electrostatics.", questions: 80, playlist: "https://www.youtube.com/watch?v=yw1Ng3G1cnw&list=PLxb0SzPSaqZ582pW_hNhCv-pf9tObGnkl" },
    { title: "Current Electricity.", questions: 90, playlist: "https://www.youtube.com/watch?v=urajWFI7fxg&list=PLxb0SzPSaqZ6-QbUMrNn_M9YfcDJts6cX" },
    { title: "Magnetic Effects of Current and Magnetism.", questions: 80, playlist: "https://www.youtube.com/watch?v=DHeOgUHMe34&list=PLxb0SzPSaqZ5TdbhPLtTxuUISwr97ivIx" },
    { title: "Electromagnetic Induction and Alternating Currents.", questions: 80, playlist: "https://www.youtube.com/watch?v=HDN2Wcj61pU&list=PLxb0SzPSaqZ72yyiW7WWCjF8uvTsVxsH9" },
    { title: "Electromagnetic Waves.", questions: 90, playlist: "https://www.youtube.com/watch?v=GoEix5kiLzI&list=PLxb0SzPSaqZ5dbymq7QUsbNI3w4xalQfe" },
    { title: "Optics.", questions: 90, playlist: "https://www.youtube.com/watch?v=NivVrWO60g8&list=PLxb0SzPSaqZ7EqCrN8lcEhA-PK8Kaaz_B" },
    { title: "Dual Nature of Matter and Radiation.", questions: 70, playlist: "https://www.youtube.com/watch?v=nKKvdMluLW8&list=PLxb0SzPSaqZ5tyBaUrbHDwAarvxf0TVns&index=3" },
    { title: "Atoms and Nuclei.", questions: 80, playlist: "https://www.youtube.com/watch?v=nKKvdMluLW8&list=PLxb0SzPSaqZ5tyBaUrbHDwAarvxf0TVns&index=3" },
    { title: "Semiconductors", questions: 70, playlist: "https://www.youtube.com/watch?v=aV2NU2mz6-E" },
  ],
  Chemistry: [
    { title: "Some Basic Concepts of Chemistry.", questions: 90, playlist: "https://www.youtube.com/watch?v=2e7RwbYbBQI&list=PLnG6YW15b0oSDTkPf9xR4gjQTPcOyLBfS" },
    { title: "Structure of Atom.", questions: 80, playlist: "https://www.youtube.com/watch?v=iN0QXOaxDE0&list=PLnG6YW15b0oSDTkPf9xR4gjQTPcOyLBfS&index=2" },
    { title: "Classification of Elements and Periodicity in Properties.", questions: 80, playlist: "https://www.youtube.com/watch?v=HMlidkHBaTA&list=PLnG6YW15b0oSDTkPf9xR4gjQTPcOyLBfS&index=3" },
    { title: "Chemical Bonding and Molecular Structure.", questions: 90, playlist: "https://www.youtube.com/watch?v=u1qLcKEfZvg&list=PLnG6YW15b0oSDTkPf9xR4gjQTPcOyLBfS&index=4" },
    { title: "Thermodynamics..", questions: 100, playlist: "https://www.youtube.com/watch?v=0Pts58MQHsg&list=PLnG6YW15b0oSDTkPf9xR4gjQTPcOyLBfS&index=6" },
    { title: "Equilibrium.", questions: 80, playlist: "https://www.youtube.com/watch?v=sKGqkXkjfac&list=PLnG6YW15b0oSDTkPf9xR4gjQTPcOyLBfS&index=7" },
    { title: "Redox Reactions.", questions: 60, playlist: "https://www.youtube.com/watch?v=JO1pJyeok24&list=PLnG6YW15b0oSDTkPf9xR4gjQTPcOyLBfS&index=10" },
    { title: "p-Block Elements.", questions: 80, playlist: "https://www.youtube.com/watch?v=rwU3Ep8bMqI&list=PLnG6YW15b0oSDTkPf9xR4gjQTPcOyLBfS&index=11" },
    { title: "Organic Chemistry – Some Basic Principles and Techniques.", questions: 80, playlist: "https://www.youtube.com/watch?v=7saHqV3ApaU&list=PLnG6YW15b0oSDTkPf9xR4gjQTPcOyLBfS&index=8" },
    { title: "Hydrocarbons.", questions: 70, playlist: "https://www.youtube.com/watch?v=8NoCq125BVo&list=PLnG6YW15b0oSDTkPf9xR4gjQTPcOyLBfS&index=9" },
    { title: "Coordination Compounds.", questions: 80, playlist: "https://www.youtube.com/watch?v=Bgs30qj1CIE" },
    { title: "Haloalkanes and Haloarenes.", questions: 80, playlist: "https://www.youtube.com/watch?v=_pJfRgnDwKQ" },
    { title: "Aldehydes, Ketones and Carboxylic Acids.", questions: 80, playlist: "https://www.youtube.com/watch?v=lWc9t2BA68g" },
    { title: "Biomolecules.", questions: 80, playlist: "https://www.youtube.com/watch?v=X-4tRJlzqOU" },
  ],
  Maths: [
    { title: "Sets, Relations, and Functions.", questions: 80, playlist: "https://www.youtube.com/watch?v=oZ1_FrxiXao&list=PLnG6YW15b0oROKNSFhi6GIzGaRtIe0yFD&index=8" },
    { title: "Quadratic Equations.", questions: 70, playlist: "https://www.youtube.com/watch?v=xfljVBVyjfs&list=PLnG6YW15b0oROKNSFhi6GIzGaRtIe0yFD&index=3" },
    { title: "Complex Numbers.", questions: 80, playlist: "https://www.youtube.com/watch?v=IVfPtU6siow&list=PLnG6YW15b0oROKNSFhi6GIzGaRtIe0yFD&index=27" },
    { title: "Matrices and Determinants.", questions: 80, playlist: "https://www.youtube.com/watch?v=XL63EGKUyA4&list=PLnG6YW15b0oROKNSFhi6GIzGaRtIe0yFD&index=5" },
    { title: "Permutations and Combinations.", questions: 80, playlist: "https://www.youtube.com/watch?v=I8UUAC5gXU8&list=PLnG6YW15b0oROKNSFhi6GIzGaRtIe0yFD&index=21" },
    { title: "Binomial Theorem and its Simple Applications.", questions: 80, playlist: "https://www.youtube.com/watch?v=ERz6HqgeWVg&list=PLnG6YW15b0oROKNSFhi6GIzGaRtIe0yFD&index=4" },
    { title: "Sequences and Series.", questions: 80, playlist: "https://www.youtube.com/watch?v=dRNJY4ZElLg&list=PLnG6YW15b0oROKNSFhi6GIzGaRtIe0yFD&index=3" },
    { title: "Limit, Continuity, and Differentiability.", questions: 80, playlist: "https://www.youtube.com/watch?v=Fj6dvUj13GE&list=PLnG6YW15b0oROKNSFhi6GIzGaRtIe0yFD&index=9" },
    { title: "Integral Calculus.", questions: 80, playlist: "https://www.youtube.com/watch?v=6An_ozEdE6w&list=PLnG6YW15b0oROKNSFhi6GIzGaRtIe0yFD&index=14" },
    { title: "Differential Equations.", questions: 80, playlist: "https://www.youtube.com/watch?v=L-cUGsQnuvU&list=PLnG6YW15b0oROKNSFhi6GIzGaRtIe0yFD&index=17" },
    { title: "Coordinate Geometry.", questions: 80, playlist: "https://www.youtube.com/watch?v=6VjZMGdWkGw&list=PLnG6YW15b0oROKNSFhi6GIzGaRtIe0yFD&index=24" },
    { title: "Three Dimensional Geometry.", questions: 80, playlist: "https://www.youtube.com/watch?v=y_AS39Mz5Ho&list=PLnG6YW15b0oROKNSFhi6GIzGaRtIe0yFD&index=19" },
    { title: "Vector Algebra.", questions: 80, playlist: "https://www.youtube.com/watch?v=mDPvJbb9gn4&list=PLnG6YW15b0oROKNSFhi6GIzGaRtIe0yFD&index=18" },
    { title: "Trigonometry.", questions: 80, playlist: "https://www.youtube.com/watch?v=uyjwlKRcrCI&list=PLnG6YW15b0oROKNSFhi6GIzGaRtIe0yFD&index=13" },
    { title: "Probability.", questions: 80, playlist: "https://www.youtube.com/watch?v=sYTW-mvxcOk&list=PLnG6YW15b0oROKNSFhi6GIzGaRtIe0yFD&index=22" },
    { title: "Statistics.", questions: 80, playlist: "https://www.youtube.com/watch?v=njcdN_-XPqc&list=PLnG6YW15b0oROKNSFhi6GIzGaRtIe0yFD&index=20" },
  ]
};

const formulaCardColors = [
  '#2374FF', '#6523FF', '#F2005D', '#E9A506', '#008E40', '#008D7F', '#A100EC', '#F26B83'
];

// Thumbnails per subject and chapter (provide unique images; fallback to generic if needed)
const videoThumbs = {
  Physics: [
    require('../../src/assets/images/physics1.jpg'),
    require('../../src/assets/images/physics2.jpg'),
    require('../../src/assets/images/physics3.jpg'),
    require('../../src/assets/images/physics4.jpg'),
    require('../../src/assets/images/physics5.jpg'),
    require('../../src/assets/images/physics6.jpg'),
    require('../../src/assets/images/physics7.jpg'),
    require('../../src/assets/images/physics8.jpg'),
    require('../../src/assets/images/physics9.jpg'),
    require('../../src/assets/images/physics10.jpg'),
    require('../../src/assets/images/physics11.jpg'),
    require('../../src/assets/images/physics12.jpg'),
    require('../../src/assets/images/physics13.jpg'),
    require('../../src/assets/images/physics14.jpg'),
    require('../../src/assets/images/physics15.jpg'),
    require('../../src/assets/images/physics16.jpg'),
    require('../../src/assets/images/physics17.jpg'),
    require('../../src/assets/images/physics18.jpg'),
    require('../../src/assets/images/physics19.jpg'),
  ],
  Chemistry: [
    require('../../src/assets/images/chem1.jpg'),
     require('../../src/assets/images/chem2.jpg'),
      require('../../src/assets/images/chem3.jpg'),
       require('../../src/assets/images/chem4.jpg'),
        require('../../src/assets/images/chem5.jpg'),
         require('../../src/assets/images/chem6.jpg'),
          require('../../src/assets/images/chem7.jpg'),
           require('../../src/assets/images/chem8.jpg'),
            require('../../src/assets/images/chem9.jpg'),
             require('../../src/assets/images/chem10.jpg'),
              require('../../src/assets/images/chem11.jpg'),
               require('../../src/assets/images/chem12.jpg'),
                require('../../src/assets/images/chem13.jpg'),
                 require('../../src/assets/images/chem14.jpg'),

  ],
  Maths: [
    require('../../src/assets/images/maths1.jpg'),
     require('../../src/assets/images/maths2.jpg'),
      require('../../src/assets/images/maths3.jpg'),
       require('../../src/assets/images/maths4.jpg'),
        require('../../src/assets/images/maths5.jpg'),
         require('../../src/assets/images/maths6.jpg'),
          require('../../src/assets/images/maths7.jpg'),
           require('../../src/assets/images/maths8.jpg'),
            require('../../src/assets/images/maths9.jpg'),
             require('../../src/assets/images/maths10.jpg'),
              require('../../src/assets/images/maths11.jpg'),
               require('../../src/assets/images/maths12.jpg'),
                require('../../src/assets/images/maths13.jpg'),
                 require('../../src/assets/images/maths14.jpg'),
                  require('../../src/assets/images/maths15.jpg'),
                   require('../../src/assets/images/maths16.jpg'),
  ]
};

export default function HomeScreen() {
  const [selectedCardTab, setSelectedCardTab] = useState('Physics');
  const [selectedStudyTab, setSelectedStudyTab] = useState('Physics');
  const [modalVisible, setModalVisible] = useState(false);
  const [modalChapter, setModalChapter] = useState(null);
  const [showAllVideos, setShowAllVideos] = useState(false);

  // Fade effect for horizontal scroll
  const formulaCardsScrollView = useRef(null);

  // Get chapters for selected subject
  const formulaChapters = chaptersData[selectedCardTab] || [];
  const studyChapters = chaptersData[selectedStudyTab] || [];
  const studyThumbs = videoThumbs[selectedStudyTab] || [];

  // Limit to 3 rows (6 videos, since 2 per row), or show all
  const VIDEOS_PER_ROW = 2;
  const ROWS_TO_SHOW = 3;
  const initialCount = VIDEOS_PER_ROW * ROWS_TO_SHOW;
  const displayStudyChapters = showAllVideos ? studyChapters : studyChapters.slice(0, initialCount);
  
  

  return (
    <View style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        {/* All content except footer gets horizontal padding */}
        <View style={styles.paddedContent}>
          {/* Quick Formula Cards */}
          <Text style={styles.sectionTitle}>Quick Formula Cards</Text>
          <View style={styles.cardTabsContainer}>
            <View style={styles.tabRow}>
              {['Physics', 'Maths', 'Chemistry'].map(tab => (
                <TouchableOpacity
                  key={tab}
                  style={[styles.tabBtn, selectedCardTab === tab && styles.tabBtnActive]}
                  onPress={() => setSelectedCardTab(tab)}
                >
                  <Text style={[styles.tabBtnText, selectedCardTab === tab && styles.tabBtnTextActive]}>{tab}</Text>
                </TouchableOpacity>
              ))}
            </View>
            <View style={{ flexDirection: 'row', alignItems: 'center' }}>
              <ScrollView
                horizontal
                ref={formulaCardsScrollView}
                showsHorizontalScrollIndicator={false}
                contentContainerStyle={styles.cardsRow}
              >
                {formulaChapters.map((chapter, index) => {
                  const bgColor = formulaCardColors[index % formulaCardColors.length];
                  return (
                    <TouchableOpacity
                      key={chapter.title}
                      activeOpacity={0.92}
                      style={[styles.formulaCard, { backgroundColor: bgColor }]}
                      onPress={() => {
                        setModalChapter(chapter);
                        setModalVisible(true);
                      }}
                    >
                      <Image
                        source={require('../../src/assets/images/Dotted.png')}
                        style={styles.formulaCardOverlay}
                        pointerEvents="none"
                      />
                      <Text
                        style={styles.formulaCardTitle}
                        numberOfLines={1}
                        ellipsizeMode="tail"
                      >
                        {chapter.title.replace(/\.$/, '')}
                      </Text>
                      <View style={styles.cardFooterRow}>
                        <Image source={require('../../src/assets/images/copy.png')} style={styles.cardIcon} />
                        <Text style={styles.cardCount}>{chapter.questions}</Text>
                        <View style={styles.cardArrowBtn}>
                          <Image source={imagepath.arrow} style={styles.cardArrowImg} />
                        </View>
                      </View>
                    </TouchableOpacity>
                  );
                })}
              </ScrollView>
              <View pointerEvents="none" style={styles.formulaFadeBox}>
                <Image
                  source={require('../../src/assets/images/Fade007.png')}
                  style={styles.formulaFadeImg}
                  resizeMode="stretch"
                />
              </View>
            </View>
          </View>

          {/* Modal for formula card */}
          <Modal
            visible={modalVisible}
            animationType="fade"
            transparent
            onRequestClose={() => setModalVisible(false)}
          >
            <View style={styles.fullScreenModalOverlay}>
              <View style={styles.fancyModalBox}>
                <View style={styles.fancyModalHeader}>
                  <Text style={styles.fancyModalTitle} numberOfLines={2}>
                    {modalChapter?.title?.replace(/\.$/, '')}
                  </Text>
                  <TouchableOpacity onPress={() => setModalVisible(false)}>
                    <Text style={styles.fancyModalCloseX}>×</Text>
                  </TouchableOpacity>
                </View>
                <View style={styles.fancyModalLineRow}>
                  <View style={styles.fancyModalLineShort} />
                  <View style={styles.fancyModalLineLong} />
                </View>
                <View style={styles.fancyModalContent} />
              </View>
            </View>
          </Modal>

          {/* Study Content */}
          <Text style={styles.sectionTitle}>Study Content</Text>
          <View style={styles.cardTabsContainer}>
            <View style={styles.tabRow}>
              {['Physics', 'Maths', 'Chemistry'].map(tab => (
                <TouchableOpacity
                  key={tab}
                  style={[
                    styles.tabBtn,
                    selectedStudyTab === tab && styles.tabBtnActive,
                  ]}
                  onPress={() => {
                    setSelectedStudyTab(tab);
                    setShowAllVideos(false);
                  }}
                >
                  <Text
                    style={[
                      styles.tabBtnText,
                      selectedStudyTab === tab && styles.tabBtnTextActive,
                    ]}
                  >
                    {tab}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>

            <View style={styles.studyGrid}>
              {displayStudyChapters.map((chapter, idx) => {
                const thumb = studyThumbs[idx % studyThumbs.length] || studyThumbs[0];
                return (
                  <TouchableOpacity
                    key={chapter.title}
                    style={styles.studyCard}
                    activeOpacity={0.92}
                    onPress={() => {
                      if (chapter.playlist) {
                        Linking.openURL(chapter.playlist);
                      }
                    }}
                  >
                    <Image
                      source={thumb}
                      style={styles.studyThumb}
                      resizeMode="cover"
                    />
                    <View style={styles.playBtn}>
                      <Image
                        source={require('../../src/assets/images/youtube_play.png')}
                        style={styles.playIcon}
                      />
                    </View>
                    <Text style={styles.studyCardTitle} numberOfLines={2}>
                      {chapter.title.replace(/\.$/, '')}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </View>

            {studyChapters.length > initialCount && (
              <TouchableOpacity
                style={styles.showMoreBtn}
                onPress={() => setShowAllVideos(!showAllVideos)}
              >
                <Text style={styles.showMoreBtnText}>
                  {showAllVideos ? 'Show Less' : 'Show More'}
                </Text>
              </TouchableOpacity>
            )}
          </View>

          {/* Invite Friends */}
          <LinearGradient
            colors={['#1C9980', '#2E5BFF']}
            start={{ x: 1, y: 1 }}
            end={{ x: 1, y: 0 }}
            style={styles.inviteBox}
          >
            <Text style={styles.inviteTitle}>Study with your friends!</Text>
            <Text style={styles.inviteSubtitle}>
              Invite your friends to Rookie app to learn together.
            </Text>
            <Image
              source={require('../../src/assets/images/invite_friends.png')}
              style={styles.inviteImage}
              resizeMode="contain"
            />
            <TouchableOpacity style={styles.inviteBtn}>
              <Text style={styles.inviteBtnText}>Invite</Text>
            </TouchableOpacity>
          </LinearGradient>

          {/* Social Media */}
          <View style={styles.socialBox}>
            <Text style={styles.socialTitle}>We're on social media</Text>
            <Text style={styles.socialSub}>
              Follow us and share with your friends.
            </Text>
            <Image
              source={require('../../src/assets/images/social_illustration.png')}
              style={styles.socialImage}
              resizeMode="contain"
            />
            <View style={styles.socialGrid}>
              {socialMediaLinks.map((item, idx) => (
                <TouchableOpacity
                  key={item.label}
                  style={styles.socialBtn}
                  onPress={() => Linking.openURL(item.url)}
                  activeOpacity={0.85}
                >
                  <Image source={item.icon} style={styles.socialIcon} />
                  <Text style={styles.socialBtnText}> {item.label}</Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>
        </View>
 
        {/* Footer: edge-to-edge in its own container */}
        <View style={styles.footerContainer}>
          <Image
            source={require('../../src/assets/images/featpicsss.png')}
            style={styles.footerImage}
            resizeMode="cover"
          />
        </View>
      </ScrollView>
    </View>
  );
}

const CARD_WIDTH = 128;
const CARD_HEIGHT = 160;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#101523',
    paddingHorizontal: 0, // Remove horizontal padding so footer can go edge to edge
    
  },
  scrollContent: {
    paddingBottom: 20,
  },
  sectionTitle: {
    color: '#fff',
    fontSize: 19,
    fontWeight: '600',
   
    marginTop: 18,
    marginBottom: 12,
    marginLeft: 16,
    fontFamily: 'Geist',
  },
  cardTabsContainer: {
    backgroundColor: '#1D2939',
    borderRadius: 18,
    marginHorizontal: 8,
    paddingVertical: 14,
    marginBottom: 18,
    paddingHorizontal: 16,
  },
  tabRow: {
    flexDirection: 'row',
    marginBottom: 15,
    justifyContent: 'flex-start',
  },
  tabBtn: {
    backgroundColor: '#101828',
    borderRadius: 18,
    paddingVertical: 7,
    paddingHorizontal: 18,
    marginRight: 8,
  },
  tabBtnActive: {
    backgroundColor: '#fff',
  },
  tabBtnText: {
    color: '#fff',
    fontWeight: '600',
    fontSize: 16,
    fontFamily: 'Geist',
  },
  tabBtnTextActive: {
    color: '#000000',
  },
  cardsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 4,
  
  },
  formulaCard: {
    width: CARD_WIDTH,
    height: CARD_HEIGHT,
    borderRadius: 14,
    padding: 10,
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    overflow: 'hidden',
    opacity: 1,
    marginRight: 12,
  },
  formulaCardTitle: {
    color: '#fff',
    fontSize: 15,
    fontWeight: '600',
    marginBottom: 10,
    width: 110,
    minHeight: 34,
    maxWidth: 110,
    textAlign: 'left',
    flexShrink: 1,
    flexGrow: 0,
    flexWrap: 'nowrap',
    fontFamily: 'Geist',
  },
  cardFooterRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 12,
  },
  cardIcon: {
    width: 16,
    height: 16,
    marginRight: 5,
    tintColor: '#fff',
  },
  cardCount: {
    color: '#fff',
    fontSize: 13,
    marginRight: 10,
    fontFamily: 'Geist',
  },
  cardArrowBtn: {
    width: 46,
    height: 30,
    borderRadius: 16,
    backgroundColor: '#fff',
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: 18,
    borderWidth: 1,
    borderColor: '#E8E8E8',
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.11,
    shadowRadius: 6,
    elevation: 3,
  },
  cardArrowImg: {
    width: 18,
    height: 18,
    resizeMode: 'contain',
  },
  formulaCardOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    width: CARD_WIDTH,
    height: CARD_HEIGHT,
    zIndex: 2,
    opacity: 1,
    pointerEvents: 'none',
  },
  // Fade effect overlay at right end of formula card row
  formulaFadeBox: {
    width: 46,
    height: CARD_HEIGHT,
    position: 'absolute',
    right: 0,
    
    top: 4,
    zIndex: 10,
    pointerEvents: 'none',
  },
  formulaFadeImg: {
    width: '100%',
    height: '100%',
    resizeMode: 'cover',
  },
  // Modal styles
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.45)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  // ... rest of your modal styles ...
  modalBox: {
    width: 300,
    
    backgroundColor: '#191C2A',
    borderRadius: 20,
    padding: 24,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOpacity: 0.18,
    shadowRadius: 24,
    elevation: 8,
  },
  modalTitle: {
    color: '#fff',
    fontSize: 20,
    fontWeight: '500',
    marginBottom: 8,
    textAlign: 'center',
    fontFamily: 'Geist',
  },
  modalSubtitle: {
    color: '#B5B5CA',
    fontSize: 15,
    marginBottom: 22,
    textAlign: 'center',
  },
  modalCloseBtn: {
    backgroundColor: '#fff',
    borderRadius: 8,
    paddingHorizontal: 34,
    paddingVertical: 10,
    marginTop: 8,
  },
  modalCloseBtnText: {
    color: '#181C28',
    fontWeight: '700',
    fontSize: 17,
    fontFamily: 'Geist',
  },
  // Study Content
  studyGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    gap: 8,
    paddingHorizontal: 2,
  },
  studyCard: {
    width: '47%',
    backgroundColor: 'transparent',
    borderRadius: 12,
    marginBottom: 13,
    overflow: 'hidden',
  },
  studyThumb: {
    width: '100%',
    height: 100,
    borderRadius: 12,
  },
  playBtn: {
    position: 'absolute',
    top: 36,
    left: '38%',
    width: 36,
    height: 36,
    borderRadius: 18,
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 2,
  },
  playIcon: {
    width: 36,
    height: 36,
  },
  studyCardTitle: {
    color: '#fff',
    fontSize: 13,
    fontWeight: 'medium',
    marginTop: 8,
    marginLeft: 2,
    marginBottom: 2,
    fontFamily: 'Geist',
  },
  // Show More Button
  showMoreBtn: {
    marginTop: 8,
    alignSelf: 'center',
    paddingVertical: 8,
    paddingHorizontal: 30,
    backgroundColor: '#fff',
    borderRadius: 18,
    marginBottom: 2,
    elevation: 2,
  },
  showMoreBtnText: {
    color: '#000000',
    fontWeight: '600',
    fontSize: 15,
    fontFamily: 'Geist',
  },
  // Invite friends
  inviteBox: {
    width: '100%',
    alignSelf: 'center',
    borderRadius: 18,
    marginTop: 18,
    marginBottom: 18,
    paddingTop: 18,
    paddingBottom: 18,
    paddingHorizontal: 6,
    backgroundColor: 'transparent',
    position: 'relative',
    overflow: 'hidden'
  },
  inviteTitle: {
    color: '#fff',
    fontWeight: '500',
    fontSize: 20,
    marginBottom: 4,
    marginLeft: 6,
    marginTop: 2,
    fontFamily: "Geist"
  },
  inviteSubtitle: {
    color: '#e5eaf7',
    fontSize: 14,
    marginLeft: 6,
    marginBottom: 13,
    marginTop: 0,
    fontWeight: '400',
    fontFamily: 'Geist',
  },
  inviteImage: {
    width: 400,
    height: 200,
    marginTop: 8,
    marginBottom: 16,
    alignSelf: 'center',
  },
  inviteBtn: {
    width: 350,
    height: 38,
    borderRadius: 8,
    backgroundColor: '#fff',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 0,
    marginBottom: 2,
    alignSelf: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.06,
    shadowRadius: 2,
    elevation: 1,
  },
  inviteBtnText: {
    color: '#222',
    fontWeight: '500',
    fontSize: 17,
    textAlign: 'center',
    fontFamily: 'Geist',
  },
  // Social Media
  socialBox: {
     width: '100%',
    alignSelf: 'center',
    borderRadius: 18,
    marginTop: 10,
    marginBottom: 18,
    backgroundColor: '#F05A24',
    alignItems: 'center',
    paddingTop: 18,
    paddingBottom: 18,
    paddingHorizontal: 8,
    elevation: 2,
  },
  socialTitle: {
    color: '#fff',
    fontWeight: '500',
    fontSize: 19,
    marginBottom: 2,
    marginTop: 2,
    textAlign: 'center',
    fontFamily: 'Geist',
  },
  socialSub: {
    color: '#fff',
    fontSize: 14,
    textAlign: 'center',
    marginBottom: 8,
    marginTop: 0,
    fontWeight: '400',
    fontFamily: 'Geist',
  },
  socialImage: {
    width: 400,
    height: 200,
    marginBottom: 6,
    marginTop: 3,
    alignSelf: 'center',
  },
  socialGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    width: 320,
    justifyContent: 'space-between',
    gap: 10,
    marginTop: 8,
  },
  socialBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    borderRadius: 8,
    paddingHorizontal: 18,
    height: 40,
    marginBottom: 8,
    width: 145,
    marginHorizontal: 0,
    justifyContent: 'flex-start',
  },
  socialIcon: {
    width: 28,
    height: 28,
    resizeMode: 'contain',
  },
  socialBtnText: {
    color: '#000',
    fontWeight: '700',
    fontSize: 15,
    fontFamily: 'Geist',
  },
  // Footer: make it edge-to-edge
  footerImage: {
    width: SCREEN_WIDTH,
    minWidth: '100%',
    maxWidth: '100%',
    height: 101,
    marginTop:20,
    marginBottom: 35,
    alignSelf: 'center',
  },
  // Modal: new styles for the modal based on the reference image
  fancyModalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.45)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  fullScreenModalOverlay: {
    position: 'absolute',
    top: 0, left: 0, right: 0, bottom: 0,
    width: '100%',
    height: '100%',
    backgroundColor: 'rgba(0,0,0,0.45)',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 9999,
  },

  fancyModalBox: {
    width: '100%',          // changed from fixed width to full width
    minHeight: '100%',      // changed from fixed minHeight to full height
    backgroundColor: '#0B111C',
    borderRadius: 0,        // remove border radius for edge-to-edge
    paddingTop: 18,
    paddingBottom: 18,
    paddingHorizontal: 0,
    alignItems: 'stretch',
    shadowColor: '#000',
    shadowOpacity: 0.18,
    shadowRadius: 24,
    elevation: 8,
    // Optionally: add flex properties to fill space
    flex: 1,
    justifyContent: 'flex-start',
  },
  fancyModalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    marginBottom: 6,
  },
  fancyModalTitle: {
    color: '#fff',
    fontSize: 20,
    fontWeight: '600',
    flex: 1,
    marginRight: 8,
    fontFamily: 'Geist',
  },
  fancyModalCloseX: {
    color: '#fff',
    fontSize: 28,
    fontWeight: '600',
    paddingHorizontal: 8,
    paddingVertical: 2,
    marginTop: -2,
    marginRight: -4,
    fontFamily: 'Geist',
  },
  fancyModalLineRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    marginBottom: 10,
  },
  fancyModalLineShort: {
    width: 28,
    height: 4,
    borderRadius: 2,
    backgroundColor: '#fff',
    marginRight: 6,
    marginTop: 0,
  },
  fancyModalLineLong: {
    flex: 1,
    height: 4,
    borderRadius: 2,
    backgroundColor: '#232D3B',
    borderStyle: 'dashed',
    borderWidth: 0,
    borderTopWidth: 3,
    borderColor: '#232D3B',
    marginTop: 0,
  },
  fancyModalContent: {
    flex: 1,
    backgroundColor: '#E8EAEE',
    marginHorizontal: 16,
    marginTop: 4,
    borderRadius: 18,
    minHeight: 550,
  },
    // New style for content wrapper
  paddedContent: {
    paddingHorizontal: 10,
  },
});