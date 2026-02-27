import React from 'react';
import { View, Text, TextInput, StyleSheet } from 'react-native';

interface Props {
  label: string;
  value: string;
  onChangeText: (v: string) => void;
}

const MedicalReconCard = ({ label, value, onChangeText }: Props) => (
  <View style={styles.cardContainer}>
    <View style={styles.labelPill}>
      <Text style={styles.labelText}>{label}</Text>
    </View>
    <TextInput 
      style={styles.underlinedInput}
      value={value}
      onChangeText={onChangeText}
      placeholder="________________________________________"
      placeholderTextColor="#EEE"
    />
  </View>
);

const styles = StyleSheet.create({
  cardContainer: { backgroundColor: '#FFFAED', borderRadius: 20, padding: 15, marginBottom: 12 },
  labelPill: { backgroundColor: '#FFEDC1', alignSelf: 'flex-start', paddingHorizontal: 12, paddingVertical: 4, borderRadius: 15, marginBottom: 8 },
  labelText: { color: '#EDB62C', fontWeight: 'bold', fontSize: 11 },
underlinedInput: { color: '#333', fontSize: 14, paddingVertical: 5,borderBottomWidth: 0 } 
});

export default MedicalReconCard;