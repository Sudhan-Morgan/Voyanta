import API from './api';

export const tripService = {
  // Fetch all trips for current user
  getAllTrips: async () => {
    const response = await API.get('/trips');
    return response.data;
  },

  // Fetch a specific trip by its ID
  getTripById: async (tripId) => {
    const response = await API.get(`/trips/${tripId}`);
    return response.data;
  },

  // Create a new trip
  createTrip: async (tripData) => {
    const response = await API.post('/trips', tripData);
    return response.data;
  },

  // Update trip details
  updateTrip: async (tripId, updateData) => {
    const response = await API.patch(`/trips/${tripId}`, updateData);
    return response.data;
  },

  // Delete a trip
  deleteTrip: async (tripId) => {
    const response = await API.delete(`/trips/${tripId}`);
    return response.data;
  }
};
