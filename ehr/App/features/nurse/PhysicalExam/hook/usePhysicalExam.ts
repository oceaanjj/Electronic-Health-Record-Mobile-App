import { useCallback, useState } from 'react';
import apiClient from '@api/apiClient';

export const usePhysicalExam = () => {
  const [dataAlert, setDataAlert] = useState<any>(null);

  const fetchDataAlert = useCallback(async (patientId: number) => {
    try {
      const response = await apiClient.get(`/physical-exam/data-alert/patient/${patientId}`);
      const body = response.data?.data || response.data;

      // API may return { alerts: "..." }, { physical_exam_alerts: "..." }, or a plain string
      if (typeof body === 'string') {
        setDataAlert(body.trim() || null);
      } else if (body?.alerts && typeof body.alerts === 'string') {
        setDataAlert(body.alerts.trim() || null);
      } else if (body?.physical_exam_alerts && typeof body.physical_exam_alerts === 'string') {
        setDataAlert(body.physical_exam_alerts.trim() || null);
      } else {
        setDataAlert(null);
      }
    } catch (e) {
      console.error('Failed to fetch physical exam data alert:', e);
      setDataAlert(null);
    }
  }, []);

  const analyzeField = useCallback(async (fieldName: string, finding: string) => {
    if (!finding || finding.trim().length < 3 || finding === 'N/A') {
      return null;
    }
    try {
      const response = await apiClient.post('/adpie/analyze', {
        fieldName,
        finding,
        component: 'physical-exam',
      });
      if (response.data) {
        const body = (response.data.data && typeof response.data.data === 'object')
          ? response.data.data
          : response.data;
        const level: string = (body.level || '').toString().trim().toUpperCase();
        const message: string = (
          (typeof body === 'string' ? body : null) ||
          body.message ||
          body.recommendation ||
          body.alert ||
          ''
        ).toString().trim();

        if (level === 'NORMAL') return null;
        if (!message || message.toUpperCase().includes('NO RECOMMENDATION')) return null;
        return message;
      }
      return null;
    } catch (e) {
      console.error(`Failed to analyze field ${fieldName}:`, e);
      return null;
    }
  }, []);

  const sanitize = (data: any) => {
    const sanitized = { ...data };
    Object.keys(sanitized).forEach(key => {
      if (typeof sanitized[key] === 'string' && sanitized[key].trim() === '') {
        sanitized[key] = 'N/A';
      }
    });
    return sanitized;
  };

  const saveAssessment = useCallback(async (payload: any, existingId?: number | null) => {
    const body = {
      ...payload,
      patient_id: parseInt(payload.patient_id, 10)
    };
    const sanitized = sanitize(body);
    
    const targetId = existingId || payload.id || payload.physical_exam_id;
    
    if (targetId) {
      const response = await apiClient.put('/physical-exam', { ...sanitized, id: targetId });
      return response.data;
    } else {
      const response = await apiClient.post('/physical-exam', sanitized);
      return response.data;
    }
  }, []);

  const checkAssessmentAlerts = useCallback(async (payload: any, existingId?: number | null) => {
    try {
      const body = {
        ...payload,
        patient_id: parseInt(payload.patient_id, 10)
      };
      const sanitized = sanitize(body);
      
      const targetId = existingId || payload.id || payload.physical_exam_id;

      if (targetId) {
        // PUT /physical-exam (no ID in URL) runs CDSS for all fields
        const response = await apiClient.put('/physical-exam', { ...sanitized, id: targetId });
        return response.data;
      } else {
        const response = await apiClient.post('/physical-exam', sanitized);
        return response.data;
      }
    } catch (err) { return null; }
  }, []);

  const updateDPIE = useCallback(async (examId: number, stepKey: string, text: string) => {
    const sanitizedText = text.trim() === '' ? 'N/A' : text;
    const response = await apiClient.put(`/physical-exam/${examId}/${stepKey}`, {
      [stepKey]: sanitizedText
    });
    return response.data;
  }, []);

  const fetchLatestPhysicalExam = useCallback(async (patientId: number) => {
    try {
      const response = await apiClient.get(`/physical-exam/patient/${patientId}?patient_id=${patientId}`);
      const records = Array.isArray(response.data)
        ? response.data
        : Array.isArray(response.data?.data)
          ? response.data.data
          : [];
      return records.length > 0 ? records[0] : null;
    } catch (err) {
      console.error('Error fetching physical exam:', err);
      return null;
    }
  }, []);

  return { 
    saveAssessment, 
    checkAssessmentAlerts, 
    analyzeField,
    updateDPIE, 
    fetchLatestPhysicalExam,
    dataAlert,
    fetchDataAlert
  };
};