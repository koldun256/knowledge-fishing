// src/pages/PublicPondsPage.jsx
import React, { useState, useEffect, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { authService } from '../services/authService';
import { pondService } from '../services/pondService';
import AuthModal from '../components/AuthModal';
import InfoModal from '../components/InfoModal';
import FeedbackModal from '../components/FeedbackModal';
import { formatStringForDisplay } from '../helper/stringFormating';
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
  
  // Пагинация
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);
  const [totalPonds, setTotalPonds] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [isInfoModalOpen, setIsInfoModalOpen] = useState(false);
  const [isFeedbackModalOpen, setIsFeedbackModalOpen] = useState(false);
  const [showLogoutDropdown, setShowLogoutDropdown] = useState(false);
  
  const [infoButtonPosition, setInfoButtonPosition] = useState(null);
  const [isMobile, setIsMobile] = useState(window.innerWidth < 710);
  
  const dropdownRef = useRef(null);
  const itemsPerPageOptions = [5, 10, 15, 20, 25];

  const infoData = [
    {
      title: "Публичные пруды",
      text: "\\tЗдесь вы можете найти интересные пруды, созданные другими пользователями.\\n\\tКаждый публичный пруд можно скопировать к себе и изучать информацию, которую добавил его создатель."
    },
    {
      title: "Виды копирования",
      text: "\\t• СКОПИРОВАТЬ - получить текущую версию пруда, а также получать новых рыб, когда автор добавляет их в публичный пруд\\n\\t• СКОПИРОВАТЬ БЗ ОТСЛЕЖИВАНИЯ ОБНОВЛЕНИЙ - тогда вы получите только текущую копию пруда\\n\\t"
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

  // Загрузка публичных прудов с пагинацией
  const loadPublicPonds = async (page, perPage, theme = "", query = "") => {
    try {
      setLoading(true);
      const response = await pondService.getPublicPonds(page, perPage, theme === 'all' ? "" : theme, query);
      
      // Предполагаем, что бэкенд возвращает структуру:
      // { ponds: [...], total: number, page: number, per_page: number, total_pages: number }
      const pondsData = response.ponds.map(item => ({
        ...item.pond,
        user_login: item.user_login,
        author: { username: item.user_login }
      }));
      
      setPonds(pondsData);
      setTotalPonds(response.total_count || 0);
      setTotalPages(response.total_pages || Math.ceil((response.total_count || 0) / perPage));
      
      // Извлечение уникальных категорий (если нужно загрузить все категории один раз)
      // if (page === 1) {
      //   const allCategoriesResponse = await pondService.getPublicPonds(1, 1000, "", "");
      //   const allPonds = allCategoriesResponse.ponds || [];
      //   const uniqueCategories = [...new Set(allPonds.map(item => item.pond.topic).filter(Boolean))];
      //   setCategories(uniqueCategories);
      // }
    } catch (error) {
      console.error('Error loading public ponds:', error);
      setError('Не удалось загрузить публичные пруды');
    } finally {
      setLoading(false);
    }
  };

  // Загрузка прудов при изменении параметров
  useEffect(() => {
    const theme = selectedCategory === 'all' ? "" : selectedCategory;
    const query = searchTerm.trim();
    loadPublicPonds(currentPage, itemsPerPage, theme, query);
  }, [currentPage, itemsPerPage, selectedCategory, searchTerm]);

  // Сохранение пользователя в localStorage
  useEffect(() => {
    if (user) {
      localStorage.setItem('currentUser', JSON.stringify(user));
    } else {
      localStorage.removeItem('currentUser');
    }
  }, [user]);

  // Обработчик изменения страницы
  const handlePageChange = (pageNumber) => {
    setCurrentPage(pageNumber);
    window.scrollTo({ top: 0, behavior: 'auto' });
  };

  // Обработчик изменения количества элементов на странице
  const handleItemsPerPageChange = (e) => {
    const newItemsPerPage = parseInt(e.target.value);
    setItemsPerPage(newItemsPerPage);
    setCurrentPage(1);
  };

  // Обработчик поиска
  const handleSearchSubmit = (e) => {
    e.preventDefault();
    setCurrentPage(1);
  };

  // Обработчик изменения категории
  const handleCategoryChange = (e) => {
    setSelectedCategory(e.target.value);
    setCurrentPage(1);
  };

  // Генерация номеров страниц для пагинации
  const getPageNumbers = () => {
    const pageNumbers = [];
    const maxVisiblePages = 5;
    
    if (totalPages <= maxVisiblePages) {
      for (let i = 1; i <= totalPages; i++) {
        pageNumbers.push(i);
      }
    } else {
      const leftOffset = Math.floor(maxVisiblePages / 2);
      let startPage = currentPage - leftOffset;
      let endPage = currentPage + leftOffset;
      
      if (startPage < 1) {
        startPage = 1;
        endPage = maxVisiblePages;
      }
      
      if (endPage > totalPages) {
        endPage = totalPages;
        startPage = totalPages - maxVisiblePages + 1;
      }
      
      for (let i = startPage; i <= endPage; i++) {
        pageNumbers.push(i);
      }
      
      // Добавляем первую страницу и многоточие
      if (startPage > 1) {
        if (startPage > 2) {
          pageNumbers.unshift('...');
        }
        pageNumbers.unshift(1);
      }
      
      // Добавляем последнюю страницу и многоточие
      if (endPage < totalPages) {
        if (endPage < totalPages - 1) {
          pageNumbers.push('...');
        }
        pageNumbers.push(totalPages);
      }
    }
    
    return pageNumbers;
  };

  const getPondImage = (pondId) => {
    const index = parseInt(pondId[0], 16) % pondImages.length;
    return `${process.env.PUBLIC_URL}/assets/${pondImages[index]}`;
  };

  const getFishWord = (count) => {
    if (count === 1) return 'рыба';
    if (count >= 2 && count <= 4) return 'рыбы';
    return 'рыб';
  };

  const handleCopyPond = async (pondId, withUpdates = true) => {
    if (!user) {
      setIsAuthModalOpen(true);
      return;
    }

    try {
      setLoading(true);
      await pondService.copyPondById(pondId, withUpdates);
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
      console.log('Login attempt with data:', loginData);
      const result = await authService.login(loginData);
      console.log('Login successful:', result);
      
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
      console.log('Registration attempt with data:', registerData);
      const result = await authService.register(registerData);
      console.log('Registration successful:', result);
      
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
          {/* Шапка - кнопка назад слева, поиск по центру, кнопки справа */}
          <header className="flex items-center justify-between mb-6 md:mb-8">
            {/* Левая часть: кнопка "Назад" */}
            <div className="flex-shrink-0">
              <button
                onClick={() => navigate('/')}
                className="flex items-center justify-center w-12 h-12 md:w-14 md:h-14 bg-transparent-my bg-opacity-80 hover:bg-opacity-100 rounded-full transition-all duration-200 hover:scale-110 shadow-md"
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

            <div className="flex-1 text-center px-4" style={{
                maxWidth: 'calc(100vw - 180px)',
                minWidth: 150
              }}>
              <h1 className="text-2xl xs:text-3xl sm:text-4xl lg:text-5xl font-bold text-black">Публичные пруды</h1>
            </div>

            {/* Центральная часть: строка поиска вместо заголовка
            <div className="flex-1 px-4" style={{
                maxWidth: 'calc(100vw - 180px)',
                minWidth: 150
              }}>
              <div className="flex items-center gap-2">
                <form onSubmit={handleSearchSubmit} className="flex-grow">
                  <div className="relative">
                    <input
                      type="text"
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      placeholder="Поиск прудов по названию, описанию или автору..."
                      className="w-full bg-white border-0 rounded-xl focus:outline-none py-2 px-4 text-base md:text-lg text-gray-800 placeholder-gray-600 transition-all duration-200 shadow-sm"
                      style={{
                        boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)',
                      }}
                    />
                    <button
                      type="submit"
                      className="absolute right-3 top-1/2 transform -translate-y-1/2 bg-transparent border-none p-1 cursor-pointer"
                      style={{ color: '#4A5568' }}
                    >
                      <svg 
                        xmlns="http://www.w3.org/2000/svg" 
                        className="h-5 w-5 md:h-6 md:w-6" 
                        fill="none" 
                        viewBox="0 0 24 24" 
                        stroke="currentColor"
                      >
                        <path 
                          strokeLinecap="round" 
                          strokeLinejoin="round" 
                          strokeWidth={2} 
                          d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" 
                        />
                      </svg>
                    </button>
                  </div>
                </form>
                
                <button
                  onClick={() => {
                    // Здесь можно добавить логику для открытия меню фильтров
                    console.log('Open filters menu');
                  }}
                  className="flex items-center justify-center w-10 h-10 bg-white rounded-xl shadow-sm transition-all duration-200 hover:bg-gray-50 hover:shadow-md"
                  title="Фильтры"
                  style={{
                    flexShrink: 0
                  }}
                >
                  <svg 
                    xmlns="http://www.w3.org/2000/svg" 
                    className="h-5 w-5 text-gray-700" 
                    fill="none" 
                    viewBox="0 0 24 24" 
                    stroke="currentColor"
                  >
                    <path 
                      strokeLinecap="round" 
                      strokeLinejoin="round" 
                      strokeWidth={2} 
                      d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z" 
                    />
                  </svg>
                </button>
                
                <button
                  onClick={() => {
                    // Здесь можно добавить логику для открытия меню выбора количества
                    console.log('Open items per page selector');
                  }}
                  className="flex items-center justify-center w-10 h-10 bg-white rounded-xl shadow-sm transition-all duration-200 hover:bg-gray-50 hover:shadow-md"
                  title={`${itemsPerPage} прудов на странице`}
                  style={{
                    flexShrink: 0
                  }}
                >
                  <span className="text-base md:text-lg font-semibold text-gray-800">
                    {itemsPerPage}
                  </span>
                </button>
              </div>
            </div> */}
            
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

          {/* Фильтры под строкой поиска */}
          {/* <div className="mb-6 md:mb-8">
            <div className="flex flex-col md:flex-row gap-4 items-end">
              <div className="w-full md:w-auto">
                <label className="block text-gray-700 mb-2 font-medium">Категория:</label>
                <select
                  value={selectedCategory}
                  onChange={handleCategoryChange}
                  className="w-full md:w-48 bg-transparent-my bg-opacity-90 border border-gray-300 rounded-lg py-2 px-3 text-gray-800 focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="all">Все категории</option>
                  {categories.map((category) => (
                    <option key={category} value={category}>
                      {category}
                    </option>
                  ))}
                </select>
              </div>

              <div className="w-full md:w-auto">
                <label className="block text-gray-700 mb-2 font-medium">На странице:</label>
                <select
                  value={itemsPerPage}
                  onChange={handleItemsPerPageChange}
                  className="w-full md:w-32 bg-transparent-my bg-opacity-90 border border-gray-300 rounded-lg py-2 px-3 text-gray-800 focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  {itemsPerPageOptions.map((option) => (
                    <option key={option} value={option}>
                      {option}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div className="text-gray-700 mt-2">
              <p>
                Показано <span className="font-semibold">{ponds.length}</span> из{' '}
                <span className="font-semibold">{totalPonds}</span> прудов
                {searchTerm && (
                  <span> по запросу "{searchTerm}"</span>
                )}
              </p>
            </div>
          </div> */}

          {/* Список прудов */}
          <div className="space-y-0">
            {ponds.length === 0 ? (
              <div className="bg-transparent-my bg-opacity-90 rounded-2xl p-8 text-center shadow-lg">
                <div className="text-gray-400 text-6xl mb-4">🐟</div>
                <h3 className="text-xl font-semibold text-gray-700 mb-2">Пруды не найдены</h3>
                <p className="text-gray-600">
                  Попробуйте изменить поисковый запрос или выберите другую категорию
                </p>
              </div>
            ) : (
              ponds.map((pond, index) => {
                const isEven = index % 2 === 1;
                
                return (
                  <div 
                    key={pond.id}
                    className="bg-transparent-my bg-opacity-90 rounded-2xl shadow-xl transition-all duration-300 hover:shadow-2xl"
                  >
                    <Link to={`/pond-card/${pond.id}`} className={`flex flex-col items-center md:flex-row ${isEven ? 'md:flex-row-reverse' : ''} bg-another-green mb-6 xs:mb-8 md:mb-6 lg:mb-10 rounded-2xl`}>
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
                          <div className="text-black leading-snug sm:leading-normal md:leading-snug lg:leading-normal text-base xs:text-lg sm:text-xl md:text-base lg:text-lg xl:text-xl text-left sm:text-justify"
                            dangerouslySetInnerHTML={{ __html: formatStringForDisplay(
                              pond.description ? (() => {
                                  let maxLength;
                                  if (window.innerWidth < 768) maxLength = 300;
                                  else if (window.innerWidth < 1024) maxLength = 350;
                                  else maxLength = 400;
                                  
                                  return pond.description.length > maxLength 
                                    ? `${pond.description.substring(0, maxLength)}...` 
                                    : pond.description;
                                })()
                              : 'Автор не добавил описание к этому пруду.'
                              )}
                            }
                          />
                        </div>
                        
                        {/* Информация о пруде */}
                        <div className="mb-3 xs:mb-6 md:mb-3 lg:mb-6">
                          <div className="flex-wrap items-center gap-0 lg:gap-8 rounded-xl">
                            <div className="flex items-center">
                              <span className="text-gray-800 font-medium mr-2 shrink-0">Автор:</span>
                              <div className="relative group">
                                <span 
                                  className="font-semibold text-gray-800 truncate block max-w-[150px] xs:max-w-[250px] sm:max-w-[300px] md:max-w-[400px]"
                                >
                                  {pond.user_login || pond.author?.username || 'Неизвестный Рыбак'}
                                </span>
                                <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-3 py-2 bg-gray-900 text-white text-sm rounded-lg opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 whitespace-nowrap z-50 pointer-events-none">
                                  {pond.user_login || pond.author?.username || 'Неизвестный автор'}
                                  <div className="absolute top-full left-1/2 transform -translate-x-1/2 w-0 h-0 border-l-4 border-r-4 border-t-4 border-l-transparent border-r-transparent border-t-gray-900"></div>
                                </div>
                              </div>
                            </div>
                            
                            <div className="flex items-center">
                              <span className="text-gray-800 font-medium mr-2">Категория:</span>
                              <span className="font-semibold text-gray-800 truncate block max-w-[150px] xs:max-w-[250px] sm:max-w-[300px] md:max-w-[400px]">
                                {pond.topic || 'Без категории'}
                              </span>
                            </div>
                            
                            <div className="flex items-center">
                              <span className="text-gray-800 font-medium mr-2">Скопирован</span>
                              <span className="font-semibold text-gray-800 truncate block max-w-[150px] xs:max-w-[250px] sm:max-w-[300px] md:max-w-[400px]">
                                {pond.cnt_copied} раз
                              </span>
                            </div>
                          </div>
                        </div>
                        
                        {/* Кнопки действий */}
                        <div className="flex flex-col sm:flex-row gap-3 md:gap-4">
                          <button
                            onClick={(e) => {
                              e.preventDefault();
                              handleCopyPond(pond.id, true);
                            }}
                            disabled={loading}
                            className="bg-sea-blue min-h-12 sm:min-h-14 leading-tight rounded-xl flex-1 text-white font-semibold py-1 px-2 transition-all duration-200 hover:scale-[1.02] active:scale-[0.98] flex items-center justify-center gap-2 disabled:opacity-70 disabled:cursor-not-allowed"
                          >
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                            </svg>
                            Скопировать
                          </button>
                          
                          <button
                            onClick={(e) => {
                              e.preventDefault();
                              handleCopyPond(pond.id, false);
                            }}
                            disabled={loading}
                            className={`bg-sea-blue min-h-12 sm:min-h-14 leading-tight rounded-xl flex-1 text-white font-semibold py-1 px-2 pl-3 transition-all duration-200 hover:scale-[1.02] active:scale-[0.98] flex items-center justify-center gap-2 disabled:opacity-70 disabled:cursor-not-allowed`}
                          >
                            Скопировать без отслеживания обновлений
                          </button>
                        </div>
                      </div>
                    </Link>
                  </div>
                );
              })
            )}
          </div>

          {/* Пагинация */}
          {totalPages > 1 && (
            <div className="mt-8 mb-6 flex flex-col items-center justify-center space-y-4">
              <div className="flex items-center justify-center space-x-2">
                {/* Кнопка "Назад" */}
                <button
                  onClick={() => handlePageChange(currentPage - 1)}
                  disabled={currentPage === 1}
                  className="flex items-center justify-center w-10 h-10 bg-transparent-my bg-opacity-80 hover:bg-opacity-100 rounded-full disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200"
                  title="Предыдущая страница"
                >
                  <svg 
                    xmlns="http://www.w3.org/2000/svg" 
                    className="w-5 h-5 text-gray-700"
                    fill="none" 
                    viewBox="0 0 24 24" 
                    stroke="currentColor"
                  >
                    <path 
                      strokeLinecap="round" 
                      strokeLinejoin="round" 
                      strokeWidth={2} 
                      d="M15 19l-7-7 7-7" 
                    />
                  </svg>
                </button>

                {/* Номера страниц */}
                {getPageNumbers().map((pageNumber, index) => (
                  pageNumber === '...' ? (
                    <span key={`ellipsis-${index}`} className="px-3 py-2 text-gray-500">
                      ...
                    </span>
                  ) : (
                    <button
                      key={pageNumber}
                      onClick={() => handlePageChange(pageNumber)}
                      className={`w-10 h-10 flex items-center justify-center rounded-full transition-all duration-200 ${
                        currentPage === pageNumber
                          ? 'bg-sea-blue text-white font-bold scale-110'
                          : 'bg-transparent-my bg-opacity-80 hover:bg-opacity-100 text-gray-800 hover:scale-105'
                      }`}
                    >
                      {pageNumber}
                    </button>
                  )
                ))}

                {/* Кнопка "Вперед" */}
                <button
                  onClick={() => handlePageChange(currentPage + 1)}
                  disabled={currentPage === totalPages}
                  className="flex items-center justify-center w-10 h-10 bg-transparent-my bg-opacity-80 hover:bg-opacity-100 rounded-full disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200"
                  title="Следующая страница"
                >
                  <svg 
                    xmlns="http://www.w3.org/2000/svg" 
                    className="w-5 h-5 text-gray-700"
                    fill="none" 
                    viewBox="0 0 24 24" 
                    stroke="currentColor"
                  >
                    <path 
                      strokeLinecap="round" 
                      strokeLinejoin="round" 
                      strokeWidth={2} 
                      d="M9 5l7 7-7 7" 
                    />
                  </svg>
                </button>
              </div>

              {/* Информация о текущей странице */}
              <div className="text-gray-700 text-center">
                <p>
                  Страница <span className="font-semibold">{currentPage}</span> из{' '}
                  <span className="font-semibold">{totalPages}</span>
                </p>
              </div>
            </div>
          )}
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