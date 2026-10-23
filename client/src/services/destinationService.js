import API from './api';

export const destinationService = {
  // Get all destinations with optional category and search
  getDestinations: async (category = 'all', search = '') => {
    const params = {};
    if (category && category !== 'all') params.category = category;
    if (search) params.search = search;
    const response = await API.get('/destinations', { params });
    return response.data;
  },

  // Get single destination by ID
  getDestinationById: async (id) => {
    const response = await API.get(`/destinations/${id}`);
    return response.data;
  },

  // Reset or seed Sri Lanka destinations
  seedDestinations: async () => {
    const response = await API.post('/destinations/seed');
    return response.data;
  }
};
