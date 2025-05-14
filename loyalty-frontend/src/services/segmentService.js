import api from '../utils/api';

const segmentService = {
  // Get all segments
  getAllSegments: async () => {
    const response = await api.get('/segments');
    return response.data;
  },
  
  // Get segment by ID
  getSegmentById: async (id) => {
    const response = await api.get(`/segments/${id}`);
    return response.data;
  },
  
  // Create new segment
  createSegment: async (segmentData) => {
    const response = await api.post('/segments', segmentData);
    return response.data;
  },
  
  // Update segment
  updateSegment: async (id, segmentData) => {
    const response = await api.put(`/segments/${id}`, segmentData);
    return response.data;
  },
  
  // Delete segment
  deleteSegment: async (id) => {
    const response = await api.delete(`/segments/${id}`);
    return response.data;
  },
  
  // Export segment
  exportSegment: async (id) => {
    const response = await api.get(`/segments/${id}/export`);
    return response.data;
  }
};

export default segmentService;