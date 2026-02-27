import React from 'react';
import { View, Text, StyleSheet, SafeAreaView, ScrollView, TextInput, TouchableOpacity, StatusBar } from 'react-native';
import Icon from 'react-native-vector-icons/MaterialIcons';
import MedicalReconCard from '../components/MedicalReconCard';
import { useMedicalReconLogic } from '../hook/useMedicalReconLogic';

interface MedicalReconciliationProps {
  onBack: () => void;
}

const MedicalReconciliationScreen: React.FC<MedicalReconciliationProps> = ({ onBack }) => {
  const {
    stageIndex, currentStage, values,
    patientName, setPatientName, handleUpdate,
    handleNext, isDataEntered, isLastStage
  } = useMedicalReconLogic();

  // Dynamic label para sa ika-anim na field
  const getExtraLabel = () => {
    if (stageIndex === 0) return "Administered during stay?";
    if (stageIndex === 1) return "Discontinued on admission?";
    return "Reason for change";
  };

  return (
    <SafeAreaView style={styles.root}>
      <StatusBar barStyle="dark-content" />
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
        
        {/* HEADER Section */}
        <View style={styles.header}>
          <TouchableOpacity onPress={onBack} style={styles.backBtn}>
            <Icon name="arrow-back" size={24} color="#035022" />
          </TouchableOpacity>
          <View style={styles.headerCenter}>
            <Text style={styles.title}>Medical{"\n"}Reconciliation</Text>
            <Text style={styles.subDate}>Monday, January 26</Text>
          </View>
        </View>

        <View style={styles.inputGroup}>
          <Text style={styles.fieldLabel}>PATIENT NAME :</Text>
          <TextInput 
            style={styles.pillInput} 
            placeholder="Select Patient" 
            value={patientName} 
            onChangeText={setPatientName} 
          />
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

        {/* FOOTER: Disabled until data is entered */}
        <TouchableOpacity 
          style={[styles.actionBtn, !isDataEntered && styles.btnDisabled]} 
          onPress={handleNext}
          disabled={!isDataEntered}
        >
          <Text style={styles.btnText}>{isLastStage ? 'SUBMIT' : 'NEXT'}</Text>
          {!isLastStage && <Text style={styles.chevron}>›</Text>}
        </TouchableOpacity>

      </ScrollView>

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
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginTop: 20, marginBottom: 20 },
  title: { fontSize: 32, color: '#035022', fontWeight: 'bold', fontStyle: 'italic', lineHeight: 35 },
  subDate: { color: '#999', fontSize: 14 },
  backBtn: { padding: 8 },
  headerCenter: { flex: 1, alignItems: 'center' },
  menuDots: { fontSize: 32, color: '#035022' },
  inputGroup: { marginBottom: 20 },
  fieldLabel: { color: '#29A539', fontWeight: 'bold', fontSize: 13, marginBottom: 5 },
  pillInput: { borderWidth: 1, borderColor: '#F0F0F0', borderRadius: 25,height: 45, paddingHorizontal: 20 },
  stageTab: { backgroundColor: '#E5FFE8', paddingVertical: 10, borderRadius: 20, alignItems: 'center', marginBottom: 20 },
  stageText: { color: '#29A539', fontWeight: 'bold', fontSize: 12 },
  actionBtn: { backgroundColor: '#E5FFE8', height: 50, borderRadius: 25, flexDirection: 'row', justifyContent: 'center', alignItems: 'center', marginTop: 10, borderWidth: 1, borderColor: '#C8E6C9' },
  btnDisabled: { backgroundColor: '#F0F0F0', borderColor: '#E0E0E0' },
  btnText: { color: '#035022', fontWeight: 'bold', fontSize: 16 },
  chevron: { color: '#035022', fontSize: 20, marginLeft: 10 },
  bottomNav: { position: 'absolute', bottom: 0, width: '100%', height: 70, backgroundColor: '#FFF', borderTopWidth: 1, borderColor: '#EEE', flexDirection: 'row', justifyContent: 'space-around', alignItems: 'center' },
  navIcon: { fontSize: 22, color: '#035022' },
  fab: { width: 60, height: 60, borderRadius: 30, backgroundColor: '#FFF', elevation: 5, marginTop: -35, justifyContent: 'center', alignItems: 'center', borderWidth: 1, borderColor: '#EEE' },
  plusSign: { fontSize: 24, color: '#29A539', fontWeight: 'bold' }
});

export default MedicalReconciliationScreen;