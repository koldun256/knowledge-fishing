// src/pages/PublicPondsPage.jsx
import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { authService } from '../services/authService';
import { pondService } from '../services/pondService';
import AuthModal from '../components/AuthModal';
import InfoModal from '../components/InfoModal';
import FeedbackModal from '../components/FeedbackModal';
import { formatStringForDisplay } from '../helper/stringFormating';
import '../index.css';

// Кастомный хук для debounce
const useDebounce = (value, delay) => {
  const [debouncedValue, setDebouncedValue] = useState(value);

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);

    return () => {
      clearTimeout(handler);
    };
  }, [value, delay]);

  return debouncedValue;
};

// Класс для фильтров
class Filters {
  constructor(category = '', author = '', customCategory = '') {
    this.category = category;
    this.author = author;
    this.customCategory = customCategory;
  }

  toParams() {
    const params = {};
    if (this.category && this.category !== 'all') {
      // Если выбрана custom категория, отправляем значение из customCategory
      if (this.category === 'custom' && this.customCategory) {
        params.category = this.customCategory;
      } else if (this.category !== 'custom') {
        params.category = this.category;
      }
    }
    if (this.author) {
      params.author = this.author;
    }
    return params;
  }

  isEmpty() {
    return (!this.category || this.category === 'all' || this.category === '') && !this.author && !this.customCategory;
  }

  getDisplayText() {
    const parts = [];
    if (this.category && this.category !== 'all') {
      if (this.category === 'custom' && this.customCategory) {
        parts.push(`категория: ${this.customCategory}`);
      } else if (this.category !== 'custom') {
        parts.push(`категория: ${this.category}`);
      }
    }
    if (this.author) {
      parts.push(`автор: ${this.author}`);
    }
    return parts.length > 0 ? parts.join(', ') : 'все фильтры';
  }
}

