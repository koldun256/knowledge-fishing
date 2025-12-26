// src/pages/PublicPondsPage.jsx
import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { authService } from '../services/authService';
import { pondService } from '../services/pondService';
import AuthModal from '../components/AuthModal';
import InfoModal from '../components/InfoModal';
import FeedbackModal from '../components/FeedbackModal';
import '../index.css';

export default function PublicPondsPage() {
  const navigate = useNavigate();
  const [ponds, setPonds] = useState([]);
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState(null);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [categories, setCategories] = useState([]);
  
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [isInfoModalOpen, setIsInfoModalOpen] = useState(false);
  const [isFeedbackModalOpen, setIsFeedbackModalOpen] = useState(false);
  const [showLogoutDropdown, setShowLogoutDropdown] = useState(false);
  
  const [infoButtonPosition, setInfoButtonPosition] = useState(null);
  const [isMobile, setIsMobile] = useState(window.innerWidth < 710);
  
  const dropdownRef = useRef(null);

  const infoData = [
    {
      title: "Публичные пруды",
      text: "\\tЗдесь вы можете найти интересные пруды, созданные другими пользователями.\\n\\tКаждый публичный пруд можно скопировать к себе и изучать информацию, которую добавил его создатель."
    },
    {
      title: "Как использовать",
      text: "\\t1. Найдите интересный пруд через поиск или категории\\n\\t2. Нажмите \"Скопировать\" - пруд добавится в вашу коллекцию\\n\\t3. Если выбрали \"Скопировать с обновлением\", вы будете получать новые карточки, которые добавит автор"
    },
    {
      title: "Виды копирования",
      text: "\\t• СКОПИРОВАТЬ - получите текущую версию пруда\\n\\t• СКОПИРОВАТЬ С ОБНОВЛЕНИЕМ - будете получать новые карточки, которые добавит автор\\n\\t• Для работы с обновлениями требуется авторизация"
    }
  ];

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

  // Загрузка публичных прудов
  useEffect(() => {
    const loadPublicPonds = async () => {
      try {
        setLoading(true);
        // Загрузка публичных прудов с сервера
        const response = await pondService.getPublicPonds();
        
        // Теперь response содержит объекты с полями pond и user_login
        const pondsData = response.map(item => ({
          ...item.pond,  // Копируем все поля из pond
          user_login: item.user_login,  // Добавляем логин пользователя
          // Добавляем поле author для совместимости со старым кодом
          author: { username: item.user_login }
        }));
        setPonds(pondsData);
        
        // Извлечение уникальных категорий
        const uniqueCategories = [...new Set(pondsData.map(p => p.topic).filter(Boolean))];
        setCategories(uniqueCategories);
        
      } catch (error) {
        console.error('Error loading public ponds:', error);
        setError('Не удалось загрузить публичные пруды');
        
        // Демо-данные для тестирования
        const demoPonds = [
          {
            id: 1,
            name: 'Программирование на Python',
            description: 'Основы Python, ООП, веб-разработка на Django и Flask. Идеально подходит для начинающих программистов.Основы Python, ООП, веб-разработка на Django и Flask. Идеально подходит для начинающих программистов.Основы Python, ООП, веб-разработка на Django и Flask. Идеально подходит для начинающих программистов.Основы Python, ООП, веб-разработка на Django и Flask. Идеально подходит для начинающих программистов.Основы Python, ООП, веб-разработка на Django и Flask. Идеально подходит для начинающих программистов.Основы Python, ООП, веб-разработка на Django и Flask. Идеально подходит для начинающих программистов.Основы Python, ООП, веб-разработка на Django и Flask. Идеально подходит для начинающих программистов.Основы Python, ООП, веб-разработка на Django и Flask. Идеально подходит для начинающих программистов.Основы Python, ООП, веб-разработка на Django и Flask. Идеально подходит для начинающих программистов.Основы Python, ООП, веб-разработка на Django и Flask. Идеально подходит для начинающих программистов.Основы Python, ООП, веб-разработка на Django и Flask. Идеально подходит для начинающих программистов.Основы Python, ООП, веб-разработка на Django и Flask. Идеально подходит для начинающих программистов.Основы Python, ООП, веб-разработка на Django и Flask. Идеально подходит для начинающих программистов.Основы Python, ООП, веб-разработка на Django и Flask. Идеально подходит для начинающих программистов.',
            topic: 'programming',
            author: { username: 'Иван Иванов' },
            cnt_fishes: 150,
            cnt_ready_fishes: 45,
            is_updatable: true,
            updated_at: '2024-01-15',
            views_count: 1234,
            created_at: '2023-12-01'
          },
          {
            id: 2,
            name: 'История искусств',
            description: 'От наскальной живописи до современного искусства. Все основные периоды и стили.',
            topic: 'art',
            author: { username: 'Анна Петрова' },
            cnt_fishes: 89,
            cnt_ready_fishes: 23,
            is_updatable: false,
            updated_at: '2024-01-10',
            views_count: 890,
            created_at: '2023-11-20'
          },
          {
            id: 3,
            name: 'Английские идиомы и фразовые глаголы',
            description: 'Популярные идиомы, фразовые глаголы и устойчивые выражения для повседневного общения.',
            topic: 'languages',
            author: { username: 'John Smith' },
            cnt_fishes: 210,
            cnt_ready_fishes: 67,
            is_updatable: true,
            updated_at: '2024-01-20',
            views_count: 1567,
            created_at: '2023-12-15'
          },
          {
            id: 4,
            name: 'Медицинские термины на латыни',
            description: 'Основные медицинские термины, анатомия, фармакология. Для студентов медицинских вузов.',
            topic: 'medicine',
            author: { username: 'Доктор Сидоров' },
            cnt_fishes: 300,
            cnt_ready_fishes: 120,
            is_updatable: true,
            updated_at: '2024-01-18',
            views_count: 2100,
            created_at: '2023-11-01'
          },
          {
            id: 5,
            name: 'Финансовая грамотность',
            description: 'Инвестиции, бюджетирование, налоги и личные финансы. Основы финансовой независимости.',
            topic: 'finance',
            author: { username: 'Алексей Финансов' },
            cnt_fishes: 120,
            cnt_ready_fishes: 35,
            is_updatable: false,
            updated_at: '2024-01-05',
            views_count: 745,
            created_at: '2023-12-10'
          },
          {
            id: 6,
            name: 'Квантовая физика для начинающих',
            description: 'Основы квантовой механики, теория относительности. Сложные концепции простым языком.',
            topic: 'science',
            author: { username: 'Профессор Квантов' },
            cnt_fishes: 180,
            cnt_ready_fishes: 42,
            is_updatable: true,
            updated_at: '2024-01-22',
            views_count: 1345,
            created_at: '2023-12-25'
          }
        ];
        
        setPonds(demoPonds);
        const demoCategories = [...new Set(demoPonds.map(p => p.topic).filter(Boolean))];
        setCategories(demoCategories);
        
      } finally {
        setLoading(false);
      }
    };

    loadPublicPonds();
  }, []);

  // Сохранение пользователя в localStorage
  useEffect(() => {
    if (user) {
      localStorage.setItem('currentUser', JSON.stringify(user));
    } else {
      localStorage.removeItem('currentUser');
    }
  }, [user]);

  const getPondImage = (pondId) => {
    const index = parseInt(pondId[0], 16) % pondImages.length;
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

  const handleCopyPond = async (pondId, withUpdates = false) => {
    if (!user) {
      setIsAuthModalOpen(true);
      return;
    }

    try {
      setLoading(true);
      await pondService.copyPond(pondId, withUpdates);
      alert(`Пруд успешно скопирован ${withUpdates ? 'с обновлениями' : ''}!`);
      navigate('/'); // Возвращаемся на главную
    } catch (error) {
      console.error('Error copying pond:', error);
      alert('Не удалось скопировать пруд');
    } finally {
      setLoading(false);
    }
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
        
        // // Проверяем, нужно ли показать приветственное окно для нового пользователя
        // const hasSeenWelcomeModal = localStorage.getItem('hasSeenWelcomeModal');
        // if (!hasSeenWelcomeModal) {
        //   setIsFirstVisit(true);
        // }
      }
      
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
        
        // // Для новых зарегистрированных пользователей показываем приветственное окно
        // setIsFirstVisit(true);
        // localStorage.removeItem('hasSeenWelcomeModal'); // Сбрасываем флаг для нового пользователя
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
      localStorage.removeItem('currentUser'); // Удаляем из localStorage
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

  // Фильтрация прудов
  const filteredPonds = ponds.filter(pond => {
    const matchesSearch = pond.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         pond.description?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         pond.user_login?.toLowerCase().includes(searchTerm.toLowerCase()); // Теперь используем user_login
    
    const matchesCategory = selectedCategory === 'all' || pond.topic === selectedCategory;
    
    return matchesSearch && matchesCategory;
  });

  if (loading && ponds.length === 0) {
    return (
      <div className="min-h-screen bg-green-100 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Загрузка публичных прудов...</p>
        </div>
      </div>
    );
  }

  if (error && ponds.length === 0) {
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
      <div className="min-h-screen bg-green-grass p-2 xs:p-4 lg:p-8 flex flex-col" style={{color: '#DAFFD5'}}>
        <div className="mx-auto w-full max-w-7xl flex-grow">
          {/* Шапка - кнопка назад слева, заголовок по центру, кнопки справа */}
          <header className="flex items-center justify-between mb-6 md:mb-8">
            {/* Левая часть: кнопка "Назад" */}
            <div className="flex-shrink-0">
              <button
                onClick={() => navigate('/')}
                className="flex items-center justify-center w-12 h-12 md:w-14 md:h-14 bg-white bg-opacity-80 hover:bg-opacity-100 rounded-full transition-all duration-200 hover:scale-110 shadow-md"
                title="Вернуться к своим прудам"
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

            {/* Центральная часть: заголовок "Публичные пруды" */}
            <div className="flex-1 text-center px-4" style={{
                maxWidth: 'calc(100vw - 180px)',
                minWidth: 150
              }}>
              <h1 className="text-2xl xs:text-3xl sm:text-4xl lg:text-5xl font-bold text-black">Публичные пруды</h1>
              {/* <p className="text-gray-700 text md:text-base mt-1">
                Найдите интересные пруды и скопируйте их к себе
              </p> */}
            </div>
            
            {/* Правая часть: кнопки аккаунта и информации */}
            <div className="flex items-center space-x-3 md:space-x-4">
              {user ? (
                <div className="relative" ref={dropdownRef}>
                  {isMobile ? (
                    <button		
                      className="flex items-center justify-center w-12 h-12 md:w-14 md:h-14 bg-white bg-opacity-80 hover:bg-opacity-100 rounded-full shadow-md transition-all duration-200 hover:scale-105 cursor-pointer"		
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
                      className="flex items-center justify-center w-auto h-12 md:h-14 bg-white bg-opacity-80 hover:bg-opacity-100 rounded-full px-4 md:px-6 shadow-md transition-all duration-200 hover:scale-105 cursor-pointer"
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
                    className={isMobile ? "w-12 h-12" : "w-35 h-14"}
                  />
                </button>
              )}
              
              <button 
                className="flex items-center justify-center w-12 h-12 md:w-14 md:h-14 bg-white bg-opacity-80 hover:bg-opacity-100 rounded-full transition-all duration-200 hover:scale-110 shadow-md info-button"
                onClick={handleInfoClick}
                title="Информация о публичных прудах"
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

          {/* Список прудов */}
          <div className="space-y-0">
            {filteredPonds.length === 0 ? (
              <div className="bg-white bg-opacity-90 rounded-2xl p-8 text-center shadow-lg">
                <div className="text-gray-400 text-6xl mb-4">🐟</div>
                <h3 className="text-xl font-semibold text-gray-700 mb-2">Пруды не найдены</h3>
                <p className="text-gray-600">
                  Попробуйте изменить поисковый запрос или выберите другую категорию
                </p>
              </div>
            ) : (
              filteredPonds.map((pond, index) => {
                const isEven = index % 2 === 1; // Четные (0, 2, 4...) - false, нечетные (1, 3, 5...) - true
                
                return (
                  <div 
                    key={pond.id}
                    className="bg-white bg-opacity-90 rounded-2xl shadow-xl transition-all duration-300 hover:shadow-2xl"
                  >
                    <div className={`flex flex-col items-center md:flex-row ${isEven ? 'md:flex-row-reverse' : ''} bg-another-green mb-6 xs:mb-8 md:mb-6 lg:mb-10 rounded-2xl`}>
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
                              {pond.cnt_ready_fishes !== undefined && pond.cnt_fishes !== undefined ? (
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
                      <div className={`md:w-2/3 flex flex-col px-5 xs:px-6 sm:px-8  ${!isEven ? 'md:px-0 md:pr-5 lg:pr-8' : 'md:px-0 md:pl-5 lg:pl-8'} pt-4 pb-6`}>
                        <div className="mb-3 xs:mb-6 md:mb-3 lg:mb-6">
                          <h4 className="text-xl xs:text-2xl sm:text-4xl md:text-2xl lg:text-3xl xl:text-4xl font-bold text-black mb-3">{pond.name}</h4>
                          <p className="text-black leading-snug sm:leading-normal md:leading-snug lg:leading-normal text-base xs:text-lg sm:text-xl md:text-base lg:text-lg xl:text-xl text-left sm:text-justify">
                            {pond.description 
                              ? (() => {
                                  let maxLength;
                                  if (window.innerWidth < 768) maxLength = 300;
                                  else if (window.innerWidth < 1024) maxLength = 350;
                                  else maxLength = 400; // xl и больше
                                  
                                  return pond.description.length > maxLength 
                                    ? `${pond.description.substring(0, maxLength)}...` 
                                    : pond.description;
                                })()
                              : 'Автор не добавил описание к этому пруду.'
                            }
                          </p>
                        </div>
                        
                        {/* Информация о пруде */}
                        <div className="mb-3 xs:mb-6 md:mb-3 lg:mb-6">
                          <div className="flex-wrap items-center gap-0 lg:gap-8 rounded-xl">
                            <div className="flex items-center">
                              <span className="text-gray-800 font-medium mr-2">Автор:</span>
                              <span className="font-semibold text-gray-800">
                                {pond.user_login || pond.author?.username || 'Неизвестный автор'}
                              </span>
                            </div>
                            
                            <div className="flex items-center">
                              <span className="text-gray-800 font-medium mr-2">Категория:</span>
                              <span className="text-gray-800 font-semibold">
                                {pond.topic || 'Без категории'}
                              </span>
                            </div>
                            
                            {/* <div className="flex items-center">
                              <span className="text-gray-600 font-medium mr-2">Обновлен:</span>
                              <span className="font-medium text-gray-700">{formatDate(pond.updated_at)}</span>
                            </div>
                            
                            {pond.is_updatable && (
                              <div className="flex items-center">
                                <span className="text-gray-600 font-medium mr-2">Обновления:</span>
                                <span className="text-green-600 font-medium">✓ Доступны</span>
                              </div>
                            )} */}
                          </div>
                        </div>
                        
                        {/* Кнопки действий */}
                        <div className="flex flex-col sm:flex-row gap-3 md:gap-4">
                          <button
                            onClick={() => handleCopyPond(pond.id, false)}
                            disabled={loading}
                            className="bg-sea-blue min-h-12 sm:min-h-14 leading-tight rounded-xl flex-1 text-white font-semibold py-1 px-2 transition-all duration-200 hover:scale-[1.02] active:scale-[0.98] flex items-center justify-center gap-2 disabled:opacity-70 disabled:cursor-not-allowed"
                          >
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                            </svg>
                            Скопировать
                          </button>
                          
                          <button
                            onClick={() => handleCopyPond(pond.id, true)}
                            disabled={loading}
                            className={`bg-sea-blue min-h-12 sm:min-h-14 leading-tight rounded-xl flex-1 text-white font-semibold py-1 px-2 pl-3 transition-all duration-200 hover:scale-[1.02] active:scale-[0.98] flex items-center justify-center gap-2 disabled:opacity-70 disabled:cursor-not-allowed`}
                          >
                            <svg className="w-5 h-5 md:hidden lg:block" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} 
                                    d="M8 5H6a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2v-1M8 5a2 2 0 002 2h2a2 2 0 002-2M8 5a2 2 0 012-2h2a2 2 0 012 2m0 0h2a2 2 0 012 2v3m2 4H10m0 0l3-3m-3 3l3 3" 
                              />
                            </svg>
                            Скопировать без отслеживания обновлений
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>

        {/* Футер с кнопкой обратной связи */}
        <div className="mt-8 md:mt-12 pt-4 md:pt-6 border-t border-green-800 border-opacity-30">
          <div className="flex justify-center">
            <button
              onClick={handleFeedbackClick}
              className="flex items-center justify-center bg-white bg-opacity-90 hover:bg-opacity-100 text-gray-800 font-semibold py-3 px-6 rounded-full shadow-lg transition-all duration-200 hover:scale-105 hover:shadow-xl"
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