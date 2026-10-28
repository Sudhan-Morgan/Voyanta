import API from './api';

export const friendService = {
  // Get all friends, incoming requests, and outgoing requests
  getFriends: async () => {
    const response = await API.get('/friends');
    return response.data;
  },

  // Search users by 6-digit User ID Number, name, or email
  searchUsers: async (query) => {
    const response = await API.get(`/friends/search?q=${encodeURIComponent(query)}`);
    return response.data;
  },

  // Send a friend request by targetUserId or 6-digit User ID Number
  sendFriendRequest: async ({ targetUserId, userNumber }) => {
    const response = await API.post('/friends/request', { targetUserId, userNumber });
    return response.data;
  },

  // Respond to incoming request ('accept' or 'decline')
  respondFriendRequest: async (requestId, action) => {
    const response = await API.put(`/friends/requests/${requestId}/respond`, { action });
    return response.data;
  },

  // Remove a friend or cancel a request
  removeFriend: async (targetId) => {
    const response = await API.delete(`/friends/${targetId}`);
    return response.data;
  }
};
