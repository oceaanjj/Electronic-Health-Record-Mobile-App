// MedAdministration/hook/useMedAdministration.js
import { useState, useCallback } from 'react';
import apiClient from '@api/apiClient';

const getTodayFormatted = () =>
  new Date().toLocaleDateString('en-US', {
    month: 'long',
    day: 'numeric',
    year: 'numeric',
  });

const toRawDate = displayDate => {
  const d = new Date(displayDate);
  if (isNaN(d.getTime())) {
    return new Date().toISOString().split('T')[0];
  }
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};

const normalizeTime = time => {
  if (!time) return '';
  // Convert HH:mm:ss or H:m to HH:mm
  const parts = time.split(':');
  if (parts.length >= 2) {
    const h = parts[0].trim().padStart(2, '0');
    const m = parts[1].trim().padStart(2, '0');
    return `${h}:${m}`;
  }
  return time;
};

export const useMedAdministration = () => {
  const [step, setStep] = useState(0); 
  const rawTimeSlots = ['10:00', '14:00', '18:00'];
  const displayTimeSlots = ['10:00 AM', '02:00 PM', '06:00 PM'];

  const [formData, setFormData] = useState({
    patient_id: null,
    patientName: '',
    date: getTodayFormatted(),
    medications: [
      { id: null, medication: '', dose: '', route: '', frequency: '', comments: '' },
      { id: null, medication: '', dose: '', route: '', frequency: '', comments: '' },
      { id: null, medication: '', dose: '', route: '', frequency: '', comments: '' },
    ],
  });

  const updateCurrentMed = (field, value) => {
    setFormData(prev => {
      const newMeds = [...prev.medications];
      newMeds[step] = { ...newMeds[step], [field]: value };
      return { ...prev, medications: newMeds };
    });
  };

  const nextStep = () => {
    if (step < 2) setStep(step + 1);
  };

  const fetchPatientData = useCallback(async (patientId, dateStr) => {
    try {
      const rawDate = toRawDate(dateStr);
      console.log(`[MedAdmin] Fetching for patient ${patientId} on ${rawDate}`);
      
      const response = await apiClient.get(
        `/medication-administration/patient/${patientId}?patient_id=${patientId}`,
      );
      
      const responseData = response.data;
      console.log('[MedAdmin] Raw API Response:', JSON.stringify(responseData));

      // Handle Laravel wrapping
      const records = Array.isArray(responseData) ? responseData : (responseData.data || []);

      // Filter for the selected date
      const todayRecords = records.filter(r => {
          const recDate = (r.date || r.created_at || '').split('T')[0].split(' ')[0];
          return recDate === rawDate;
      });

      const newMeds = [
        { id: null, medication: '', dose: '', route: '', frequency: '', comments: '' },
        { id: null, medication: '', dose: '', route: '', frequency: '', comments: '' },
        { id: null, medication: '', dose: '', route: '', frequency: '', comments: '' },
      ];

      todayRecords.forEach(record => {
        const recordTime = normalizeTime(record.time);
        
        // Match 10:00, 14:00, or 18:00
        const timeIndex = rawTimeSlots.indexOf(recordTime);
        
        if (timeIndex !== -1) {
          console.log(`[MedAdmin] Matched record ${record.id} to slot ${timeIndex} (${recordTime})`);
          newMeds[timeIndex] = {
            id: record.id,
            medication: record.medication === 'N/A' ? '' : record.medication || '',
            dose: record.dose === 'N/A' ? '' : record.dose || '',
            route: record.route === 'N/A' ? '' : record.route || '',
            frequency: record.frequency === 'N/A' ? '' : record.frequency || '',
            comments: record.comments === 'N/A' ? '' : record.comments || '',
          };
        }
      });

      setFormData(prev => ({
        ...prev,
        medications: newMeds,
        patient_id: patientId,
      }));
    } catch (error) {
      console.error('Error fetching patient med data:', error);
    }
  }, []);

  const saveMedAdministration = async () => {
    if (!formData.patient_id) {
      throw new Error('Patient is required');
    }

    const sanitize = val =>
      val === null || (typeof val === 'string' && val.trim() === '')
        ? 'N/A'
        : val;

    const rawDate = toRawDate(formData.date);
    const item = formData.medications[step];

    const payload = {
      patient_id: parseInt(formData.patient_id, 10),
      medication: sanitize(item.medication),
      dose: sanitize(item.dose),
      route: sanitize(item.route),
      frequency: sanitize(item.frequency),
      time: rawTimeSlots[step],
      date: rawDate,
      comments: sanitize(item.comments),
    };

    try {
      let res;
      // If we have an existing ID for this slot, use PUT to update it specifically
      if (item.id) {
        res = await apiClient.put(`/medication-administration/${item.id}`, payload);
      } else {
        // Otherwise use POST (Backend guide says POST also updates if patient/date/time match)
        res = await apiClient.post('/medication-administration', payload);
      }
      
      const savedData = res.data?.data || res.data;
      console.log('[MedAdmin] Saved successfully:', JSON.stringify(savedData));

      if (savedData?.id) {
          setFormData(prev => {
              const newMeds = [...prev.medications];
              newMeds[step] = { ...newMeds[step], id: savedData.id };
              return { ...prev, medications: newMeds };
          });
      }
      return savedData;
    } catch (err) {
      console.error(`Error saving med step ${step}:`, err?.response?.data || err.message);
      const serverMsg = err?.response?.data?.message || err?.response?.data?.detail;
      throw new Error(serverMsg || err.message || 'Failed to save');
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
    fetchPatientData,
  };
};
