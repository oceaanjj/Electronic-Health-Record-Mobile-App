import React, {
  useState,
  useEffect,
  useCallback,
  useRef,
  useMemo,
} from 'react';
import {
  StyleSheet,
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  SafeAreaView,
  StatusBar,
  BackHandler,
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialIcons';
import LinearGradient from 'react-native-linear-gradient';
import HistoryInputCard from '../components/HistoryInputCard';
import Button from '@components/button';
import { useMedicalHistory } from '../hook/useMedicalHistory';
import SweetAlert from '@components/SweetAlert';
import PatientSearchBar from '@components/PatientSearchBar';
import { useAppTheme } from '@App/theme/ThemeContext';

interface MedicalHistoryProps {
  onBack: () => void;
  readOnly?: boolean;
  patientId?: number;
  initialPatientName?: string;
}

const initialFormData = {
  present: { medical_id: null, condition_name: '', description: '', medication: '', dosage: '', side_effect: '', comment: '' },
  past: { medical_id: null, condition_name: '', description: '', medication: '', dosage: '', side_effect: '', comment: '' },
  allergies: { medical_id: null, condition_name: '', description: '', medication: '', dosage: '', side_effect: '', comment: '' },
  vaccination: { medical_id: null, condition_name: '', description: '', medication: '', dosage: '', side_effect: '', comment: '' },
  developmental: { development_id: null, gross_motor: '', fine_motor: '', language: '', cognitive: '', social: '' },
};

const STEP_FIELDS: Record<string, string[]> = {
  present: ['condition_name', 'description', 'medication', 'dosage', 'side_effect', 'comment'],
  past: ['condition_name', 'description', 'medication', 'dosage', 'side_effect', 'comment'],
  allergies: ['condition_name', 'description', 'medication', 'dosage', 'side_effect', 'comment'],
  vaccination: ['condition_name', 'description', 'medication', 'dosage', 'side_effect', 'comment'],
  developmental: ['gross_motor', 'fine_motor', 'language', 'cognitive', 'social'],
};

const FIELD_LABELS: Record<string, string> = {
  condition_name: 'CONDITION NAME', description: 'DESCRIPTION', medication: 'MEDICATION', dosage: 'DOSAGE', side_effect: 'SIDE EFFECT', comment: 'COMMENT', gross_motor: 'GROSS MOTOR', fine_motor: 'FINE MOTOR', language: 'LANGUAGE', cognitive: 'COGNITIVE', social: 'SOCIAL',
};

const MedicalHistoryScreen: React.FC<MedicalHistoryProps> = ({ 
  onBack,
  readOnly = false,
  patientId,
  initialPatientName
}) => {
  const { isDarkMode, theme, commonStyles } = useAppTheme();
  const styles = useMemo(() => createStyles(theme, commonStyles, isDarkMode), [theme, commonStyles, isDarkMode]);

  const { saveMedicalHistory, fetchMedicalHistory } = useMedicalHistory();
  const [step, setStep] = useState(0);
  const [selectedPatientId, setSelectedPatientId] = useState<number | null>(patientId || null);
  const [scrollEnabled, setScrollEnabled] = useState(true);
  const prevPatientIdRef = useRef<number | null>(null);
  const scrollViewRef = useRef<ScrollView>(null);

  const [alertConfig, setAlertConfig] = useState<any>({ visible: false, title: '', message: '', type: 'error' });
  const [formData, setFormData] = useState(initialFormData);
  const [isNAStep, setIsNAStep] = useState<Record<string, boolean>>({
    present: false, past: false, allergies: false, vaccination: false, developmental: false,
  });

  const steps = [
    { title: 'PRESENT ILLNESS', key: 'present' },
    { title: 'PAST MEDICAL / SURGICAL', key: 'past' },
    { title: 'KNOWN CONDITION OR ALLERGIES', key: 'allergies' },
    { title: 'VACCINATION', key: 'vaccination' },
    { title: 'DEVELOPMENTAL HISTORY', key: 'developmental' },
  ];

  const loadPatientData = useCallback(async (pid: number) => {
    const data = await fetchMedicalHistory(pid);
    if (data) {
      const getFirst = (val: any) => (Array.isArray(val) ? val[0] : val);
      const newFormData = {
        present: getFirst(data.present_illness) || initialFormData.present,
        past: getFirst(data.past_medical_surgical) || initialFormData.past,
        allergies: getFirst(data.allergies) || initialFormData.allergies,
        vaccination: getFirst(data.vaccination) || initialFormData.vaccination,
        developmental: getFirst(data.developmental_history) || initialFormData.developmental,
      };
      setFormData(newFormData);

      const newISNA: Record<string, boolean> = {};
      Object.keys(STEP_FIELDS).forEach(key => {
        const fields = STEP_FIELDS[key];
        const section = (newFormData as any)[key];
        newISNA[key] = fields.length > 0 && fields.every(f => section[f] === 'N/A');
      });
      setIsNAStep(newISNA);
    }
  }, [fetchMedicalHistory]);

  useEffect(() => {
    if (selectedPatientId !== prevPatientIdRef.current) {
      prevPatientIdRef.current = selectedPatientId;
      if (selectedPatientId) loadPatientData(selectedPatientId);
    }
  }, [selectedPatientId, loadPatientData]);

  useEffect(() => {
    const bh = BackHandler.addEventListener('hardwareBackPress', () => { onBack(); return true; });
    return () => bh.remove();
  }, [onBack]);

  const toggleNA = () => {
    if (readOnly) return;
    const currentKey = steps[step].key;
    const newState = !isNAStep[currentKey];
    setIsNAStep(prev => ({ ...prev, [currentKey]: newState }));

    const fields = STEP_FIELDS[currentKey];
    const updatedSection = { ...(formData as any)[currentKey] };
    fields.forEach(f => { updatedSection[f] = newState ? 'N/A' : (updatedSection[f] === 'N/A' ? '' : updatedSection[f]); });
    setFormData(prev => ({ ...prev, [currentKey]: updatedSection }));
  };

  const handleNext = async () => {
    if (readOnly) {
      if (step < steps.length - 1) { setStep(step + 1); scrollViewRef.current?.scrollTo({ y: 0, animated: true }); }
      else onBack();
      return;
    }

    if (!selectedPatientId) return setAlertConfig({ visible: true, title: 'Patient Required', message: 'Please select a patient.', type: 'error' });

    if (step < steps.length - 1) {
      setStep(step + 1);
      scrollViewRef.current?.scrollTo({ y: 0, animated: true });
    } else {
      try {
        await saveMedicalHistory(selectedPatientId, formData);
        setAlertConfig({ visible: true, title: 'Success', message: 'Medical History saved successfully.', type: 'success' });
        loadPatientData(selectedPatientId);
      } catch (error: any) {
        setAlertConfig({ visible: true, title: 'Error', message: error.message || 'Failed to save.', type: 'error' });
      }
    }
  };

  const currentStepKey = steps[step].key;
  const currentFields = STEP_FIELDS[currentStepKey];

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle={isDarkMode ? 'light-content' : 'dark-content'} backgroundColor="transparent" translucent={true} />
      <View style={{ zIndex: 10 }}>
        <View style={{ paddingHorizontal: 40, backgroundColor: theme.background, paddingBottom: 15 }}>
          <View style={styles.header}>
            <View style={{ flex: 1 }}>
              <Text style={styles.title}>Medical History</Text>
              <Text style={styles.dateText}>{new Date().toDateString()}</Text>
            </View>
            <TouchableOpacity onPress={onBack}><Icon name="close" size={28} color={theme.primary} /></TouchableOpacity>
          </View>
        </View>
        <LinearGradient colors={isDarkMode ? ['#121212', 'transparent'] : ['#FFF', 'transparent']} style={{ height: 20 }} pointerEvents="none" />
      </View>

      <ScrollView ref={scrollViewRef} style={styles.container} showsVerticalScrollIndicator={false} keyboardShouldPersistTaps="handled" scrollEnabled={scrollEnabled}>
        <View style={{ height: 20 }} />
        {!readOnly ? (
          <PatientSearchBar onPatientSelect={id => setSelectedPatientId(id)} onToggleDropdown={isOpen => setScrollEnabled(!isOpen)} />
        ) : (
          <View style={styles.readOnlyBanner}>
            <Text style={styles.bannerLabel}>VIEWING PATIENT:</Text>
            <Text style={styles.bannerName}>{initialPatientName || "N/A"}</Text>
          </View>
        )}

        {!readOnly && (
          <View>
            <TouchableOpacity style={[styles.naRow, !selectedPatientId && { opacity: 0.5 }]} onPress={toggleNA}>
              <Text style={styles.naText}>Mark all as N/A</Text>
              <Icon name={isNAStep[currentStepKey] ? 'check-box' : 'check-box-outline-blank'} size={22} color={selectedPatientId ? theme.primary : theme.textMuted} />
            </TouchableOpacity>
            <Text style={[styles.disabledText, isNAStep[currentStepKey] && { color: theme.error }]}>
              {isNAStep[currentStepKey] ? 'All fields below are disabled.' : 'Checking this will disable all fields below.'}
            </Text>
          </View>
        )}

        <View style={styles.banner}><Text style={styles.bannerText}>{steps[step].title}</Text></View>

        {currentFields.map(field => (
          <HistoryInputCard
            key={`${currentStepKey}-${field}`}
            label={FIELD_LABELS[field] || field.toUpperCase()}
            value={(formData as any)[currentStepKey][field] || ''}
            onChangeText={v => setFormData(prev => ({ ...prev, [currentStepKey]: { ...(prev as any)[currentStepKey], [field]: v } }))}
            disabled={!selectedPatientId || isNAStep[currentStepKey] || readOnly}
          />
        ))}

        <View style={styles.btnContainer}>
          <Button title={step === steps.length - 1 ? (readOnly ? 'FINISH' : 'SUBMIT') : 'NEXT'} onPress={handleNext} disabled={!selectedPatientId} />
        </View>
        <View style={{ height: 100 }} />
      </ScrollView>
      <SweetAlert visible={alertConfig.visible} title={alertConfig.title} message={alertConfig.message} type={alertConfig.type} onConfirm={() => setAlertConfig({ ...alertConfig, visible: false })} />
    </SafeAreaView>
  );
};

