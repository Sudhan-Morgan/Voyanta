import API from './api';

export const itineraryService = {
  // Get all itinerary items grouped by day
  getTripItinerary: async (tripId) => {
    const response = await API.get(`/trips/${tripId}/itinerary`);
    return response.data;
  },

  // Add an activity/stop to a specific day
  addItineraryItem: async (tripId, itemData) => {
    const response = await API.post(`/trips/${tripId}/itinerary`, itemData);
    return response.data;
  },

  // Update an itinerary item
  updateItineraryItem: async (tripId, itemId, data) => {
    const response = await API.put(`/trips/${tripId}/itinerary/${itemId}`, data);
    return response.data;
  },

  // Delete an itinerary item
  deleteItineraryItem: async (tripId, itemId) => {
    const response = await API.delete(`/trips/${tripId}/itinerary/${itemId}`);
    return response.data;
  }
};
