import React, { useState } from 'react';
import { View, StyleSheet, SafeAreaView } from 'react-native';
import DashboardSummary from '../components/DashboardSummary';
import { DashboardGrid } from '../../../components/navigation/DashboardGrid';
import SearchScreen from '../../Search/screen/SearchScreen';
import CalendarScreen from '../../Calendar/screen/CalendarScreen';
import BottomNav from '../../../components/navigation/BottomNav';
import RegisterPatient from '../../PatientRegistration/component/RegisterPatient';


// 1. Import the new Medical History screen
import MedicalHistoryScreen from '../../MedicalHistory/screen/MedicalHistoryScreen';
import PhysicalExamScreen from '../../PhysicalExam/screen/PhysicalExamScreen';
import ADLMainScreen from '../../ADL/screen/ADLMainScreen';
import LabValuesScreen from '../../LaboratoryValues/screen/LabValuesScreen';

export default function HomeScreen() {
  const [activeTab, setActiveTab] = useState('Home');

  const handleNavigation = (route: string) => setActiveTab(route);

  const renderPage = () => {
    switch (activeTab) {
      case "Home":
        return <DashboardSummary onNavigate={handleNavigation} />;
      case "Search":
        return <SearchScreen />;
      case "Grid":
        return <DashboardGrid onPressItem={handleNavigation} />;
      case "Calendar":
        return <CalendarScreen />;
      case "Register":
        return <RegisterPatient onBack={() => setActiveTab('Home')} />;
      case "MedicalHistory":
        return <MedicalHistoryScreen onBack={() => setActiveTab('Grid')} />;
      case "PhysicalExam":
        return <PhysicalExamScreen onBack={() => setActiveTab('Grid')} />;
      case "Activities":
        return <ADLMainScreen onBack={() => setActiveTab('Grid')} />;
      case "LabValues":
        return <LabValuesScreen onBack={() => setActiveTab('Grid')} />;
        
      default:
        return <DashboardSummary onNavigate={handleNavigation} />;
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.flex1}>
        {renderPage()}
      </View>
      <BottomNav
        activeRoute={activeTab}
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