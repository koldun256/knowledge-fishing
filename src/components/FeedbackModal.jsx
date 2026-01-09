// src/components/FeedbackModal.jsx
import React, { useState, useEffect, useCallback } from 'react';
import ReactDOM from 'react-dom';

import { feedbackService } from '../services/feedbackService';

export default function FeedbackModal({ isOpen, onClose, onSubmit }) {
  const [formData, setFormData] = useState({
    type: 'Проблема',
    text: ''
  });
  
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);

  const handleClose = useCallback(() => {
    setFormData({
      type: 'Проблема',
      text: ''
    });
    setError(null);
    setSuccess(false);
    setIsSubmitting(false);
    onClose();
  }, [onClose]);

  const handleBackdropClick = useCallback((e) => {
    if (e.target === e.currentTarget) {
      handleClose();
    }
  }, [handleClose]);

  const handleChange = useCallback((e) => {
    setFormData(prev => ({
      ...prev,
      [e.target.name]: e.target.value
    }));
    // Сбрасываем ошибку при изменении формы
    if (error) setError(null);
  }, [error]);

  useEffect(() => {
    const handleEscape = (e) => {
      if (e.key === 'Escape' && isOpen) {
        handleClose();
      }
    };

    document.addEventListener('keydown', handleEscape);
    return () => document.removeEventListener('keydown', handleEscape);
  }, [isOpen, handleClose]);

  useEffect(() => {
    if (isOpen) {
      setFormData({
        type: 'Проблема',
        text: ''
      });
      setError(null);
      setSuccess(false);
      setIsSubmitting(false);
    }
  }, [isOpen]);
  
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Валидация
    if (!formData.text.trim()) {
      setError('Пожалуйста, напишите ваше сообщение');
      return;
    }
    
    setIsSubmitting(true);
    setError(null);
    
    try {
      // Отправляем данные через feedbackService
      await feedbackService.SendFeedback({
        type: formData.type,
        text: formData.text
      });
      
      // Успешная отправка
      setSuccess(true);
      
      // Если передан onSubmit callback - вызываем его
      if (onSubmit) {
        onSubmit(formData);
      }
      
      // Автоматически закрываем модалку через 2 секунды
      setTimeout(() => {
        handleClose();
      }, 2000);
      
    } catch (err) {
      // Обработка ошибки
      setError(err.text || 'Произошла ошибка при отправке. Попробуйте еще раз.');
      console.error('Feedback submission error:', err);
    } finally {
      setIsSubmitting(false);
    }
  };
  
  if (!isOpen) return null;

  return ReactDOM.createPortal(
    <div 
      className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-[10000] p-4"
      onClick={handleBackdropClick}
    >
      <style>{`
        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
      `}</style>
      
      <div className="bg-white p-6 rounded-xl w-[90%] max-w-[500px] max-h-[90vh] shadow-2xl overflow-hidden flex flex-col relative">
        {/* Крестик закрытия в правом верхнем углу */}
        <button
          onClick={handleClose}
          disabled={isSubmitting}
          className={`absolute top-4 right-4 bg-transparent border-none text-2xl cursor-pointer w-8 h-8 flex items-center justify-center rounded transition-all duration-300 ease-in-out z-10 ${
            isSubmitting 
              ? 'text-gray-300 cursor-not-allowed' 
              : 'text-gray-600 hover:bg-gray-100 hover:text-gray-800'
          }`}
        >
          ×
        </button>
        
        {/* Заголовок - фиксированный */}
        <h2 className={`m-0 mb-5 text-[28px] font-extrabold text-center pr-10 flex-shrink-0 ${
          success ? 'text-green-500' : 'text-[#013b45]'
        }`}>
          {success ? 'Спасибо за отзыв!' : 'Обратная связь'}
        </h2>
        
        {/* Основной контент - прокручиваемый с правильным отступом */}
        <div className="flex-1 overflow-auto flex flex-col min-h-0 pr-5 -mr-5">
          {success ? (
            // Сообщение об успешной отправке
            <div className="text-center py-5 flex-1 flex flex-col justify-center items-center">
              <div className="text-[72px] text-green-500 mb-5">
                ✓
              </div>
              <p className="text-lg text-gray-700 mb-2.5">
                Ваше сообщение успешно отправлено!
              </p>
              <p className="text-sm text-gray-600">
                Окно закроется автоматически через 2 секунды...
              </p>
            </div>
          ) : (
            // Форма обратной связи
            <form onSubmit={handleSubmit} className="flex flex-col flex-1">
              {/* Сообщение об ошибке */}
              {error && (
                <div className="mb-5 p-3 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm flex-shrink-0">
                  {error}
                </div>
              )}
              
              {/* Поле Тип сообщения */}
              <div className="mb-5 flex-shrink-0">
                <label className="block mb-2 font-semibold text-lg text-gray-700 uppercase tracking-wider">
                  ТИП СООБЩЕНИЯ
                </label>
                <select
                  name="type"
                  value={formData.type}
                  onChange={handleChange}
                  disabled={isSubmitting}
                  className={`w-full p-3 border-2 rounded-lg text-base box-border transition-colors duration-300 ease-in-out ${
                    error ? 'border-red-400' : 'border-gray-300'
                  } ${
                    isSubmitting ? 'bg-gray-50 cursor-not-allowed opacity-70' : 'bg-white cursor-pointer'
                  }`}
                >
                  <option value="Проблема">Проблема</option>
                  <option value="Предложение">Предложение</option>
                  <option value="Отзыв">Отзыв</option>
                </select>
              </div>

              {/* Поле Сообщение */}
              <div className="mb-5 flex-shrink-0">
                <label className="block mb-2 font-semibold text-lg text-gray-700 uppercase tracking-wider">
                  НАПИШИТЕ ВАШЕ СООБЩЕНИЕ *
                </label>
                <textarea
                  name="text"
                  value={formData.text}
                  onChange={handleChange}
                  placeholder="Опишите вашу проблему, предложение или оставьте отзыв..."
                  rows={5}
                  disabled={isSubmitting}
                  className={`w-full p-3 border-2 rounded-lg text-base box-border transition-colors duration-300 ease-in-out resize-y min-h-[120px] ${
                    error ? 'border-red-400' : 'border-gray-300'
                  } ${
                    isSubmitting ? 'bg-gray-50 opacity-70' : 'bg-white'
                  }`}
                  required
                />
              </div>

              {/* Кнопка отправки */}
              <div className="flex justify-end mb-5 flex-shrink-0">
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className={`px-6 py-3 border-none rounded-lg text-white text-base font-semibold transition-all duration-300 ease-in-out min-w-[120px] flex justify-center items-center ${
                    isSubmitting 
                      ? 'bg-gray-400 cursor-not-allowed' 
                      : 'bg-blue-500 hover:bg-blue-600'
                  }`}
                >
                  {isSubmitting ? (
                    <>
                      <span className="inline-block w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin mr-2" />
                      ОТПРАВКА...
                    </>
                  ) : 'ОТПРАВИТЬ'}
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>,
    document.body
  );
}
