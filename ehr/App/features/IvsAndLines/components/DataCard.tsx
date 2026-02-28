import React from 'react';
import { StyleSheet, View, Text, TextInput, Pressable } from 'react-native';

interface DataCardProps {
  badgeText: string;
  value?: string;
  onChangeText?: (text: string) => void;
  placeholder?: string;
  disabled?: boolean;
  onDisabledPress?: () => void;
}

const DataCard: React.FC<DataCardProps> = ({
  badgeText,
  value,
  onChangeText,
  placeholder = 'Enter details here...',
  disabled = false,
  onDisabledPress,
}) => {
  return (
    <View style={styles.card}>
      {/* Top Header Section: Badge + Line */}
      <View style={styles.headerRow}>
        <View style={styles.badge}>
          <Text style={styles.badgeText}>{badgeText}</Text>
        </View>
        <View style={styles.headerLine} />
      </View>

      {/* Input Section: Simulating the horizontal lines from the image */}
      <Pressable
        style={styles.inputContainer}
        onPress={() => {
          if (disabled && onDisabledPress) {
            onDisabledPress();
          }
        }}
      >
        <TextInput
          style={styles.input}
          value={value}
          onChangeText={onChangeText}
          placeholder={placeholder}
          placeholderTextColor="#D1D1D1"
          multiline={true}
          blurOnSubmit={true}
          editable={!disabled}
          pointerEvents={disabled ? 'none' : 'auto'}
        />
        {/* Visual guide lines to match the UI in the image */}
        <View style={styles.guideLine} />
        <View style={styles.guideLine} />
        <View style={styles.guideLine} />
      </Pressable>
    </View>
  );
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: '#FFF9F0', // Light cream background
    borderRadius: 18,
    padding: 16,
    marginBottom: 15,
    // Subtle shadow
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 2,
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
  },
  badge: {
    backgroundColor: '#FCE69B', // Soft yellow badge
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 10,
    marginRight: 10,
  },
  badgeText: {
    color: '#CC9D00', // Dark gold/mustard text
    fontSize: 12,
    fontWeight: '800',
    letterSpacing: 0.5,
  },
  headerLine: {
    flex: 1,
    height: 1,
    backgroundColor: '#F2E8D5', // Very faint line next to badge
  },
  inputContainer: {
    marginTop: 5,
    minHeight: 80,
  },
  input: {
    fontSize: 15,
    color: '#444',
    paddingVertical: 0,
    textAlignVertical: 'top',
    lineHeight: 24, // Matches the spacing of guide lines
    zIndex: 1,
  },
  guideLine: {
    height: 1,
    backgroundColor: '#F2E8D5',
    marginTop: 20, // Creates the "ruled paper" look from your image
  },
});

export default DataCard;
