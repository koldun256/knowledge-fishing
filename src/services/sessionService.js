import { API_CONFIG } from "../config/api";

export const sessionService = {
  async get_cur_fishing_session() {
    const response = await fetch(`${API_CONFIG.BASE_URL}/fishing_sessions/`, {
      credentials: API_CONFIG.withCredentials ? 'include' : 'omit'
    });
    if (!response.ok) throw new Error('Failed to get current fishing session');
    return response.json();
  },
};
