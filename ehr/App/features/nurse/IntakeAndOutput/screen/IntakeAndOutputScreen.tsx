import React, {
  useState,
  useEffect,
  useRef,
  useCallback,
  useMemo,
} from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  ScrollView,
  TouchableOpacity,
  Pressable,
  StatusBar,
  ActivityIndicator,
  Modal,
  FlatList,
  Image,
  Dimensions,
  BackHandler,
  Platform,
} from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import Icon from 'react-native-vector-icons/MaterialIcons';

import IntakeOutputCard from '../component/IntakeOutputCard';
import SweetAlert from '@components/SweetAlert';
import PatientSearchBar from '@components/PatientSearchBar';
import { useIntakeAndOutputLogic } from '../hook/useIntakeAndOutputLogic';
import ADPIEScreen from '@nurse/VitalSigns/screen/ADPIEScreen';
import CDSSModal from '@components/CDSSModal';
import { useAppTheme } from '@App/theme/ThemeContext';

const alertIcon = require('@assets/icons/alert.png');

interface IntakeAndOutputScreenProps {
  onBack: () => void;
  readOnly?: boolean;
  patientId?: number;
  initialPatientName?: string;
}

const IntakeAndOutputScreen: React.FC<IntakeAndOutputScreenProps> = ({
  onBack,
  readOnly = false,
  patientId,
  initialPatientName,
}) => {
  const { isDarkMode, theme, commonStyles } = useAppTheme();
  const styles = useMemo(
    () => createStyles(theme, commonStyles, isDarkMode),
    [theme, commonStyles, isDarkMode],
  );

  const {
    patientName,
    selectedPatientId,
    handleSelectPatient,
    intakeOutput,
    handleUpdateField,
    isDataEntered,
    saveAssessment,
    checkRealTimeAlerts,
    assessmentAlert,
    currentAlert,
    setBackendAlert,
    triggerPatientAlert,
    loading,
    recordId,
    setIntakeOutput,
  } = useIntakeAndOutputLogic();

  const [alertVisible, setAlertVisible] = useState(false);
  const [cdssModalVisible, setCdssModalVisible] = useState(false);
  const [successVisible, setSuccessVisible] = useState(false);
  const [successMessage, setSuccessMessage] = useState({ title: '', message: '' });
  const [isAdpieActive, setIsAdpieActive] = useState(false);
  const [currentDate, setCurrentDate] = useState('');
  const [scrollEnabled, setScrollEnabled] = useState(true);
  const [isNA, setIsNA] = useState(false);
  const scrollViewRef = useRef<ScrollView>(null);

  // --- DOCTOR VIEWING LOGIC ---
  useEffect(() => {
    if (patientId) {
        handleSelectPatient(patientId, initialPatientName || '');
    }
  }, [patientId, initialPatientName, handleSelectPatient]);

  const toggleNA = () => {
    if (readOnly) return;
    const newState = !isNA;
    setIsNA(newState);
    if (newState) {
      setIntakeOutput({ oral_intake: 'N/A', iv_fluids: 'N/A', urine_output: 'N/A' });
    } else {
      setIntakeOutput(prev => ({
        oral_intake: prev.oral_intake === 'N/A' ? '' : prev.oral_intake,
        iv_fluids: prev.iv_fluids === 'N/A' ? '' : prev.iv_fluids,
        urine_output: prev.urine_output === 'N/A' ? '' : prev.urine_output,
      }));
    }
  };

  useEffect(() => {
    if (selectedPatientId) {
      const fields = ['oral_intake', 'iv_fluids', 'urine_output'];
      const allNA = fields.every(f => (intakeOutput as any)[f] === 'N/A');
      setIsNA(allNA);
    } else {
      setIsNA(false);
    }
  }, [selectedPatientId, intakeOutput]);

  const handleBackPress = useCallback(() => {
    if (isAdpieActive) {
      setIsAdpieActive(false);
      scrollViewRef.current?.scrollTo({ y: 0, animated: true });
      return true;
    }
    onBack();
    return true;
  }, [isAdpieActive, onBack]);

  useEffect(() => {
    const bh = BackHandler.addEventListener('hardwareBackPress', handleBackPress);
    return () => bh.remove();
  }, [handleBackPress]);

  useEffect(() => {
    setCurrentDate(new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' }));
  }, []);

  useEffect(() => {
    if (!selectedPatientId || readOnly) return;
    const timer = setTimeout(async () => {
      if (isDataEntered) {
        try {
          await checkRealTimeAlerts({
            patient_id: parseInt(selectedPatientId, 10),
            oral_intake: parseInt(intakeOutput.oral_intake, 10) || 0,
            iv_fluids: parseInt(intakeOutput.iv_fluids, 10) || 0,
            urine_output: parseInt(intakeOutput.urine_output, 10) || 0,
          });
        } catch (e) {}
      }
    }, 1000);
    return () => clearTimeout(timer);
  }, [intakeOutput, selectedPatientId, isDataEntered, checkRealTimeAlerts, readOnly]);

  const handleSubmit = async () => {
    if (readOnly) return;
    if (!selectedPatientId) { triggerPatientAlert(); setAlertVisible(true); return; }
    const result = await saveAssessment();
    if (result) {
      const isUpdate = recordId === result.id || result.updated_at !== result.created_at;
      setSuccessMessage({
        title: isUpdate ? 'SUCCESSFULLY UPDATED' : 'SUCCESSFULLY SUBMITTED',
        message: `Intake and output ${isUpdate ? 'updated' : 'submitted'} successfully.`,
      });
      setSuccessVisible(true);
    } else { setAlertVisible(true); }
  };

  const handleCDSSPress = async () => {
    if (readOnly) { if (recordId) setIsAdpieActive(true); return; }
    if (!selectedPatientId) { triggerPatientAlert(); setAlertVisible(true); return; }
    const res = await saveAssessment();
    if (res && res.id) { setIsAdpieActive(true); }
    else if (recordId) { setIsAdpieActive(true); }
    else { setAlertVisible(true); }
  };

  const fadeColors = isDarkMode
    ? ['rgba(18, 18, 18, 0)', 'rgba(18, 18, 18, 0.8)', 'rgba(18, 18, 18, 1)']
    : ['rgba(255, 255, 255, 0)', 'rgba(255, 255, 255, 0.8)', 'rgba(255, 255, 255, 1)'];

  if (isAdpieActive && recordId) {
    return (
      <ADPIEScreen
        recordId={recordId}
        patientName={patientName}
        onBack={() => setIsAdpieActive(false)}
        feature="intake-output"
        readOnly={readOnly}
      />
    );
  }

  return (
    <SafeAreaView style={styles.root}>
      <StatusBar barStyle={isDarkMode ? 'light-content' : 'dark-content'} backgroundColor="transparent" translucent={true} />
      <View style={{ zIndex: 10 }}>
        <View style={{ paddingHorizontal: 40, backgroundColor: theme.background, paddingBottom: 15 }}>
          <View style={styles.header}>
            <View style={{ flex: 1 }}>
              <Text style={styles.title}>Intake and Output</Text>
              <Text style={styles.subDate}>{currentDate}</Text>
            </View>
            <TouchableOpacity onPress={onBack}><Icon name="close" size={28} color={theme.primary} /></TouchableOpacity>
          </View>
        </View>
        <LinearGradient colors={isDarkMode ? ['#121212', 'transparent'] : ['#FFF', 'transparent']} style={{ height: 20 }} pointerEvents="none" />
      </View>

      <View style={{ flex: 1, marginTop: -20 }}>
        <ScrollView ref={scrollViewRef} keyboardShouldPersistTaps="handled" showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent} scrollEnabled={scrollEnabled}>
          <View style={{ height: 20 }} />
          {!readOnly ? (
            <PatientSearchBar initialPatientName={patientName} onPatientSelect={handleSelectPatient} onToggleDropdown={isOpen => setScrollEnabled(!isOpen)} />
          ) : (
            <View style={styles.readOnlyBanner}>
                <Text style={styles.bannerLabel}>VIEWING PATIENT:</Text>
                <Text style={styles.bannerName}>{initialPatientName || "N/A"}</Text>
            </View>
          )}

          {!readOnly && (
            <View>
                <TouchableOpacity style={[styles.naRow, !selectedPatientId && { opacity: 0.5 }]} onPress={() => { if (!selectedPatientId) { triggerPatientAlert(); setAlertVisible(true); } else { toggleNA(); } }}>
                    <Text style={styles.naText}>Mark all as N/A</Text>
                    <Icon name={isNA ? 'check-box' : 'check-box-outline-blank'} size={22} color={selectedPatientId ? theme.primary : theme.textMuted} />
                </TouchableOpacity>
                <Text style={[styles.disabledText, isNA && { color: theme.error }]}>
                    {isNA ? 'All fields below are disabled.' : 'Checking this will disable all fields below.'}
                </Text>
            </View>
          )}

          <View style={{ opacity: selectedPatientId ? 1 : 0.6 }}>
            <IntakeOutputCard label="ORAL INTAKE" value={intakeOutput.oral_intake} onChangeText={t => handleUpdateField('oral_intake', t)} disabled={!selectedPatientId || isNA || readOnly} />
            <IntakeOutputCard label="IV FLUIDS" value={intakeOutput.iv_fluids} onChangeText={t => handleUpdateField('iv_fluids', t)} disabled={!selectedPatientId || isNA || readOnly} />
            <IntakeOutputCard label="URINE OUTPUT" value={intakeOutput.urine_output} onChangeText={t => handleUpdateField('urine_output', t)} disabled={!selectedPatientId || isNA || readOnly} />
          </View>

          <View style={styles.footerAction}>
            {!readOnly ? (
                <>
                    <TouchableOpacity style={[styles.alertIcon, { backgroundColor: assessmentAlert ? (isDarkMode ? '#78350F' : '#FFECBD') : theme.surface }]} disabled={!isDataEntered || !selectedPatientId} onPress={() => setCdssModalVisible(true)}>
                        <Image source={alertIcon} style={[styles.fullImg, { tintColor: '#EDB62C' }]} />
                    </TouchableOpacity>
                    <View style={styles.buttonGroup}>
                        <TouchableOpacity style={[styles.cdssButton, (!selectedPatientId || !isDataEntered) && { backgroundColor: theme.buttonDisabledBg }]} onPress={handleCDSSPress} disabled={!selectedPatientId}>
                            <Text style={[styles.cdssBtnText, (!selectedPatientId || !isDataEntered) && { color: theme.textMuted }]}>CDSS</Text>
                        </TouchableOpacity>
                        <TouchableOpacity style={[styles.submitButton, !selectedPatientId && { backgroundColor: theme.buttonDisabledBg }]} onPress={handleSubmit} disabled={!selectedPatientId}>
                            <Text style={[styles.submitBtnText, !selectedPatientId && { color: theme.textMuted }]}>SUBMIT</Text>
                        </TouchableOpacity>
                    </View>
                </>
            ) : (
                <View style={styles.buttonGroup}>
                    <TouchableOpacity style={styles.cdssButton} onPress={handleCDSSPress}><Text style={styles.cdssBtnText}>VIEW ADPIE</Text></TouchableOpacity>
                    <TouchableOpacity style={styles.submitButton} onPress={onBack}><Text style={styles.submitBtnText}>FINISH</Text></TouchableOpacity>
                </View>
            )}
          </View>
        </ScrollView>
        <LinearGradient colors={fadeColors} style={styles.fadeBottom} pointerEvents="none" />
      </View>

      <CDSSModal visible={cdssModalVisible} onClose={() => setCdssModalVisible(false)} category="I&O Assessment" alertText={assessmentAlert || 'Stable findings.'} />
      <SweetAlert visible={alertVisible} title="Alert" message="Please select a patient first." type="error" onConfirm={() => setAlertVisible(false)} />
      <SweetAlert visible={successVisible} title={successMessage.title} message={successMessage.message} type="success" onConfirm={() => setSuccessVisible(false)} />
    </SafeAreaView>
  );
};

