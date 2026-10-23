import API from './api';

export const authService = {
  // Register a new account
  register: async (userData) => {
    const response = await API.post('/auth/register', userData);
    if (response.data.token) {
      localStorage.setItem('voyanta_token', response.data.token);
      localStorage.setItem('voyanta_user', JSON.stringify(response.data.user));
    }
    return response.data;
  },

  // Login with email and password
  login: async (credentials) => {
    const response = await API.post('/auth/login', credentials);
    if (response.data.token) {
      localStorage.setItem('voyanta_token', response.data.token);
      localStorage.setItem('voyanta_user', JSON.stringify(response.data.user));
    }
    return response.data;
  },

  // Get currently logged-in user profile
  getMe: async () => {
    const response = await API.get('/auth/me');
    return response.data;
  },

  // Update profile and preferences
  updateProfile: async (profileData) => {
    const response = await API.put('/auth/profile', profileData);
    if (response.data.user) {
      localStorage.setItem('voyanta_user', JSON.stringify(response.data.user));
    }
    return response.data;
  },

  // Logout user
  logout: () => {
    localStorage.removeItem('voyanta_token');
    localStorage.removeItem('voyanta_user');
    localStorage.removeItem('travelmate_token');
    localStorage.removeItem('travelmate_user');
  }
};
