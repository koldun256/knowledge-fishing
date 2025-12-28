// src/components/SharePondModal.jsx
import React, { useState, useEffect, useCallback } from 'react';
import ReactDOM from 'react-dom';
import { API_CONFIG } from '../config/api';

export const shareUrlPrefix = `${API_CONFIG.BASE_URL}/`;

export default function SharePondModal({ isOpen, onClose, pond }) {
  const [shareUrl, setShareUrl] = useState('');
  const [copied, setCopied] = useState(false);
  const [pondInfo, setPondInfo] = useState('');

  useEffect(() => {
    if (pond) {
      // Генерация ссылки для общего доступа к пруду
      const baseUrl = window.location.origin;
      const shareId = `${pond.id}`;
      const url = `${shareUrlPrefix}${shareId}`;
      setShareUrl(url);
      
      // Формируем текст для соцсетей
      const infoText = `Пруд "${pond.name}" в Knowledge Fishing\n` +
                      `Всего рыб: ${pond.cnt_fishes || 0}\n` +
                      `Готовы к рыбалке: ${pond.cnt_ready_fishes || 0}\n\n` +
                      `Ссылка: ${url}`;
      setPondInfo(infoText);
    }
  }, [pond]);

  const handleClose = useCallback(() => {
    setCopied(false);
    onClose();
  }, [onClose]);

  const handleBackdropClick = useCallback((e) => {
    if (e.target === e.currentTarget) {
      handleClose();
    }
  }, [handleClose]);

  const handleCopyLink = () => {
    navigator.clipboard.writeText(shareUrl)
      .then(() => {
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
      })
      .catch(err => {
        console.error('Не удалось скопировать ссылку: ', err);
      });
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

  // Функции для шаринга в разные соцсети
  const handleShareTelegram = () => {
    const text = encodeURIComponent(`Посмотрите мой пруд "${pond.name}" в Knowledge Fishing!\n\n${pondInfo}`);
    window.open(`https://t.me/share/url?url=${encodeURIComponent(shareUrl)}&text=${text}`, '_blank');
  };

  const handleShareVK = () => {
    const text = encodeURIComponent(`Пруд "${pond.name}" в Knowledge Fishing`);
    window.open(`https://vk.com/share.php?url=${encodeURIComponent(shareUrl)}&title=${text}&comment=${encodeURIComponent(pondInfo)}`, '_blank');
  };

  const handleShareWhatsApp = () => {
    const text = encodeURIComponent(`Посмотрите мой пруд "${pond.name}" в Knowledge Fishing!\n\n${pondInfo}`);
    window.open(`https://wa.me/?text=${text}`, '_blank');
  };

  const handleShareYandexMail = () => {
    const subject = encodeURIComponent(`Пруд "${pond.name}" в Knowledge Fishing`);
    const body = encodeURIComponent(`Привет!\n\nПосмотрите мой пруд "${pond.name}" в Knowledge Fishing:\n\n${pondInfo}\n\n`);
    window.open(`https://mail.yandex.ru/compose?to=&subject=${subject}&body=${body}`, '_blank');
  };

  // Для Макс (Mail.ru) - используем стандартный mailto
  const handleShareMax = () => {
    const subject = encodeURIComponent(`Пруд "${pond.name}" в Knowledge Fishing`);
    const body = encodeURIComponent(`Привет!\n\nПосмотрите мой пруд "${pond.name}" в Knowledge Fishing:\n\n${pondInfo}\n\n`);
    window.open(`mailto:?subject=${subject}&body=${body}`, '_blank');
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

  if (!isOpen || !pond) return null;

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
          Поделиться прудом
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
          {/* Название пруда */}
          <div style={{ marginBottom: '20px', flexShrink: 0 }}>
            <p style={{
              fontSize: '18px',
              fontWeight: '600',
              color: '#34495e',
              textAlign: 'center',
              margin: 0
            }}>
              "{pond.name}"
            </p>
          </div>

          {/* Ссылка для общего доступа */}
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
              ССЫЛКА ДЛЯ ОБЩЕГО ДОСТУПА
            </label>
            <div style={{
              display: 'flex',
              gap: '8px',
              alignItems: 'center'
            }}>
              <input
                type="text"
                value={shareUrl}
                readOnly
                style={{
                  flex: 1,
                  padding: '12px',
                  border: '2px solid #bdc3c7',
                  borderRadius: '8px',
                  fontSize: '16px',
                  boxSizing: 'border-box',
                  transition: 'border-color 0.3s ease',
                  backgroundColor: '#f8f9fa',
                  cursor: 'default'
                }}
              />
              <button
                onClick={handleCopyLink}
                style={{
                  padding: '12px 20px',
                  border: 'none',
                  borderRadius: '8px',
                  backgroundColor: copied ? '#27ae60' : '#3498db',
                  color: 'white',
                  cursor: 'pointer',
                  fontSize: '14px',
                  fontWeight: '600',
                  transition: 'all 0.3s ease',
                  whiteSpace: 'nowrap',
                  minWidth: '120px'
                }}
                onMouseEnter={(e) => {
                  if (!copied) {
                    e.target.style.backgroundColor = '#2980b9';
                  }
                }}
                onMouseLeave={(e) => {
                  if (!copied) {
                    e.target.style.backgroundColor = '#3498db';
                  }
                }}
              >
                {copied ? '✓ СКОПИРОВАНО' : 'КОПИРОВАТЬ'}
              </button>
            </div>
            <p style={{
              marginTop: '8px',
              fontSize: '14px',
              color: '#7f8c8d',
              fontStyle: 'italic'
            }}>
              Отправьте эту ссылку, чтобы поделиться прудом с другими пользователями
            </p>
          </div>

          {/* Квадратные кнопки для соцсетей */}
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
              ПОДЕЛИТЬСЯ В
            </label>
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(5, 1fr)',
              gap: '12px',
              justifyContent: 'center'
            }}>
              {/* Telegram */}
              <button
                onClick={handleShareTelegram}
                title="Поделиться в Telegram"
                style={{
                  width: '60px',
                  height: '60px',
                  border: 'none',
                  borderRadius: '12px',
                  backgroundColor: '#0088cc',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  transition: 'all 0.3s ease',
                  padding: '0'
                }}
                onMouseEnter={(e) => {
                  e.target.style.backgroundColor = '#0077b5';
                  e.target.style.transform = 'scale(1.1)';
                }}
                onMouseLeave={(e) => {
                  e.target.style.backgroundColor = '#0088cc';
                  e.target.style.transform = 'scale(1)';
                }}
              >
                <svg width="32" height="32" viewBox="0 0 24 24" fill="white">
                  <path d="M11.944 0A12 12 0 0 0 0 12a12 12 0 0 0 12 12 12 12 0 0 0 12-12A12 12 0 0 0 12 0a12 12 0 0 0-.056 0zm4.962 7.224c.1-.002.321.023.465.14a.506.506 0 0 1 .171.325c.016.093.036.306.02.472-.18 1.898-.962 6.502-1.36 8.627-.168.9-.499 1.201-.82 1.23-.698.064-1.225-.46-1.9-.902-1.056-.692-1.653-1.124-2.678-1.8-1.185-.78-.417-1.21.258-1.91.177-.184 3.247-2.977 3.307-3.23.007-.032.014-.15-.056-.212s-.174-.041-.249-.024c-.106.024-1.793 1.14-5.061 3.345-.48.33-.913.49-1.302.48-.428-.008-1.252-.241-1.865-.44-.752-.245-1.349-.374-1.297-.789.027-.216.325-.437.894-.663 3.498-1.524 5.83-2.529 6.998-3.014 3.332-1.386 4.025-1.627 4.476-1.635z"/>
                </svg>
              </button>

              {/* VK (ВКонтакте) */}
              <button
                onClick={handleShareVK}
                title="Поделиться во ВКонтакте"
                style={{
                  width: '60px',
                  height: '60px',
                  border: 'none',
                  borderRadius: '12px',
                  backgroundColor: '#4C75A3',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  transition: 'all 0.3s ease',
                  padding: '0'
                }}
                // onMouseEnter={(e) => {
                //   // e.target.style.backgroundColor = '#3a5a80';
                //   e.target.style.transform = 'scale(1.1)';
                // }}
                // onMouseLeave={(e) => {
                //   // e.target.style.backgroundColor = '#4C75A3';
                //   e.target.style.transform = 'scale(1)';
                // }}
              >
                <img 
									src={`${process.env.PUBLIC_URL}/assets/tg-icon.png`} 
									alt="Поделиться в Телеграмм"
									className="rounded-lg transition-transform group-hover:scale-105"
                />
              </button>

              {/* WhatsApp */}
              <button
                onClick={handleShareWhatsApp}
                title="Поделиться в WhatsApp"
                style={{
                  width: '60px',
                  height: '60px',
                  border: 'none',
                  borderRadius: '12px',
                  backgroundColor: '#25D366',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  transition: 'all 0.3s ease',
                  padding: '0'
                }}
                onMouseEnter={(e) => {
                  e.target.style.backgroundColor = '#1da851';
                  e.target.style.transform = 'scale(1.1)';
                }}
                onMouseLeave={(e) => {
                  e.target.style.backgroundColor = '#25D366';
                  e.target.style.transform = 'scale(1)';
                }}
              >
                <svg width="32" height="32" viewBox="0 0 24 24" fill="white">
                  <path d="M20.52 3.449C18.24 1.245 15.24 0 12.045 0 5.496 0 .146 5.16.001 11.586c-.042 2.028.566 4.014 1.741 5.732L0 24l6.896-1.806c1.594.879 3.389 1.376 5.197 1.411h.005c6.494 0 11.906-5.177 12.056-11.599.026-1.506-.297-3.003-.951-4.411-.644-1.398-1.571-2.624-2.683-3.656zM12.099 21.499c-1.48 0-2.93-.417-4.197-1.204l-.301-.179-3.124.817.833-3.047-.197-.314c-.827-1.314-1.262-2.825-1.265-4.38C3.054 6.428 7.155 1.5 12.045 1.5c2.651 0 5.116 1.033 6.977 2.907 1.86 1.874 2.881 4.366 2.881 7.019 0 5.532-4.491 10.073-9.804 10.073zM17 14.535c-.149-.075-.888-.439-1.026-.489-.138-.051-.239-.076-.338.075-.1.151-.384.489-.471.592-.087.102-.174.115-.323.038-.149-.075-.629-.232-1.199-.739-.443-.394-.741-.879-.827-1.027-.087-.149-.009-.23.065-.303.068-.067.149-.174.224-.261.075-.087.1-.149.149-.249.05-.1.025-.188-.013-.264-.037-.075-.338-.815-.463-1.116-.121-.295-.244-.255-.338-.26-.087-.005-.188-.005-.289-.005a.56.56 0 0 0-.404.189c-.138.151-.526.513-.526 1.251s.538 1.451.613 1.552c.075.102 1.056 1.613 2.56 2.265.353.154.628.246.842.315.354.113.675.097.928.059.284-.043.888-.363 1.013-.715.126-.352.126-.653.088-.715-.037-.063-.137-.102-.287-.177z"/>
                </svg>
              </button>

              {/* Mail.ru (Макс) */}
              <button
                onClick={handleShareMax}
                title="Поделиться по почте (Mail.ru)"
                style={{
                  width: '60px',
                  height: '60px',
                  border: 'none',
                  borderRadius: '12px',
                  backgroundColor: '#168DE2',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  transition: 'all 0.3s ease',
                  padding: '0'
                }}
                onMouseEnter={(e) => {
                  e.target.style.backgroundColor = '#0f6bb8';
                  e.target.style.transform = 'scale(1.1)';
                }}
                onMouseLeave={(e) => {
                  e.target.style.backgroundColor = '#168DE2';
                  e.target.style.transform = 'scale(1)';
                }}
              >
                <svg width="32" height="32" viewBox="0 0 24 24" fill="white">
                  <path d="M22 7.535V16.48c0 .27-.1.5-.3.7-.2.2-.43.3-.7.3h-1.94l-1.13 3.21c-.1.27-.3.4-.6.4h-.06c-.33 0-.57-.2-.67-.53l-1.08-3.08H8.58l-1.08 3.08c-.1.33-.34.53-.67.53h-.06c-.3 0-.5-.13-.6-.4L5.94 17.48H4c-.27 0-.5-.1-.7-.3-.2-.2-.3-.43-.3-.7V7.535c0-.27.1-.5.3-.7.2-.2.43-.3.7-.3h18c.27 0 .5.1.7.3.2.2.3.43.3.7zM12 14.72c1.67 0 3.02-1.35 3.02-3.02 0-1.67-1.35-3.02-3.02-3.02-1.67 0-3.02 1.35-3.02 3.02 0 1.67 1.35 3.02 3.02 3.02zm6.3-5.35c0-.67-.54-1.21-1.21-1.21-.67 0-1.21.54-1.21 1.21 0 .67.54 1.21 1.21 1.21.67 0 1.21-.54 1.21-1.21z"/>
                </svg>
              </button>

              {/* Яндекс Почта */}
              <button
                onClick={handleShareYandexMail}
                title="Поделиться через Яндекс Почту"
                style={{
                  width: '60px',
                  height: '60px',
                  border: 'none',
                  borderRadius: '12px',
                  backgroundColor: '#FC3F1D',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  transition: 'all 0.3s ease',
                  padding: '0'
                }}
                onMouseEnter={(e) => {
                  e.target.style.backgroundColor = '#d32f0d';
                  e.target.style.transform = 'scale(1.1)';
                }}
                onMouseLeave={(e) => {
                  e.target.style.backgroundColor = '#FC3F1D';
                  e.target.style.transform = 'scale(1)';
                }}
              >
                <svg width="32" height="32" viewBox="0 0 24 24" fill="white">
                  <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.41 0-8-3.59-8-8s3.59-8 8-8 8 3.59 8 8-3.59 8-8 8zm4.59-12.42L10 14.17l-2.59-2.58L6 13l4 4 8-8z"/>
                </svg>
              </button>
            </div>
            
            {/* Подпись под кнопками */}
            <p style={{
              marginTop: '12px',
              fontSize: '14px',
              color: '#7f8c8d',
              textAlign: 'center',
              fontStyle: 'italic'
            }}>
              Нажмите на иконку, чтобы поделиться
            </p>
          </div>

          {/* Информация о пруде
          <div style={{
            marginBottom: '20px',
            flexShrink: 0,
            backgroundColor: '#f8f9fa',
            border: '1px solid #e9ecef',
            borderRadius: '8px',
            padding: '16px'
          }}>
            <h3 style={{
              margin: '0 0 12px 0',
              fontSize: '16px',
              fontWeight: '600',
              color: '#34495e'
            }}>
              ИНФОРМАЦИЯ О ПРУДЕ:
            </h3>
            <div style={{
              display: 'grid',
              gridTemplateColumns: '1fr 1fr',
              gap: '8px',
              fontSize: '14px'
            }}>
              <div style={{ color: '#7f8c8d' }}>Название:</div>
              <div style={{ fontWeight: '500' }}>{pond.name}</div>
              
              <div style={{ color: '#7f8c8d' }}>Всего рыб:</div>
              <div style={{ fontWeight: '500' }}>{pond.cnt_fishes || 0}</div>
              
              <div style={{ color: '#7f8c8d' }}>Готовы к рыбалке:</div>
              <div style={{ fontWeight: '500' }}>{pond.cnt_ready_fishes || 0}</div>
            </div>
          </div> */}

          {/* Кнопка закрытия */}
          <div style={{
            display: 'flex',
            justifyContent: 'flex-end',
            marginBottom: '20px',
            flexShrink: 0
          }}>
            <button
              onClick={handleClose}
              style={{
                padding: '12px 24px',
                border: 'none',
                borderRadius: '8px',
                backgroundColor: '#95a5a6',
                color: 'white',
                cursor: 'pointer',
                fontSize: '16px',
                fontWeight: '600',
                transition: 'all 0.3s ease'
              }}
              onMouseEnter={(e) => {
                e.target.style.backgroundColor = '#7f8c8d';
              }}
              onMouseLeave={(e) => {
                e.target.style.backgroundColor = '#95a5a6';
              }}
            >
              ЗАКРЫТЬ
            </button>
          </div>
        </div>
      </div>
    </div>,
    document.body
  );
}