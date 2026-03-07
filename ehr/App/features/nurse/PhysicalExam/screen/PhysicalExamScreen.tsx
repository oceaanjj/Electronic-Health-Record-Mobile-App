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
import ExamInputCard from '../components/PhysicalInputCard';
import ADPIEScreen from './ADPIEScreen';
import { usePhysicalExam } from '../hook/usePhysicalExam';
import SweetAlert from '@components/SweetAlert';
import PatientSearchBar from '@components/PatientSearchBar';
import { useAppTheme } from '@App/theme/ThemeContext';

const initialFormData = {
  general_appearance: '',
  skin_condition: '',
  eye_condition: '',
  oral_condition: '',
  cardiovascular: '',
  abdomen_condition: '',
  extremities: '',
  neurological: '',
};

interface PhysicalExamProps {
  onBack: () => void;
  readOnly?: boolean;
  patientId?: string;
  initialPatientName?: string;
}

const PhysicalExamScreen: React.FC<PhysicalExamProps> = ({ 
  onBack, 
  readOnly = false, 
  patientId,
  initialPatientName 
}) => {
  const { isDarkMode, theme, commonStyles } = useAppTheme();
  const styles = useMemo(
    () => createStyles(theme, commonStyles, isDarkMode),
    [theme, commonStyles, isDarkMode],
  );

  const { saveAssessment, checkAssessmentAlerts, fetchLatestPhysicalExam, fetchExamHistoryForReading } =
    usePhysicalExam();
  const [searchText, setSearchText] = useState(initialPatientName || '');
  const [selectedPatientId, setSelectedPatientId] = useState<string | null>(
    patientId || null,
  );
  const [scrollEnabled, setScrollEnabled] = useState(true);
  const prevPatientIdRef = useRef<string | null>(null);

  const [alertConfig, setAlertConfig] = useState<any>({ visible: false, title: '', message: '', type: 'error' });
  const [examId, setExamId] = useState<number | null>(null);
  const [backendAlerts, setBackendAlerts] = useState<any>({});
  const [isAdpieActive, setIsAdpieActive] = useState(false);
  const [formData, setFormData] = useState(initialFormData);
  const [isNA, setIsNA] = useState(false);
  const scrollViewRef = useRef<ScrollView>(null);

  const toggleNA = () => {
    if (readOnly) return;
    const newState = !isNA;
    setIsNA(newState);
    const updatedData = { ...formData };
    Object.keys(initialFormData).forEach(key => {
      (updatedData as any)[key] = newState ? 'N/A' : ((updatedData as any)[key] === 'N/A' ? '' : (updatedData as any)[key]);
    });
    setFormData(updatedData);
  };

  useEffect(() => {
    const bh = BackHandler.addEventListener('hardwareBackPress', () => {
      if (isAdpieActive) { setIsAdpieActive(false); return true; }
      onBack(); return true;
    });
    return () => bh.remove();
  }, [onBack, isAdpieActive]);

  const applyExamData = useCallback((data: any) => {
    if (!data) return;
    setExamId(data.id);
    const newFormData = {
      general_appearance: data.general_appearance || '',
      skin_condition: data.skin_condition || '',
      eye_condition: data.eye_condition || '',
      oral_condition: data.oral_condition || '',
      cardiovascular: data.cardiovascular || '',
      abdomen_condition: data.abdomen_condition || '',
      extremities: data.extremities || '',
      neurological: data.neurological || '',
    };
    setFormData(newFormData);
    setIsNA(Object.values(newFormData).every(v => v === 'N/A'));
    setBackendAlerts({
      general_appearance_alert: data.general_appearance_alert,
      skin_alert: data.skin_alert,
      eye_alert: data.eye_alert,
      oral_alert: data.oral_alert,
      cardiovascular_alert: data.cardiovascular_alert,
      abdomen_alert: data.abdomen_alert,
      extremities_alert: data.extremities_alert,
      neurological_alert: data.neurological_alert,
    });
  }, []);

  const loadPatientData = useCallback(
    async (pId: number) => {
      if (readOnly) {
        const history = await fetchExamHistoryForReading(pId);
        if (history && history.length > 0) applyExamData(history[0]);
      } else {
        const data = await fetchLatestPhysicalExam(pId);
        if (data) applyExamData(data);
        else { setExamId(null); setFormData(initialFormData); setIsNA(false); setBackendAlerts({}); }
      }
    },
    [fetchLatestPhysicalExam, fetchExamHistoryForReading, applyExamData, readOnly],
  );

  useEffect(() => {
    if (selectedPatientId !== prevPatientIdRef.current) {
      prevPatientIdRef.current = selectedPatientId;
      if (selectedPatientId) loadPatientData(parseInt(selectedPatientId, 10));
    }
  }, [selectedPatientId, loadPatientData]);

  const handleCDSSPress = async () => {
    if (readOnly) { if (examId) setIsAdpieActive(true); return; }
    if (!selectedPatientId) return setAlertConfig({ visible: true, title: 'Patient Required', message: 'Please select a patient.', type: 'error' });
    try {
      const result = await saveAssessment({ patient_id: selectedPatientId, ...formData });
      const id = result.id || result.physical_exam_id;
      if (id) { setExamId(id); setIsAdpieActive(true); }
    } catch (e) { setAlertConfig({ visible: true, title: 'Error', message: 'Submission failed.', type: 'error' }); }
  };

  const handleSave = async () => {
    if (readOnly) { onBack(); return; }
    if (!selectedPatientId) return setAlertConfig({ visible: true, title: 'Patient Required', message: 'Please select a patient.', type: 'error' });
    try {
      const result = await saveAssessment({ patient_id: selectedPatientId, ...formData });
      setAlertConfig({ visible: true, title: 'Success', message: 'Physical Exam saved successfully.', type: 'success' });
      loadPatientData(parseInt(selectedPatientId, 10));
    } catch (e) { setAlertConfig({ visible: true, title: 'Error', message: 'Submission failed.', type: 'error' }); }
  };

  if (isAdpieActive && examId && selectedPatientId) {
    return (
      <ADPIEScreen
        examId={examId}
        patientName={searchText}
        assessmentAlerts={backendAlerts}
        readOnly={readOnly}
        onBack={() => setIsAdpieActive(false)}
      />
    );
  }

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle={isDarkMode ? 'light-content' : 'dark-content'} backgroundColor="transparent" translucent={true} />
      <View style={{ zIndex: 10 }}>
        <View style={{ paddingHorizontal: 40, backgroundColor: theme.background, paddingBottom: 15 }}>
          <View style={styles.header}>
            <View style={{ flex: 1 }}>
                <Text style={styles.title}>Physical Exam</Text>
                <Text style={styles.dateText}>{new Date().toDateString()}</Text>
            </View>
            <TouchableOpacity onPress={onBack}><Icon name="close" size={28} color={theme.primary} /></TouchableOpacity>
          </View>
        </View>
        <LinearGradient colors={isDarkMode ? ['#121212', 'transparent'] : ['#FFFFFF', 'transparent']} style={{ height: 20 }} pointerEvents="none" />
      </View>

      <ScrollView ref={scrollViewRef} style={styles.container} showsVerticalScrollIndicator={false} scrollEnabled={scrollEnabled} keyboardShouldPersistTaps="handled">
        <View style={{ height: 20 }} />
        {!readOnly ? (
          <PatientSearchBar
            onPatientSelect={(id, name) => { setSelectedPatientId(id ? id.toString() : null); setSearchText(name); }}
            initialPatientName={searchText}
            onToggleDropdown={isOpen => setScrollEnabled(!isOpen)}
          />
        ) : (
          <View style={styles.readOnlyBanner}>
            <Text style={styles.bannerLabel}>VIEWING PATIENT:</Text>
            <Text style={styles.bannerName}>{initialPatientName || 'N/A'}</Text>
          </View>
        )}

        {!readOnly && (
          <View>
            <TouchableOpacity style={[styles.naRow, !selectedPatientId && { opacity: 0.5 }]} onPress={toggleNA}>
              <Text style={styles.naText}>Mark all as N/A</Text>
              <Icon name={isNA ? 'check-box' : 'check-box-outline-blank'} size={22} color={selectedPatientId ? theme.primary : theme.textMuted} />
            </TouchableOpacity>
            <Text style={[styles.disabledText, isNA && { color: theme.error }]}>
              {isNA ? 'All fields below are disabled.' : 'Checking this will disable all fields below.'}
            </Text>
          </View>
        )}

        <View style={styles.banner}><Text style={styles.bannerText}>PHYSICAL EXAMINATION</Text></View>

        {Object.keys(initialFormData).map((key) => (
          <ExamInputCard
              key={key}
              label={key.replace('_', ' ').toUpperCase()}
              value={(formData as any)[key]}
              disabled={!selectedPatientId || isNA || readOnly}
              readOnly={readOnly}
              alertText={(backendAlerts as any)[`${key}_alert`] || (backendAlerts as any)[`${key.replace('_condition', '')}_alert`]}
              onChangeText={t => setFormData(prev => ({ ...prev, [key]: t }))}
          />
        ))}

        <View style={styles.footerRow}>
          <TouchableOpacity style={styles.cdssBtn} onPress={handleCDSSPress} disabled={!selectedPatientId}>
            <Text style={styles.cdssText}>{readOnly ? 'VIEW ADPIE' : 'CDSS'}</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.submitBtn} onPress={handleSave} disabled={!selectedPatientId}>
            <Text style={styles.submitText}>{readOnly ? 'FINISH' : 'SUBMIT'}</Text>
          </TouchableOpacity>
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
  banner: { backgroundColor: theme.tableHeader, paddingVertical: 10, borderRadius: 25, alignItems: 'center', marginBottom: 20 },
  bannerText: { color: theme.secondary, fontFamily: 'AlteHaasGroteskBold', fontSize: 14 },
  readOnlyBanner: { backgroundColor: '#E5FFE8', padding: 15, borderRadius: 20, borderWidth: 1, borderColor: '#29A539', marginBottom: 10 },
  bannerLabel: { fontSize: 10, color: '#29A539', fontWeight: 'bold' },
  bannerName: { fontSize: 18, color: '#035022', fontFamily: 'MinionPro-SemiboldItalic' },
  naRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'flex-end', marginTop: 5 },
  naText: { fontSize: 14, fontFamily: 'AlteHaasGroteskBold', color: theme.primary, marginRight: 8 },
  disabledText: { fontSize: 13, fontFamily: 'AlteHaasGroteskBold', color: theme.textMuted, textAlign: 'right', marginBottom: 15 },
  footerRow: { flexDirection: 'row', justifyContent: 'space-between', marginTop: 10 },
  cdssBtn: { flex: 1, backgroundColor: theme.buttonBg, paddingVertical: 15, borderRadius: 25, alignItems: 'center', marginHorizontal: 5, borderWidth: 1.5, borderColor: theme.buttonBorder },
  submitBtn: { flex: 1, backgroundColor: theme.buttonBg, paddingVertical: 15, borderRadius: 25, alignItems: 'center', marginHorizontal: 5, borderWidth: 1.5, borderColor: theme.buttonBorder },
  cdssText: { color: theme.primary, fontFamily: 'AlteHaasGroteskBold', fontSize: 16 },
  submitText: { color: theme.primary, fontFamily: 'AlteHaasGroteskBold', fontSize: 16 },
});

export default PhysicalExamScreen;
