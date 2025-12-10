import { Text, StyleSheet, TouchableOpacity } from 'react-native';
import React from 'react';
import { LinearGradient } from 'expo-linear-gradient';

const ButtonComp = ({ title, onPress }: any) => {
  return (
    <TouchableOpacity onPress={onPress} style={styles.wrapper}>
      <LinearGradient
        colors={["#D500F9", '#3B82F6']}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.button_container}
      >
        <Text style={styles.button_text}>{title}</Text>
      </LinearGradient>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  wrapper: {
    borderRadius: 30,
    overflow: 'hidden',
    marginVertical: 10,
  },
  button_container: {
    paddingVertical: 14,
    paddingHorizontal: 30,
    borderRadius: 30,
    alignItems: 'center',
    justifyContent: 'center',
  },
  button_text: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
});

export default ButtonComp;

