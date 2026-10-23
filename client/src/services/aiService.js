import API from './api';

export const aiService = {
  // Generate a customized day-by-day travel itinerary using AI
  generateItinerary: async (plannerParams) => {
    const response = await API.post('/ai/generate-itinerary', plannerParams);
    return response.data;
  },

  // Save an AI-generated itinerary directly into user's trips
  saveItineraryAsTrip: async (payload) => {
    const response = await API.post('/ai/save-as-trip', payload);
    return response.data;
  }
};
