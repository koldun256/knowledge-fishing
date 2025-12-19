import { API_CONFIG } from "../config/api";

export const statsService = {
    getStats: async () => {
    const url = `${API_CONFIG.BASE_URL}/stats`;
    
    try {
      const response = await fetch(url, {
        credentials: API_CONFIG.withCredentials ? 'include' : 'omit'
      });

      if (!response.ok) {
        let errorMessage = `Failed to fetch stats: ${response.status}`;
        
        try {
          const errorData = await response.json();
          if (errorData.detail) {
            errorMessage = errorData.detail;
          } else if (errorData.message) {
            errorMessage = errorData.message;
          }
        } catch (e) {
          // Если не удалось распарсить JSON, используем стандартное сообщение
          console.error('Error parsing error response:', e);
        }
        
        throw new Error(errorMessage);
      }


      // Сначала читаем как текст
    //   const text = await response.text();
    //   console.log('Raw response text:', text);
      
      return await response.json();
      
    } catch (error) {
      console.error('Error fetching statistics:', error);
      throw error;
    }
  },

  /**
   * Получить статистику в формате для отображения
   * @returns {Promise<Object>} Объект с обработанной статистикой
   */
  getFormattedStats: async () => {
    try {
      const [allStats, lastDayStats] = await statsService.getStats();
      
      return {
        allStats: {
          usersWithLogin: allStats.cnt_users_with_login || 0,
          ponds: allStats.cnt_ponds || 0,
          fishes: allStats.cnt_fishes || 0,
          feedback: allStats.cnt_feedback || 0
        },
        lastDayStats: {
          usersWithLogin: lastDayStats.cnt_users_with_login || 0,
          ponds: lastDayStats.cnt_ponds || 0,
          fishes: lastDayStats.cnt_fishes || 0,
          feedback: lastDayStats.cnt_feedback || 0
        }
      };
    } catch (error) {
      console.error('Error formatting statistics:', error);
      throw error;
    }
  }
};
