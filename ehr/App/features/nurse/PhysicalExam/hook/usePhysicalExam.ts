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

  // Analyze a single field in real-time by saving to the backend (which runs CDSS automatically).
  // Uses PUT /{id}/assessment if examId exists, else POST /physical-exam.
  // Returns { alert, severity } for the specific field, or null if no finding.
  const analyzeField = useCallback(async (
    patientId: number,
    examId: number | null,
    fieldName: string,
    finding: string,
    alertKey: string,
  ): Promise<{ alert: string; severity: string } | null> => {
    if (!finding || finding.trim().length < 3 || finding === 'N/A') return null;
    try {
      let response;
      if (examId) {
        response = await apiClient.put(`/physical-exam/${examId}/assessment`, {
          patient_id: patientId,
          [fieldName]: finding,
        });
      } else {
        response = await apiClient.post('/physical-exam', {
          patient_id: patientId,
          [fieldName]: finding,
        });
      }
      // Top-level alerts object has all _alert keys
      const alerts = response.data?.alerts || response.data?.data || {};
      const alertText: string = (alerts[alertKey] || '').toString().trim();
      if (!alertText || alertText === 'No Findings') return null;
      // Severity is not returned by this endpoint — infer from alert text
      const upper = alertText.toUpperCase();
      const severity = upper.includes('URGENT') || upper.includes('CRITICAL') || upper.includes('IMMEDIATELY')
        ? 'CRITICAL'
        : upper.includes('EVALUATE') || upper.includes('MONITOR') || upper.includes('CONSIDER')
          ? 'WARNING'
          : 'INFO';
      return { alert: alertText, severity };
    } catch (e) {
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
    let response;
    if (targetId) {
      response = await apiClient.put('/physical-exam', { ...sanitized, id: targetId });
    } else {
      response = await apiClient.post('/physical-exam', sanitized);
    }
    // Return full response body — callers read .data and .alerts
    return response.data;
  }, []);

  const updateDPIE= useCallback(async (examId: number, stepKey: string, text: string) => {
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
    analyzeField,
    updateDPIE, 
    fetchLatestPhysicalExam,
    dataAlert,
    fetchDataAlert
  };
};