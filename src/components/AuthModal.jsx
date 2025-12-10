// src/components/AuthModal.jsx
import React, { useState, useEffect, useCallback } from 'react';
import ReactDOM from 'react-dom';

export default function AuthModal({ isOpen, onClose, onLogin, onRegister }) {
  const [isSignUp, setIsSignUp] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [formData, setFormData] = useState({
    login: '',
    password: ''
  });

  const handleClose = useCallback(() => {
    setFormData({
      login: '',
      password: ''
    });
    setIsSignUp(false);
    setShowPassword(false);
    setError(null);
    setIsLoading(false);
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
    // Очищаем ошибку при изменении полей
    if (error) {
      setError(null);
    }
  }, [error]);

  const toggleSignUp = useCallback(() => {
    setIsSignUp(prev => !prev);
    setFormData({
      login: '',
      password: ''
    });
    setShowPassword(false);
    setError(null);
  }, []);

  const handleSubmit = useCallback(async (e) => {
    e.preventDefault();
    
    if (!formData.login.trim()) {
      setError('Введите логин');
      return;
    }
    
    if (!formData.password.trim()) {
      setError('Введите пароль');
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      if (isSignUp) {
        await onRegister(formData);
      } else {
        await onLogin(formData);
      }
      handleClose();
    } catch (err) {
      // Обрабатываем ошибки из API
      let errorMessage = 'Произошла ошибка';
      
      if (err.message.includes('login are already existed')) {
        errorMessage = 'Пользователь с таким логином уже существует';
      } else if (err.message.includes('there is no user with this login')) {
        errorMessage = 'Пользователь с таким логином не найден';
      } else if (err.message.includes('incorrect password')) {
        errorMessage = 'Неверный пароль';
      } else if (err.message.includes('Failed to')) {
        // Извлекаем более понятное сообщение из ошибки fetch
        const match = err.message.match(/Failed to (.*): (\d+)/);
        if (match) {
          const action = match[1];
          const status = match[2];
          if (status === '400') {
            errorMessage = `Ошибка ${action}: проверьте правильность данных`;
          } else if (status === '401' || status === '403') {
            errorMessage = 'Ошибка авторизации';
          } else if (status === '500') {
            errorMessage = 'Ошибка сервера. Попробуйте позже';
          } else {
            errorMessage = `Ошибка ${action} (код ${status})`;
          }
        }
      } else if (err.message) {
        errorMessage = err.message;
      }
      
      setError(errorMessage);
    } finally {
      setIsLoading(false);
    }
  }, [formData, isSignUp, onLogin, onRegister, handleClose]);

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
        login: '',
        password: ''
      });
      setIsSignUp(false);
      setShowPassword(false);
      setError(null);
      setIsLoading(false);
    }
  }, [isOpen]);
  
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
        maxWidth: '400px',
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
          {isSignUp ? 'Регистрация' : 'Вход'}
        </h2>
        
        {/* Основной контент */}
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
            {/* Блок с ошибкой */}
            {error && (
              <div style={{
                marginBottom: '20px',
                padding: '12px',
                backgroundColor: '#fee',
                border: '1px solid #f66',
                borderRadius: '8px',
                color: '#c33',
                fontSize: '14px',
                textAlign: 'center',
                flexShrink: 0
              }}>
                {error}
              </div>
            )}

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
                ЛОГИН *
              </label>
              <input
                type="text"
                name="login"
                value={formData.login}
                onChange={handleChange}
                placeholder="Введите логин"
                disabled={isLoading}
                style={{
                  width: '100%',
                  padding: '12px',
                  border: error && !formData.login.trim() ? '2px solid #f66' : '2px solid #bdc3c7',
                  borderRadius: '8px',
                  fontSize: '16px',
                  boxSizing: 'border-box',
                  transition: 'border-color 0.3s ease',
                  backgroundColor: isLoading ? '#f5f5f5' : 'white'
                }}
                required
              />
            </div>

            {/* Поле Пароль с кнопкой показа */}
            <div style={{ marginBottom: '20px', flexShrink: 0, position: 'relative' }}>
              <label style={{
                display: 'block',
                marginBottom: '8px',
                fontWeight: '600',
                fontSize: '18px',
                color: '#34495e',
                textTransform: 'uppercase',
                letterSpacing: '0.5px'
              }}>
                ПАРОЛЬ *
              </label>
              <div style={{ position: 'relative' }}>
                <input
                  type={showPassword ? "text" : "password"}
                  name="password"
                  value={formData.password}
                  onChange={handleChange}
                  placeholder="Введите пароль"
                  disabled={isLoading}
                  style={{
                    width: '100%',
                    padding: '12px 45px 12px 12px',
                    border: error && !formData.password.trim() ? '2px solid #f66' : '2px solid #bdc3c7',
                    borderRadius: '8px',
                    fontSize: '16px',
                    boxSizing: 'border-box',
                    transition: 'border-color 0.3s ease',
                    backgroundColor: isLoading ? '#f5f5f5' : 'white'
                  }}
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  disabled={isLoading}
                  style={{
                    position: 'absolute',
                    right: '12px',
                    top: '50%',
                    transform: 'translateY(-50%)',
                    background: 'none',
                    border: 'none',
                    cursor: isLoading ? 'not-allowed' : 'pointer',
                    color: isLoading ? '#999' : '#666',
                    padding: '4px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    transition: 'color 0.3s ease',
                    opacity: isLoading ? 0.7 : 1
                  }}
                  onMouseEnter={(e) => {
                    if (!isLoading) {
                      e.target.style.color = '#013b45ff';
                    }
                  }}
                  onMouseLeave={(e) => {
                    if (!isLoading) {
                      e.target.style.color = '#666';
                    }
                  }}
                >
                  {showPassword ? (
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
                      <path d="M12 4.5C7 4.5 2.73 7.61 1 12c1.73 4.39 6 7.5 11 7.5s9.27-3.11 11-7.5c-1.73-4.39-6-7.5-11-7.5zM12 17c-2.76 0-5-2.24-5-5s2.24-5 5-5 5 2.24 5 5-2.24 5-5 5zm0-8c-1.66 0-3 1.34-3 3s1.34 3 3 3 3-1.34 3-3-1.34-3-3-3z"/>
                    </svg>
                  ) : (
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
                      <path d="M12 7c2.76 0 5 2.24 5 5 0 .65-.13 1.26-.36 1.83l2.92 2.92c1.51-1.26 2.7-2.89 3.43-4.75-1.73-4.39-6-7.5-11-7.5-1.4 0-2.74.25-3.98.7l2.16 2.16C10.74 7.13 11.35 7 12 7zM2 4.27l2.28 2.28.46.46C3.08 8.3 1.78 10.02 1 12c1.73 4.39 6 7.5 11 7.5 1.55 0 3.03-.3 4.38-.84l.42.42L19.73 22 21 20.73 3.27 3 2 4.27zM7.53 9.8l1.55 1.55c-.05.21-.08.43-.08.65 0 1.66 1.34 3 3 3 .22 0 .44-.03.65-.08l1.55 1.55c-.67.33-1.41.53-2.2.53-2.76 0-5-2.24-5-5 0-.79.2-1.53.53-2.2zm4.31-.78l3.15 3.15.02-.16c0-1.66-1.34-3-3-3l-.17.01z"/>
                    </svg>
                  )}
                </button>
              </div>
            </div>

            {/* Кнопки действий */}
            <div style={{
              display: 'flex',
              flexDirection: 'column',
              gap: '12px',
              marginTop: 'auto',
              flexShrink: 0
            }}>
              {/* Основная кнопка (зеленая) */}
              <button
                type="submit"
                disabled={isLoading}
                style={{
                  padding: '12px 24px',
                  border: 'none',
                  borderRadius: '8px',
                  backgroundColor: isLoading ? '#95a5a6' : '#27ae60',
                  color: 'white',
                  cursor: isLoading ? 'not-allowed' : 'pointer',
                  fontSize: '16px',
                  fontWeight: '600',
                  transition: 'all 0.3s ease',
                  width: '100%',
                  opacity: isLoading ? 0.8 : 1
                }}
                onMouseEnter={(e) => {
                  if (!isLoading) {
                    e.target.style.backgroundColor = '#219a52';
                  }
                }}
                onMouseLeave={(e) => {
                  if (!isLoading) {
                    e.target.style.backgroundColor = '#27ae60';
                  }
                }}
              >
                {isLoading ? (
                  <span style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mx-auto"></div>
                    {isSignUp ? 'РЕГИСТРАЦИЯ...' : 'ВХОД...'}
                  </span>
                ) : (
                  isSignUp ? 'ЗАРЕГИСТРИРОВАТЬСЯ' : 'ВОЙТИ'
                )}
              </button>

              {/* Кнопка переключения режима (белая с черной границей) - показывается только в режиме входа */}
              {!isSignUp && (
                <button
                  type="button"
                  onClick={toggleSignUp}
                  disabled={isLoading}
                  style={{
                    padding: '12px 24px',
                    border: '2px solid #ffffffff',
                    borderRadius: '8px',
                    backgroundColor: 'white',
                    color: '#34495e',
                    cursor: isLoading ? 'not-allowed' : 'pointer',
                    fontSize: '16px',
                    fontWeight: '600',
                    transition: 'all 0.3s ease',
                    width: '100%',
                    opacity: isLoading ? 0.6 : 1
                  }}
                  onMouseEnter={(e) => {
                    if (!isLoading) {
                      e.target.style.backgroundColor = '#f5f5f5';
                      e.target.style.borderColor = '#ffffffff';
                      e.target.style.color = '#013b45ff';
                    }
                  }}
                  onMouseLeave={(e) => {
                    if (!isLoading) {
                      e.target.style.backgroundColor = 'white';
                      e.target.style.borderColor = '#ffffffff';
                      e.target.style.color = '#34495e';
                    }
                  }}
                >
                  ЗАРЕГИСТРИРОВАТЬСЯ
                </button>
              )}

              {/* Кнопка "Войти" в режиме регистрации */}
              {isSignUp && (
                <button
                  type="button"
                  onClick={toggleSignUp}
                  disabled={isLoading}
                  style={{
                    padding: '12px 24px',
                    border: '2px solid #ffffffff',
                    borderRadius: '8px',
                    backgroundColor: 'white',
                    color: '#34495e',
                    cursor: isLoading ? 'not-allowed' : 'pointer',
                    fontSize: '16px',
                    fontWeight: '600',
                    transition: 'all 0.3s ease',
                    width: '100%',
                    opacity: isLoading ? 0.6 : 1
                  }}
                  onMouseEnter={(e) => {
                    if (!isLoading) {
                      e.target.style.backgroundColor = '#f5f5f5';
                      e.target.style.borderColor = '#ffffffff';
                      e.target.style.color = '#013b45ff';
                    }
                  }}
                  onMouseLeave={(e) => {
                    if (!isLoading) {
                      e.target.style.backgroundColor = 'white';
                      e.target.style.borderColor = '#ffffffff';
                      e.target.style.color = '#34495e';
                    }
                  }}
                >
                  ВОЙТИ
                </button>
              )}
            </div>
          </form>
        </div>
      </div>
    </div>,
    document.body
  );
}
