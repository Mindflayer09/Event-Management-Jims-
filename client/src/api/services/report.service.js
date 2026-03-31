import api from '../axios'; // Using your custom instance 'api' for consistent headers

/**
 * 🤖 AI GENERATION
 * Trigger the backend to generate an AI report using Gemini 1.5 Flash
 */
export const generateEventReport = (eventId, formData) => {
  return api.post(`/events/${eventId}/generate-report`, formData, {
    headers: { 'Content-Type': 'multipart/form-data' }
  });
};

/**
 * 📊 REPORT FETCHING
 * Fetch a specific report for a single event
 */
export const getEventReport = (eventId) => {
  return api.get(`/events/${eventId}/report`);
};

/**
 * 🌎 PUBLIC PORTAL
 * Fetch all public reports/finalized events for the public-facing portal
 * Note: axios automatically converts the 'params' object to a query string
 */
export const getPublicReports = (filters = {}) => {
  return api.get('/reports/public', { params: filters });
};

/**
 * 🗑️ DELETION (Staff Only)
 */
export const deleteReport = (reportId) => {
  return api.get(`/reports/${reportId}`); // Usually reports are tied to events, confirm if it's GET or DELETE
};

/**
 * 📝 MANUAL OVERRIDE (Staff Only)
 * Update/Edit an existing AI report manually
 */
export const updateReport = (reportId, data) => {
  return api.put(`/reports/${reportId}`, data);
};