import API from './api';

export const expenseService = {
  // Fetch all expenses, category breakdown, and debt settlements for a trip
  getTripExpenses: async (tripId) => {
    const response = await API.get(`/trips/${tripId}/expenses`);
    return response.data;
  },

  // Record a new expense
  addExpense: async (tripId, expenseData) => {
    const response = await API.post(`/trips/${tripId}/expenses`, expenseData);
    return response.data;
  },

  // Update an existing expense
  updateExpense: async (tripId, expenseId, data) => {
    const response = await API.put(`/trips/${tripId}/expenses/${expenseId}`, data);
    return response.data;
  },

  // Delete an expense
  deleteExpense: async (tripId, expenseId) => {
    const response = await API.delete(`/trips/${tripId}/expenses/${expenseId}`);
    return response.data;
  },

  // Toggle settled status for a user's share
  settleShare: async (tripId, expenseId, userId) => {
    const response = await API.patch(`/trips/${tripId}/expenses/${expenseId}/settle`, { userId });
    return response.data;
  }
};
