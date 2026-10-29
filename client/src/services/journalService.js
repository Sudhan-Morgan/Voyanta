import API from './api';

export const journalService = {
  // Fetch all journal entries for a trip
  getTripJournal: async (tripId) => {
    const response = await API.get(`/trips/${tripId}/journal`);
    return response.data;
  },

  // Create a new journal entry with photos & notes
  createJournalEntry: async (tripId, entryData) => {
    const response = await API.post(`/trips/${tripId}/journal`, entryData);
    return response.data;
  },

  // Update an existing journal entry
  updateJournalEntry: async (tripId, entryId, updateData) => {
    const response = await API.put(`/trips/${tripId}/journal/${entryId}`, updateData);
    return response.data;
  },

  // Delete a journal entry
  deleteJournalEntry: async (tripId, entryId) => {
    const response = await API.delete(`/trips/${tripId}/journal/${entryId}`);
    return response.data;
  },

  // Toggle like on a memory
  toggleLikeEntry: async (tripId, entryId) => {
    const response = await API.patch(`/trips/${tripId}/journal/${entryId}/like`);
    return response.data;
  }
};

