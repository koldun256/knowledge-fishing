// src/pages/SinglePondPage.jsx
import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { authService } from '../services/authService';
import { pondService } from '../services/pondService';
import { fishService } from '../services/fishService';
import AuthModal from '../components/AuthModal';
import InfoModal from '../components/InfoModal';
import FeedbackModal from '../components/FeedbackModal';
import { formatStringForDisplay } from '../helper/stringFormating';
import '../index.css';

export default function SinglePondPage() {
  const { firstParam, secondParam } = useParams();
  const navigate = useNavigate();
  const [pond, setPond] = useState(null); 
  const [fishes, setFishes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState(null);
  const [error, setError] = useState(null);
  
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [isInfoModalOpen, setIsInfoModalOpen] = useState(false);
  const [isFeedbackModalOpen, setIsFeedbackModalOpen] = useState(false);
  const [showLogoutDropdown, setShowLogoutDropdown] = useState(false);
  
  const [infoButtonPosition, setInfoButtonPosition] = useState(null);
  const [isMobile, setIsMobile] = useState(window.innerWidth < 710);
  
  const dropdownRef = useRef(null);

  console.log('URL Parameters:', { firstParam, secondParam });
  console.log('Current URL:', window.location.href);

  const pondImages = [
    'pond1.png',
    'pond2.png',
    'pond3.png',
    'pond4.png',
    'pond5.png',
    'pond6.png',
    'pond7.png',
    'pond8.png',
  ];

  const infoData = [
    {
      title: "Пруд и его рыбы",
      text: "\\tНа этой странице вы можете просмотреть подробную информацию о пруде и всех рыбах, которые в нем содержатся.\\n\\tВы можете скопировать этот пруд к себе, чтобы изучать его содержимое."
    },
    {
      title: "Содержимое пруда",
      text: "\\t• В верхней части отображается карточка пруда с описанием\\n\\t• Ниже показываются все рыбы этого пруда с вопросами и ответами\\n\\t• Рыбы отсортированы в порядке их добавления"
    }
  ];

  const determineUrlType = () => {
    // Если есть второй параметр, значит это формат user-login/pond-name
    if (secondParam) {
      return {
        type: 'public_url',
        publicUrl: `${firstParam}/${secondParam}`
      };
    }
    
    // Проверяем, является ли параметр UUID
    const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
    if (uuidRegex.test(firstParam)) {
      return {
        type: 'uuid',
        pondId: firstParam
      };
    }
  
    // Если не UUID, возможно это имя пруда или что-то еще
    return {
      type: 'unknown',
      identifier: firstParam
    };
  };

  // Обработчик изменения размера окна
  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth < 710);
    };

    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Закрытие выпадающего меню при клике вне его
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setShowLogoutDropdown(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Восстановление пользователя из localStorage
  useEffect(() => {
    const restoreUserFromStorage = () => {
      try {
        const savedUser = localStorage.getItem('currentUser');
        if (savedUser) {
          const parsedUser = JSON.parse(savedUser);
          setUser(parsedUser);
        }
      } catch (error) {
        console.error('Error restoring user:', error);
      }
    };

    restoreUserFromStorage();
  }, []);

  useEffect(() => {
    const loadPondData = async () => {
      try {
        setLoading(true);
        const urlInfo = determineUrlType();
      
        // Проверяем, удалось ли определить тип URL
        if (!urlInfo) {
            throw new Error('Неверный формат URL пруда');
        }
        let pondData;
        
        console.log(urlInfo);
        if (urlInfo.type === 'uuid') {
          // Загрузка по UUID
          pondData = await pondService.getPondCardById(urlInfo.pondId);
        } else if (urlInfo.type === 'public_url') {
          // Загрузка по user-login/pond-name
          pondData = await pondService.getPondCardByPublicUrl(urlInfo.publicUrl);
        }
        
        if (pondData) {
          const pondDataCorrected = {
            ...pondData.pond,
            user_login: pondData.user_login,
            fishes: pondData.fishes
          };
          setPond(pondDataCorrected);
        } else {
          throw new Error('Пруд не найден');
        }
        
      } catch (error) {
        console.error('Error loading pond data:', error);
        setError('Не удалось загрузить данные пруда');
      } finally {
        setLoading(false);
      }
    };
    
    if (firstParam) {
      loadPondData();
    }
  }, [firstParam, secondParam]);

  // Сохранение пользователя в localStorage
  useEffect(() => {
    if (user) {
      localStorage.setItem('currentUser', JSON.stringify(user));
    } else {
      localStorage.removeItem('currentUser');
    }
  }, [user]);

  const getPondImage = (pondId) => {
    const index = parseInt(pondId.toString()[0], 16) % pondImages.length;
    return `${process.env.PUBLIC_URL}/assets/${pondImages[index]}`;
  };

  const getFishWord = (count) => {
    if (count === 1) return 'рыба';
    if (count >= 2 && count <= 4) return 'рыбы';
    return 'рыб';
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('ru-RU', {
      day: 'numeric',
      month: 'long',
      year: 'numeric'
    });
  };

  const handleCopyPond = async (withUpdates = true) => {
    if (!user) {
      setIsAuthModalOpen(true);
      return;
    }

    const urlInfo = determineUrlType();

    try {
      setLoading(true);
      if (urlInfo.type === 'uuid')
        await pondService.copyPondById(urlInfo.pondId, withUpdates);
      else 
        await pondService.copyPondByPublicUrl(urlInfo.publicUrl, withUpdates);
      alert(`Пруд успешно скопирован ${withUpdates ? 'с обновлениями' : ''}!`);
    } catch (error) {
      console.error('Error copying pond:', error);
      alert('Не удалось скопировать пруд');
    } finally {
      setLoading(false);
    }
  };

  const handleLogin = async (loginData) => {
    try {
      const result = await authService.login(loginData);
      
      if (result) {
        const userData = {
          id: result.id || result.userId,
          login: result.login || result.username,
          username: result.username || result.login,
          email: result.email,
          token: result.token,
        };
        
        setUser(userData);
        localStorage.setItem('currentUser', JSON.stringify(userData));
      }
      
      return result;
      
    } catch (error) {
      console.error('Login error:', error);
      throw error;
    }
  };

  const handleRegister = async (registerData) => {
    try {
      const result = await authService.register(registerData);
      
      if (result) {
        const userData = {
          id: result.id || result.userId,
          login: result.login || result.username,
          username: result.username || result.login,
          email: result.email,
          token: result.token,
        };
        
        setUser(userData);
        localStorage.setItem('currentUser', JSON.stringify(userData));
      }
      
      return { 
        success: true, 
        message: 'Регистрация выполнена успешно! Вы можете войти в систему.' 
      };
      
    } catch (error) {
      console.error('Registration error:', error);
      throw error;
    }
  };
  
  const handleLogout = async () => {
    try {
      await authService.logout();
      setUser(null);
      localStorage.removeItem('currentUser');
      setShowLogoutDropdown(false);
      document.cookie = "access_token=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;";
      
      console.log('Logout successful');
    } catch (error) {
      console.error('Logout error:', error);
    }
  };

  const handleUserClick = () => {
    setShowLogoutDropdown(!showLogoutDropdown);
  };

  const handleInfoClick = (event) => {
    const buttonRect = event.currentTarget.getBoundingClientRect();
    setInfoButtonPosition(buttonRect);
    setIsInfoModalOpen(true);
  };

  const handleFeedbackClick = () => {
    setIsFeedbackModalOpen(true);
  };

  const handleFeedbackSubmit = (feedbackData) => {
    console.log('Feedback submitted:', feedbackData);
    alert('Спасибо за ваше сообщение! Мы рассмотрим его в ближайшее время.');
    setIsFeedbackModalOpen(false);
  };

  const handleAuthSuccess = () => {
    setIsAuthModalOpen(false);
  };

  if (loading && !pond) {
    return (
      <div className="min-h-screen bg-green-100 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Загрузка пруда...</p>
        </div>
      </div>
    );
  }

  if (error && !pond) {
    return (
      <div className="min-h-screen bg-green-100 flex items-center justify-center">
        <div className="text-center">
          <div className="text-red-500 text-4xl mb-4">⚠️</div>
          <h2 className="text-xl font-semibold text-gray-800 mb-2">Ошибка загрузки</h2>
          <p className="text-gray-600 mb-4">{error}</p>
          <button 
            onClick={() => navigate('/public-ponds')}
            className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg mr-2"
          >
            К публичным прудам
          </button>
          <button 
            onClick={() => window.location.reload()}
            className="bg-gray-600 hover:bg-gray-700 text-white px-6 py-2 rounded-lg"
          >
            Обновить
          </button>
        </div>
      </div>
    );
  }

  if (!pond) {
    return (
      <div className="min-h-screen bg-green-100 flex items-center justify-center">
        <div className="text-center">
          <div className="text-gray-400 text-6xl mb-4">🐟</div>
          <h3 className="text-xl font-semibold text-gray-700 mb-2">Пруд не найден</h3>
          <p className="text-gray-600 mb-4">
            Пруд, который вы ищете, не существует или был удален.
          </p>
          <button 
            onClick={() => navigate('/public-ponds')}
            className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg"
          >
            Вернуться к публичным прудам
          </button>
        </div>
      </div>
    );
  }

  return (
    <>
      <div className="min-h-screen bg-green-grass p-2 xs:p-4 lg:p-8 flex flex-col" style={{color: '#DAFFD5'}}>
        <div className="mx-auto w-full max-w-7xl flex-grow">
          {/* Шапка */}
          <header className="flex items-center justify-between mb-6 md:mb-8">
            {/* Левая часть: кнопка "Назад" */}
            <div className="flex-shrink-0">
              <button
                onClick={() => navigate('/public-ponds')}
                className="flex items-center justify-center w-12 h-12 md:w-14 md:h-14 bg-transparent-my bg-opacity-80 hover:bg-opacity-100 rounded-full transition-all duration-200 hover:scale-110 shadow-md"
                title="Вернуться к публичным прудам"
              >
                <svg 
                  xmlns="http://www.w3.org/2000/svg"
                  className="w-6 h-6 md:w-7 md:h-7 text-gray-700"
                  fill="none" 
                  viewBox="0 0 24 24" 
                  stroke="currentColor"
                >
                  <path 
                    strokeLinecap="round" 
                    strokeLinejoin="round" 
                    strokeWidth={2} 
                    d="M10 19l-7-7m0 0l7-7m-7 7h18" 
                  />
                </svg>
              </button>
            </div>

            {/* Центральная часть: заголовок */}
            <div className="flex-1 text-center px-4" style={{
                maxWidth: 'calc(100vw - 180px)',
                minWidth: 150
              }}>
              <h1 className="text-2xl xs:text-3xl sm:text-4xl lg:text-5xl font-bold text-black">{pond.name}</h1>
            </div>
            
            {/* Правая часть: кнопки аккаунта и информации */}
            <div className="flex items-center space-x-3 md:space-x-4">
              {user ? (
                <div className="relative" ref={dropdownRef}>
                  {isMobile ? (
                    <button		
                      className="flex items-center justify-center w-12 h-12 md:w-14 md:h-14 bg-transparent-my bg-opacity-80 hover:bg-opacity-100 rounded-full shadow-md transition-all duration-200 hover:scale-105 cursor-pointer"		
                      onClick={handleUserClick}		
                      title={`${user.login || user.username || user.email || 'Пользователь'}`}		
                    >		
                      <img 		
                        src={`${process.env.PUBLIC_URL}/assets/signed-in-small.png`} 		
                        alt="Нажмите для выхода"		
                        className="w-12 h-12 md:w-14 md:h-14"		
                      />		
                    </button>
                  ) : (
                    <button
                      className="flex items-center justify-center w-auto h-12 md:h-14 bg-transparent-my bg-opacity-80 hover:bg-opacity-100 rounded-full px-4 md:px-6 shadow-md transition-all duration-200 hover:scale-105 cursor-pointer"
                      onClick={handleUserClick}
                      title="Нажмите для выхода"
                    >
                      <span className="text-2xl font-semibold text-gray-800 truncate max-w-[200px]">
                        {user.login || user.username || user.email || 'Пользователь'}
                      </span>
                    </button>
                  )}
                  
                  {showLogoutDropdown && (
                    <div className="absolute right-0 mt-2 w-full min-w-[120px] bg-transparent-my rounded-lg shadow-xl z-50 overflow-hidden border border-gray-200">
                      <button
                        className="w-full px-4 py-3 text-left text-gray-800 hover:bg-gray-100 font-medium flex items-center transition-colors duration-150"
                        onClick={handleLogout}
                      >
                        <svg 
                          xmlns="http://www.w3.org/2000/svg" 
                          className="w-5 h-5 mr-3 opacity-70"
                          fill="none" 
                          viewBox="0 0 24 24" 
                          stroke="currentColor"
                        >
                          <path 
                            strokeLinecap="round" 
                            strokeLinejoin="round" 
                            strokeWidth={2} 
                            d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" 
                          />
                        </svg>
                        Выйти
                      </button>
                    </div>
                  )}
                </div>
              ) : (
                <button 
                  className="flex items-center justify-center w-35 h-14 bg-transparent-my bg-opacity-80 hover:bg-opacity-100 rounded-full transition-all duration-200 hover:scale-110 shadow-md"
                  onClick={() => setIsAuthModalOpen(true)}
                  title="Вход/Регистрация"
                >
                  <img 
                    src={
                      isMobile 
                        ? `${process.env.PUBLIC_URL}/assets/sign-in-small.png` 
                        : `${process.env.PUBLIC_URL}/assets/sign-in.png`
                    } 
                    alt="Вход/Регистрация"
                    className={isMobile ? "w-12 h-12" : "w-35 h-14"}
                  />
                </button>
              )}
              
              <button 
                className="flex items-center justify-center w-12 h-12 md:w-14 md:h-14 bg-transparent-my bg-opacity-80 hover:bg-opacity-100 rounded-full transition-all duration-200 hover:scale-110 shadow-md info-button"
                onClick={handleInfoClick}
                title="Информация"
                id="info-button"
              >
                <img 
                  src={`${process.env.PUBLIC_URL}/assets/info.png`} 
                  alt="Информация"
                  className="w-12 h-12 md:w-14 md:h-14 transition-transform duration-200 hover:rotate-12"
                />
              </button>
            </div>
          </header>

          {/* Карточка пруда */}
          <div className="bg-transparent-my bg-opacity-90 rounded-2xl shadow-xl mb-4 lg:mb-6">
            <div className="flex flex-col items-center md:flex-row bg-another-green rounded-2xl">
              {/* Часть с картинкой пруда */}
              <div className="md:w-1/3 rounded-2xl">
                <div className="relative h-full">
                  <img 
                    src={getPondImage(pond.id)} 
                    alt={pond.name}
                    className="w-full h-full min-h-[240px] max-h-[500px] object-cover rounded-xl"
                  />
                  <div 
                    className="absolute inset-0 flex flex-col items-center justify-center"
                    style={{
                      margin: '23%',
                      pointerEvents: 'none'
                    }}
                  >
                    <h3 
                      className="text-black text-2xl md:text-lg mdlg:text-xl lg:text-2xl font-bold text-center w-full mb-2 md:mb-0 lg:mb-2"
                      style={{
                        overflow: 'hidden',
                        textOverflow: 'ellipsis',
                        display: '-webkit-box',
                        WebkitLineClamp: 2,
                        WebkitBoxOrient: 'vertical',
                        lineHeight: '1.2',
                        maxHeight: '2.4em',
                        wordBreak: 'break-word'
                      }}
                      title={pond.name}
                    >
                      {pond.name}
                    </h3>
                    <div className="text-black text-base md:text-sm lg:text-base font-medium text-center w-full px-2 leading-tight">
                      {pond.cnt_fishes !== undefined ? (
                        <div className="flex flex-col items-center">
                          <span className="whitespace-nowrap">
                            {pond.cnt_fishes} {getFishWord(pond.cnt_fishes)}
                          </span>
                        </div>
                      ) : (
                        <span className="text-gray-500 text-sm">Информация о рыбах недоступна</span>
                      )}
                    </div>
                  </div>
                </div>
              </div>
              
              {/* Часть с информацией и кнопками */}
              <div className="md:w-2/3 flex flex-col px-5 xs:px-6 sm:px-8 md:px-0 md:pr-5 lg:pr-8 pt-4 pb-6">
                <div className="mb-3 xs:mb-6 md:mb-3 lg:mb-6">
                  {/* <h4 className="text-xl xs:text-2xl sm:text-4xl md:text-2xl lg:text-3xl xl:text-4xl font-bold text-black mb-3">{pond.name}</h4> */}
                  <div className="text-black leading-snug sm:leading-normal md:leading-snug lg:leading-normal text-base xs:text-lg sm:text-xl md:text-base lg:text-lg xl:text-xl text-left sm:text-justify"
                    dangerouslySetInnerHTML={{ __html: formatStringForDisplay(pond.description || 'Автор не добавил описание к этому пруду.') } }
                  />
                </div>
                
                {/* Информация о пруде */}
                <div className="mb-3 xs:mb-6 md:mb-3 lg:mb-6">
                  <div className="flex flex-col gap-2 rounded-xl">
                    <div className="flex items-center">
                      <span className="text-gray-800 font-medium mr-2 shrink-0">Автор:</span>
                      <span className="font-semibold text-gray-800 truncate">
                        {pond.user_login || pond.author?.username || 'Неизвестный Рыбак'}
                      </span>
                    </div>
                    
                    <div className="flex items-center">
                      <span className="text-gray-800 font-medium mr-2">Категория:</span>
                      <span className="font-semibold text-gray-800 truncate">
                        {pond.topic || 'Без категории'}
                      </span>
                    </div>
                    
                    <div className="flex items-center">
                      <span className="text-gray-800 font-medium mr-2">Скопирован:</span>
                      <span className="font-semibold text-gray-800">
                        {pond.cnt_copied || 0} раз
                      </span>
                    </div>
                    
                    {/* <div className="flex items-center">
                      <span className="text-gray-800 font-medium mr-2">Просмотров:</span>
                      <span className="font-semibold text-gray-800">
                        {pond.views_count || 0}
                      </span>
                    </div> */}
                    
                    <div className="flex items-center">
                      <span className="text-gray-800 font-medium mr-2">Создан:</span>
                      <span className="font-semibold text-gray-800">
                        {pond.created_at ? formatDate(pond.created_at) : 'Неизвестно'}
                      </span>
                    </div>
                    
                    <div className="flex items-center">
                      <span className="text-gray-800 font-medium mr-2">Последнее обновление:</span>
                      <span className="font-semibold text-gray-800">
                        {pond.updated_at ? formatDate(pond.updated_at) : 'Неизвестно'}
                      </span>
                    </div>
                    
                    {/* {pond.is_updatable && (
                      <div className="flex items-center">
                        <span className="text-gray-800 font-medium mr-2">Обновления:</span>
                        <span className="text-green-600 font-medium">✓ Доступны</span>
                      </div>
                    )} */}
                  </div>
                </div>
                
                {/* Кнопки копирования пруда */}
                <div className="flex flex-col sm:flex-row gap-3 md:gap-4">
                  <button
                    onClick={() => handleCopyPond(true)}
                    disabled={loading}
                    className="bg-sea-blue min-h-12 sm:min-h-14 leading-tight rounded-xl flex-1 text-white font-semibold py-1 px-2 transition-all duration-200 hover:scale-[1.02] active:scale-[0.98] flex items-center justify-center gap-2 disabled:opacity-70 disabled:cursor-not-allowed"
                  >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                    </svg>
                    Скопировать
                  </button>
                  
                  <button
                    onClick={() => handleCopyPond(false)}
                    disabled={loading}
                    className="bg-sea-blue min-h-12 sm:min-h-14 leading-tight rounded-xl flex-1 text-white font-semibold py-1 px-2 transition-all duration-200 hover:scale-[1.02] active:scale-[0.98] flex items-center justify-center gap-2 disabled:opacity-70 disabled:cursor-not-allowed"
                  >
                    {/* <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} 
                            d="M8 5H6a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2v-1M8 5a2 2 0 002 2h2a2 2 0 002-2M8 5a2 2 0 012-2h2a2 2 0 012 2m0 0h2a2 2 0 012 2v3m2 4H10m0 0l3-3m-3 3l3 3" 
                      />
                    </svg> */}
                    Скопировать без отслеживания обновлений
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Секция с рыбами */}
          <div className="bg-transparent-my bg-opacity-90 rounded-2xl shadow-xl p-2 lg:p-0 xl:p-4">
            <h2 className="text-xl xs:text-2xl lg:text-3xl font-bold text-black mb-4 text-center">
              Рыбы в пруду ({pond.fishes.length})
            </h2>
            
            {pond.fishes.length === 0 ? (
              <div className="text-center py-8">
                <div className="text-gray-400 text-6xl mb-4">🐟</div>
                <h3 className="text-xl font-semibold text-gray-700 mb-2">В этом пруду пока нет рыб</h3>
                <p className="text-gray-600">
                  Автор еще не добавил рыбу в этот пруд
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 lg:gap-6">
                {pond.fishes.map((fish, index) => (
                  <div
                    key={fish.id}
                    className="bg-another-green rounded-xl p-2 sm:p-4 2xl:p-6 shadow-lg transition-all duration-300 hover:shadow-xl"
                  >
                    <div className="flex items-start gap-4">
                      <div className="flex-shrink-0 flex items-center justify-center w-10 h-10 xs:w-12 xs:h-12 rounded-full bg-sea-blue text-white font-bold text-lg xs:text-xl">
                        {index + 1}
                      </div>
                      
                      <div className="flex-1">
                        <div className="mb-2">
                          <h4 className="text-base sm:text-lg font-semibold text-black mb-0 ">
                            Вопрос:
                          </h4>
                          <div className="text-gray-800 text-base sm:text-lg"
                            dangerouslySetInnerHTML={{ __html: formatStringForDisplay(fish.question) }}
                          />
                        </div>
                        
                        <div>
                          <h4 className="text-base sm:text-lg font-semibold text-black mb-0">
                            Ответ:
                          </h4>
                          <div className="text-gray-800 text-base sm:text-lg"
                            dangerouslySetInnerHTML={{ __html: formatStringForDisplay(fish.answer) }}
                          />
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
                {/* {pond.fishes.map((fish, index) => (
                  <div 
                    key={fish.id}
                    className="bg-another-green rounded-xl p-2 sm:p-4 xl:p-6 shadow-lg transition-all duration-300 hover:shadow-xl"
                  >
                    <div className="flex items-start gap-4">
                      <div className="flex-shrink-0 flex items-center justify-center w-10 h-10 xs:w-12 xs:h-12 rounded-full bg-sea-blue text-white font-bold text-lg xs:text-xl lg:w-14 lg:h-14 lg:text-2xl">
                        {index + 1}
                      </div>
                      
                      <div className="flex-1 grid grid-cols-1 lg:grid-cols-2 lg:gap-8">
                        <div className="lg:col-span-1 mb-2">
                          <h4 className="text-base sm:text-lg font-semibold text-black mb-0">
                            Вопрос:
                          </h4>
                          <p className="text-gray-800 text-base sm:text-lg">
                            {fish.question}
                          </p>
                        </div>
                        
                        <div className="lg:col-span-1">
                          <h4 className="text-base sm:text-lg font-semibold text-black mb-0">
                            Ответ:
                          </h4>
                          <p className="text-gray-800 text-base sm:text-lg">
                            {fish.answer}
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                ))} */}
              </div>
            )}
          </div>
        </div>

        {/* Футер с кнопкой обратной связи */}
        <div className="mt-8 md:mt-12 pt-4 md:pt-6 border-t border-green-800 border-opacity-30">
          <div className="flex justify-center">
            <button
              onClick={handleFeedbackClick}
              className="flex items-center justify-center bg-transparent-my bg-opacity-90 hover:bg-opacity-100 text-gray-800 font-semibold py-3 px-6 rounded-full shadow-lg transition-all duration-200 hover:scale-105 hover:shadow-xl"
            >
              <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" />
              </svg>
              <span className="text-lg">Обратная связь</span>
            </button>
          </div>
          <p className="text-center text-gray-700 mt-2 text-sm md:text-base">
            Напишите нам, если у вас есть предложения или вы нашли ошибку
          </p>
        </div>
      </div>

      {/* Модальные окна */}
      <AuthModal
        isOpen={isAuthModalOpen}
        onClose={() => setIsAuthModalOpen(false)}
        onLogin={handleLogin}
        onRegister={handleRegister}
        onSuccess={handleAuthSuccess}
      />

      <InfoModal
        isOpen={isInfoModalOpen}
        onClose={() => setIsInfoModalOpen(false)}
        infoItems={infoData}
        triggerPosition={infoButtonPosition}
        isWelcome={false}
      />

      <FeedbackModal
        isOpen={isFeedbackModalOpen}
        onClose={() => setIsFeedbackModalOpen(false)}
        onSubmit={handleFeedbackSubmit}
      />
    </>
  );
}