export default function PublicPondsPage() {
  const navigate = useNavigate();
  const [ponds, setPonds] = useState([]);
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState(null);
  const [error, setError] = useState(null);
  
  // Состояния для поиска
  const [searchTerm, setSearchTerm] = useState(() => {
    const savedSearchTerm = localStorage.getItem('publicPondsSearchTerm');
    return savedSearchTerm || '';
  });
  
  // Фильтры
  const [filters, setFilters] = useState(() => {
    const savedCategory = localStorage.getItem('publicPondsCategory') || '';
    const savedAuthor = localStorage.getItem('publicPondsAuthor') || '';
    const savedCustomCategory = localStorage.getItem('publicPondsCustomCategory') || '';
    return new Filters(savedCategory, savedAuthor, savedCustomCategory);
  });
  
  // Дебаунс для поиска и фильтров
  const debouncedSearchTerm = useDebounce(searchTerm, 500);
  const debouncedFilters = useDebounce(filters, 500);
  
  // Состояние для открытия фильтров
  const [showFiltersDropdown, setShowFiltersDropdown] = useState(false);
  
  const [categories, setCategories] = useState([]);
  
  // Пагинация
  const [currentPage, setCurrentPage] = useState(() => {
    const savedPage = localStorage.getItem('publicPondsCurrentPage');
    return savedPage ? parseInt(savedPage) : 1;
  });
  const [itemsPerPage, setItemsPerPage] = useState(() => {
    const savedItemsPerPage = localStorage.getItem('publicPondsItemsPerPage');
    return savedItemsPerPage ? parseInt(savedItemsPerPage) : 10;
  });
  const [totalPonds, setTotalPonds] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [isInfoModalOpen, setIsInfoModalOpen] = useState(false);
  const [isFeedbackModalOpen, setIsFeedbackModalOpen] = useState(false);
  const [showLogoutDropdown, setShowLogoutDropdown] = useState(false);
  const [showItemsPerPageDropdown, setShowItemsPerPageDropdown] = useState(false);
  
  const [infoButtonPosition, setInfoButtonPosition] = useState(null);
  const [isMobile, setIsMobile] = useState(window.innerWidth < 710);
  
  const dropdownRef = useRef(null);
  const itemsPerPageDropdownRef = useRef(null);
  const filtersDropdownRef = useRef(null);
  const itemsPerPageOptions = [10, 20, 50, 100];
  // Добавляем ref для мобильных версий
  const filtersMobileRef = useRef(null);
  const itemsPerPageMobileRef = useRef(null);

  // Примерные категории (в реальном приложении можно загружать с сервера)
  const defaultCategories = ['Программирование', 'Дизайн', 'Маркетинг', 'Бизнес', 'Образование', 'Развлечения'];

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

  // Закрытие выпадающих меню при клике вне их - ОБНОВЛЕННАЯ ЛОГИКА
  useEffect(() => {
    const handleClickOutside = (event) => {
      const target = event.target;
      
      // Закрытие меню пользователя
      if (dropdownRef.current && !dropdownRef.current.contains(target)) {
        setShowLogoutDropdown(false);
      }
      
      // Закрытие меню выбора количества элементов (десктоп и мобильный)
      const isItemsPerPageClick = 
        (itemsPerPageDropdownRef.current && itemsPerPageDropdownRef.current.contains(target)) ||
        (itemsPerPageMobileRef.current && itemsPerPageMobileRef.current.contains(target));
      
      if (!isItemsPerPageClick && showItemsPerPageDropdown) {
        setShowItemsPerPageDropdown(false);
      }
      
      // Закрытие меню фильтров (десктоп и мобильный)
      const isFiltersClick = 
        (filtersDropdownRef.current && filtersDropdownRef.current.contains(target)) ||
        (filtersMobileRef.current && filtersMobileRef.current.contains(target));
      
      if (!isFiltersClick && showFiltersDropdown) {
        setShowFiltersDropdown(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [showFiltersDropdown, showItemsPerPageDropdown, showLogoutDropdown]);

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

  // Загрузка публичных прудов с пагинацией и фильтрами
  const loadPublicPonds = useCallback(async (page, perPage, query = "", filtersObj = null) => {
    try {
      setLoading(true);
      // Преобразуем фильтры в параметры
      const filtersParams = filtersObj ? filtersObj.toParams() : {};
      
      const response = await pondService.getPublicPonds(page, perPage, filtersParams, query);
      
      const pondsData = response.ponds.map(item => ({
        ...item.pond,
        user_login: item.user_login,
        author: { username: item.user_login }
      }));
      
      setPonds(pondsData);
      setTotalPonds(response.total_count || 0);
      setTotalPages(response.total_pages || Math.ceil((response.total_count || 0) / perPage));
      
      const uniqueCategories = [...new Set(pondsData.map(item => item.topic).filter(Boolean))];
      const allCategories = [...new Set([...defaultCategories, ...uniqueCategories])];
      setCategories(allCategories);
      
    } catch (error) {
      console.error('Error loading public ponds:', error);
      setError('Не удалось загрузить публичные пруды');
    } finally {
      setLoading(false);
    }
  }, []);

  // Загрузка прудов при изменении параметров (с debounce)
  useEffect(() => {
    const query = debouncedSearchTerm.trim();
    loadPublicPonds(currentPage, itemsPerPage, query, debouncedFilters);
  }, [currentPage, itemsPerPage, debouncedSearchTerm, debouncedFilters, loadPublicPonds]);

  // Инициализация при первой загрузке
  useEffect(() => {
    const savedSearchTerm = localStorage.getItem('publicPondsSearchTerm') || '';
    const savedCategory = localStorage.getItem('publicPondsCategory') || '';
    const savedAuthor = localStorage.getItem('publicPondsAuthor') || '';
    const savedCustomCategory = localStorage.getItem('publicPondsCustomCategory') || '';
    
    setSearchTerm(savedSearchTerm);
    setFilters(new Filters(savedCategory, savedAuthor, savedCustomCategory));
    
    loadPublicPonds(currentPage, itemsPerPage, savedSearchTerm, new Filters(savedCategory, savedAuthor, savedCustomCategory));
  }, [loadPublicPonds, itemsPerPage, currentPage]);

  // Сохранение пользователя в localStorage
  useEffect(() => {
    if (user) {
      localStorage.setItem('currentUser', JSON.stringify(user));
    } else {
      localStorage.removeItem('currentUser');
    }
  }, [user]);

  // Сохранение текущей страницы в localStorage при изменении
  useEffect(() => {
    localStorage.setItem('publicPondsCurrentPage', currentPage.toString());
  }, [currentPage]);

  // Сохранение количества элементов на странице в localStorage при изменении
  useEffect(() => {
    localStorage.setItem('publicPondsItemsPerPage', itemsPerPage.toString());
  }, [itemsPerPage]);

  // Сохранение фильтров в localStorage при изменении
  useEffect(() => {
    localStorage.setItem('publicPondsCategory', filters.category || '');
    localStorage.setItem('publicPondsAuthor', filters.author || '');
    localStorage.setItem('publicPondsCustomCategory', filters.customCategory || '');
  }, [filters]);

  // Обработчик изменения страницы
  const handlePageChange = (pageNumber) => {
    setCurrentPage(pageNumber);
    window.scrollTo({ top: 0, behavior: 'auto' });
  };

  // Обработчик изменения количества элементов на странице
  const handleItemsPerPageChange = (value) => {
    setItemsPerPage(value);
    setCurrentPage(1);
    setShowItemsPerPageDropdown(false);
  };

  // Обработчик поиска (по кнопке)
  const handleSearchSubmit = (e) => {
    e.preventDefault();
    setCurrentPage(1);
    
    localStorage.setItem('publicPondsSearchTerm', searchTerm.trim());
  };

  // Обработчик изменения категории в фильтрах
  const handleCategoryChange = (e) => {
    const newCategory = e.target.value;
    setFilters(prev => new Filters(newCategory, prev.author, prev.customCategory));
  };

  // Обработчик изменения custom категории в фильтрах
  const handleCustomCategoryChange = (e) => {
    const newCustomCategory = e.target.value;
    setFilters(prev => new Filters(prev.category, prev.author, newCustomCategory));
  };

  // Обработчик изменения автора в фильтрах
  const handleAuthorChange = (e) => {
    const newAuthor = e.target.value;
    setFilters(prev => new Filters(prev.category, newAuthor, prev.customCategory));
  };

  // Обработчик применения фильтров
  const handleApplyFilters = () => {
    setCurrentPage(1);
    setShowFiltersDropdown(false);
    
    localStorage.setItem('publicPondsCategory', filters.category || '');
    localStorage.setItem('publicPondsAuthor', filters.author || '');
    localStorage.setItem('publicPondsCustomCategory', filters.customCategory || '');
  };

  // Обработчик сброса фильтров
  const handleResetFilters = () => {
    setFilters(new Filters('', '', ''));
    setCurrentPage(1);
    setShowFiltersDropdown(false);
    
    localStorage.setItem('publicPondsCategory', '');
    localStorage.setItem('publicPondsAuthor', '');
    localStorage.setItem('publicPondsCustomCategory', '');
  };

  // Открытие/закрытие фильтров
  const handleFiltersClick = () => {
    setShowFiltersDropdown(!showFiltersDropdown);
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
      
      if (startPage > 1) {
        if (startPage > 2) {
          pageNumbers.unshift('...');
        }
        pageNumbers.unshift(1);
      }
      
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

  const handleItemsPerPageClick = () => {
    setShowItemsPerPageDropdown(!showItemsPerPageDropdown);
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

  // Очистка поиска
  const handleClearSearch = () => {
    setSearchTerm('');
    setCurrentPage(1);
    
    localStorage.setItem('publicPondsSearchTerm', '');
  };

  // Поиск по нажатию Enter
  const handleKeyPress = (e) => {
    if (e.key === 'Enter') {
      handleSearchSubmit(e);
    }
  };

  // Функция для получения отображаемого текста фильтров
  const getFiltersDisplayText = () => {
    return filters.isEmpty() ? 'все фильтры' : filters.getDisplayText();
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
          <header className="flex items-center justify-between mb-4 sm:mb-6 lg:mb-8">
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

            <div className="flex-1 pr-2 px-0 sm:px-4" style={{
                maxWidth: 'calc(100vw - 180px)',
                minWidth: 150
              }}>
              {/* Десктопная версия (больше 500px) */}
              <div className="hidden sm:flex items-center gap-2">
                <form onSubmit={handleSearchSubmit} className="flex-grow">
                  <div className="relative">
                    <input
                      type="text"
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      onKeyPress={handleKeyPress}
                      placeholder="Поиск прудов по названию, описанию или категории..."
                      className="w-full bg-white pr-16 sm:pr-20 border-0 rounded-xl focus:outline-none py-2 md:py-1.5 px-4 text-base md:text-lg text-gray-800 placeholder-gray-600 transition-all duration-200 shadow-sm"
                      style={{
                        boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)',
                        // paddingRight: '4rem'
                      }}
                    />
                    {(searchTerm) && (
                      <button
                        type="button"
                        onClick={handleClearSearch}
                        className="absolute right-8 sm:right-10 top-1/2 transform -translate-y-1/2 bg-transparent border-none p-1 cursor-pointer"
                        style={{ color: '#4A5568' }}
                        title="Очистить поиск и фильтры"
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
                            d="M6 18L18 6M6 6l12 12" 
                          />
                        </svg>
                      </button>
                    )}
                    <button
                      type="submit"
                      className="absolute right-2 top-1/2 transform -translate-y-1/2 bg-transparent border-none p-1 cursor-pointer"
                      style={{ color: '#4A5568' }}
                      title="Искать"
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
                
                {/* Кнопка фильтров */}
                <div className="relative" ref={filtersDropdownRef}>
                  <button
                    onClick={handleFiltersClick}
                    className="flex items-center justify-center w-10 h-10 bg-white rounded-xl shadow-sm transition-all duration-200 hover:bg-gray-50 hover:shadow-md"
                    title={getFiltersDisplayText()}
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
                    {!filters.isEmpty() && (
                      <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full h-4 w-4 flex items-center justify-center">
                        !
                      </span>
                    )}
                  </button>
                  
                  {showFiltersDropdown && (
                    <div className="absolute right-0 mt-2 w-80 bg-white rounded-xl shadow-xl z-50 overflow-hidden border border-gray-200 p-4">
                      <h3 className="text-lg font-semibold text-gray-800 mb-4">Фильтры</h3>
                      
                      <div className="space-y-4">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            Категория
                          </label>
                          <div className="flex gap-2">
                            <select
                              value={filters.category || 'all'}
                              onChange={handleCategoryChange}
                              className="flex-grow bg-white border border-gray-300 rounded-lg py-2 px-3 text-gray-800 focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                            >
                              <option value="all">Все категории</option>
                              <option value="custom">Ввести свою категорию</option>
                              {categories.map((category) => (
                                <option key={category} value={category}>
                                  {category}
                                </option>
                              ))}
                            </select>
                          </div>
                          
                          {filters.category === 'custom' && (
                            <input
                              type="text"
                              placeholder="Введите название категории..."
                              value={filters.customCategory || ''}
                              onChange={handleCustomCategoryChange}
                              className="mt-2 w-full bg-white border border-gray-300 rounded-lg py-2 px-3 text-gray-800 focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                            />
                          )}
                        </div>
                        
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            Автор
                          </label>
                          <input
                            type="text"
                            placeholder="Введите имя автора..."
                            value={filters.author || ''}
                            onChange={handleAuthorChange}
                            className="w-full bg-white border border-gray-300 rounded-lg py-2 px-3 text-gray-800 focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                          />
                        </div>
                      </div>
                      
                      <div className="flex justify-between mt-6 pt-4 border-t border-gray-200">
                        <button
                          onClick={handleResetFilters}
                          className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors"
                        >
                          Сбросить
                        </button>
                        <button
                          onClick={handleApplyFilters}
                          className="px-4 py-2 text-sm font-medium text-white bg-sea-blue hover:bg-blue-700 rounded-lg transition-colors"
                        >
                          Применить
                        </button>
                      </div>
                    </div>
                  )}
                </div>
                
                {/* Кнопка выбора количества элементов на странице */}
                <div className="relative" ref={itemsPerPageDropdownRef}>
                  <button
                    onClick={handleItemsPerPageClick}
                    className="flex items-center justify-center w-10 h-10 bg-white rounded-xl shadow-sm transition-all duration-200 hover:bg-gray-50 hover:shadow-md relative"
                    title={`${itemsPerPage} прудов на странице`}
                    style={{
                      flexShrink: 0
                    }}
                  >
                    <span className="text-lg font-semibold text-gray-800">
                      {itemsPerPage}
                    </span>
                  </button>
                  
                  {showItemsPerPageDropdown && (
                    <div className="absolute right-0 mt-2 w-32 bg-white rounded-xl shadow-xl z-50 overflow-hidden border border-gray-200">
                      {itemsPerPageOptions.map((option) => (
                        <button
                          key={option}
                          onClick={() => handleItemsPerPageChange(option)}
                          className={`w-full px-4 py-3 text-left text-gray-800 hover:bg-gray-50 font-medium flex items-center justify-between transition-colors duration-150 ${
                            itemsPerPage === option ? 'bg-blue-50 text-blue-600' : ''
                          }`}
                        >
                          <span>{option}</span>
                          {itemsPerPage === option && (
                            <svg 
                              xmlns="http://www.w3.org/2000/svg" 
                              className="h-4 w-4 text-blue-600"
                              fill="none" 
                              viewBox="0 0 24 24" 
                              stroke="currentColor"
                            >
                              <path 
                                strokeLinecap="round" 
                                strokeLinejoin="round" 
                                strokeWidth={2} 
                                d="M5 13l4 4L19 7" 
                              />
                            </svg>
                          )}
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              </div>

              {/* Мобильная версия (меньше 500px) */}
              <div className="sm:hidden flex flex-col w-full">
                {/* Заглушка - пока ничего не показываем в первой строке на мобильных */}
              </div>
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

          {/* Вторая строка для мобильных устройств (меньше 710px) - все в одной строке */}
          <div className="sm:hidden flex flex-row items-center gap-2 w-full mb-6">
            {/* Поиск - занимает большую часть */}
            <form onSubmit={handleSearchSubmit} className="flex-grow min-w-[150px]">
              <div className="relative">
                <input
                  type="text"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  onKeyPress={handleKeyPress}
                  placeholder="Поиск прудов..."
                  className="w-full bg-white border-0 rounded-xl focus:outline-none py-2 px-4 text-base text-gray-800 placeholder-gray-600 transition-all duration-200 shadow-sm"
                  style={{
                    boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)',
                    paddingRight: '4rem'
                  }}
                />
                {(searchTerm) && (
                  <button
                    type="button"
                    onClick={handleClearSearch}
                    className="absolute right-8 top-1/2 transform -translate-y-1/2 bg-transparent border-none p-1 cursor-pointer"
                    style={{ color: '#4A5568' }}
                    title="Очистить поиск"
                  >
                    <svg 
                      xmlns="http://www.w3.org/2000/svg" 
                      className="h-5 w-5" 
                      fill="none" 
                      viewBox="0 0 24 24" 
                      stroke="currentColor"
                    >
                      <path 
                        strokeLinecap="round" 
                        strokeLinejoin="round" 
                        strokeWidth={2} 
                        d="M6 18L18 6M6 6l12 12" 
                      />
                    </svg>
                  </button>
                )}
                <button
                  type="submit"
                  className="absolute right-2 top-1/2 transform -translate-y-1/2 bg-transparent border-none p-1 cursor-pointer"
                  style={{ color: '#4A5568' }}
                  title="Искать"
                >
                  <svg 
                    xmlns="http://www.w3.org/2000/svg" 
                    className="h-5 w-5" 
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

            {/* Кнопка фильтров */}
            <div className="relative flex-shrink-0" ref={filtersMobileRef}>
              <button
                onClick={handleFiltersClick}
                className="flex items-center justify-center w-10 h-10 bg-white rounded-xl shadow-sm transition-all duration-200 hover:bg-gray-50 hover:shadow-md"
                title={getFiltersDisplayText()}
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
                {!filters.isEmpty() && (
                  <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full h-4 w-4 flex items-center justify-center">
                    !
                  </span>
                )}
              </button>
              
              {showFiltersDropdown && (
                <div 
                  className="absolute right-0 mt-2 w-full min-w-[280px] bg-white rounded-xl shadow-xl z-50 overflow-hidden border border-gray-200 p-4"
                  style={{ maxWidth: 'calc(100vw - 2rem)' }}
                >
                  <h3 className="text-lg font-semibold text-gray-800 mb-4">Фильтры</h3>
                  
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Категория
                      </label>
                      <div className="flex gap-2">
                        <select
                          value={filters.category || 'all'}
                          onChange={handleCategoryChange}
                          className="flex-grow bg-white border border-gray-300 rounded-lg py-2 px-3 text-gray-800 focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                        >
                          <option value="all">Все категории</option>
                          <option value="custom">Вести свою категорию</option>
                          {categories.map((category) => (
                            <option key={category} value={category}>
                              {category}
                            </option>
                          ))}
                        </select>
                      </div>
                      
                      {filters.category === 'custom' && (
                        <input
                          type="text"
                          placeholder="Введите название категории..."
                          value={filters.customCategory || ''}
                          onChange={handleCustomCategoryChange}
                          className="mt-2 w-full bg-white border border-gray-300 rounded-lg py-2 px-3 text-gray-800 focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                        />
                      )}
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Автор
                      </label>
                      <input
                        type="text"
                        placeholder="Введите имя автора..."
                        value={filters.author || ''}
                        onChange={handleAuthorChange}
                        className="w-full bg-white border border-gray-300 rounded-lg py-2 px-3 text-gray-800 focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                      />
                    </div>
                  </div>
                  
                  <div className="flex justify-between mt-6 pt-4 border-t border-gray-200">
                    <button
                      onClick={handleResetFilters}
                      className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors"
                    >
                      Сбросить
                    </button>
                    <button
                      onClick={handleApplyFilters}
                      className="px-4 py-2 text-sm font-medium text-white bg-sea-blue hover:bg-blue-700 rounded-lg transition-colors"
                    >
                      Применить
                    </button>
                  </div>
                </div>
              )}
            </div>
            
            {/* Кнопка выбора количества элементов на странице */}
            <div className="relative flex-shrink-0" ref={itemsPerPageMobileRef}>
              <button
                onClick={handleItemsPerPageClick}
                className="flex items-center justify-center w-10 h-10 bg-white rounded-xl shadow-sm transition-all duration-200 hover:bg-gray-50 hover:shadow-md"
                title={`${itemsPerPage} прудов на странице`}
              >
                <span className="text-lg font-semibold text-gray-800">
                  {itemsPerPage}
                </span>
              </button>
              
              {showItemsPerPageDropdown && (
                <div 
                  className="absolute right-0 mt-2 w-32 bg-white rounded-xl shadow-xl z-50 overflow-hidden border border-gray-200"
                >
                  {itemsPerPageOptions.map((option) => (
                    <button
                      key={option}
                      onClick={() => handleItemsPerPageChange(option)}
                      className={`w-full px-4 py-3 text-left text-gray-800 hover:bg-gray-50 font-medium flex items-center justify-between transition-colors duration-150 ${
                        itemsPerPage === option ? 'bg-blue-50 text-blue-600' : ''
                      }`}
                    >
                      <span>{option}</span>
                      {itemsPerPage === option && (
                        <svg 
                          xmlns="http://www.w3.org/2000/svg" 
                          className="h-4 w-4 text-blue-600"
                          fill="none" 
                          viewBox="0 0 24 24" 
                          stroke="currentColor"
                        >
                          <path 
                            strokeLinecap="round" 
                            strokeLinejoin="round" 
                            strokeWidth={2} 
                            d="M5 13l4 4L19 7" 
                          />
                        </svg>
                      )}
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Информация о фильтрах и поиске
          <div className="mb-6 md:mb-8">
            <div className="text-gray-700">
              <p className="text-sm md:text-base">
                Найдено <span className="font-semibold">{totalPonds}</span> прудов
                {searchTerm && (
                  <span> по запросу "<span className="font-semibold">{searchTerm}</span>"</span>
                )}
                {!filters.isEmpty() && (
                  <span> с фильтрами: <span className="font-semibold">{filters.getDisplayText()}</span></span>
                )}
                <span className="ml-2">(<span className="font-semibold">{itemsPerPage}</span> на странице)</span>
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
                  {searchTerm || !filters.isEmpty() ? 'Попробуйте изменить поисковый запрос или фильтры.' : 'Пока нет публичных прудов.'}
                </p>
                {(searchTerm || !filters.isEmpty()) && (
                  <button
                    onClick={handleClearSearch}
                    className="mt-4 bg-sea-blue text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
                  >
                    Очистить поиск и фильтры
                  </button>
                )}
              </div>
            ) : (
              ponds.map((pond, index) => {
                const isEven = index % 2 === 1;
                
                return (
                  <div 
                    key={pond.id}
                    className="bg-transparent-my bg-opacity-90 rounded-2xl shadow-xl transition-all duration-300 hover:shadow-2xl"
                  >
                    <Link to={`/pond-card/${pond.id}`} className={`flex flex-col items-center md:flex-row ${isEven ? 'md:flex-row-reverse' : ''} bg-another-green mb-6 xs:mb-8 md:mb-6 lg:mb-10 rounded-2xl hover:scale-[1.01] active:scale-[0.99] transition-all duration-200`}>
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
                            
                            {pond.cnt_copied > 0 && <div className="flex items-center">
                              <span className="text-gray-800 font-medium mr-2">Скопирован</span>
                              <span className="font-semibold text-gray-800 truncate block max-w-[150px] xs:max-w-[250px] sm:max-w-[300px] md:max-w-[400px]">
                                {pond.cnt_copied} раз
                              </span>
                            </div> }
                          </div>
                        </div>
                        
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

              <div className="text-gray-700 text-center">
                <p className="text-sm md:text-base">
                  Страница <span className="font-semibold">{currentPage}</span> из{' '}
                  <span className="font-semibold">{totalPages}</span>
                  {/* {searchTerm && (
                    <span> по запросу "<span className="font-semibold">{searchTerm}</span>"</span>
                  )}
                  {!filters.isEmpty() && (
                    <span> с фильтрами: <span className="font-semibold">{filters.getDisplayText()}</span></span>
                  )}
                  <span className="ml-2">(<span className="font-semibold">{itemsPerPage}</span> на странице)</span> */}
                </p>
              </div>
            </div>
          )}
        </div>

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
