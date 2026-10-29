import API from './api';

export const weatherService = {
  // Fetch day-by-day weather forecast based on trip planned dates & destination
  getTripWeather: async (tripId) => {
    const response = await API.get(`/trips/${tripId}/weather`);
    return response.data;
  }
};
