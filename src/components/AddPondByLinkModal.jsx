// src/components/AddPondByLinkModal.jsx
import React, { useState, useEffect } from 'react';
import ReactDOM from 'react-dom';

export default function AddPondByLinkModal({ isOpen, onClose, onAdd }) {
  const [link, setLink] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleBackdropClick = (e) => {
    if (e.target === e.currentTarget) {
      handleClose();
    }
  };

  useEffect(() => {
    const handleEscape = (e) => {
      if (e.key === 'Escape' && isOpen) {
        handleClose();
      }
    };

    document.addEventListener('keydown', handleEscape);
    return () => document.removeEventListener('keydown', handleEscape);
  }, [isOpen]);

  useEffect(() => {
    if (isOpen) {
      setLink('');
      setError('');
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const validateLink = (url) => {
    // Базовая валидация URL
    try {
      new URL(url);
      return true;
    } catch {
      return false;
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!link.trim()) {
      setError('Введите ссылку на пруд');
      return;
    }

    if (!validateLink(link)) {
      setError('Введите корректную ссылку');
      return;
    }

    setLoading(true);
    setError('');

    try {
      // Здесь будет API-запрос для добавления пруда по ссылке
      // const response = await api.addPondByLink(link);
      // onAdd(response.data);
      
      // Для демонстрации имитируем успешное добавление
      setTimeout(() => {
        onAdd({
          id: Date.now(),
          name: 'Пруд по ссылке',
          link: link
        });
      }, 1000);
      
    } catch (err) {
      setError(err.message || 'Ошибка при добавлении пруда');
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    setLink(e.target.value);
    if (error) setError('');
  };

  const handleClose = () => {
    setLink('');
    setError('');
    setLoading(false);
    onClose();
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
        
        <h2 style={{ 
          margin: '0 0 20px 0', 
          fontSize: '28px', 
          fontWeight: '800',
          color: '#3498db',
          textAlign: 'center',
          paddingRight: '40px',
          flexShrink: 0
        }}>
          Добавить пруд по ссылке
        </h2>
        
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
            {/* Поле для ввода ссылки */}
            <div style={{ marginBottom: '24px', flexShrink: 0 }}>
              <label style={{
                display: 'block',
                marginBottom: '12px',
                fontWeight: '600',
                fontSize: '18px',
                color: '#34495e',
                textTransform: 'uppercase',
                letterSpacing: '0.5px'
              }}>
                ССЫЛКА НА ПРУД *
              </label>
              <input
                type="url"
                value={link}
                onChange={handleChange}
                placeholder="https://example.com/pond/..."
                style={{
                  width: '100%',
                  padding: '14px',
                  border: `2px solid ${error ? '#e74c3c' : '#bdc3c7'}`,
                  borderRadius: '8px',
                  fontSize: '16px',
                  boxSizing: 'border-box',
                  transition: 'border-color 0.3s ease',
                  fontFamily: 'monospace'
                }}
                required
                autoFocus
              />
              
              {error && (
                <div style={{
                  marginTop: '8px',
                  padding: '10px',
                  backgroundColor: '#fee',
                  border: '1px solid #e74c3c',
                  borderRadius: '6px',
                  color: '#c0392b',
                  fontSize: '14px'
                }}>
                  ⚠️ {error}
                </div>
              )}
              
              <div style={{
                marginTop: '12px',
                padding: '12px',
                backgroundColor: '#f8f9fa',
                borderRadius: '8px',
                fontSize: '14px',
                color: '#7f8c8d'
              }}>
                <p style={{ margin: '0 0 8px 0', fontWeight: '600' }}>
                  Как получить ссылку на пруд?
                </p>
                <ul style={{ margin: '0', paddingLeft: '20px' }}>
                  <li>Попросите у владельца пруда ссылку для копирования</li>
                  <li>Найдите пруд в каталоге публичных прудов</li>
                  <li>Используйте ссылку из социальных сетей или мессенджеров</li>
                </ul>
              </div>
            </div>

            {/* Информация о том, что будет скопировано */}
            <div style={{ 
              marginBottom: '20px',
              flexShrink: 0,
              padding: '16px',
              backgroundColor: '#e3f2fd',
              borderRadius: '8px',
              border: '1px solid #bbdefb'
            }}>
              <h4 style={{
                margin: '0 0 8px 0',
                fontSize: '16px',
                color: '#1565c0',
                display: 'flex',
                alignItems: 'center',
                gap: '8px'
              }}>
                <span>📋</span> Что будет скопировано:
              </h4>
              <ul style={{
                margin: '0',
                paddingLeft: '24px',
                fontSize: '14px',
                color: '#0d47a1'
              }}>
                <li>Все карточки пруда</li>
                <li>Интервалы повторения</li>
                <li>Структура слоев</li>
                <li>Настройки пруда</li>
              </ul>
            </div>

            {/* Кнопки действий */}
            <div style={{
              display: 'flex',
              justifyContent: 'space-between',
              marginTop: 'auto',
              paddingTop: '20px',
              flexShrink: 0
            }}>
              <button
                type="button"
                onClick={handleClose}
                style={{
                  padding: '12px 24px',
                  border: '2px solid #bdc3c7',
                  borderRadius: '8px',
                  backgroundColor: 'transparent',
                  color: '#7f8c8d',
                  cursor: 'pointer',
                  fontSize: '14px',
                  fontWeight: '600',
                  transition: 'all 0.3s ease',
                  minWidth: '120px'
                }}
                onMouseEnter={(e) => {
                  e.target.style.backgroundColor = '#f8f9fa';
                  e.target.style.borderColor = '#95a5a6';
                  e.target.style.color = '#34495e';
                }}
                onMouseLeave={(e) => {
                  e.target.style.backgroundColor = 'transparent';
                  e.target.style.borderColor = '#bdc3c7';
                  e.target.style.color = '#7f8c8d';
                }}
              >
                Назад
              </button>
              
              <button
                type="submit"
                disabled={loading || !link.trim()}
                style={{
                  padding: '12px 24px',
                  border: 'none',
                  borderRadius: '8px',
                  backgroundColor: loading ? '#95a5a6' : '#3498db',
                  color: 'white',
                  cursor: (loading || !link.trim()) ? 'not-allowed' : 'pointer',
                  fontSize: '14px',
                  fontWeight: '600',
                  transition: 'all 0.3s ease',
                  opacity: (loading || !link.trim()) ? 0.6 : 1,
                  minWidth: '120px'
                }}
              >
                {loading ? 'ДОБАВЛЕНИЕ...' : 'ДОБАВИТЬ ПРУД'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>,
    document.body
  );
}