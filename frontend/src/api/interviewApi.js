import api from './client';

export const interviewApi = {
  getInterviews: async (jobId) => {
    const response = await api.get(`/jobs/${jobId}/interviews`);
    return response.data; // List<InterviewResponse>
  },

  createInterview: async (jobId, interviewData) => {
    const response = await api.post(`/jobs/${jobId}/interviews`, interviewData);
    return response.data;
  },

  updateInterview: async (jobId, interviewId, interviewData) => {
    const response = await api.put(`/jobs/${jobId}/interviews/${interviewId}`, interviewData);
    return response.data;
  },

  deleteInterview: async (jobId, interviewId) => {
    const response = await api.delete(`/jobs/${jobId}/interviews/${interviewId}`);
    return response.data;
  },
};
