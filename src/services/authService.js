// src/services/authService.js
import { API_CONFIG } from '../config/api';

export const authService = {
  initializeUser: async () => {
    try {
      const url = `${API_CONFIG.BASE_URL}/`;
      console.log('🔄 Making POST request to:', url);
      
      const response = await fetch(url, {
        credentials: API_CONFIG.withCredentials ? 'include' : 'omit',
      });
      
      console.log('📋 Response status:', response.status, response.statusText);
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      console.log('✅ User initialization successful:', data);
    } catch (error) {
      console.error('❌ User initialization failed:', error);
    }
  }
};
