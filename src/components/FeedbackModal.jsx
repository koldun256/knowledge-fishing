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
    <div style={{
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      backgroundColor: 'rgba(0,0,0,0.5)',
      display: 'flex',
      justifyContent: 'center',
      alignItems: 'center',
      zIndex: 10000,
      padding: '16px'
    }} onClick={handleBackdropClick}>
      <div style={{
        backgroundColor: 'white',
        padding: '24px',
        borderRadius: '12px',
        width: '90%',
        maxWidth: '500px',
        maxHeight: '90vh',
        boxShadow: '0 10px 25px rgba(0,0,0,0.2)',
        overflow: 'hidden',
        display: 'flex',
        flexDirection: 'column',
        position: 'relative'
      }}>
        {/* Крестик закрытия в правом верхнем углу */}
        <button
          onClick={handleClose}
          disabled={isSubmitting}
          style={{
            position: 'absolute',
            top: '16px',
            right: '16px',
            background: 'none',
            border: 'none',
            fontSize: '24px',
            cursor: isSubmitting ? 'not-allowed' : 'pointer',
            color: isSubmitting ? '#ccc' : '#666',
            width: '32px',
            height: '32px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            borderRadius: '4px',
            transition: 'all 0.3s ease',
            zIndex: 10
          }}
          onMouseEnter={(e) => {
            if (!isSubmitting) {
              e.target.style.backgroundColor = '#f5f5f5';
              e.target.style.color = '#333';
            }
          }}
          onMouseLeave={(e) => {
            if (!isSubmitting) {
              e.target.style.backgroundColor = 'transparent';
              e.target.style.color = '#666';
            }
          }}
        >
          ×
        </button>
        
        {/* Заголовок - фиксированный */}
        <h2 style={{ 
          margin: '0 0 20px 0', 
          fontSize: '28px', 
          fontWeight: '800',
          color: success ? '#2ecc71' : '#013b45ff',
          textAlign: 'center',
          paddingRight: '40px',
          flexShrink: 0
        }}>
          {success ? 'Спасибо за отзыв!' : 'Обратная связь'}
        </h2>
        
        {/* Основной контент - прокручиваемый с правильным отступом */}
        <div style={{
          flex: 1,
          overflow: 'auto',
          display: 'flex',
          flexDirection: 'column',
          minHeight: 0,
          paddingRight: '20px',
          marginRight: '-20px'
        }}>
          {success ? (
            // Сообщение об успешной отправке
            <div style={{
              textAlign: 'center',
              padding: '20px 0',
              flex: 1,
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'center',
              alignItems: 'center'
            }}>
              <div style={{
                fontSize: '72px',
                color: '#2ecc71',
                marginBottom: '20px'
              }}>
                ✓
              </div>
              <p style={{
                fontSize: '18px',
                color: '#34495e',
                marginBottom: '10px'
              }}>
                Ваше сообщение успешно отправлено!
              </p>
              <p style={{
                fontSize: '14px',
                color: '#7f8c8d'
              }}>
                Окно закроется автоматически через 2 секунды...
              </p>
            </div>
          ) : (
            // Форма обратной связи
            <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', flex: 1 }}>
              {/* Сообщение об ошибке */}
              {error && (
                <div style={{
                  marginBottom: '20px',
                  padding: '12px',
                  backgroundColor: '#ffebee',
                  border: '1px solid #ffcdd2',
                  borderRadius: '8px',
                  color: '#c62828',
                  fontSize: '14px',
                  flexShrink: 0
                }}>
                  {error}
                </div>
              )}
              
              {/* Поле Тип сообщения */}
              <div style={{ marginBottom: '20px', flexShrink: 0 }}>
                <label style={{
                  display: 'block',
                  marginBottom: '8px',
                  fontWeight: '600',
                  fontSize: '18px',
                  color: '#34495e',
                  textTransform: 'uppercase',
                  letterSpacing: '0.5px'
                }}>
                  ТИП СООБЩЕНИЯ
                </label>
                <select
                  name="type"
                  value={formData.type}
                  onChange={handleChange}
                  disabled={isSubmitting}
                  style={{
                    width: '100%',
                    padding: '12px',
                    border: error ? '2px solid #ff6b6b' : '2px solid #bdc3c7',
                    borderRadius: '8px',
                    fontSize: '16px',
                    boxSizing: 'border-box',
                    backgroundColor: isSubmitting ? '#f9f9f9' : 'white',
                    transition: 'border-color 0.3s ease',
                    cursor: isSubmitting ? 'not-allowed' : 'pointer',
                    opacity: isSubmitting ? 0.7 : 1
                  }}
                >
                  <option value="Проблема">Проблема</option>
                  <option value="Предложение">Предложение</option>
                  <option value="Отзыв">Отзыв</option>
                </select>
              </div>

              {/* Поле Логин
              <div style={{ marginBottom: '20px', flexShrink: 0 }}>
                <label style={{
                  display: 'block',
                  marginBottom: '8px',
                  fontWeight: '600',
                  fontSize: '18px',
                  color: '#34495e',
                  textTransform: 'uppercase',
                  letterSpacing: '0.5px'
                }}>
                  ЛОГИН (ПО ЖЕЛАНИЮ)
                  <span style={{
                    fontSize: '14px',
                    fontWeight: 'normal',
                    textTransform: 'none',
                    marginLeft: '8px',
                    color: '#7f8c8d'
                  }}>
                    Пожалуйста, укажите, если описываете проблему
                  </span>
                </label>
                <input
                  type="text"
                  name="login"
                  value={formData.login}
                  onChange={handleChange}
                  placeholder="Ваш логин"
                  disabled={isSubmitting}
                  style={{
                    width: '100%',
                    padding: '12px',
                    border: error ? '2px solid #ff6b6b' : '2px solid #bdc3c7',
                    borderRadius: '8px',
                    fontSize: '16px',
                    boxSizing: 'border-box',
                    backgroundColor: isSubmitting ? '#f9f9f9' : 'white',
                    transition: 'border-color 0.3s ease',
                    opacity: isSubmitting ? 0.7 : 1
                  }}
                />
              </div> */}

              {/* Поле Сообщение */}
              <div style={{ marginBottom: '20px', flexShrink: 0 }}>
                <label style={{
                  display: 'block',
                  marginBottom: '8px',
                  fontWeight: '600',
                  fontSize: '18px',
                  color: '#34495e',
                  textTransform: 'uppercase',
                  letterSpacing: '0.5px'
                }}>
                  НАПИШИТЕ ВАШЕ СООБЩЕНИЕ *
                </label>
                <textarea
                  name="text"
                  value={formData.text}
                  onChange={handleChange}
                  placeholder="Опишите вашу проблему, предложение или оставьте отзыв..."
                  rows={5}
                  disabled={isSubmitting}
                  style={{
                    width: '100%',
                    padding: '12px',
                    border: error ? '2px solid #ff6b6b' : '2px solid #bdc3c7',
                    borderRadius: '8px',
                    fontSize: '16px',
                    boxSizing: 'border-box',
                    transition: 'border-color 0.3s ease',
                    resize: 'vertical',
                    minHeight: '120px',
                    backgroundColor: isSubmitting ? '#f9f9f9' : 'white',
                    opacity: isSubmitting ? 0.7 : 1
                  }}
                  required
                />
              </div>

              {/* Кнопка отправки */}
              <div style={{
                display: 'flex',
                justifyContent: 'flex-end',
                marginBottom: '20px',
                flexShrink: 0
              }}>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  style={{
                    padding: '12px 24px',
                    border: 'none',
                    borderRadius: '8px',
                    backgroundColor: isSubmitting ? '#95a5a6' : '#3498db',
                    color: 'white',
                    cursor: isSubmitting ? 'not-allowed' : 'pointer',
                    fontSize: '16px',
                    fontWeight: '600',
                    transition: 'all 0.3s ease',
                    minWidth: '120px',
                    display: 'flex',
                    justifyContent: 'center',
                    alignItems: 'center'
                  }}
                  onMouseEnter={(e) => {
                    if (!isSubmitting) {
                      e.target.style.backgroundColor = '#2980b9';
                    }
                  }}
                  onMouseLeave={(e) => {
                    if (!isSubmitting) {
                      e.target.style.backgroundColor = '#3498db';
                    }
                  }}
                >
                  {isSubmitting ? (
                    <>
                      <span style={{
                        display: 'inline-block',
                        width: '16px',
                        height: '16px',
                        border: '2px solid rgba(255,255,255,0.3)',
                        borderTop: '2px solid white',
                        borderRadius: '50%',
                        animation: 'spin 1s linear infinite',
                        marginRight: '8px'
                      }} />
                      ОТПРАВКА...
                    </>
                  ) : 'ОТПРАВИТЬ'}
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
      
      {/* CSS для анимации спиннера */}
      <style>{`
        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
      `}</style>
    </div>,
    document.body
  );
}