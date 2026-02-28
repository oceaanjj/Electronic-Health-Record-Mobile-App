import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, SafeAreaView, ScrollView, TouchableOpacity, StatusBar, ActivityIndicator, FlatList, Modal } from 'react-native';
import Icon from 'react-native-vector-icons/MaterialIcons';
import MedicalReconCard from '../components/MedicalReconCard';
import { useMedicalReconLogic, Patient } from '../hook/useMedicalReconLogic';
import SweetAlert from '../../../components/SweetAlert';

interface MedicalReconciliationProps {
  onBack: () => void;
}

const MedicalReconciliationScreen: React.FC<MedicalReconciliationProps> = ({ onBack }) => {
  const {
    stageIndex, currentStage, values,
    patientName, setPatientName,
    patientId, setPatientId,
    patients, fetchPatients,
    isLoading, isSubmitting,
    handleUpdate,
    handleNext, isDataEntered, isLastStage,
    alertConfig, closeAlert
  } = useMedicalReconLogic();

  const [showPatientModal, setShowPatientModal] = useState(false);
  const [currentDate, setCurrentDate] = useState('');

  useEffect(() => {
    fetchPatients();
    // Simplified date formatting that's safer for React Native
    const now = new Date();
    const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
    const months = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
    setCurrentDate(`${days[now.getDay()]}, ${months[now.getMonth()]} ${now.getDate()}`);
  }, [fetchPatients]);

  // Dynamic label para sa ika-anim na field
  const getExtraLabel = () => {
    if (stageIndex === 0) return "Administered during stay?";
    if (stageIndex === 1) return "Discontinued on admission?";
    return "Reason for change";
  };

  const handleSelectPatient = (patient: Patient) => {
    setPatientId(patient.patient_id);
    setPatientName(`${patient.last_name}, ${patient.first_name}`);
    setShowPatientModal(false);
  };

  const handleAlertConfirm = () => {
    if (alertConfig.type === 'success') {
      onBack();
    }
    closeAlert();
  };

  const renderPatientItem = ({ item }: { item: Patient }) => (
    <TouchableOpacity 
      style={styles.patientItem} 
      onPress={() => handleSelectPatient(item)}
    >
      <Text style={styles.patientItemText}>{item.last_name}, {item.first_name} (ID: {item.patient_id})</Text>
    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={styles.root}>
      <StatusBar barStyle="dark-content" />
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
        
        {/* HEADER Section */}
        <View style={styles.header}>
          <View>
            <Text style={styles.title}>Medical{"\n"}Reconciliation</Text>
            <Text style={styles.subDate}>{currentDate}</Text>
          </View>
          <TouchableOpacity onPress={() => {/* More options if needed */}}>
            <Icon name="more-vert" size={35} color="#035022" />
          </TouchableOpacity>
        </View>

        <View style={styles.inputGroup}>
          <Text style={styles.fieldLabel}>PATIENT NAME :</Text>
          <TouchableOpacity 
            style={styles.pillInputContainer} 
            onPress={() => setShowPatientModal(true)}
          >
            <Text style={[styles.pillInputText, !patientName && styles.placeholderText]}>
              {patientName || "Select Patient"}
            </Text>
            <Icon name="arrow-drop-down" size={24} color="#999" />
          </TouchableOpacity>
        </View>

        {/* STAGE Indicator */}
        <View style={styles.stageTab}>
          <Text style={styles.stageText}>{currentStage}</Text>
        </View>

        {/* INPUT Cards Flow */}
        <MedicalReconCard label="Medication" value={values.med} onChangeText={(v: string) => handleUpdate('med', v)} />
        <MedicalReconCard label="Dose" value={values.dose} onChangeText={(v: string) => handleUpdate('dose', v)} />
        <MedicalReconCard label="Route" value={values.route} onChangeText={(v: string) => handleUpdate('route', v)} />
        <MedicalReconCard label="Frequency" value={values.freq} onChangeText={(v: string) => handleUpdate('freq', v)} />
        
        {/* Indication is hidden in Stage 3 */}
        {stageIndex !== 2 && (
          <MedicalReconCard label="Indication" value={values.indication} onChangeText={(v: string) => handleUpdate('indication', v)} />
        )}

        <MedicalReconCard label={getExtraLabel()} value={values.extra} onChangeText={(v: string) => handleUpdate('extra', v)} />

        {/* FOOTER: Disabled until data is entered or while submitting */}
        <TouchableOpacity 
          style={[styles.actionBtn, (!isDataEntered || isSubmitting || !patientId) && styles.btnDisabled]} 
          onPress={handleNext}
          disabled={!isDataEntered || isSubmitting || !patientId}
        >
          {isSubmitting ? (
            <ActivityIndicator size="small" color="#035022" />
          ) : (
            <>
              <Text style={styles.btnText}>{isLastStage ? 'SUBMIT' : 'NEXT'}</Text>
              {!isLastStage && <Text style={styles.chevron}>›</Text>}
            </>
          )}
        </TouchableOpacity>

      </ScrollView>

      {/* Patient Selection Modal */}
      <Modal
        visible={showPatientModal}
        transparent={true}
        animationType="slide"
        onRequestClose={() => setShowPatientModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Select Patient</Text>
              <TouchableOpacity onPress={() => setShowPatientModal(false)}>
                <Icon name="close" size={24} color="#333" />
              </TouchableOpacity>
            </View>
            {isLoading ? (
              <ActivityIndicator size="large" color="#29A539" style={{ margin: 20 }} />
            ) : (
              <FlatList
                data={patients}
                keyExtractor={(item) => item.patient_id.toString()}
                renderItem={renderPatientItem}
                ListEmptyComponent={<Text style={styles.emptyText}>No patients found.</Text>}
                style={styles.patientList}
              />
            )}
          </View>
        </View>
      </Modal>

      {/* SweetAlert Component */}
      <SweetAlert
        visible={alertConfig.visible}
        title={alertConfig.title}
        message={alertConfig.message}
        type={alertConfig.type}
        onConfirm={handleAlertConfirm}
        onCancel={closeAlert}
      />

      {/* BOTTOM NAV */}
      <View style={styles.bottomNav}>
          <Text style={styles.navIcon}>🏠</Text><Text style={styles.navIcon}>🔍</Text>
          <View style={styles.fab}><Text style={styles.plusSign}>+</Text></View>
          <Text style={styles.navIcon}>📊</Text><Text style={styles.navIcon}>📅</Text>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: '#FFF' },
  scrollContent: { paddingHorizontal: 25, paddingBottom: 130 },
  header: { flexDirection: 'row', justifyContent: 'space-between', marginTop: 40, marginBottom: 25 },
  title: { 
    fontSize: 35, 
    color: '#035022', 
    fontFamily: 'MinionPro-SemiboldItalic',
    lineHeight: 38
  },
  subDate: { color: '#999', fontSize: 13 },
  menuDots: { fontSize: 32, color: '#035022' },
  inputGroup: { marginBottom: 20 },
  fieldLabel: { color: '#29A539', fontWeight: 'bold', fontSize: 13, marginBottom: 5 },
  pillInputContainer: { 
    borderWidth: 1, 
    borderColor: '#F0F0F0', 
    borderRadius: 25, 
    height: 45, 
    paddingHorizontal: 20,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#FAFAFA'
  },
  pillInputText: { fontSize: 14, color: '#333' },
  placeholderText: { color: '#999' },
  stageTab: { backgroundColor: '#E5FFE8', paddingVertical: 10, borderRadius: 20, alignItems: 'center', marginBottom: 20 },
  stageText: { color: '#29A539', fontWeight: 'bold', fontSize: 12 },
  actionBtn: { backgroundColor: '#E5FFE8', height: 50, borderRadius: 25, flexDirection: 'row', justifyContent: 'center', alignItems: 'center', marginTop: 10, borderWidth: 1, borderColor: '#C8E6C9' },
  btnDisabled: { backgroundColor: '#F0F0F0', borderColor: '#E0E0E0' },
  btnText: { color: '#035022', fontWeight: 'bold', fontSize: 16 },
  chevron: { color: '#035022', fontSize: 20, marginLeft: 10 },
  bottomNav: { position: 'absolute', bottom: 0, width: '100%', height: 70, backgroundColor: '#FFF', borderTopWidth: 1, borderColor: '#EEE', flexDirection: 'row', justifyContent: 'space-around', alignItems: 'center' },
  navIcon: { fontSize: 22, color: '#035022' },
  fab: { width: 60, height: 60, borderRadius: 30, backgroundColor: '#FFF', elevation: 5, marginTop: -35, justifyContent: 'center', alignItems: 'center', borderWidth: 1, borderColor: '#EEE' },
  plusSign: { fontSize: 24, color: '#29A539', fontWeight: 'bold' },
  
  // Modal Styles
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'center', alignItems: 'center' },
  modalContent: { backgroundColor: '#FFF', width: '90%', maxHeight: '80%', borderRadius: 20, padding: 20, elevation: 5 },
  modalHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 15 },
  modalTitle: { fontSize: 18, fontWeight: 'bold', color: '#035022' },
  patientList: { marginBottom: 10 },
  patientItem: { paddingVertical: 15, borderBottomWidth: 1, borderBottomColor: '#EEE' },
  patientItemText: { fontSize: 16, color: '#333' },
  emptyText: { textAlign: 'center', color: '#999', marginVertical: 20 }
});

export default MedicalReconciliationScreen;
