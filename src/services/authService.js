// src/services/authService.js
import { API_CONFIG } from '../config/api';

export const authService = {
  initializeUser: async () => {
    try {
      const url = `${API_CONFIG.BASE_URL}/`;
      
      const response = await fetch(url, {
        credentials: API_CONFIG.withCredentials ? 'include' : 'omit',
      });
      
      console.log('📋 Response status:', response.status, response.statusText);
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
    } catch (error) {
      console.error('❌ User initialization failed:', error);
      throw error;
    }
  },

  register: async (userData) => {
    const url = `${API_CONFIG.BASE_URL}/register`;

    const response = await fetch(url, {
      method: 'POST',
      credentials: API_CONFIG.withCredentials ? 'include' : 'omit',
      headers: { 'Content-Type' : 'application/json'},
      body: JSON.stringify(userData)
    });

    if (!response.ok) {
      let errorMessage = `Failed to create new user: ${response.status}`;
      
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
    
    const data = await response.json();
    console.log('User created successfully:', data);
    return data;
  },

  login: async (userData) => {
    const url = `${API_CONFIG.BASE_URL}/login`;

    const response = await fetch(url, {
      method: 'POST',
      credentials: API_CONFIG.withCredentials ? 'include' : 'omit',
      headers: { 'Content-Type' : 'application/json'},
      body: JSON.stringify(userData)
    });

    if (!response.ok) {
      let errorMessage = `Failed to login: ${response.status}`;
      
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
    
    const data = await response.json();
    console.log('User login successfully:', data);
    return data;
  },

  logout: async () => {
    const url = `${API_CONFIG.BASE_URL}/logout`;

    const response = await fetch(url, {
      method: 'POST',
      credentials: API_CONFIG.withCredentials ? 'include' : 'omit'
    });

    if (!response.ok) {
      let errorMessage = `Failed to logout: ${response.status}`;
      
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
    
    const data = await response.json();
    console.log('User logout successfully:', data);
    return data;
  },
};