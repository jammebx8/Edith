import React from 'react';
import { View, Text, TouchableOpacity, Linking, StyleSheet, Alert, StatusBar } from 'react-native';

const PAYMENT_LINK = 'https://rzp.io/rzp/MefRQqc'; // Replace with your real link

const PaymentScreen: React.FC = () => {
  const handlePay = async () => {
    const supported = await Linking.canOpenURL(PAYMENT_LINK);
    if (supported) {
      Linking.openURL(PAYMENT_LINK);
    } else {
      Alert.alert('Error', 'Cannot open payment link');
    }
  };

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#0a0517" />
      <Text style={styles.title}>Get 1 Month Subscription</Text>
      <Text style={styles.price}>₹199 only</Text>

      <TouchableOpacity style={styles.button} onPress={handlePay}>
        <Text style={styles.buttonText}>Pay Now</Text>
      </TouchableOpacity>

      <Text style={styles.note}>Secure Razorpay Payment</Text>
    </View>
  );
};

export default PaymentScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0B0B28',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 24,
  },
  title: {
    fontFamily: 'Geist',
    fontSize: 24,
    color: '#FFFFFF',
    marginBottom: 10,
    fontWeight: '700',
  },
  price: {
    fontFamily: 'Geist',
    fontSize: 20,
    color: '#00FFAA',
    marginBottom: 30,
    fontWeight: '500',
  },
  button: {
    backgroundColor: '#00FFAA',
    paddingVertical: 14,
    paddingHorizontal: 40,
    borderRadius: 12,
    marginBottom: 20,
  },
  buttonText: {
    fontFamily: 'Geist',
    color: '#0B0B28',
    fontSize: 18,
    fontWeight: '700',
  },
  note: {
    fontFamily: 'Geist',
    fontSize: 12,
    color: '#888',
    marginTop: 10,
    fontWeight: '300',
  },
});
