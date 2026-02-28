// File: src/screens/IvsAndLinesScreen.tsx (TSX for main screen)
import React from 'react';
import {
  StyleSheet,
  View,
  Text,
  TextInput,
  ScrollView,
  TouchableOpacity,
  Image,
} from 'react-native';
import useIvsAndLinesData from '../hook/useIvsAndLinesData.js'; // Assuming same directory for simplicity
import DataCard from '../components/DataCard';

// Prop types for the BottomNavBar (internal to this file for now)
type BottomNavProps = {
  activeIndex: number;
  onNavPress: (index: number) => void;
};

// Bottom Navigation component (inline and simplified)
const BottomNavBar: React.FC<BottomNavProps> = ({
  activeIndex,
  onNavPress,
}) => {
  const icons = [
    { name: 'home-outline', label: 'Home' },
    { name: 'search-outline', label: 'Search' },
    { name: 'add-person', label: 'Add' }, // Special central icon
    { name: 'apps-outline', label: 'Apps' },
    { name: 'calendar-outline', label: 'Calendar' },
  ];

  const renderIcon = (index: number, iconName: string) => {
    // In a real app, use a proper icon library like expo/vector-icons or react-native-vector-icons
    // Let's use placeholder Views that look correct.
    if (iconName === 'add-person') {
      return (
        <View
          style={[
            styles.centralIcon,
            activeIndex === index && styles.activeCentralIcon,
          ]}
        >
          <Text style={[styles.iconText, styles.centralIconText]}>+</Text>
          <Text style={[styles.iconText, styles.centralIconSubText]}>👤</Text>
        </View>
      );
    }
    return (
      <Text
        style={[styles.iconText, activeIndex === index && styles.activeIcon]}
      >
        Icon
      </Text>
    );
  };

  return (
    <View style={styles.navBar}>
      {icons.map((icon, index) => (
        <TouchableOpacity
          key={index}
          style={styles.navItem}
          onPress={() => onNavPress(index)}
        >
          {renderIcon(index, icon.name)}
        </TouchableOpacity>
      ))}
    </View>
  );
};

const IvsAndLinesScreen: React.FC = () => {
  // Use the custom hook
  const { patientName, setPatientName, handleSubmit } = useIvsAndLinesData();

  const handleNavPress = (index: number) => {
    console.log('Pressed nav item:', index);
    // Add logic to change screens or manage state
  };

  return (
    <View style={styles.mainContainer}>
      <ScrollView
        style={styles.container}
        contentContainerStyle={styles.contentContainer}
        showsVerticalScrollIndicator={false}
      >
        {/* Header and Date */}
        <View style={styles.headerContainer}>
          <Text style={styles.titleText}>IVs and Lines</Text>
          <Text style={styles.dateText}>Monday, January 26</Text>
        </View>

        {/* Patient Name Section */}
        <View style={styles.patientNameSection}>
          <Text style={styles.patientLabel}>PATIENT NAME :</Text>
          <TextInput
            style={styles.patientInput}
            value={patientName}
            onChangeText={setPatientName}
            placeholder="Select or type Patient name"
            placeholderTextColor="#D1D1D1"
          />
        </View>

        {/* Form Sections using DataCard component */}
        <DataCard badgeText="IV FLUID" />
        <DataCard badgeText="RATE" />
        <DataCard badgeText="SITE" />
        <DataCard badgeText="STATUS" />

        {/* Submit Button */}
        <TouchableOpacity style={styles.submitButton} onPress={handleSubmit}>
          <Text style={styles.submitButtonText}>SUBMIT</Text>
        </TouchableOpacity>
      </ScrollView>

      {/* Bottom Navigation Bar */}
      <BottomNavBar activeIndex={2} onNavPress={handleNavPress} />
    </View>
  );
};

const styles = StyleSheet.create({
  mainContainer: {
    flex: 1,
    backgroundColor: 'white',
  },
  container: {
    flex: 1,
  },
  contentContainer: {
    paddingHorizontal: 20,
    paddingTop: 50, // Enough space for the status bar
    paddingBottom: 100, // Space for the bottom navbar
  },
  headerContainer: {
    marginBottom: 20,
  },
  titleText: {
    color: '#227145', // Main green
    fontWeight: 'bold',
    fontSize: 28, // Matches the title's visual weight
  },
  dateText: {
    color: '#9B9B9B', // Gray color
    fontSize: 16,
    marginTop: 5,
  },
  patientNameSection: {
    marginBottom: 20,
  },
  patientLabel: {
    color: '#227145', // Main green
    fontWeight: '700',
    fontSize: 14,
    marginBottom: 8,
  },
  patientInput: {
    borderColor: '#E0E0E0', // Light gray border
    borderWidth: 1,
    borderRadius: 16, // Rounded input like in image
    paddingHorizontal: 16,
    paddingVertical: 12,
    fontSize: 16,
    color: 'black',
  },
  submitButton: {
    backgroundColor: '#EAF8EF', // Light green background
    borderColor: '#227145', // Dark green border
    borderWidth: 1.5,
    borderRadius: 24, // Highly rounded corners
    paddingVertical: 15,
    marginTop: 30,
    marginBottom: 30, // Extra bottom padding
    alignItems: 'center',
  },
  submitButtonText: {
    color: '#227145', // Dark green text
    fontWeight: '700',
    fontSize: 16,
    letterSpacing: 1, // Matching the text's character spacing
  },
  navBar: {
    flexDirection: 'row',
    height: 70, // Fixed height for navbar
    backgroundColor: 'white',
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    borderTopColor: '#E0E0E0',
    borderTopWidth: 1,
    paddingHorizontal: 10,
    justifyContent: 'space-around',
    alignItems: 'center',
    elevation: 8, // Light shadow on top of navbar
  },
  navItem: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  iconText: {
    color: '#A0A0A0', // De-emphasized gray icon
    fontSize: 14,
  },
  activeIcon: {
    color: '#227145', // Green color for active icon
  },
  centralIcon: {
    backgroundColor: 'white',
    width: 60,
    height: 60,
    borderRadius: 30,
    borderWidth: 1,
    borderColor: '#E0E0E0', // Light gray border for central icon
    alignItems: 'center',
    justifyContent: 'center',
    position: 'absolute', // This helps center it over the items
    bottom: 10, // Moves it slightly above the bar
    zIndex: 10,
    // Add visual elements from the image
    flexDirection: 'row',
  },
  activeCentralIcon: {
    borderColor: '#227145', // Dark green active central icon
  },
  centralIconText: {
    color: '#227145', // Main green
    fontSize: 24,
    fontWeight: 'bold',
    marginRight: -2, // Hack to pull together
  },
  centralIconSubText: {
    fontSize: 20, // Emoji for a quick person icon
    marginTop: 2,
  },
});

export default IvsAndLinesScreen;
