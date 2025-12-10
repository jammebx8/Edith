import React, { useEffect, useState } from "react";
import {
  StyleSheet,
  Text,
  View,
  TouchableOpacity,
  Image,
  Modal,
  ScrollView,
  StatusBar,
  Platform,
} from "react-native";
import { router } from "expo-router";
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useNavigation } from "@react-navigation/native";
import { scale, verticalScale, moderateScale } from "react-native-size-matters";

const simpleTermsContent = `
Terms and Conditions

1. Introduction
Welcome to OurApp! By using our services, you agree to comply with and be bound by the following terms.

2. Privacy Policy
We value your privacy. Your personal data is used only for providing and improving our services and will never be sold to third parties. See below for our privacy policy.

Privacy Policy

- We collect basic usage data to enhance your experience.
- We do not share your personal data with external parties except as required by law or for payment processing.

Shipping Policy

- All products and services are delivered digitally to the provided email or in-app. No physical shipments are made. For any issues, contact our support team.

Contact Us

For questions or support, please contact us at:
Email: dhruvgdscp@gmail.com

Cancellation and Refunds Policy

- You may cancel your order within 24 hours for a full refund, provided the digital service has not been fulfilled.
- Refunds will be processed to your original payment method within 7 business days.

By continuing, you accept these conditions.
`;

export default function TermsAgree() {
  const [loading, setLoading] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);
  const navigation = useNavigation();

  useEffect(() => {
    const checkOnboarded = async () => {
      const onboarded = await AsyncStorage.getItem('@user_onboarded');
      if (onboarded === 'true') {
        router.replace("/edith");
      }
    };
    checkOnboarded();
  }, []);
  
  const handleContinue = async () => {
    router.push("/Onboarding");
  };

  return (
    <> 
      <StatusBar barStyle="light-content" backgroundColor="#000000" />
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        keyboardShouldPersistTaps="handled"
        bounces={false}
      >
        <View style={styles.container}>
          <Image
            source={require("../../src/assets/images/logo.png")}
            style={styles.logo}
            resizeMode="contain"
          />
          <Text style={styles.heading}>Your Prep{"\n"}Made Easy</Text>
          <View style={styles.handContainer}>
            <Image
              source={require("../../src/assets/images/Hand.png")}
              style={styles.handImage}
              resizeMode="contain"
            />
            <TouchableOpacity
              style={[styles.continueButton, loading && styles.buttonDisabled]}
              onPress={handleContinue}
              disabled={loading}
              activeOpacity={0.8}
            >
              <Text style={styles.continueButtonText}>
                Continue
              </Text>
            </TouchableOpacity>
          </View>
          <View style={{ flex: 1 }} />
          <Text style={styles.termsText}>
            By continuing you'll agree to all of our{"\n"}
            <Text
              style={styles.link}
              onPress={() => setModalVisible(true)}
            >
              Terms & Conditions 
            </Text>
            .
          </Text>
        </View>
      </ScrollView>
      <Modal
        animationType="slide"
        transparent={true}
        visible={modalVisible}
        onRequestClose={() => setModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalView}>
            <ScrollView contentContainerStyle={styles.modalScrollContent}>
              <Text style={styles.modalTitle}>Policies and Terms</Text>
              <Text style={styles.modalText}>{simpleTermsContent}</Text>
              <TouchableOpacity
                style={styles.closeButton}
                onPress={() => setModalVisible(false)}
              >
                <Text style={styles.closeButtonText}>Close</Text>
              </TouchableOpacity>
            </ScrollView>
          </View>
        </View>
      </Modal>
    </>
  );
}

const styles = StyleSheet.create({
  background: {
    flex: 1,
    width: "100%",
    height: "100%",
    backgroundColor: "#000",
  },
  scrollContent: {
    flexGrow: 1,
    justifyContent: "center",
    backgroundColor: "#000",
  },
  container: {
    flex: 1,
    paddingTop: Platform.OS === "android" ? verticalScale(60) : verticalScale(80),
    alignItems: "center",
    justifyContent: "flex-start",
    paddingHorizontal: 0,
  },
  logo: {
    width: scale(100),
    height: verticalScale(60),
    marginBottom: verticalScale(10),
  },
  heading: {
    color: "#fff",
    fontSize: moderateScale(44),
    fontWeight: "bold",
    textAlign: "center",
    marginTop: verticalScale(10),
    lineHeight: moderateScale(48),
    fontFamily: 'Geist',
  },
  handContainer: {
    width: "100%",
    alignItems: "center",
  },
  handImage: {
    width: scale(300),
    height: verticalScale(265),
  },
  continueButton: {
    backgroundColor: "#fff",
    borderRadius: moderateScale(32),
    width: "90%",
    alignSelf: "center",
    marginBottom: verticalScale(12),
    paddingVertical: 0,
    paddingHorizontal: 0,
    height: verticalScale(48),
    justifyContent: "center",
    shadowColor: "#000",
    shadowOpacity: 0.08,
    shadowRadius: moderateScale(8),
    shadowOffset: { width: 0, height: 2 },
    elevation: 2,
  },
  buttonDisabled: {
    opacity: 0.6,
  },
  continueButtonText: {
    color: "#222",
    fontWeight: "bold",
    fontFamily: 'Geist',
    fontSize: moderateScale(20),
    textAlign: "center",
  },
  termsText: {
    color: "#aaa",
    fontSize: moderateScale(13),
    textAlign: "center",
    marginBottom: verticalScale(100),
    marginTop: verticalScale(2),
    lineHeight: moderateScale(18),
    fontFamily: 'Geist',
  },
  link: {
    color: "#3B82F6",
    textDecorationLine: "underline",
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.65)",
    justifyContent: "center",
    alignItems: "center",
    padding: 16,
  },
  modalView: {
    width: "100%",
    maxHeight: "80%",
    backgroundColor: "#fff",
    borderRadius: 16,
    padding: 20,
    shadowColor: "#000",
    shadowOpacity: 0.1,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 4 },
    elevation: 6,
  },
  modalScrollContent: {
    paddingBottom: 30,
  },
  modalTitle: {
    fontWeight: "bold",
    fontSize: moderateScale(20),
    marginBottom: 12,
    color: "#111",
    textAlign: "center",
  },
  modalText: {
    fontSize: moderateScale(14),
    color: "#333",
    lineHeight: moderateScale(18),
    marginBottom: 28,
    fontFamily: 'Geist',
    textAlign: "left",
    whiteSpace: "pre-line", // for web only, ignored on native
  },
  closeButton: {
    backgroundColor: "#3B82F6",
    borderRadius: 24,
    paddingVertical: 8,
    paddingHorizontal: 28,
    alignSelf: "center",
  },
  closeButtonText: {
    color: "#fff",
    fontWeight: "bold",
    fontSize: moderateScale(15),
  },
});