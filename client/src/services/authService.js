import API from './api';

export const authService = {
  // Send 6-digit OTP for email verification before registration
  sendRegisterOtp: async (data) => {
    const response = await API.post('/auth/send-register-otp', data);
    return response.data;
  },

  // Verify registration OTP
  verifyRegisterOtp: async (data) => {
    const response = await API.post('/auth/verify-register-otp', data);
    return response.data;
  },

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

  // Add a place to favorites
  addFavoritePlace: async (placeData) => {
    const response = await API.post('/auth/favorite-places', placeData);
    if (response.data.user) {
      localStorage.setItem('voyanta_user', JSON.stringify(response.data.user));
    }
    return response.data;
  },

  // Remove a place from favorites
  removeFavoritePlace: async (placeId) => {
    const response = await API.delete(`/auth/favorite-places/${placeId}`);
    if (response.data.user) {
      localStorage.setItem('voyanta_user', JSON.stringify(response.data.user));
    }
    return response.data;
  },

  // Request password reset link
  forgotPassword: async (email) => {
    const response = await API.post('/auth/forgot-password', { email });
    return response.data;
  },

  // Reset password using token
  resetPassword: async (token, password) => {
    const response = await API.put(`/auth/reset-password/${token}`, { password });
    if (response.data.token) {
      localStorage.setItem('voyanta_token', response.data.token);
      localStorage.setItem('voyanta_user', JSON.stringify(response.data.user));
    }
    return response.data;
  },

  // Update password for logged in user
  updatePassword: async (passwords) => {
    const response = await API.put('/auth/update-password', passwords);
    if (response.data.token) {
      localStorage.setItem('voyanta_token', response.data.token);
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

