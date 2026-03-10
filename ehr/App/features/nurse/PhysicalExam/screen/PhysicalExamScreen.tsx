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
  Platform,
  Image,
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialIcons';
import LinearGradient from 'react-native-linear-gradient';
import ExamInputCard from '../components/PhysicalInputCard';
import ADPIEScreen from '@components/ADPIEScreen';
import CDSSModal from '@components/CDSSModal';
import { usePhysicalExam } from '../hook/usePhysicalExam';
import SweetAlert from '@components/SweetAlert';
import PatientSearchBar from '@components/PatientSearchBar';
import { useAppTheme } from '@App/theme/ThemeContext';

const alertIcon = require('@assets/icons/alert.png');

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
}

const PhysicalExamScreen: React.FC<PhysicalExamProps> = ({ onBack }) => {
  const { isDarkMode, theme, commonStyles } = useAppTheme();
  const styles = useMemo(
    () => createStyles(theme, commonStyles, isDarkMode),
    [theme, commonStyles, isDarkMode],
  );

  const {
    saveAssessment,
    analyzeField,
    fetchLatestPhysicalExam,
    dataAlert,
    fetchDataAlert,
  } = usePhysicalExam();
  
  const [searchText, setSearchText] = useState('');
  const [selectedPatientId, setSelectedPatientId] = useState<string | null>(null);
  const [scrollEnabled, setScrollEnabled] = useState(true);
  const prevPatientIdRef = useRef<string | null>(null);
  const lastAnalyzedValues = useRef<Record<string, string>>({});

  // SweetAlert State
  const [alertConfig, setAlertConfig] = useState<{
    visible: boolean;
    title: string;
    message: string;
    type: 'success' | 'error' | 'warning';
  }>({
    visible: false,
    title: '',
    message: '',
    type: 'error',
  });

  const showAlert = (
    title: string,
    message: string,
    type: 'success' | 'error' | 'warning' = 'error',
  ) => {
    setAlertConfig({ visible: true, title, message, type });
  };

  const [examId, setExamId] = useState<number | null>(null);
  const [backendAlerts, setBackendAlerts] = useState<any>({});
  const [fieldAnalysis, setFieldAnalysis] = useState<Record<string, string | null>>({});
  const [assessmentAlert, setAssessmentAlert] = useState<string | null>(null);

  // Controls the view switch from Assessment to ADPIE Stepper
  const [isAdpieActive, setIsAdpieActive] = useState(false);

  const [formData, setFormData] = useState(initialFormData);
  const [isNA, setIsNA] = useState(false);
  const scrollViewRef = useRef<ScrollView>(null);

  const toggleNA = () => {
    const newState = !isNA;
    setIsNA(newState);

    if (newState) {
      const updatedData = { ...formData };
      Object.keys(initialFormData).forEach(key => {
        (updatedData as any)[key] = 'N/A';
      });
      setFormData(updatedData);
    } else {
      const updatedData = { ...formData };
      Object.keys(initialFormData).forEach(key => {
        if ((updatedData as any)[key] === 'N/A') {
          (updatedData as any)[key] = '';
        }
      });
      setFormData(updatedData);
    }
  };

  useEffect(() => {
    const backAction = () => {
      onBack();
      return true;
    };
    const backHandler = BackHandler.addEventListener('hardwareBackPress', backAction);
    return () => backHandler.remove();
  }, [onBack]);

  const loadPatientData = useCallback(
    async (patientId: number) => {
      fetchDataAlert(patientId);
      const data = await fetchLatestPhysicalExam(patientId);
      if (data) {
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

        const allNA = Object.values(newFormData).every(v => v === 'N/A');
        setIsNA(allNA);

        setBackendAlerts({
          general_appearance_alert: data.general_appearance_alert,
          skin_condition_alert: data.skin_condition_alert || data.skin_alert,
          eye_condition_alert: data.eye_condition_alert || data.eye_alert,
          oral_condition_alert: data.oral_condition_alert || data.oral_alert,
          cardiovascular_alert: data.cardiovascular_alert,
          abdomen_condition_alert: data.abdomen_condition_alert || data.abdomen_alert,
          extremities_alert: data.extremities_alert,
          neurological_alert: data.neurological_alert,
        });
      } else {
        setExamId(null);
        setFormData(initialFormData);
        setIsNA(false);
        setBackendAlerts({});
        setFieldAnalysis({});
        lastAnalyzedValues.current = {};
      }
    },
    [fetchLatestPhysicalExam, fetchDataAlert],
  );

  useEffect(() => {
    if (selectedPatientId !== prevPatientIdRef.current) {
      prevPatientIdRef.current = selectedPatientId;
      if (selectedPatientId) {
        loadPatientData(parseInt(selectedPatientId, 10));
      } else {
        setExamId(null);
        setFormData(initialFormData);
        setIsNA(false);
        setBackendAlerts({});
        setFieldAnalysis({});
        lastAnalyzedValues.current = {};
      }
    }
  }, [selectedPatientId, loadPatientData]);

  // REAL-TIME CDSS: Debounced analysis per field
  useEffect(() => {
    if (!selectedPatientId || isNA) return;

    const timer = setTimeout(async () => {
      const fields = Object.keys(formData);
      
      for (const field of fields) {
        const val = (formData as any)[field];
        // Only analyze if value has changed significantly and isn't a repeat
        if (
          val && 
          val.trim().length >= 3 && 
          val !== 'N/A' && 
          val !== lastAnalyzedValues.current[field]
        ) {
          lastAnalyzedValues.current[field] = val;
          const analysis = await analyzeField(field, val);
          if (analysis && analysis !== 'NO RECOMMENDATIONS') {
            setFieldAnalysis(prev => ({ ...prev, [field]: analysis }));
          } else {
            setFieldAnalysis(prev => ({ ...prev, [field]: null }));
          }
        } else if (!val || val.trim().length < 3) {
          setFieldAnalysis(prev => ({ ...prev, [field]: null }));
        }
      }
    }, 1000);

    return () => clearTimeout(timer);
  }, [formData, selectedPatientId, analyzeField, isNA]);

  const getFieldAlert = (field: string) => {
    // 1. Real-time result (Live feedback)
    if (fieldAnalysis[field]) return fieldAnalysis[field];
    
    // 2. Persistent Backend alerts (Saved state)
    const alerts = backendAlerts || {};
    const backendKey = `${field}_alert`;
    const simpleKey = field.replace('_condition', '') + '_alert';
    if (alerts[backendKey] && alerts[backendKey] !== 'N/A') return alerts[backendKey];
    if (alerts[simpleKey] && alerts[simpleKey] !== 'N/A') return alerts[simpleKey];

    // 3. Split concatenated dataAlert (Section 9C)
    if (dataAlert && typeof dataAlert === 'string') {
      const parts = dataAlert.split(';').map(p => p.trim());
      const simplified = field.replace('_condition', '').replace('_', ' ');
      const match = parts.find(p => p.toLowerCase().includes(simplified.toLowerCase()));
      if (match) return match;
    }
    
    return null;
  };

  const handleCDSSPress = async () => {
    if (!selectedPatientId) {
      return showAlert('Patient Required', 'Please select a patient first in the search bar.');
    }

    try {
      const result = await saveAssessment({
        patient_id: selectedPatientId,
        ...formData,
      }, examId);

      const id = result?.id || result?.physical_exam_id || examId;
      if (id) {
        setExamId(id);
        if (result?.assessment_alert || result?.alert) {
          setAssessmentAlert(result.assessment_alert || result.alert);
        }
        setIsAdpieActive(true);
        scrollViewRef.current?.scrollTo({ y: 0, animated: true });
      } else {
        showAlert('Error', 'Could not retrieve assessment ID.');
      }
    } catch (e) {
      console.error('CDSS Press Error:', e);
      showAlert('Error', 'Could not initiate clinical support.');
    }
  };

  const handleSave = async () => {
    if (!selectedPatientId) {
      return showAlert('Patient Required', 'Please select a patient first in the search bar.');
    }
    try {
      const result = await saveAssessment({
        patient_id: selectedPatientId,
        ...formData,
      }, examId);

      const newId = result.id || result.physical_exam_id;
      const isUpdate = !!examId || result.updated_at !== result.created_at;

      if (newId) {
        setExamId(newId);
        fetchDataAlert(parseInt(selectedPatientId, 10)); // Refresh summary alerts
      }

      showAlert(
        isUpdate ? 'SUCCESSFULLY UPDATED' : 'SUCCESSFULLY SUBMITTED',
        `Physical Exam has been ${isUpdate ? 'updated' : 'submitted'} successfully.`,
        'success',
      );
      loadPatientData(parseInt(selectedPatientId, 10));
    } catch (e) {
      showAlert('Error', 'Submission failed. Please check your connection.');
    }
  };

  const getCurrentDate = () => {
    return new Date().toLocaleDateString('en-US', {
      weekday: 'long',
      month: 'long',
      day: 'numeric',
    });
  };

  const updateField = (field: string, val: string) => {
    setFormData(prev => ({ ...prev, [field]: val }));
  };

  const isDataEntered = Object.values(formData).some(
    v => v && v.trim().length > 0 && v !== 'N/A',
  );

  const fadeColors = isDarkMode
    ? ['rgba(18, 18, 18, 0)', 'rgba(18, 18, 18, 0.8)', 'rgba(18, 18, 18, 1)']
    : ['rgba(255, 255, 255, 0)', 'rgba(255, 255, 255, 0.8)', 'rgba(255, 255, 255, 1)'];

  const headerFadeColors = isDarkMode
    ? ['rgba(18, 18, 18, 1)', 'rgba(18, 18, 18, 0)']
    : ['rgba(255, 255, 255, 1)', 'rgba(255, 255, 255, 0)'];

  const generateFindingsSummary = () => {
    const findings = Object.entries(formData)
      .filter(([_, value]) => value && value.trim() !== '' && value !== 'N/A')
      .map(([key, value]) => `${key.replace(/_/g, ' ').toUpperCase()}: ${value}`);
    
    const alerts = Object.entries(backendAlerts)
      .filter(([_, value]) => typeof value === 'string' && value.trim() !== '' && !value.toLowerCase().includes('normal'))
      .map(([_, value]) => value);

    const summary = [...findings, ...alerts];
    if (dataAlert) {
      if (typeof dataAlert === 'string') summary.push(dataAlert);
      else Object.values(dataAlert).forEach(v => typeof v === 'string' && v.trim() !== '' && summary.push(v));
    }
    return summary.join('. ');
  };

  if (isAdpieActive && examId && selectedPatientId) {
    return (
      <ADPIEScreen
        recordId={typeof examId === 'string' ? parseInt(examId, 10) : examId}
        patientName={searchText}
        feature="physical-exam"
        findingsSummary={generateFindingsSummary()}
        initialAlert={assessmentAlert || undefined}
        onBack={() => {
          setIsAdpieActive(false);
          setAssessmentAlert(null);
        }}
      />
    );
  }

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar
        barStyle={isDarkMode ? 'light-content' : 'dark-content'}
        backgroundColor="transparent"
        translucent={true}
      />
      <View style={{ zIndex: 10 }}>
        <View style={{ paddingHorizontal: 40, backgroundColor: theme.background, paddingBottom: 15 }}>
          <View style={[styles.header, { marginBottom: 0 }]}>
            <View style={{ flex: 1 }}>
              <Text style={styles.title}>Physical Exam</Text>
              <Text style={styles.subTitleDate}>{getCurrentDate()}</Text>
            </View>
          </View>
        </View>
        <LinearGradient colors={headerFadeColors} style={{ height: 20 }} pointerEvents="none" />
      </View>

      <View style={{ flex: 1, marginTop: -20 }}>
        <ScrollView
          ref={scrollViewRef}
          keyboardShouldPersistTaps="handled"
          style={styles.container}
          showsVerticalScrollIndicator={false}
          scrollEnabled={scrollEnabled}
        >
          <View style={{ height: 20 }} />
          <PatientSearchBar
            onPatientSelect={(id, name) => {
              setSelectedPatientId(id ? id.toString() : null);
              setSearchText(name);
            }}
            initialPatientName={searchText}
            onToggleDropdown={isOpen => setScrollEnabled(!isOpen)}
          />

          <TouchableOpacity
            style={[styles.naRow, !selectedPatientId && { opacity: 0.5 }]}
            onPress={() => {
              if (!selectedPatientId) showAlert('Patient Required', 'Please select a patient first.');
              else toggleNA();
            }}
          >
            <Text style={[styles.naText, !selectedPatientId && { color: theme.textMuted }]}>Mark all as N/A</Text>
            <Icon
              name={isNA ? 'check-box' : 'check-box-outline-blank'}
              size={22}
              color={selectedPatientId ? theme.primary : theme.textMuted}
            />
          </TouchableOpacity>

          <Text style={[styles.disabledTextAtBottom, isNA && { color: theme.error }]}>
            {isNA ? 'All fields below are disabled.' : 'Checking this will disable all fields below.'}
          </Text>

          <View style={styles.banner}>
            <Text style={styles.bannerText}>PHYSICAL EXAMINATION</Text>
          </View>

          {/* Assessment Notepad Cards */}
          <ExamInputCard
            label="GENERAL APPEARANCE"
            value={formData.general_appearance}
            disabled={!selectedPatientId || isNA}
            alertText={getFieldAlert('general_appearance')}
            onChangeText={t => updateField('general_appearance', t)}
            onDisabledPress={() => !selectedPatientId && showAlert('Patient Required', 'Please select a patient first.')}
          />
          <ExamInputCard
            label="SKIN"
            value={formData.skin_condition}
            disabled={!selectedPatientId || isNA}
            alertText={getFieldAlert('skin_condition')}
            onChangeText={t => updateField('skin_condition', t)}
            onDisabledPress={() => !selectedPatientId && showAlert('Patient Required', 'Please select a patient first.')}
          />
          <ExamInputCard
            label="EYES"
            value={formData.eye_condition}
            disabled={!selectedPatientId || isNA}
            alertText={getFieldAlert('eye_condition')}
            onChangeText={t => updateField('eye_condition', t)}
            onDisabledPress={() => !selectedPatientId && showAlert('Patient Required', 'Please select a patient first.')}
          />
          <ExamInputCard
            label="ORAL CAVITY"
            value={formData.oral_condition}
            disabled={!selectedPatientId || isNA}
            alertText={getFieldAlert('oral_condition')}
            onChangeText={t => updateField('oral_condition', t)}
            onDisabledPress={() => !selectedPatientId && showAlert('Patient Required', 'Please select a patient first.')}
          />
          <ExamInputCard
            label="CARDIOVASCULAR"
            value={formData.cardiovascular}
            disabled={!selectedPatientId || isNA}
            alertText={getFieldAlert('cardiovascular')}
            onChangeText={t => updateField('cardiovascular', t)}
            onDisabledPress={() => !selectedPatientId && showAlert('Patient Required', 'Please select a patient first.')}
          />
          <ExamInputCard
            label="ABDOMEN"
            value={formData.abdomen_condition}
            disabled={!selectedPatientId || isNA}
            alertText={getFieldAlert('abdomen_condition')}
            onChangeText={t => updateField('abdomen_condition', t)}
            onDisabledPress={() => !selectedPatientId && showAlert('Patient Required', 'Please select a patient first.')}
          />
          <ExamInputCard
            label="EXTREMITIES"
            value={formData.extremities}
            disabled={!selectedPatientId || isNA}
            alertText={getFieldAlert('extremities')}
            onChangeText={t => updateField('extremities', t)}
            onDisabledPress={() => !selectedPatientId && showAlert('Patient Required', 'Please select a patient first.')}
          />
          <ExamInputCard
            label="NEUROLOGICAL"
            value={formData.neurological}
            disabled={!selectedPatientId || isNA}
            alertText={getFieldAlert('neurological')}
            onChangeText={t => updateField('neurological', t)}
            onDisabledPress={() => !selectedPatientId && showAlert('Patient Required', 'Please select a patient first.')}
          />

          <View style={styles.footerRow}>
            <TouchableOpacity
              style={[styles.cdssBtn, (!selectedPatientId || (!isDataEntered && !isNA)) && { backgroundColor: theme.buttonDisabledBg, borderColor: theme.buttonDisabledBorder }]}
              onPress={handleCDSSPress}
              disabled={!selectedPatientId}
            >
              <Text style={[styles.cdssText, (!selectedPatientId || (!isDataEntered && !isNA)) ? { color: theme.textMuted } : { color: theme.primary }]}>CDSS</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.submitBtn, !selectedPatientId && { backgroundColor: theme.buttonDisabledBg, borderColor: theme.buttonDisabledBorder }]}
              onPress={handleSave}
              disabled={!selectedPatientId}
            >
              <Text style={[styles.submitText, !selectedPatientId && { color: theme.textMuted }]}>SUBMIT</Text>
            </TouchableOpacity>
          </View>

          <View style={{ height: 100 }} />
        </ScrollView>
        <LinearGradient colors={fadeColors} style={styles.fadeBottom} pointerEvents="none" />
      </View>

      <SweetAlert
        visible={alertConfig.visible}
        title={alertConfig.title}
        message={alertConfig.message}
        type={alertConfig.type}
        onConfirm={() => setAlertConfig({ ...alertConfig, visible: false })}
        confirmText="OK"
      />
    </SafeAreaView>
  );
};

