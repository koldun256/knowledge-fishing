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
  }
}