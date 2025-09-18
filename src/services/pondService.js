import { API_CONFIG } from '../config/api';

export const pondService = {
  getAllPonds: async () => {
    const response = await fetch(`${API_CONFIG.BASE_URL}/ponds`, {
      credentials: API_CONFIG.withCredentials ? 'include' : 'omit'
    });
    if (!response.ok) throw new Error('Failed to fetch ponds');
    return response.json();
  },

  getPondById: async (id) => {
    const response = await fetch(`${API_CONFIG.BASE_URL}/ponds/${id}`, {
      credentials: API_CONFIG.withCredentials ? 'include' : 'omit'
    });
    if (!response.ok) throw new Error('Failed to fetch pond');
    return response.json();
  }
};
