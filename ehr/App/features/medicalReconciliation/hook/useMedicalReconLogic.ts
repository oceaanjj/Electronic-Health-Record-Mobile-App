import { useState, useMemo, useCallback } from 'react';
import apiClient from '../../../api/apiClient';

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
  extra: string; // Administered stay? / Discontinued? / Reason for change
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
  const [patients, setPatients] = useState<Patient[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
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

  const currentStage = RECON_STAGES[stageIndex];
  const values = reconData[stageIndex];

  // Fetch patients for selection
  const fetchPatients = useCallback(async () => {
    setIsLoading(true);
    try {
      const response = await apiClient.get('/patients/');
      setPatients(response.data || []);
    } catch (error) {
      console.error('Error fetching patients:', error);
    } finally {
      setIsLoading(false);
    }
  }, []);

  // VALIDATION: Hindi makaka-next kung walang maski isang input
  const isDataEntered = useMemo(() => {
    return Object.values(values).some(v => v.trim() !== '');
  }, [values]);

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
        title: 'Selection Required',
        message: 'Please select a patient first',
        type: 'warning'
      });
      return;
    }

    setIsSubmitting(true);
    try {
      // Stage 0: Current Medication
      const currentMed = reconData[0];
      if (Object.values(currentMed).some(v => v.trim() !== '')) {
        await apiClient.post('/medication-reconciliation/current-medication/', {
          patient_id: patientId,
          current_med: currentMed.med,
          current_dose: currentMed.dose,
          current_route: currentMed.route,
          current_frequency: currentMed.freq,
          current_indication: currentMed.indication,
          current_text: currentMed.extra
        });
      }

      // Stage 1: Home Medication
      const homeMed = reconData[1];
      if (Object.values(homeMed).some(v => v.trim() !== '')) {
        await apiClient.post('/medication-reconciliation/home-medication/', {
          patient_id: patientId,
          home_med: homeMed.med,
          home_dose: homeMed.dose,
          home_route: homeMed.route,
          home_frequency: homeMed.freq,
          home_indication: homeMed.indication,
          home_text: homeMed.extra
        });
      }

      // Stage 2: Changes in Medication
      const changeMed = reconData[2];
      if (Object.values(changeMed).some(v => v.trim() !== '')) {
        await apiClient.post('/medication-reconciliation/changes-in-medication/', {
          patient_id: patientId,
          change_med: changeMed.med,
          change_dose: changeMed.dose,
          change_route: changeMed.route,
          change_frequency: changeMed.freq,
          change_text: changeMed.extra
        });
      }

      setAlertConfig({
        visible: true,
        title: 'Success',
        message: 'Medication Reconciliation submitted successfully!',
        type: 'success'
      });
    } catch (error) {
      console.error('Error submitting reconciliation:', error);
      setAlertConfig({
        visible: true,
        title: 'Error',
        message: 'Failed to submit medication reconciliation',
        type: 'error'
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleNext = () => {
    if (isDataEntered) {
      if (stageIndex < RECON_STAGES.length - 1) {
        setStageIndex(prev => prev + 1);
      } else {
        submitReconciliation();
      }
    }
  };

  const closeAlert = () => {
    setAlertConfig(prev => ({ ...prev, visible: false }));
  };

  return {
    stageIndex,
    currentStage,
    values,
    patientName,
    setPatientName,
    patientId,
    setPatientId,
    patients,
    fetchPatients,
    isLoading,
    isSubmitting,
    handleUpdate,
    handleNext,
    isDataEntered,
    isLastStage: stageIndex === RECON_STAGES.length - 1,
    alertConfig,
    closeAlert
  };
};