const createStyles = (theme: any, commonStyles: any, isDarkMode: boolean) => StyleSheet.create({
  root: { flex: 1, backgroundColor: theme.background },
  scrollContent: { paddingHorizontal: 40, paddingBottom: 130 },
  header: commonStyles.header,
  title: commonStyles.title,
  subDate: { color: theme.textMuted, fontFamily: 'AlteHaasGroteskBold', fontSize: 13 },
  readOnlyBanner: { backgroundColor: '#E5FFE8', padding: 15, borderRadius: 20, borderWidth: 1, borderColor: '#29A539', marginBottom: 10 },
  bannerLabel: { fontSize: 10, color: '#29A539', fontWeight: 'bold' },
  bannerName: { fontSize: 18, color: '#035022', fontFamily: 'MinionPro-SemiboldItalic' },
  naRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'flex-end', marginTop: 5 },
  naText: { fontSize: 14, fontFamily: 'AlteHaasGroteskBold', color: theme.primary, marginRight: 8 },
  disabledText: { fontSize: 13, fontFamily: 'AlteHaasGroteskBold', color: theme.textMuted, textAlign: 'right', marginBottom: 15 },
  footerAction: { flexDirection: 'row', alignItems: 'center', marginTop: 10 },
  alertIcon: { width: 45, height: 45, borderRadius: 22.5, justifyContent: 'center', alignItems: 'center', borderWidth: 1, borderColor: '#EDB62C' },
  fullImg: { width: '80%', height: '80%', resizeMode: 'contain' },
  buttonGroup: { flex: 1, flexDirection: 'row', marginLeft: 15 },
  cdssButton: { flex: 1, height: 48, backgroundColor: theme.buttonBg, borderRadius: 25, justifyContent: 'center', alignItems: 'center', borderWidth: 1.5, borderColor: theme.buttonBorder, marginRight: 5 },
  cdssBtnText: { color: theme.primary, fontFamily: 'AlteHaasGroteskBold', fontSize: 14 },
  submitButton: { flex: 1, height: 48, backgroundColor: theme.buttonBg, borderRadius: 25, justifyContent: 'center', alignItems: 'center', borderWidth: 1.5, borderColor: theme.buttonBorder, marginLeft: 5 },
  submitBtnText: { color: theme.primary, fontFamily: 'AlteHaasGroteskBold', fontSize: 14 },
  fadeBottom: { position: 'absolute', bottom: 0, left: 0, right: 0, height: 60 },
});

export default IntakeAndOutputScreen;
