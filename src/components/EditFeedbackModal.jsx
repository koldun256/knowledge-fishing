import React, { useState, useEffect } from 'react';
import { API_CONFIG } from '../config/api';
import { feedbackService } from '../services/feedbackService';

// Маппинг типов с бэкенда на русские названия
const FEEDBACK_TYPE_MAPPING = {
  'PROBLEM': 'Проблема',
  'REVIEW': 'Отзыв',
  'SUGGESTION': 'Предложение'
};

// Форматирование даты
const formatDate = (dateString) => {
  if (!dateString) return 'Не указано';
  const date = new Date(dateString);
  return date.toLocaleDateString('ru-RU', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  });
};

// Функция для получения имени пользователя
const getUserName = (userId) => {
  return `Пользователь #${userId?.slice(0, 8) || 'unknown'}`;
};

// Компонент модального окна редактирования отзыва
function EditFeedbackModal({ feedback, isOpen, onClose, onSave }) {
  const [editedFeedback, setEditedFeedback] = useState(null);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (feedback) {
      setEditedFeedback({ 
        ...feedback,
        solution: feedback.solution || ''
      });
      setError(null);
    }
  }, [feedback]);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setEditedFeedback(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!editedFeedback) return;
    
    setIsSaving(true);
    setError(null);

    try {
      // Преобразуем данные для отправки на бэкенд
      const feedbackToSend = {
        id: editedFeedback.id,
        solved: editedFeedback.solved || false,
        solution: editedFeedback.solution || ''
      };

      console.log('Отправка данных на сервер:', feedbackToSend);
      
      const updatedFeedback = await feedbackService.UpdateFeedback(feedbackToSend);
      console.log('Ответ от сервера:', updatedFeedback);
      
      onSave(updatedFeedback);
      onClose();
    } catch (err) {
      console.error('Ошибка при обновлении отзыва:', err);
      setError(err.message || 'Произошла ошибка при сохранении изменений. Пожалуйста, попробуйте еще раз.');
    } finally {
      setIsSaving(false);
    }
  };

  if (!isOpen || !feedback || !editedFeedback) return null;

  const displayType = FEEDBACK_TYPE_MAPPING[feedback.type] || feedback.type;
  const isProblem = feedback.type === 'Проблема';

  return (
    <div 
      className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-[1000] p-4 md:p-5 animate-fadeIn"
      onClick={onClose}
    >
      <style>{`
        @keyframes fadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        
        @keyframes slideUp {
          from {
            transform: translateY(50px);
            opacity: 0;
          }
          to {
            transform: translateY(0);
            opacity: 1;
          }
        }
        
        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
        
        .animate-fadeIn {
          animation: fadeIn 0.2s ease;
        }
        
        .animate-slideUp {
          animation: slideUp 0.3s ease;
        }
      `}</style>
      
      <div 
        className="bg-white rounded-xl w-full max-w-[600px] max-h-[90vh] overflow-y-auto shadow-2xl animate-slideUp"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex justify-between items-center p-6 md:p-8 border-b border-gray-200">
          <h2 className="m-0 text-2xl font-semibold text-gray-800">Просмотр обратной связи</h2>
          <button 
            className="bg-transparent border-none text-2xl text-gray-600 cursor-pointer p-1 w-10 h-10 flex items-center justify-center rounded-full hover:bg-gray-100 hover:text-red-600 transition-colors duration-200 disabled:opacity-50"
            onClick={onClose}
            aria-label="Закрыть"
            disabled={isSaving}
          >
            ×
          </button>
        </div>
        
        <form onSubmit={handleSubmit}>
          <div className="p-6 md:p-8">
            <div className="mb-5">
              <label className="block mb-2 font-semibold text-gray-800 text-sm">Тип обратной связи:</label>
              <div className="px-4 py-3 bg-gray-50 border border-gray-200 rounded-lg text-gray-600 text-sm min-h-[20px]">
                {displayType}
              </div>
            </div>

            <div className="mb-5">
              <label className="block mb-2 font-semibold text-gray-800 text-sm">Дата создания:</label>
              <div className="px-4 py-3 bg-gray-50 border border-gray-200 rounded-lg text-gray-600 text-sm min-h-[20px]">
                {formatDate(feedback.created_at)}
              </div>
            </div>

            <div className="mb-5">
              <label className="block mb-2 font-semibold text-gray-800 text-sm">Пользователь:</label>
              <div className="px-4 py-3 bg-gray-50 border border-gray-200 rounded-lg text-gray-600 text-sm min-h-[20px]">
                {getUserName(feedback.user_id)}
              </div>
            </div>

            <div className="mb-5">
              <label className="block mb-2 font-semibold text-gray-800 text-sm">Текст фидбэка:</label>
              <div className="p-4 bg-gray-50 border border-gray-200 rounded-lg max-h-[200px] overflow-y-auto leading-relaxed whitespace-pre-wrap text-gray-800 text-sm">
                {feedback.text}
              </div>
            </div>

            <div className="mb-5">
              <label className="flex items-center gap-2.5 cursor-pointer select-none py-2">
                <input
                  type="checkbox"
                  name="solved"
                  checked={editedFeedback.solved || false}
                  onChange={handleChange}
                  disabled={isSaving}
                  className="w-5 h-5 cursor-pointer m-0"
                />
                <span className="text-sm text-gray-800">Отметить решенным</span>
              </label>
            </div>

            <div className="mb-5">
              <label htmlFor="solution" className="block mb-2 font-semibold text-gray-800 text-sm">
                {isProblem ? 'Решение проблемы' : 'Комментарий администратора'}:
              </label>
              <textarea
                id="solution"
                name="solution"
                value={editedFeedback.solution}
                onChange={handleChange}
                rows="4"
                placeholder={isProblem 
                  ? "Опишите решение проблемы или оставьте комментарий..." 
                  : "Оставьте комментарий к отзыву..."
                }
                disabled={isSaving}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg text-sm font-inherit resize-y min-h-[100px] box-border transition-colors duration-200 focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100 disabled:bg-gray-50 disabled:cursor-not-allowed"
              />
            </div>

            {feedback.solved_at && feedback.solved_at > new Date('1970-01-01') && (
              <div className="mb-5">
                <label className="block mb-2 font-semibold text-gray-800 text-sm">Дата решения:</label>
                <div className="px-4 py-3 bg-gray-50 border border-gray-200 rounded-lg text-gray-600 text-sm min-h-[20px]">
                  {formatDate(feedback.solved_at)}
                </div>
              </div>
            )}

            {error && (
              <div className="px-4 py-3 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm mt-4">
                <strong>Ошибка:</strong> {error}
              </div>
            )}
          </div>

          <div className="flex justify-end gap-3 p-6 md:p-8 border-t border-gray-200 bg-gray-50 rounded-b-xl">
            <button
              type="button"
              onClick={onClose}
              disabled={isSaving}
              className="px-6 py-3 bg-gray-100 text-gray-800 border border-gray-300 rounded-lg text-sm font-semibold cursor-pointer transition-all duration-200 hover:bg-gray-200 hover:-translate-y-0.5 disabled:opacity-60 disabled:cursor-not-allowed disabled:hover:bg-gray-100 disabled:hover:translate-y-0 min-w-[120px]"
            >
              Отмена
            </button>
            <button
              type="submit"
              disabled={isSaving}
              className="px-6 py-3 bg-blue-600 text-white border-none rounded-lg text-sm font-semibold cursor-pointer transition-all duration-200 hover:bg-blue-700 hover:-translate-y-0.5 hover:shadow-md disabled:bg-blue-300 disabled:cursor-not-allowed disabled:hover:translate-y-0 disabled:hover:shadow-none min-w-[120px]"
            >
              {isSaving ? (
                <>
                  <span className="inline-block animate-spin mr-2">⟳</span>
                  Сохранение...
                </>
              ) : (
                'Сохранить изменения'
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default EditFeedbackModal;
