import React from 'react';
import { StyleSheet, View, Text, Platform } from 'react-native';

const THEME_GREEN = '#1B5E20';

export default function CalendarScreen() {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Calendar</Text>
      {/* You can integrate react-native-calendars here later */}
      <View style={styles.emptyContent}>
        <Text style={styles.placeholderText}>No scheduled appointments for today.</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    paddingHorizontal: 40,
    paddingTop: Platform.OS === 'ios' ? 20 : 40,
  },
  title: {
    fontSize: 32,
    fontFamily: Platform.OS === 'ios' ? 'Georgia' : 'serif',
    color: THEME_GREEN,
    fontWeight: 'semibold',
    marginBottom: 35,
  },
  emptyContent: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  placeholderText: {
    color: '#999',
    fontSize: 16,
  }
});