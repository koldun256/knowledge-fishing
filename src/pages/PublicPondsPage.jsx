// src/pages/PublicPondsPage.jsx
import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
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
  const [isMobile, setIsMobile] = useState(window.innerWidth < 600);
  
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
      setIsMobile(window.innerWidth < 600);
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
        const pondsData = await pondService.getPublicPonds();
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
            description: 'Основы Python, ООП, веб-разработка на Django и Flask. Идеально подходит для начинающих программистов.',
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
    const index = parseInt(String(pondId)[0] || '0', 10) % pondImages.length;
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
      const result = await pondService.login(loginData);
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
      
      setIsAuthModalOpen(false);
      return result;
      
    } catch (error) {
      console.error('Login error:', error);
      throw error;
    }
  };

  const handleRegister = async (registerData) => {
    try {
      const result = await pondService.register(registerData);
      
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
      
      setIsAuthModalOpen(false);
      return { success: true, message: 'Регистрация выполнена успешно!' };
      
    } catch (error) {
      console.error('Registration error:', error);
      throw error;
    }
  };

  const handleLogout = async () => {
    try {
      await pondService.logout();
      setUser(null);
      localStorage.removeItem('currentUser');
      setShowLogoutDropdown(false);
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
                         pond.author?.username?.toLowerCase().includes(searchTerm.toLowerCase());
    
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
      <div className="min-h-screen bg-green-grass p-4 md:p-8 flex flex-col" style={{color: '#00a028ff'}}>
        <div className="mx-auto w-full max-w-7xl flex-grow">
          {/* Шапка */}
          <header className="flex justify-between items-center mb-6 md:mb-8">
            <div style={{
                width: 'fit-content',
                maxWidth: 'calc(100vw - 180px)',
                minWidth: 150
              }}>
              <h1 className="text-2xl md:text-3xl lg:text-4xl font-bold text-black">Публичные пруды</h1>
              <p className="text-gray-700 text-sm md:text-base mt-1">
                Найдите интересные пруды и скопируйте их к себе
              </p>
            </div>
            
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
                      <span className="text-lg md:text-xl font-semibold text-gray-800 truncate max-w-[150px] md:max-w-[200px]">
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
                  className="flex items-center justify-center w-12 h-12 md:w-14 md:h-14 bg-white bg-opacity-80 hover:bg-opacity-100 rounded-full transition-all duration-200 hover:scale-110 shadow-md"
                  onClick={() => setIsAuthModalOpen(true)}
                  title="Вход/Регистрация"
                >
                  <img 
                    src={`${process.env.PUBLIC_URL}/assets/sign-in-small.png`} 
                    alt="Вход/Регистрация"
                    className="w-12 h-12 md:w-14 md:h-14"
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
          </header>

          {/* Поиск и фильтры
          <div className="mb-6 md:mb-8 bg-white bg-opacity-80 rounded-2xl p-4 md:p-6 shadow-lg">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div className="flex-1">
                <div className="relative">
                  <input
                    type="text"
                    placeholder="Поиск прудов, описаний или авторов..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full px-4 py-3 pr-10 border-2 border-gray-300 rounded-xl focus:outline-none focus:border-blue-500 transition-colors text-gray-800 placeholder-gray-500"
                  />
                  <div className="absolute right-3 top-3 text-gray-400">
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                    </svg>
                  </div>
                </div>
              </div>
              
              <div className="flex items-center gap-3">
                <span className="text-gray-700 font-medium whitespace-nowrap">Категория:</span>
                <select
                  value={selectedCategory}
                  onChange={(e) => setSelectedCategory(e.target.value)}
                  className="px-4 py-3 border-2 border-gray-300 rounded-xl focus:outline-none focus:border-blue-500 transition-colors bg-white text-gray-800"
                >
                  <option value="all">Все категории</option>
                  {categories.map(category => (
                    <option key={category} value={category}>
                      {category.charAt(0).toUpperCase() + category.slice(1)}
                    </option>
                  ))}
                </select>
              </div>
            </div>
            
            <div className="mt-4 flex flex-wrap gap-2">
              <button
                onClick={() => setSelectedCategory('all')}
                className={`px-4 py-2 rounded-lg transition-colors ${selectedCategory === 'all' ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-700 hover:bg-gray-300'}`}
              >
                Все
              </button>
              {categories.slice(0, 5).map(category => (
                <button
                  key={category}
                  onClick={() => setSelectedCategory(category)}
                  className={`px-4 py-2 rounded-lg transition-colors ${selectedCategory === category ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-700 hover:bg-gray-300'}`}
                >
                  {category.charAt(0).toUpperCase() + category.slice(1)}
                </button>
              ))}
            </div>
          </div> */}

          {/* Список прудов */}
          <div className="space-y-6 md:space-y-8">
            {filteredPonds.length === 0 ? (
              <div className="bg-white bg-opacity-90 rounded-2xl p-8 text-center shadow-lg">
                <div className="text-gray-400 text-6xl mb-4">🐟</div>
                <h3 className="text-xl font-semibold text-gray-700 mb-2">Пруды не найдены</h3>
                <p className="text-gray-600">
                  Попробуйте изменить поисковый запрос или выберите другую категорию
                </p>
              </div>
            ) : (
              filteredPonds.map((pond) => (
                <div 
                  key={pond.id}
                  className="bg-white bg-opacity-90 rounded-2xl overflow-hidden shadow-xl transition-all duration-300 hover:shadow-2xl"
                >
                  <div className="flex flex-col lg:flex-row">
                    {/* Левая часть - ТОЛЬКО картинка пруда */}
                    <div className="lg:w-1/3 p-4 md:p-6">
                      <div className="relative h-full">
                        <img 
                          src={getPondImage(pond.id)} 
                          alt={pond.name}
                          className="w-full h-full min-h-[250px] object-cover rounded-xl"
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
                    
                    {/* Правая часть - Вся информация и кнопки */}
                    <div className="lg:w-2/3 p-4 md:p-6 flex flex-col">
                      <div className="mb-4">
                        <h4 className="text-xl md:text-2xl font-bold text-gray-800 mb-3">Описание пруда</h4>
                        <p className="text-black leading-relaxed text-base md:text-lg">
                          {pond.description || 'Автор не добавил описание к этому пруду.'}
                        </p>
                      </div>
                      
                      <div className="mt-auto">
                        {/* Информация о пруде */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                          <div className="bg-blue-50 rounded-xl p-4">
                            <div className="space-y-3">
                              <div className="flex items-center justify-between">
                                <span className="text-gray-600">Автор:</span>
                                <span className="font-semibold text-gray-800">{pond.author?.username || 'Неизвестный автор'}</span>
                              </div>
                              <div className="flex items-center justify-between">
                                <span className="text-gray-600">Категория:</span>
                                <span className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm font-medium">
                                  {pond.topic || 'Без категории'}
                                </span>
                              </div>
                            </div>
                          </div>
                          
                          {/* <div className="bg-green-50 rounded-xl p-4">
                            <div className="space-y-3">
                              <div className="flex items-center justify-between">
                                <span className="text-gray-600">Обновлен:</span>
                                <span className="font-medium text-gray-700">{formatDate(pond.updated_at)}</span>
                              </div>
                              <div className="flex items-center justify-between">
                                <span className="text-gray-600">Просмотров:</span>
                                <span className="font-medium text-gray-700">{pond.views_count?.toLocaleString() || 0}</span>
                              </div>
                              {pond.is_updatable && (
                                <div className="flex items-center justify-between">
                                  <span className="text-gray-600">Обновления:</span>
                                  <span className="text-green-600 font-medium">✓ Доступны</span>
                                </div>
                              )}
                            </div>
                          </div> */}
                        </div>
                        
                        {/* Кнопки действий */}
                        <div className="flex flex-col sm:flex-row gap-3 md:gap-4">
                          <button
                            onClick={() => handleCopyPond(pond.id, false)}
                            disabled={loading}
                            className="flex-1 bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white font-semibold py-3 px-4 md:py-4 md:px-6 rounded-xl transition-all duration-200 hover:scale-[1.02] active:scale-[0.98] shadow-lg hover:shadow-xl flex items-center justify-center gap-2 disabled:opacity-70 disabled:cursor-not-allowed"
                          >
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                            </svg>
                            Скопировать
                          </button>
                          
                          <button
                            onClick={() => handleCopyPond(pond.id, true)}
                            disabled={loading}
                            className={`flex-1 font-semibold py-3 px-4 md:py-4 md:px-6 rounded-xl transition-all duration-200 hover:scale-[1.02] active:scale-[0.98] shadow-lg hover:shadow-xl flex items-center justify-center gap-2 ${
                              'bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 text-white'
                            } disabled:opacity-70 disabled:cursor-not-allowed`}
                          >
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                            </svg>
                            Скопировать с обновлением
                          </button>
                        </div>
                        
                        {/* <div className="mt-4 flex items-center justify-center text-sm text-gray-500">
                          <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                          </svg>
                          После копирования пруд появится в вашей коллекции
                        </div> */}
                      </div>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
          
          {/* Пагинация (если нужно) */}
          {filteredPonds.length > 0 && (
            <div className="mt-8 flex justify-center">
              <div className="flex items-center space-x-2">
                <button className="w-10 h-10 flex items-center justify-center bg-white bg-opacity-80 rounded-lg shadow hover:bg-opacity-100 transition-colors">
                  <svg className="w-5 h-5 text-gray-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                  </svg>
                </button>
                <span className="px-4 py-2 bg-white bg-opacity-80 rounded-lg shadow font-medium">1</span>
                <button className="w-10 h-10 flex items-center justify-center bg-white bg-opacity-80 rounded-lg shadow hover:bg-opacity-100 transition-colors">
                  <svg className="w-5 h-5 text-gray-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </button>
              </div>
            </div>
          )}
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