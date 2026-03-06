import { useState, useMemo, useCallback } from 'react';
import apiClient from '@api/apiClient';

export const RECON_STAGES = [
  "PATIENT'S CURRENT MEDICATION",
  "PATIENT'S HOME MEDICATION",
  "CHANGES IN MEDICATION DURING HOSPITALIZATION"
];

export interface ReconEntry {
  med: string;
  dose: string;
  route: string;
  freq: string;
  indication: string;
  extra: string; 
}

export interface Patient {
  patient_id: number;
  first_name: string;
  last_name: string;
}

const initialEntry: ReconEntry = { med: '', dose: '', route: '', freq: '', indication: '', extra: '' };

export const useMedicalReconLogic = () => {
  const [stageIndex, setStageIndex] = useState(0);
  const [patientId, setPatientId] = useState<number | null>(null);
  const [patientName, setPatientName] = useState('');
  
  const [isLoading, setIsLoading] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const [existingIds, setExistingIds] = useState<{
    current: number | null;
    home: number | null;
    changes: number | null;
  }>({ current: null, home: null, changes: null });

  const [reconData, setReconData] = useState<Record<number, ReconEntry>>({
    0: { ...initialEntry },
    1: { ...initialEntry },
    2: { ...initialEntry }
  });

  const [alertConfig, setAlertConfig] = useState<{
    visible: boolean;
    title: string;
    message: string;
    type: 'success' | 'error' | 'warning' | 'info';
  }>({ visible: false, title: '', message: '', type: 'info' });

  const [successMessage, setSuccessMessage] = useState({
    title: '',
    message: '',
  });
  const [successVisible, setSuccessVisible] = useState(false);

  const currentStage = RECON_STAGES[stageIndex];
  const values = reconData[stageIndex];

  const fetchPatientMedications = useCallback(async (id: number) => {
    setIsLoading(true);
    try {
      // Matches the Laravel hyphenated structure
      const [homeRes, currentRes, changesRes] = await Promise.all([
        apiClient.get(`/medication-reconciliation/home/patient/${id}`),
        apiClient.get(`/medication-reconciliation/current/patient/${id}`),
        apiClient.get(`/medication-reconciliation/changes/patient/${id}`),
      ]);

      const home = (Array.isArray(homeRes.data) ? homeRes.data[0] : homeRes.data) || {};
      const current = (Array.isArray(currentRes.data) ? currentRes.data[0] : currentRes.data) || {};
      const changes = (Array.isArray(changesRes.data) ? changesRes.data[0] : changesRes.data) || {};

      setExistingIds({
        current: current.id || null,
        home: home.id || null,
        changes: changes.id || null
      });

      setReconData({
        0: {
          med: current.current_med || '',
          dose: current.current_dose || '',
          route: current.current_route || '',
          freq: current.current_frequency || '',
          indication: current.current_indication || '',
          extra: current.current_text || ''
        },
        1: {
          med: home.home_med || '',
          dose: home.home_dose || '',
          route: home.home_route || '',
          freq: home.home_frequency || '',
          indication: home.home_indication || '',
          extra: home.home_text || ''
        },
        2: {
          med: changes.change_med || '',
          dose: changes.change_dose || '',
          route: changes.change_route || '',
          freq: changes.change_frequency || '',
          indication: '',
          extra: changes.change_text || ''
        }
      });
    } catch (error) {
      console.error('Error fetching patient medications:', error);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useMemo(() => {
    if (patientId) {
      fetchPatientMedications(patientId);
    } else {
      setExistingIds({ current: null, home: null, changes: null });
      setReconData({
        0: { ...initialEntry },
        1: { ...initialEntry },
        2: { ...initialEntry }
      });
    }
  }, [patientId, fetchPatientMedications]);

  const isDataEntered = useMemo(() => true, []);

  const handleUpdate = (field: keyof ReconEntry, value: string) => {
    setReconData(prev => ({
      ...prev,
      [stageIndex]: { ...prev[stageIndex], [field]: value }
    }));
  };

  const submitReconciliation = async () => {
    if (!patientId) {
      setAlertConfig({
        visible: true,
        title: 'Patient Required',
        message: 'Please select a patient first in the search bar.',
        type: 'error'
      });
      return;
    }

    setIsSubmitting(true);
    const sanitize = (val: string) => (val && val.trim() === '' ? 'N/A' : val || 'N/A');

    try {
      const newIds = { ...existingIds };

      // Stage 0: Current Medication
      const cMed = reconData[0];
      const p0 = {
        patient_id: patientId,
        current_med: sanitize(cMed.med),
        current_dose: sanitize(cMed.dose),
        current_route: sanitize(cMed.route),
        current_frequency: sanitize(cMed.freq),
        current_indication: sanitize(cMed.indication),
        current_text: sanitize(cMed.extra)
      };

      if (existingIds.current) {
        await apiClient.put(`/medication-reconciliation/current/${existingIds.current}`, p0);
      } else {
        const res = await apiClient.post('/medication-reconciliation/current', p0);
        if (res.data?.id) newIds.current = res.data.id;
      }

      // Stage 1: Home Medication
      const hMed = reconData[1];
      const p1 = {
        patient_id: patientId,
        home_med: sanitize(hMed.med),
        home_dose: sanitize(hMed.dose),
        home_route: sanitize(hMed.route),
        home_frequency: sanitize(hMed.freq),
        home_indication: sanitize(hMed.indication),
        home_text: sanitize(hMed.extra)
      };

      if (existingIds.home) {
        await apiClient.put(`/medication-reconciliation/home/${existingIds.home}`, p1);
      } else {
        const res = await apiClient.post('/medication-reconciliation/home', p1);
        if (res.data?.id) newIds.home = res.data.id;
      }

      // Stage 2: Changes in Medication
      const chMed = reconData[2];
      const p2 = {
        patient_id: patientId,
        change_med: sanitize(chMed.med),
        change_dose: sanitize(chMed.dose),
        change_route: sanitize(chMed.route),
        change_frequency: sanitize(chMed.freq),
        change_text: sanitize(chMed.extra)
      };

      if (existingIds.changes) {
        await apiClient.put(`/medication-reconciliation/changes/${existingIds.changes}`, p2);
      } else {
        const res = await apiClient.post('/medication-reconciliation/changes', p2);
        if (res.data?.id) newIds.changes = res.data.id;
      }

      setExistingIds(newIds);
      setSuccessMessage({
        title: 'Success',
        message: 'Medication Reconciliation saved successfully!',
      });
      setSuccessVisible(true);

    } catch (error) {
      console.error('Error submitting reconciliation:', error);
      setAlertConfig({
        visible: true,
        title: 'Error',
        message: 'Failed to save medication reconciliation',
        type: 'error'
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleNext = () => {
    if (stageIndex < RECON_STAGES.length - 1) {
      setStageIndex(prev => prev + 1);
    } else {
      submitReconciliation();
    }
  };

  const closeAlert = () => setAlertConfig(prev => ({ ...prev, visible: false }));

  const triggerPatientAlert = useCallback(() => {
    setAlertConfig({
      visible: true,
      title: 'Patient Required',
      message: 'Please select a patient first in the search bar.',
      type: 'error'
    });
  }, []);

  const resetForm = useCallback(() => {
    setStageIndex(0);
    setPatientId(null);
    setPatientName('');
    setExistingIds({ current: null, home: null, changes: null });
    setReconData({
      0: { ...initialEntry },
      1: { ...initialEntry },
      2: { ...initialEntry }
    });
  }, []);

  return {
    stageIndex,
    currentStage,
    values,
    patientName,
    setPatientName,
    patientId,
    setPatientId,
    isLoading,
    isSubmitting,
    handleUpdate,
    handleNext,
    isDataEntered,
    isLastStage: stageIndex === RECON_STAGES.length - 1,
    alertConfig,
    closeAlert,
    triggerPatientAlert,
    resetForm,
    setStageIndex,
    RECON_STAGES,
    successMessage,
    successVisible,
    setSuccessVisible
  };
};
