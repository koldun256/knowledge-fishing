// src/components/FeedbackModal.jsx
import React, { useState, useEffect, useCallback } from 'react';
import ReactDOM from 'react-dom';

export default function FeedbackModal({ isOpen, onClose, onSubmit }) {
  const [formData, setFormData] = useState({
    messageType: 'Проблема',
    login: '',
    message: ''
  });

  const handleClose = useCallback(() => {
    setFormData({
      messageType: 'Проблема',
      login: '',
      message: ''
    });
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
  }, []);

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
        messageType: 'Проблема',
        login: '',
        message: ''
      });
    }
  }, [isOpen]);
  
  if (!isOpen) return null;

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!formData.message.trim()) {
      alert('Пожалуйста, напишите ваше сообщение');
      return;
    }
    
    onSubmit(formData);
    handleClose();
  };

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
          style={{
            position: 'absolute',
            top: '16px',
            right: '16px',
            background: 'none',
            border: 'none',
            fontSize: '24px',
            cursor: 'pointer',
            color: '#666',
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
            e.target.style.backgroundColor = '#f5f5f5';
            e.target.style.color = '#333';
          }}
          onMouseLeave={(e) => {
            e.target.style.backgroundColor = 'transparent';
            e.target.style.color = '#666';
          }}
        >
          ×
        </button>
        
        {/* Заголовок - фиксированный */}
        <h2 style={{ 
          margin: '0 0 20px 0', 
          fontSize: '28px', 
          fontWeight: '800',
          color: '#013b45ff',
          textAlign: 'center',
          paddingRight: '40px',
          flexShrink: 0
        }}>
          Обратная связь
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
          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', flex: 1 }}>
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
                name="messageType"
                value={formData.messageType}
                onChange={handleChange}
                style={{
                  width: '100%',
                  padding: '12px',
                  border: '2px solid #bdc3c7',
                  borderRadius: '8px',
                  fontSize: '16px',
                  boxSizing: 'border-box',
                  backgroundColor: 'white',
                  transition: 'border-color 0.3s ease',
                  cursor: 'pointer'
                }}
              >
                <option value="Проблема">Проблема</option>
                <option value="Предложение">Предложение</option>
                <option value="Отзыв">Отзыв</option>
              </select>
            </div>

            {/* Поле Логин */}
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
                style={{
                  width: '100%',
                  padding: '12px',
                  border: '2px solid #bdc3c7',
                  borderRadius: '8px',
                  fontSize: '16px',
                  boxSizing: 'border-box',
                  transition: 'border-color 0.3s ease'
                }}
              />
            </div>

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
                name="message"
                value={formData.message}
                onChange={handleChange}
                placeholder="Опишите вашу проблему, предложение или оставьте отзыв..."
                rows={5}
                style={{
                  width: '100%',
                  padding: '12px',
                  border: '2px solid #bdc3c7',
                  borderRadius: '8px',
                  fontSize: '16px',
                  boxSizing: 'border-box',
                  transition: 'border-color 0.3s ease',
                  resize: 'vertical',
                  minHeight: '120px'
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
                style={{
                  padding: '12px 24px',
                  border: 'none',
                  borderRadius: '8px',
                  backgroundColor: '#3498db',
                  color: 'white',
                  cursor: 'pointer',
                  fontSize: '16px',
                  fontWeight: '600',
                  transition: 'all 0.3s ease'
                }}
                onMouseEnter={(e) => {
                  e.target.style.backgroundColor = '#2980b9';
                }}
                onMouseLeave={(e) => {
                  e.target.style.backgroundColor = '#3498db';
                }}
              >
                ОТПРАВИТЬ
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>,
    document.body
  );
}