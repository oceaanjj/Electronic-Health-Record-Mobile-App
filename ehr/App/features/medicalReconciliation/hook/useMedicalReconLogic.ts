import { useState, useMemo } from 'react';

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

const initialEntry: ReconEntry = { med: '', dose: '', route: '', freq: '', indication: '', extra: '' };

export const useMedicalReconLogic = () => {
  const [stageIndex, setStageIndex] = useState(0);
  const [patientName, setPatientName] = useState('');
  const [reconData, setReconData] = useState<Record<number, ReconEntry>>({
    0: { ...initialEntry },
    1: { ...initialEntry },
    2: { ...initialEntry }
  });

  const currentStage = RECON_STAGES[stageIndex];
  const values = reconData[stageIndex];

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

  const handleNext = () => {
    if (isDataEntered && stageIndex < RECON_STAGES.length - 1) {
      setStageIndex(prev => prev + 1);
    }
  };

  return {
    stageIndex,
    currentStage,
    values,
    patientName,
    setPatientName,
    handleUpdate,
    handleNext,
    isDataEntered,
    isLastStage: stageIndex === RECON_STAGES.length - 1
  };
};