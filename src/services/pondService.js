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
  },

  createPond: async (pondData) => {
    const response = await fetch(`${API_CONFIG.BASE_URL}/ponds`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      credentials: API_CONFIG.withCredentials ? 'include' : 'omit',
      body: JSON.stringify(pondData)
    });
    if (!response.ok) throw new Error('Failed to create pond');
    return response.json();
  },

  getNextFish: async (id) => {
    const response = await fetch(`${API_CONFIG.BASE_URL}/ponds/${id}/start-fishing`, {
      credentials: API_CONFIG.withCredentials ? 'include' : 'omit'
    });
    if (!response.ok) throw new Error('Failed to get next fish');
    return response.json();
  },
};
