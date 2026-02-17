import React, { useState } from 'react';
import { View, StyleSheet, SafeAreaView } from 'react-native';
import DashboardSummary from '../components/DashboardSummary';
import { DashboardGrid } from '../../../components/navigation/DashboardGrid';
import SearchScreen from '../../Search/screen/SearchScreen';
import CalendarScreen from '../../Calendar/screen/CalendarScreen';
import BottomNav from '../../../components/navigation/BottomNav';

// Corrected import paths
import RegisterPatient from '../../PatientRegistration/component/RegisterPatient';
import DemographicProfileScreen from '../../DemographicProfile/screen/DemographicProfileScreen';

export default function HomeScreen() {
  const [activeTab, setActiveTab] = useState('Home');

  const handleNavigation = (route: string) => setActiveTab(route);

  const renderPage = () => {
    switch (activeTab) {
      case 'Home':
        return <DashboardSummary onNavigate={handleNavigation} />;
      case 'Search':
        return <SearchScreen />;
      case 'Grid':
        return <DashboardGrid onPressItem={handleNavigation} />;
      case 'Calendar':
        return <CalendarScreen />;
      case 'Register':
        return <RegisterPatient onBack={() => setActiveTab('Home')} />;

      // ADD THIS CASE: Matches the ID from your DashboardGrid items
      case 'Demographic Profile':
        return <DemographicProfileScreen onBack={() => setActiveTab('Grid')} />;

      default:
        return <DashboardSummary onNavigate={handleNavigation} />;
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.flex1}>{renderPage()}</View>
      <BottomNav
        activeRoute={activeTab === 'Demographic Profile' ? 'Grid' : activeTab}
        onNavigate={handleNavigation}
        onAddPatient={() => setActiveTab('Register')}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  flex1: {
    flex: 1,
  },
});
