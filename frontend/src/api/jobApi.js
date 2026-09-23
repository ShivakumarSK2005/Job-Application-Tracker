import api from './client';

export const jobApi = {
  // Get paginated jobs with optional company, role, status, page, size, sort
  getJobs: async ({ page = 0, size = 10, sort = 'appliedDate,desc', company, role, status } = {}) => {
    const params = new URLSearchParams();
    params.append('page', page);
    params.append('size', size);
    if (sort) params.append('sort', sort);
    if (company && company.trim()) params.append('company', company.trim());
    if (role && role.trim()) params.append('role', role.trim());
    if (status && status !== 'ALL') params.append('status', status);

    const response = await api.get(`/jobs?${params.toString()}`);
    return response.data; // Page<JobResponse>
  },

  getJobById: async (id) => {
    const response = await api.get(`/jobs/${id}`);
    return response.data;
  },

  createJob: async (jobData) => {
    const response = await api.post('/jobs', jobData);
    return response.data;
  },

  updateJob: async (id, jobData) => {
    const response = await api.put(`/jobs/${id}`, jobData);
    return response.data;
  },

  updateJobStatus: async (id, status, notes = null) => {
    const payload = { status };
    if (notes) payload.notes = notes;
    const response = await api.patch(`/jobs/${id}/status`, payload);
    return response.data;
  },

  deleteJob: async (id) => {
    const response = await api.delete(`/jobs/${id}`);
    return response.data;
  },
};