const createStyles = (theme: any, commonStyles: any, isDarkMode: boolean) =>
  StyleSheet.create({
    safeArea: commonStyles.safeArea,
    container: commonStyles.container,
    header: commonStyles.header,
    title: commonStyles.title,
    subTitleDate: { fontSize: 13, fontFamily: 'AlteHaasGroteskBold', color: theme.textMuted },
    sectionLabel: { fontSize: 12, fontWeight: 'bold', color: theme.primary, marginBottom: 8 },
    banner: { backgroundColor: theme.tableHeader, paddingVertical: 10, borderRadius: 25, alignItems: 'center', marginBottom: 20 },
    bannerText: { color: theme.secondary, fontFamily: 'AlteHaasGroteskBold', fontSize: 14 },
    naRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'flex-end', marginBottom: 5, marginTop: 5 },
    naText: { fontSize: 14, fontFamily: 'AlteHaasGroteskBold', color: theme.primary, marginRight: 8 },
    disabledTextAtBottom: { fontSize: 13, fontFamily: 'AlteHaasGroteskBold', color: theme.textMuted, textAlign: 'right', marginBottom: 15 },
    footerRow: { flexDirection: 'row', justifyContent: 'space-between', marginTop: 10, paddingBottom: 40 },
    cdssBtn: { flex: 1, backgroundColor: theme.buttonBg, paddingVertical: 15, borderRadius: 25, alignItems: 'center', marginHorizontal: 5, borderWidth: 1.5, borderColor: theme.buttonBorder },
    submitBtn: { flex: 1, backgroundColor: theme.buttonBg, paddingVertical: 15, borderRadius: 25, alignItems: 'center', marginHorizontal: 5, borderWidth: 1.5, borderColor: theme.buttonBorder },
    cdssText: { color: theme.primary, fontFamily: 'AlteHaasGroteskBold', fontSize: 16 },
    submitText: { color: theme.primary, fontFamily: 'AlteHaasGroteskBold', fontSize: 16 },
    fadeBottom: { position: 'absolute', bottom: 0, left: 0, right: 0, height: 60 },
  });

export default PhysicalExamScreen;
