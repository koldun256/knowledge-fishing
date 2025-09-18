import { API_CONFIG } from '../config/api';

export const fishService = {
  getFishesByPondId: async (pondId) => {
    const response = await fetch(`${API_CONFIG.BASE_URL}/ponds/${pondId}/fishes`, {
      credentials: API_CONFIG.withCredentials ? 'include' : 'omit'
    });
    if (!response.ok) throw new Error('Failed to fetch fishes');
    return response.json();
  },

  getNextFish: async () => {
    const response = await fetch(`${API_CONFIG.BASE_URL}/start-fishing`, {
      credentials: API_CONFIG.withCredentials ? 'include' : 'omit'
    });
    if (!response.ok) throw new Error('Failed to get next fish');
    return response.json();
  },

  reviewFish: async (fishId, { score }) => {
    const response = await fetch(`${API_CONFIG.BASE_URL}/fishes/${fishId}/caught`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      credentials: API_CONFIG.withCredentials ? 'include' : 'omit',
      body: JSON.stringify({ score })
    });
    if (!response.ok) throw new Error('Failed to review fish');
    return response.json();
  },

  getFishById: async (fishId) => {
    const response = await fetch(`${API_CONFIG.BASE_URL}/fishes/${fishId}`, {
      credentials: API_CONFIG.withCredentials ? 'include' : 'omit'
    });
    if (!response.ok) throw new Error('Failed to get fish by id');
    return response.json();
  },
};
