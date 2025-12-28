// src/pages/PondsList.jsx
import React, { useEffect, useState, useRef } from 'react';
import { Link } from 'react-router-dom';
import { pondService } from '../services/pondService';
import { authService } from '../services/authService';
import PondTypeSelectionModal from '../components/PondTypeSelectionModal'
import EditPondModal from '../components/EditPondModal';
import AuthModal from '../components/AuthModal';
import InfoModal from '../components/InfoModal';
import FeedbackModal from '../components/FeedbackModal';
import SharePondModal from '../components/SharePondModal'; // Добавлен импорт
import '../index.css';

export default function PondsList() {
  const [ponds, setPonds] = useState([]);
  const [loading, setLoading] = useState(true);
  const [userInitialized, setUserInitialized] = useState(false);
  const [error, setError] = useState(null);
  const [isTypeSelectionModalOpen, setIsTypeSelectionModalOpen] = useState(false);
  const [editingPond, setEditingPond] = useState(null);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [isInfoModalOpen, setIsInfoModalOpen] = useState(false);
  const [isFeedbackModalOpen, setIsFeedbackModalOpen] = useState(false);
  const [isSharePondModalOpen, setIsSharePondModalOpen] = useState(false); // Добавлено состояние
  const [selectedPondForSharing, setSelectedPondForSharing] = useState(null); // Добавлено состояние
  const [user, setUser] = useState(null);
  const [showLogoutDropdown, setShowLogoutDropdown] = useState(false);
  const [isFirstVisit, setIsFirstVisit] = useState(true);
  
  const [infoButtonPosition, setInfoButtonPosition] = useState(null);
  const dropdownRef = useRef(null);
  
  // Добавлено: состояние для отслеживания ширины экрана
  const [isMobile, setIsMobile] = useState(window.innerWidth < 710);

  const infoData = [
    {
      title: "Добро пожаловать!",
      text: "\\tДобро пожаловать в Knowledge Fishing.\\n\\tНаш проект поможет тебе запоминать любую информацию с помощью интервальных повторений.\\n\\tНо при чем же тут рыбалка?"
    },
    {
      title: "Пруды",
      text: "\\tПруды нужны для организации информациии - все данные на определенную тему можно сложить в один пруд.\\n\\tПри создании пруда нужно указать его название, а также есть возможность изменить интервалы повторения (подробнее о них позже).\\n\\tЧтобы изменить данные пруда или удалить его, нажмите на значок шестеренки возле него."
    },
    {
      title: "Рыбы",
      text: "\\tРыба - это как раз те данные, которые ты хочешь запомнить. Рекомендуется сохранять сведения в формате вопроса и ответа.\\n\\tСоздать рыб можно внутри конкретного пруда двумя способами - добавить одну рыбу или сразу несколько. Во втором случае очень удобно использовать ИИ, его можно скопировать в нижней части окна создания нескольких рыб. Главное - не забыть заменить ключевые слова, задающие тему вашего пруда.\\n\\tПосле создания рыба будет помещена в самый верхний слой пруда - там обычно живут мальки."
    },
    {
      title: "Интервалы повторения",
      text: "\\tСразу после добавления в пруд рыба будет серого цвета - это означает, что она еще не готова к повторению и поймать ее пока нельзя, потому что прошло недостаточно времени.\\n\\tЗа время, которое должно пройти, чтобы рыба стала готовой (и обрела цвет) отвечают интервалы повторения. Первый интервал - за время подготовки на верхнем уровне, вторый интервал - на втором сверху уровне и т д\\n\\tИсходно установлены периоды времени - час, день, неделя и месяц. Их можно изменить в настройках пруда."
    },
    {
      title: "Рыбалка",
      text: "\\tГотовую рыбу можно поймать и повторить данные, за которые она отвечает. После нажатия на кнопку \"Начать рыбалку\" будет выбрана случайная готовая рыба и ты увидишь ее вопрос. А вот ответ будет скрыт, чтобы ты мог его вспомнить самостоятельно.\\n\\tПосле проверки ответа ты можешь выбрать, на какой уровень поместить рыба. Базовый сценарий - опустить рыбу на слеюдущий уровень, но если ты понимаешь, что плохо вспомнил ответ, то можешь оставить ее на том же уровне или даже увеличить уровень - так она встретится быстрее"
    },
    {
      title: "Авторизация",
      text: "\\tЧтобы не потерять свои данные, а также иметь доступ из всех браузеров и устройств, зарегистрируйтесь или войдите в аккаунт.\\n\\tНа этом все, ни хвоста, ни чешуи!"
    }
  ];

  // Добавлено: обработчик изменения размера окна
  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth < 710);
    };

    // Устанавливаем начальное значение
    handleResize();

    // Добавляем слушатель события
    window.addEventListener('resize', handleResize);

    // Убираем слушатель при размонтировании
    return () => {
      window.removeEventListener('resize', handleResize);
    };
  }, []);

  // Закрытие выпадающего меню при клике вне его
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setShowLogoutDropdown(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  // Проверка, был ли пользователь на сайте ранее
  useEffect(() => {
    const checkFirstVisit = () => {
      const hasSeenWelcomeModal = localStorage.getItem('hasSeenWelcomeModal');
      if (hasSeenWelcomeModal === 'true') {
        setIsFirstVisit(false);
        console.log('User has visited before, welcome modal will not show');
      } else {
        console.log('First-time user detected, welcome modal will show');
      }
    };
    
    checkFirstVisit();
  }, []);

  // Восстановление состояния пользователя из localStorage при монтировании
  useEffect(() => {
    const restoreUserFromStorage = () => {
      try {
        const savedUser = localStorage.getItem('currentUser');
        if (savedUser) {
          const parsedUser = JSON.parse(savedUser);
          setUser(parsedUser);
          console.log('User restored from localStorage:', parsedUser);
        }
      } catch (error) {
        console.error('Error restoring user from localStorage:', error);
      }
    };

    restoreUserFromStorage();
  }, []);

  // Эффект для автоматического открытия InfoModal при первом входе
  useEffect(() => {
    if (isFirstVisit && !loading && !isInfoModalOpen) {
      console.log('Opening welcome modal for first-time user:', user?.username || user?.login);
      
      // Получаем позицию кнопки info для правильного позиционирования
      const infoButton = document.getElementById('info-button');
      if (infoButton) {
        const buttonRect = infoButton.getBoundingClientRect();
        setInfoButtonPosition(buttonRect);
      } else {
        // Если кнопка не найдена, используем позицию по умолчанию
        setInfoButtonPosition({
          top: 100,
          right: 100,
          width: 56,
          height: 56
        });
      }
      
      // Открываем модальное окно с небольшой задержкой для лучшего UX
      setTimeout(() => {
        setIsInfoModalOpen(true);
        console.log('Welcome modal opened');
      }, 800); // Увеличенная задержка для лучшего восприятия
    }
  }, [user, isFirstVisit, loading, isInfoModalOpen]);

  useEffect(() => {
    console.log('PondsList component mounted - useEffect triggered');
    
    const initializeApp = async () => {
      try {
        console.log('Step 1: Starting user initialization...');
        
        // Восстанавливаем пользователя через сервис
        const userData = await authService.initializeUser();
        console.log('User initialized from service:', userData);
        
        // Если сервис вернул пользователя, обновляем состояние
        if (userData) {
          setUser(userData);
          // Сохраняем в localStorage для persistence
          localStorage.setItem('currentUser', JSON.stringify(userData));
        } else {
          // Если сервис не вернул пользователя, но он есть в localStorage
          // (это fallback на случай если сервис работает некорректно)
          const savedUser = localStorage.getItem('currentUser');
          if (savedUser && !user) {
            const parsedUser = JSON.parse(savedUser);
            setUser(parsedUser);
            console.log('User restored from localStorage as fallback:', parsedUser);
          }
        }
        
        setUserInitialized(true);
        
        console.log('Step 2: Loading ponds after user initialization...');
        const pondsData = await pondService.getAllPonds();
        console.log('Ponds loaded:', pondsData);
        setPonds(pondsData);
        
      } catch (error) {
        console.error('Initialization error:', error);
        setError('Не удалось загрузить приложение: ' + error.message);
      } finally {
        console.log('Initialization process completed');
        setLoading(false);
      }
    };

    initializeApp();
  }, []);

  // Сохраняем пользователя в localStorage при изменении
  useEffect(() => {
    if (user) {
      localStorage.setItem('currentUser', JSON.stringify(user));
    } else {
      localStorage.removeItem('currentUser');
    }
  }, [user]);

  const handleCreatePond = async (pondData) => {
    try {
      console.log('Creating pond with data:', pondData);
      const newPond = await pondService.createPond(pondData);
      
      setPonds(prev => [...prev, newPond]);
      console.log('Pond created and added to list:', newPond);
      
      return newPond;
    } catch (error) {
      console.error('Error in handleCreatePond:', error);
      throw error;
    }
  };

  const handleAddPondByLink = async (pondId, withUpdates) => {
    console.log(pondId, withUpdates);
    try {
      const newPond = await pondService.copyPondById(pondId, withUpdates);
      
      setPonds(prev => [...prev, newPond]);
      console.log('Pond created and added to list:', newPond);
      
      return newPond;
    } catch (error) {
      console.error('Ошибка добавления пруда:', error);
    }
  };

  const handleEditPond = async (pondData) => {
    try {
      console.log('Editing pond with data:', pondData);
      const updatedPond = await pondService.updatePond(editingPond.id, pondData);
      
      setPonds(prev => prev.map(pond => 
        pond.id === editingPond.id ? updatedPond : pond
      ));
      console.log('Pond updated:', updatedPond);
      
      setEditingPond(null);
      return updatedPond;
    } catch (error) {
      console.error('Error in handleEditPond:', error);
      throw error;
    }
  };

  const handleDeletePond = async (pondId) => {
    try {
      console.log('Deleting pond:', pondId);
      await pondService.deletePond(pondId);
      
      setPonds(prev => prev.filter(pond => pond.id !== pondId));
      console.log('Pond deleted successfully');
      
      setEditingPond(null);
    } catch (error) {
      console.error('Error in handleDeletePond:', error);
      throw error;
    }
  };

  // Добавлено: обработчик открытия модального окна "Поделиться"
  const handleShareClick = (e, pond) => {
    e.preventDefault();
    e.stopPropagation();
    setSelectedPondForSharing(pond);
    setIsSharePondModalOpen(true);
  };

  // Добавлено: обработчик закрытия модального окна "Поделиться"
  const handleShareClose = () => {
    setIsSharePondModalOpen(false);
    setSelectedPondForSharing(null);
  };

  const handleLogin = async (loginData) => {
    try {
      console.log('Login attempt with data:', loginData);
      const result = await authService.login(loginData);
      console.log('Login successful:', result);
      
      if (result) {
        // Убедимся, что сохраняем правильную структуру
        const userData = {
          id: result.id || result.userId,
          login: result.login || result.username,
          username: result.username || result.login,
          email: result.email,
          token: result.token, // если есть токен
          // другие поля по необходимости
        };
        
        setUser(userData);
        localStorage.setItem('currentUser', JSON.stringify(userData));
        
        // Проверяем, нужно ли показать приветственное окно для нового пользователя
        const hasSeenWelcomeModal = localStorage.getItem('hasSeenWelcomeModal');
        if (!hasSeenWelcomeModal) {
          setIsFirstVisit(true);
        }
      }
      
      const pondsData = await pondService.getAllPonds();
      setPonds(pondsData);
      
      return result;
      
    } catch (error) {
      console.error('Login error:', error);
      throw error;
    }
  };

  const handleRegister = async (registerData) => {
    try {
      console.log('Registration attempt with data:', registerData);
      const result = await authService.register(registerData);
      console.log('Registration successful:', result);
      
      // После регистрации обычно происходит автоматический вход
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
        
        // Для новых зарегистрированных пользователей показываем приветственное окно
        setIsFirstVisit(true);
        localStorage.removeItem('hasSeenWelcomeModal'); // Сбрасываем флаг для нового пользователя
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

  const handleAuthSuccess = () => {
    setIsAuthModalOpen(false);
    console.log('Authentication successful');
  };

  const handleLogout = async () => {
    try {
      await authService.logout();
      setUser(null);
      localStorage.removeItem('currentUser'); // Удаляем из localStorage
      setShowLogoutDropdown(false);

      document.cookie = "access_token=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;";
      
      // const pondsData = await pondService.getAllPonds();
      setPonds([]);
      
      console.log('Logout successful');
    } catch (error) {
      console.error('Logout error:', error);
    }
  };

  const handleUserClick = () => {
    setShowLogoutDropdown(!showLogoutDropdown);
  };

  const handleFeedbackSubmit = (feedbackData) => {
    console.log('Feedback submitted:', feedbackData);
    alert('Спасибо за ваше сообщение! Мы рассмотрим его в ближайшее время.');
    setIsFeedbackModalOpen(false);
  };

  const handleSettingsClick = (e, pond) => {
    e.preventDefault();
    e.stopPropagation();
    setEditingPond(pond);
  };

  const handleInfoClick = (event) => {
    console.log('Открытие модального окна информации');
    
    const buttonRect = event.currentTarget.getBoundingClientRect();
    setInfoButtonPosition(buttonRect);
    
    setTimeout(() => {
      setIsInfoModalOpen(true);
    }, 10);
  };

  const handleInfoClose = () => {
    setIsInfoModalOpen(false);
    
    // При закрытии модального окна (вручную или автоматически)
    // помечаем, что пользователь уже видел его
    if (isFirstVisit) {
      console.log('First visit completed, marking welcome modal as seen');
      localStorage.setItem('hasSeenWelcomeModal', 'true');
      setIsFirstVisit(false);
    }
  };

  const handleFeedbackClick = () => {
    console.log('Открытие модального окна обратной связи');
    setIsFeedbackModalOpen(true);
  };

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

  const getPondImage = (pondId) => {
    const index = parseInt(pondId[0], 16) % pondImages.length;
    return `${process.env.PUBLIC_URL}/assets/${pondImages[index]}`;
  };

  const getFishWord = (count) => {
    if (count === 1) return 'рыба';
    if (count >= 2 && count <= 4) return 'рыбы';
    return 'рыб';
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-green-100 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Инициализация пользователя и загрузка прудов...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-green-100 flex items-center justify-center">
        <div className="text-center">
          <div className="text-red-500 text-4xl mb-4">⚠️</div>
          <h2 className="text-xl font-semibold text-gray-800 mb-2">Ошибка загрузки</h2>
          <p className="text-gray-600 mb-4">{error}</p>
          <button 
            onClick={() => window.location.reload()}
            className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg"
          >
            Обновить страницу
          </button>
        </div>
      </div>
    );
  }

  return (
    <>
      <div className="min-h-screen bg-green-grass p-8 flex flex-col" style={{color: '#00a028ff'}}>
        <div className="mx-auto flex-grow">
          <header className="flex justify-between items-center mb-8">
            <div style={{
                width: 'fit-content',
                maxWidth: 'calc(100vw - 200px)',
                minWidth: 150 // важно для корректной работы flex-shrink
              }}>
              <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold text-black">Где будем рыбачить?</h1>
            </div>
            
            <div className="flex items-center space-x-4">
              {user ? (
                <div className="relative" ref={dropdownRef}>
                  {isMobile ? (
                    // На мобильных устройствах показываем иконку вместо текста
                    <button
                      className="flex items-center justify-center w-14 h-14 bg-white bg-opacity-80 hover:bg-opacity-100 rounded-full shadow-md transition-all duration-200 hover:scale-105 cursor-pointer"
                      onClick={handleUserClick}
                      title={`${user.login || user.username || user.email || 'Пользователь'}`}
                    >
                      <img 
                        src={
                          `${process.env.PUBLIC_URL}/assets/signed-in-small.png`
                        } 
                        alt="Нажмите для выхода"
                        className={isMobile ? "w-14 h-14" : "w-35 h-14"}
                      />
                    </button>
                  ) : (
                    // На десктопах показываем полную версию с текстом
                    <button
                      className="flex items-center justify-center w-auto h-14 bg-white bg-opacity-80 hover:bg-opacity-100 rounded-full px-6 shadow-md transition-all duration-200 hover:scale-105 cursor-pointer"
                      onClick={handleUserClick}
                      title="Нажмите для выхода"
                    >
                      <span className="text-2xl font-semibold text-gray-800 truncate max-w-[200px]">
                        {user.login || user.username || user.email || 'Пользователь'}
                      </span>
                    </button>
                  )}
                  
                  {showLogoutDropdown && (
                    <div className="absolute right-0 mt-2 w-full min-w-[120px] bg-white rounded-lg shadow-xl z-50 overflow-hidden border border-gray-200">
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
                  className="flex items-center justify-center w-35 h-14 bg-white bg-opacity-80 hover:bg-opacity-100 rounded-full transition-all duration-200 hover:scale-110 shadow-md"
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
                    className={isMobile ? "w-14 h-14" : "w-35 h-14"}
                  />
                </button>
              )}
              
              <button 
                className="flex items-center justify-center w-14 h-14 bg-white bg-opacity-80 hover:bg-opacity-100 rounded-full transition-all duration-200 hover:scale-110 shadow-md info-button"
                onClick={handleInfoClick}
                title="Информация о проекте"
                id="info-button"
              >
                <img 
                  src={`${process.env.PUBLIC_URL}/assets/info.png`} 
                  alt="Информация о проекте"
                  className="w-14 h-14 transition-transform duration-200 hover:rotate-12"
                />
              </button>
            </div>
          </header>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 2xl:grid-cols-4 gap-4">
            {ponds.map((pond) => (
              <div key={pond.id} className="relative">
                <Link to={`/pond/${pond.id}`} className="block group">
                  <img 
                    src={getPondImage(pond.id)} 
                    alt={pond.name}
                    className="w-full h-auto transition-transform group-hover:scale-105"
                  />
                  <div 
                    className="absolute inset-0 flex flex-col items-center justify-center"
                    style={{
                      margin: '23%',
                      pointerEvents: 'none'
                    }}
                  >
                    <h3 
                      className="text-black text-2xl font-bold text-center w-full mb-2"
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
                    <div className="text-black text-base font-medium text-center w-full px-2 leading-tight">
                      {pond.cnt_ready_fishes !== undefined && pond.cnt_fishes !== undefined ? (
                        <div className="flex flex-col items-center">
                          <span className="whitespace-nowrap">
                            {pond.cnt_ready_fishes} {getFishWord(pond.cnt_ready_fishes)} из {pond.cnt_fishes}
                          </span>
                          <span>уже проголодались</span>
                        </div>
                      ) : (
                        <span className="text-gray-500 text-sm">Информация о рыбах недоступна</span>
                      )}
                    </div>
                  </div>
                </Link>

                {/* Контейнер для кнопок в правом верхнем углу */}
                <div className="absolute top-4 right-4 flex flex-col gap-2" style={{ pointerEvents: 'auto' }}>
                  {/* Кнопка настроек */}
                  <button
                    onClick={(e) => handleSettingsClick(e, pond)}
                    className="bg-white bg-opacity-80 hover:bg-opacity-100 rounded-full p-1 transition-all duration-200 hover:scale-110 shadow-md settings-button"
                    title="Настройки пруда"
                  >
                    <img 
                      src={`${process.env.PUBLIC_URL}/assets/settings-border.png`} 
                      alt="Настройки пруда"
                      className="w-6 h-6"
                    />
                  </button>
                  
                  {/* Кнопка поделиться */}
                  <button
                    onClick={(e) => handleShareClick(e, pond)}
                    className="bg-white bg-opacity-80 hover:bg-opacity-100 rounded-full p-1 transition-all duration-200 hover:scale-110 shadow-md share-button"
                    title="Поделиться прудом"
                  >
                    {/* SVG иконка "Поделиться" */}
                    <svg 
                      xmlns="http://www.w3.org/2000/svg" 
                      className="w-6 h-6 text-black"
                      fill="none" 
                      viewBox="0 0 24 24" 
                      stroke="currentColor"
                      strokeWidth={2}
                    >
                      <path 
                        strokeLinecap="round" 
                        strokeLinejoin="round" 
                        d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z" 
                      />
                    </svg>
                  </button>
                </div>
              </div>
            ))}
            
            <button 
              onClick={() => setIsTypeSelectionModalOpen(true)}
              className="block relative focus:outline-none group"
            >
              <img 
                src={`${process.env.PUBLIC_URL}/assets/pond_add.png`} 
                alt="Создать новый пруд"
                className="w-full h-auto transition-transform group-hover:scale-105"
              />
            </button>
          </div>
        </div>

        <div className="mt-8 pt-2 border-t border-green-800 border-opacity-30">
          <div className="flex justify-center">
            <button
              onClick={handleFeedbackClick}
              className="flex items-center justify-center bg-white bg-opacity-90 hover:bg-opacity-100 text-gray-800 font-semibold py-3 px-6 rounded-full shadow-lg transition-all duration-200 hover:scale-105 hover:shadow-xl"
            >
              <span className="text-lg">Обратная связь</span>
            </button>
          </div>
          <p className="text-center text-gray-700 mt-0 text-sm">
            Напиши нам, если у тебя есть предложения по улучшению сервиса или случилась какая-то ошибка
          </p>
        </div>
      </div>

      <PondTypeSelectionModal
        isOpen={isTypeSelectionModalOpen}
        onClose={() => setIsTypeSelectionModalOpen(false)}
        onCreate={handleCreatePond}
        onAddByLink={handleAddPondByLink}
      />

      <EditPondModal
        isOpen={!!editingPond}
        onClose={() => setEditingPond(null)}
        onSave={handleEditPond}
        onDelete={handleDeletePond}
        pond={editingPond}
      />

      <AuthModal
        isOpen={isAuthModalOpen}
        onClose={() => setIsAuthModalOpen(false)}
        onLogin={handleLogin}
        onRegister={handleRegister}
        onSuccess={handleAuthSuccess}
      />

      <InfoModal
        isOpen={isInfoModalOpen}
        onClose={handleInfoClose}
        infoItems={infoData}
        triggerPosition={infoButtonPosition}
        isWelcome={isFirstVisit}
      />

      <FeedbackModal
        isOpen={isFeedbackModalOpen}
        onClose={() => setIsFeedbackModalOpen(false)}
        onSubmit={handleFeedbackSubmit}
      />

      {/* Модальное окно "Поделиться" */}
      <SharePondModal
        isOpen={isSharePondModalOpen}
        onClose={handleShareClose}
        pond={selectedPondForSharing}
      />
    </>
  );
}