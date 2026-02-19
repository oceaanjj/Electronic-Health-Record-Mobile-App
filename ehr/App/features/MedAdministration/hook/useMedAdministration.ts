// MedAdministration/hook/useMedAdministration.ts
import { useState } from 'react';
import apiClient from '../../../api/apiClient';

export const useMedAdministration = () => {
  const [step, setStep] = useState(0); // 0: 10AM, 1: 2PM, 2: 6PM
  const timeSlots = ['10:00:00', '14:00:00', '18:00:00'];
  const displayTimeSlots = ['10:00 AM', '2:00 PM', '6:00 PM'];

  const [formData, setFormData] = useState({
    patient_id: null as number | null,
    patientName: '',
    date: new Date().toISOString().split('T')[0],
    medications: [
      { medication: '', dose: '', route: '', frequency: '', comments: '' },
      { medication: '', dose: '', route: '', frequency: '', comments: '' },
      { medication: '', dose: '', route: '', frequency: '', comments: '' },
    ],
  });

  const updateCurrentMed = (field: string, value: string) => {
    const newMeds = [...formData.medications];
    newMeds[step] = { ...newMeds[step], [field]: value };
    setFormData({ ...formData, medications: newMeds });
  };

  const nextStep = () => {
    if (step < 2) setStep(step + 1);
  };

  const saveMedAdministration = async () => {
    if (!formData.patient_id) {
      throw new Error('Patient is required');
    }

    try {
      // Save each medication administration entry
      const requests = formData.medications
        .map((med, index) => ({ med, index })) // Keep track of original index for timeSlots
        .filter(item => item.med.medication.trim() !== '')
        .map(item => {
          return apiClient.post('/medication-administration/', {
            patient_id: formData.patient_id,
            medication: item.med.medication,
            dose: item.med.dose,
            route: item.med.route,
            frequency: item.med.frequency,
            comments: item.med.comments,
          });
        });

      if (requests.length === 0) {
        throw new Error('No medication data to submit');
      }

      await Promise.all(requests);
    } catch (err: any) {
      const message =
        err?.response?.data?.detail || err?.message || 'Submission Error';
      throw new Error(
        typeof message === 'string' ? message : JSON.stringify(message),
      );
    }
  };

  return {
    step,
    setStep,
    timeSlots: displayTimeSlots,
    formData,
    setFormData,
    updateCurrentMed,
    nextStep,
    saveMedAdministration,
  };
};
