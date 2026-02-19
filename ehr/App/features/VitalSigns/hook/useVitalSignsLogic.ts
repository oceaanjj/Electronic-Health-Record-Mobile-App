import { useState, useMemo } from 'react';
import { Alert } from 'react-native';

const TIME_SLOTS = ['6:00 AM', '8:00 AM', '12:00 PM', '2:00 PM', '6:00 PM', '8:00 PM', '12:00 AM'];

export interface Vitals {
  temperature: string;
  hr: string;
  rr: string;
  bp: string;
  spo2: string;
}

const initialVitals: Vitals = {
  temperature: '',
  hr: '',
  rr: '',
  bp: '',
  spo2: '',
};

// Normal Ranges for Validation
const NORMAL_RANGES = {
  temp: { min: 36.1, max: 37.5 },
  hr: { min: 60, max: 100 },
  rr: { min: 12, max: 20 },
  spo2: { min: 95, max: 100 },
};

export const useVitalSignsLogic = () => {
  const [patientName, setPatientName] = useState('');
  const [vitalsHistory, setVitalsHistory] = useState<Record<string, Vitals>>({});
  const [currentVitals, setCurrentVitals] = useState<Vitals>(initialVitals);
  const [currentTimeIndex, setCurrentTimeIndex] = useState(0);

  const currentTime = useMemo(() => TIME_SLOTS[currentTimeIndex], [currentTimeIndex]);

  const isDataEntered = useMemo(() => {
    return Object.values(currentVitals).some(value => value.trim() !== '');
  }, [currentVitals]);

  // --- ENGLISH ALERT LOGIC ---
  const handleAlertPress = () => {
    let alerts: string[] = [];

    const temp = parseFloat(currentVitals.temperature);
    if (temp > NORMAL_RANGES.temp.max) alerts.push(`High Temperature: ${temp}°C`);
    if (temp < NORMAL_RANGES.temp.min && temp > 0) alerts.push(`Low Temperature: ${temp}°C`);

    const hr = parseFloat(currentVitals.hr);
    if ((hr > NORMAL_RANGES.hr.max || hr < NORMAL_RANGES.hr.min) && hr > 0) alerts.push(`Abnormal Heart Rate: ${hr} bpm`);

    const spo2 = parseFloat(currentVitals.spo2);
    if (spo2 < NORMAL_RANGES.spo2.min && spo2 > 0) alerts.push(`Low SpO2: ${spo2}%`);

    if (alerts.length > 0) {
      // Alert title and messages in English
      Alert.alert("Vital Signs Alert!", alerts.join('\n'), [{ text: "OK" }]);
    } else {
      // Normal status in English
      Alert.alert("Normal Vitals", "All current inputs are within the normal range.", [{ text: "OK" }]);
    }
  };

  const handleUpdateVital = (key: keyof Vitals, value: string) => {
    setCurrentVitals(prev => ({ ...prev, [key]: value }));
  };

  const handleNextTime = () => {
    if (isDataEntered && currentTimeIndex < TIME_SLOTS.length - 1) {
      setVitalsHistory(prev => ({ ...prev, [currentTime]: currentVitals }));
      setCurrentTimeIndex(prev => prev + 1);
      setCurrentVitals(initialVitals);
    }
  };

  const getChartData = (vitalKey: keyof Vitals) => {
    const currentPoint = { time: currentTime, value: parseFloat(currentVitals[vitalKey]) || 0 };
    const historicalData = Object.entries(vitalsHistory).map(([time, vitals]) => ({
      time,
      value: parseFloat(vitals[vitalKey]) || 0,
    }));
    return [...historicalData, currentPoint];
  };

  return {
    patientName,
    setPatientName,
    vitals: currentVitals,
    handleUpdateVital,
    isDataEntered,
    currentTime,
    handleNextTime,
    getChartData,
    handleAlertPress,
    vitalKeys: Object.keys(initialVitals) as (keyof Vitals)[],
  };
};