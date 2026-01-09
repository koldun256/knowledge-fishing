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
    <div 
      className="fixed inset-0 bg-black/50 flex justify-center items-center z-[10000] p-4"
      onClick={handleBackdropClick}
    >
      <div className="bg-white p-6 rounded-xl w-full max-w-[400px] max-h-[90vh] shadow-2xl overflow-hidden flex flex-col relative">
        {/* Крестик закрытия в правом верхнем углу */}
        <button
          onClick={handleClose}
          className="absolute top-4 right-4 bg-none border-none text-2xl cursor-pointer text-gray-600 w-8 h-8 flex items-center justify-center rounded transition-all duration-300 ease-in-out hover:bg-gray-100 hover:text-gray-800 z-10"
        >
          ×
        </button>
        
        {/* Заголовок - фиксированный */}
        <h2 className="m-0 mb-5 text-2xl font-extrabold text-[#013b45] text-center pr-10 flex-shrink-0">
          {isSignUp ? 'Регистрация' : 'Вход'}
        </h2>
        
        {/* Основной контент */}
        <div className="flex-1 overflow-auto flex flex-col min-h-0 pr-5 -mr-5">
          <form onSubmit={handleSubmit} className="flex flex-col flex-1">
            {/* Блок с ошибкой */}
            {error && (
              <div className="mb-5 p-3 bg-red-50 border border-red-400 rounded-lg text-red-700 text-sm text-center flex-shrink-0">
                {error}
              </div>
            )}

            {/* Поле Логин */}
            <div className="mb-5 flex-shrink-0">
              <label className="block mb-2 font-semibold text-lg text-gray-700 uppercase tracking-wider">
                ЛОГИН *
              </label>
              <input
                type="text"
                name="login"
                value={formData.login}
                onChange={handleChange}
                placeholder="Введите логин"
                disabled={isLoading}
                className={`w-full p-3 border-2 rounded-lg text-base box-border transition-colors duration-300 ${
                  error && !formData.login.trim() 
                    ? 'border-red-400' 
                    : 'border-gray-300'
                } ${isLoading ? 'bg-gray-100' : 'bg-white'}`}
                required
              />
            </div>

            {/* Поле Пароль с кнопкой показа */}
            <div className="mb-5 flex-shrink-0 relative">
              <label className="block mb-2 font-semibold text-lg text-gray-700 uppercase tracking-wider">
                ПАРОЛЬ *
              </label>
              <div className="relative">
                <input
                  type={showPassword ? "text" : "password"}
                  name="password"
                  value={formData.password}
                  onChange={handleChange}
                  placeholder="Введите пароль"
                  disabled={isLoading}
                  className={`w-full p-3 pr-11 border-2 rounded-lg text-base box-border transition-colors duration-300 ${
                    error && !formData.password.trim() 
                      ? 'border-red-400' 
                      : 'border-gray-300'
                  } ${isLoading ? 'bg-gray-100' : 'bg-white'}`}
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  disabled={isLoading}
                  className={`absolute right-3 top-1/2 -translate-y-1/2 bg-none border-none cursor-pointer text-gray-600 p-1 flex items-center justify-center transition-colors duration-300 ${
                    isLoading ? 'cursor-not-allowed opacity-70' : 'hover:text-[#013b45]'
                  }`}
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
            <div className="flex flex-col gap-3 mt-auto flex-shrink-0">
              {/* Основная кнопка (зеленая) */}
              <button
                type="submit"
                disabled={isLoading}
                className={`p-3 border-none rounded-lg text-white cursor-pointer text-base font-semibold transition-all duration-300 ease-in-out w-full ${
                  isLoading 
                    ? 'bg-gray-400 cursor-not-allowed opacity-80' 
                    : 'bg-green-500 hover:bg-green-600'
                }`}
              >
                {isLoading ? (
                  <span className="flex items-center justify-center gap-2">
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
                  className={`p-3 border-2 border-white rounded-lg bg-white text-gray-700 text-base font-semibold transition-all duration-300 ease-in-out w-full ${
                    isLoading 
                      ? 'cursor-not-allowed opacity-60' 
                      : 'hover:bg-gray-100 hover:border-white hover:text-[#013b45]'
                  }`}
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
                  className={`p-3 border-2 border-white rounded-lg bg-white text-gray-700 text-base font-semibold transition-all duration-300 ease-in-out w-full ${
                    isLoading 
                      ? 'cursor-not-allowed opacity-60' 
                      : 'hover:bg-gray-100 hover:border-white hover:text-[#013b45]'
                  }`}
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
