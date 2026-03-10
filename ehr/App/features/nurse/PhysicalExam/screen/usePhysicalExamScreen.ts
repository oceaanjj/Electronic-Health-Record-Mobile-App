import { useState, useEffect, useCallback, useRef } from 'react';
import { BackHandler } from 'react-native';
import { usePhysicalExam } from '../hook/usePhysicalExam';
import { initialFormData, ALERT_KEY_MAP } from './constants';

export const usePhysicalExamScreen = (onBack: () => void) => {
  const {
    saveAssessment,
    checkAssessmentAlerts,
    fetchLatestPhysicalExam,
    dataAlert,
    fetchDataAlert,
  } = usePhysicalExam();

  const [searchText, setSearchText] = useState('');
  const [selectedPatientId, setSelectedPatientId] = useState<string | null>(null);
  const [scrollEnabled, setScrollEnabled] = useState(true);
  const prevPatientIdRef = useRef<string | null>(null);
  const fieldTimers = useRef<Record<string, ReturnType<typeof setTimeout>>>({});
  const formDataRef = useRef(initialFormData);
  const examIdRef = useRef<number | null>(null);

  const [alertConfig, setAlertConfig] = useState<{
    visible: boolean;
    title: string;
    message: string;
    type: 'success' | 'error' | 'warning';
  }>({ visible: false, title: '', message: '', type: 'error' });

  const showAlert = (
    title: string,
    message: string,
    type: 'success' | 'error' | 'warning' = 'error',
  ) => setAlertConfig({ visible: true, title, message, type });

  const [examId, setExamId] = useState<number | null>(null);
  const [backendAlerts, setBackendAlerts] = useState<any>({});
  const [assessmentAlert, setAssessmentAlert] = useState<string | null>(null);
  const [isAdpieActive, setIsAdpieActive] = useState(false);
  const [formData, setFormData] = useState(initialFormData);
  const [isNA, setIsNA] = useState(false);

  useEffect(() => { formDataRef.current = formData; }, [formData]);
  useEffect(() => { examIdRef.current = examId; }, [examId]);

  useEffect(() => {
    const backAction = () => { onBack(); return true; };
    const backHandler = BackHandler.addEventListener('hardwareBackPress', backAction);
    return () => backHandler.remove();
  }, [onBack]);

  const toggleNA = () => {
    const newState = !isNA;
    setIsNA(newState);
    if (newState) {
      Object.values(fieldTimers.current).forEach(clearTimeout);
      fieldTimers.current = {};
      const updated = { ...formData };
      Object.keys(initialFormData).forEach(key => { (updated as any)[key] = 'N/A'; });
      setFormData(updated);
    } else {
      const updated = { ...formData };
      Object.keys(initialFormData).forEach(key => {
        if ((updated as any)[key] === 'N/A') (updated as any)[key] = '';
      });
      setFormData(updated);
    }
  };

  const loadPatientData = useCallback(
    async (patientId: number) => {
      fetchDataAlert(patientId);
      const data = await fetchLatestPhysicalExam(patientId);
      if (data) {
        setExamId(data.id);
        examIdRef.current = data.id;
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
          general_appearance_alert: data.general_appearance_alert || null,
          skin_alert: data.skin_alert || null,
          eye_alert: data.eye_alert || null,
          oral_alert: data.oral_alert || null,
          cardiovascular_alert: data.cardiovascular_alert || null,
          abdomen_alert: data.abdomen_alert || null,
          extremities_alert: data.extremities_alert || null,
          neurological_alert: data.neurological_alert || null,
        });
      } else {
        setExamId(null);
        examIdRef.current = null;
        setFormData(initialFormData);
        setIsNA(false);
        setBackendAlerts({});
        Object.values(fieldTimers.current).forEach(clearTimeout);
        fieldTimers.current = {};
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
        examIdRef.current = null;
        setFormData(initialFormData);
        setIsNA(false);
        setBackendAlerts({});
        Object.values(fieldTimers.current).forEach(clearTimeout);
        fieldTimers.current = {};
      }
    }
  }, [selectedPatientId, loadPatientData]);

  const getBackendAlert = (field: string): string | null => {
    const alertKey = ALERT_KEY_MAP[field];
    if (alertKey && backendAlerts[alertKey] && backendAlerts[alertKey] !== 'N/A') {
      return backendAlerts[alertKey];
    }
    return null;
  };

  const updateField = (field: string, val: string) => {
    setFormData(prev => ({ ...prev, [field]: val }));

    if (fieldTimers.current[field]) clearTimeout(fieldTimers.current[field]);

    const alertKey = ALERT_KEY_MAP[field];

    if (!val || val.trim().length < 3 || val === 'N/A') {
      if (alertKey) setBackendAlerts((prev: any) => ({ ...prev, [alertKey]: null }));
      return;
    }

    fieldTimers.current[field] = setTimeout(async () => {
      if (!selectedPatientId) return;

      const currentForm = { ...formDataRef.current, [field]: val };
      const result = await checkAssessmentAlerts(
        { patient_id: selectedPatientId, ...currentForm },
        examIdRef.current,
      );

      if (!result) return;

      const record = (result.data && typeof result.data === 'object') ? result.data : result;
      const newId = record.id || record.physical_exam_id;
      if (newId) {
        examIdRef.current = newId;
        if (!examId) setExamId(newId);
      }

      // Check save response first; fall back to GET which always has computed alert columns
      let alertValue = alertKey ? (record[alertKey] ?? null) : null;
      if (alertKey && !alertValue) {
        const fresh = await fetchLatestPhysicalExam(parseInt(selectedPatientId, 10));
        if (fresh) alertValue = fresh[alertKey] ?? null;
      }

      if (alertKey) {
        setBackendAlerts((prev: any) => ({ ...prev, [alertKey]: alertValue || null }));
      }
    }, 1000);
  };

  const handleCDSSPress = async () => {
    if (!selectedPatientId) {
      return showAlert('Patient Required', 'Please select a patient first in the search bar.');
    }
    try {
      const result = await saveAssessment({ patient_id: selectedPatientId, ...formData }, examId);
      const id = result?.id || result?.physical_exam_id || examId;
      if (id) {
        setExamId(id);
        if (result?.assessment_alert || result?.alert) {
          setAssessmentAlert(result.assessment_alert || result.alert);
        }
        setIsAdpieActive(true);
      } else {
        showAlert('Error', 'Could not retrieve assessment ID.');
      }
    } catch (e) {
      showAlert('Error', 'Could not initiate clinical support.');
    }
  };

  const handleSave = async () => {
    if (!selectedPatientId) {
      return showAlert('Patient Required', 'Please select a patient first in the search bar.');
    }
    try {
      const result = await saveAssessment({ patient_id: selectedPatientId, ...formData }, examId);
      const newId = result.id || result.physical_exam_id;
      const isUpdate = !!examId || result.updated_at !== result.created_at;
      if (newId) {
        setExamId(newId);
        examIdRef.current = newId;
        fetchDataAlert(parseInt(selectedPatientId, 10));
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

  const generateFindingsSummary = () => {
    const findings = Object.entries(formData)
      .filter(([_, v]) => v && v.trim() !== '' && v !== 'N/A')
      .map(([key, v]) => `${key.replace(/_/g, ' ').toUpperCase()}: ${v}`);

    const alerts = Object.entries(backendAlerts)
      .filter(([_, v]) => typeof v === 'string' && (v as string).trim() !== '' && !(v as string).toLowerCase().includes('normal'))
      .map(([_, v]) => v as string);

    const summary = [...findings, ...alerts];
    if (dataAlert) {
      if (typeof dataAlert === 'string') summary.push(dataAlert);
      else Object.values(dataAlert).forEach(v => typeof v === 'string' && v.trim() !== '' && summary.push(v));
    }
    return summary.join('. ');
  };

  const isDataEntered = Object.values(formData).some(
    v => v && v.trim().length > 0 && v !== 'N/A',
  );

  const getCurrentDate = () =>
    new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' });

  return {
    searchText, setSearchText,
    selectedPatientId, setSelectedPatientId,
    scrollEnabled, setScrollEnabled,
    alertConfig, setAlertConfig,
    showAlert,
    examId,
    assessmentAlert, setAssessmentAlert,
    isAdpieActive, setIsAdpieActive,
    formData,
    isNA,
    backendAlerts,
    dataAlert,
    toggleNA,
    loadPatientData,
    getBackendAlert,
    updateField,
    handleCDSSPress,
    handleSave,
    generateFindingsSummary,
    isDataEntered,
    getCurrentDate,
  };
};
