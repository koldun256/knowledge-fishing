import { API_CONFIG } from '../config/api';

export const feedbackService = {
  SendFeedback: async (feedback) => {
    const url = `${API_CONFIG.BASE_URL}/feedback`;
    const response = await fetch(url, {
      method: 'POST',
      credentials: API_CONFIG.withCredentials ? 'include' : 'omit',
      headers: { 'Content-Type' : 'application/json'},
      body: JSON.stringify(feedback)
    });

    if (!response.ok) {
      let errorMessage = `Failed to send feedback: ${response.status}`;
      
      try {
        const errorData = await response.json();
        if (errorData.detail) {
          errorMessage = errorData.detail;
        }
      } catch (e) {
        // Если не удалось распарсить JSON, используем стандартное сообщение
      }
      
      throw new Error(errorMessage);
    }
    
    await response.json();
  },

  GetFeedback: async (feedback_params) => {
    const params = new URLSearchParams();
    if (feedback_params.count !== undefined) {
      params.append('count', feedback_params.count);
    }
    if (feedback_params.get_last !== null) {
      params.append('get_last', feedback_params.get_last);
    }
    if (feedback_params.type) {
      params.append('type', feedback_params.type);
    }
    if (feedback_params.solved !== null) {
      params.append('solved', feedback_params.solved);
    } 

    const response = await fetch(`${API_CONFIG.BASE_URL}/feedbacks?${params.toString()}`, {
      credentials: API_CONFIG.withCredentials ? 'include' : 'omit'
    });
    if (!response.ok) throw new Error('Failed to fetch feedback');
    return response.json();
  },

  UpdateFeedback: async (feedback) => {
    const url = `${API_CONFIG.BASE_URL}/feedback`;
    const response = await fetch(url, {
      method: 'PUT',
      credentials: API_CONFIG.withCredentials ? 'include' : 'omit',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(feedback)
    });

    if (!response.ok) {
      let errorMessage = `Failed to update feedback: ${response.status}`;
      
      try {
        const errorData = await response.json();
        if (errorData.detail) {
          errorMessage = errorData.detail;
        }
      } catch (e) {
        // Если не удалось распарсить JSON, используем стандартное сообщение
      }
      
      throw new Error(errorMessage);
    }
    
    return await response.json();
  }
};