const createStyles = (theme: any, commonStyles: any, isDarkMode: boolean) => StyleSheet.create({
  safeArea: commonStyles.safeArea,
  container: commonStyles.container,
  header: commonStyles.header,
  title: commonStyles.title,
  dateText: { fontSize: 13, fontFamily: 'AlteHaasGroteskBold', color: theme.textMuted },
  banner: { backgroundColor: theme.tableHeader, paddingVertical: 10, borderRadius: 25, alignItems: 'center', marginBottom: 20, marginTop: 20 },
  bannerText: { color: theme.secondary, fontFamily: 'AlteHaasGroteskBold', fontSize: 14 },
  readOnlyBanner: { backgroundColor: '#E5FFE8', padding: 15, borderRadius: 20, borderWidth: 1, borderColor: '#29A539', marginBottom: 10 },
  bannerLabel: { fontSize: 10, color: '#29A539', fontWeight: 'bold' },
  bannerName: { fontSize: 18, color: '#035022', fontFamily: 'MinionPro-SemiboldItalic' },
  naRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'flex-end', marginTop: 5 },
  naText: { fontSize: 14, fontFamily: 'AlteHaasGroteskBold', color: theme.primary, marginRight: 8 },
  disabledText: { fontSize: 13, fontFamily: 'AlteHaasGroteskBold', color: theme.textMuted, textAlign: 'right', marginBottom: 15 },
  btnContainer: { marginTop: 10 },
});

export default MedicalHistoryScreen;
