import API from './api';

export const tripService = {
  // Fetch all trips for current user
  getAllTrips: async () => {
    const response = await API.get('/trips');
    return response.data;
  },

  // Fetch pending trip invitations for current user
  getTripInvitations: async () => {
    const response = await API.get('/trips/invitations');
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
  },

  // Invite friend/user to a trip
  inviteFriendToTrip: async (tripId, inviteData) => {
    const response = await API.post(`/trips/${tripId}/invite`, inviteData);
    return response.data;
  },

  // Respond to trip invitation (accept or decline)
  respondTripInvitation: async (tripId, action) => {
    const response = await API.put(`/trips/${tripId}/invitation/respond`, { action });
    return response.data;
  },

  // Remove a member from a trip
  removeTripMember: async (tripId, memberId) => {
    const response = await API.delete(`/trips/${tripId}/members/${memberId}`);
    return response.data;
  },

  // Get discussion messages for a trip
  getTripMessages: async (tripId) => {
    const response = await API.get(`/trips/${tripId}/messages`);
    return response.data;
  },

  // Post a discussion message in a trip forum
  createTripMessage: async (tripId, messageData) => {
    const response = await API.post(`/trips/${tripId}/messages`, messageData);
    return response.data;
  },

  // Toggle like on a trip discussion message
  toggleLikeTripMessage: async (tripId, messageId) => {
    const response = await API.post(`/trips/${tripId}/messages/${messageId}/like`);
    return response.data;
  },

  // Delete a trip discussion message
  deleteTripMessage: async (tripId, messageId) => {
    const response = await API.delete(`/trips/${tripId}/messages/${messageId}`);
    return response.data;
  }
};
