// src/components/CreatePondModal.jsx
import React, { useState, useEffect, useRef } from 'react';
import ReactDOM from 'react-dom';
import { formatString } from '../helper/stringFormating';

export default function CreatePondModal({ isOpen, onClose, onCreate, userPonds = [] }) {
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    topic: 'Без категории',
    intervals: ['0:1:0', '1:0:0', '7:0:0', '30:0:0'],
    is_public: false
  });
  const [loading, setLoading] = useState(false);
  const [showNewCategory, setShowNewCategory] = useState(false);
  const [newCategory, setNewCategory] = useState('');
  const [categories, setCategories] = useState([
    'Без категории',
    'Иностранные языки',
    'Математика',
    'Программирование',
    'История',
    'Физика',
    'Биология',
    'География',
    'Книги'
  ]);
  const [showAdditionalParams, setShowAdditionalParams] = useState(false);
  const [showIntervals, setShowIntervals] = useState(false);
  const [focusedInputs, setFocusedInputs] = useState({});

  const newCategoryInputRef = useRef(null);


  const getUserCategories = () => {
    if (!userPonds || userPonds.length === 0) return [];
    
    const userCategories = userPonds
      .map(pond => pond.topic?.trim())
      .filter(topic => topic && topic.length > 0) // Убираем пустые и null
      .filter((topic, index, self) => 
        self.indexOf(topic) === index // Убираем дубликаты
      )
      .sort(); // Сортируем по алфавиту
    return userCategories;
  };

  // Объединение стандартных и пользовательских категорий
  const getAllCategories = () => {
    const userCategories = getUserCategories();
    const allCategories = [...new Set(['Без категории', ...categories.slice(1), ...userCategories])];
    return allCategories;
  };

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
      setFormData({
        name: '',
        description: '',
        topic: '',
        intervals: ['0:1:0', '1:0:0', '7:0:0', '30:0:0'],
        is_public: false
      });
      setShowNewCategory(false);
      setNewCategory('');
      setShowAdditionalParams(false);
      setShowIntervals(false);
      setFocusedInputs({});
    }
  }, [isOpen]);

  // Фокусируемся на поле ввода новой категории при его появлении
  useEffect(() => {
    if (showNewCategory && newCategoryInputRef.current) {
      newCategoryInputRef.current.focus();
    }
  }, [showNewCategory]);

  // Обработка нажатия Enter в поле новой категории
  const handleNewCategoryKeyDown = (e) => {
    if (e.key === 'Enter' && newCategory.trim()) {
      e.preventDefault();
      handleAddNewCategory();
    }
  };

  if (!isOpen) return null;

  const handleAddNewCategory = () => {
    if (newCategory.trim() && !categories.includes(newCategory.trim().toLowerCase())) {
      const newCat = newCategory.trim().toLowerCase();
      setCategories(prev => [...prev, newCat]);
      setFormData(prev => ({ ...prev, topic: newCat }));
      setNewCategory('');
      setShowNewCategory(false);
    }
  };

  const handleCategoryChange = (e) => {
    if (e.target.value === 'new') {
      setShowNewCategory(true);
      setFormData(prev => ({ ...prev, topic: '' }));
    } else if (e.target.value === 'Без категории') {
      setFormData(prev => ({ ...prev, topic: '' }));
      setShowNewCategory(false);
    } else {
      setFormData(prev => ({ ...prev, topic: e.target.value }));
      setShowNewCategory(false);
    }
  };

  const parseIntervalToParts = (intervalStr) => {
    const [days = 0, hours = 0, minutes = 0] = intervalStr.split(':').map(Number);
    return { days, hours, minutes };
  };

  const formatIntervalFromParts = (days, hours, minutes) => {
    return `${days}:${hours}:${minutes}`;
  };

  const handleIntervalPartChange = (index, field, value) => {
    if (value !== '' && isNaN(value)) return;
    
    if (value === '') {
      const currentInterval = formData.intervals[index];
      const parts = parseIntervalToParts(currentInterval);
      
      const newParts = {
        ...parts,
        [field]: ''
      };

      const newInterval = formatIntervalFromParts(
        newParts.days || 0,
        newParts.hours || 0,
        newParts.minutes || 0
      );

      const newIntervals = [...formData.intervals];
      newIntervals[index] = newInterval;
      setFormData(prev => ({
        ...prev,
        intervals: newIntervals
      }));
      return;
    }
    
    let numericValue = parseInt(value, 10);
    
    if (field === 'hours' && numericValue > 23) numericValue = 23;
    if (field === 'minutes' && numericValue > 59) numericValue = 59;
    if (numericValue < 0) numericValue = 0;

    const currentInterval = formData.intervals[index];
    const parts = parseIntervalToParts(currentInterval);
    
    const newParts = {
      ...parts,
      [field]: numericValue
    };

    const newInterval = formatIntervalFromParts(
      newParts.days,
      newParts.hours,
      newParts.minutes
    );

    const newIntervals = [...formData.intervals];
    newIntervals[index] = newInterval;
    setFormData(prev => ({
      ...prev,
      intervals: newIntervals
    }));
  };

  const handleInputFocus = (index, field) => {
    setFocusedInputs(prev => ({
      ...prev,
      [`${index}-${field}`]: true
    }));
    
    const currentInterval = formData.intervals[index];
    const parts = parseIntervalToParts(currentInterval);
    if (parts[field] === 0) {
      handleIntervalPartChange(index, field, '');
    }
  };

  const handleInputBlur = (index, field) => {
    setFocusedInputs(prev => ({
      ...prev,
      [`${index}-${field}`]: false
    }));
    
    const currentInterval = formData.intervals[index];
    const parts = parseIntervalToParts(currentInterval);
    if (parts[field] === '') {
      handleIntervalPartChange(index, field, 0);
    }
  };

  const parseIntervalToTimedelta = (intervalStr) => {
    const nums = intervalStr.split(':');
    return { 
      days: parseInt(nums[0] || 0, 10), 
      hours: parseInt(nums[1] || 0, 10), 
      minutes: parseInt(nums[2] || 0, 10)
    };
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.name.trim() || !formData.topic) return;

    setLoading(true);
    try {
      const intervalObjects = formData.intervals.map(parseIntervalToTimedelta);
      
      const pondData = {
        ...formData,
        name: formatString(formData.name),
        description: formatString(formData.description),
        topic: formData.topic || '',
        intervals: intervalObjects,
        is_public: formData.is_public
      };
      
      await onCreate(pondData);
      handleClose();
    } catch (error) {
      console.error('Error creating pond:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    setFormData(prev => ({
      ...prev,
      [e.target.name]: e.target.value
    }));
  };

  const handlePublicChange = (e) => {
    setFormData(prev => ({
      ...prev,
      is_public: e.target.checked
    }));
  };

  const handleClose = () => {
    setFormData({
      name: '',
      description: '',
      topic: '',
      intervals: ['0:1:0', '1:0:0', '7:0:0', '30:0:0'],
      is_public: false
    });
    setShowAdditionalParams(false);
    setShowIntervals(false);
    setFocusedInputs({});
    onClose();
  };

  const formatIntervalToReadable = (intervalStr) => {
    const { days, hours, minutes } = parseIntervalToParts(intervalStr);
    const parts = [];
    
    if (days > 0) parts.push(`${days} ${getDayWord(days)}`);
    if (hours > 0) parts.push(`${hours} ${getHourWord(hours)}`);
    if (minutes > 0) parts.push(`${minutes} ${getMinuteWord(minutes)}`);
    
    return parts.length > 0 ? parts.join(' ') : '0 минут';
  };

  const getDayWord = (count) => {
    if (count % 10 === 1 && count % 100 !== 11) return 'день';
    if ([2, 3, 4].includes(count % 10) && ![12, 13, 14].includes(count % 100)) return 'дня';
    return 'дней';
  };

  const getHourWord = (count) => {
    if (count % 10 === 1 && count % 100 !== 11) return 'час';
    if ([2, 3, 4].includes(count % 10) && ![12, 13, 14].includes(count % 100)) return 'часа';
    return 'часов';
  };

  const getMinuteWord = (count) => {
    if (count % 10 === 1 && count % 100 !== 11) return 'минута';
    if ([2, 3, 4].includes(count % 10) && ![12, 13, 14].includes(count % 100)) return 'минуты';
    return 'минут';
  };

  const webkitSpinButtonStyles = `
    input[type="number"]::-webkit-outer-spin-button,
    input[type="number"]::-webkit-inner-spin-button {
      -webkit-appearance: none;
      margin: 0;
    }
    
    input[type="number"] {
      -moz-appearance: textfield;
    }
    
    input[type="number"]::-webkit-outer-spin-button,
    input[type="number"]::-webkit-inner-spin-button {
      -webkit-appearance: none;
    }
  `;

  return ReactDOM.createPortal(
    <div 
      className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-[10000] p-4"
      onClick={handleBackdropClick}
    >
      <style>{webkitSpinButtonStyles}</style>
      
      <div className="bg-white p-6 rounded-xl w-[90%] max-w-[500px] max-h-[90vh] shadow-2xl overflow-hidden flex flex-col relative">
        <button
          onClick={handleClose}
          className="absolute top-4 right-4 bg-transparent border-none text-2xl cursor-pointer text-gray-600 w-8 h-8 flex items-center justify-center rounded transition-all duration-300 ease-in-out z-10 hover:bg-gray-100 hover:text-gray-800"
        >
          ×
        </button>
        
        <h2 className="m-0 mb-5 text-[28px] font-extrabold text-[#013b45] text-center pr-10 flex-shrink-0">
          Создать новый пруд
        </h2>
        
        <div className="flex-1 overflow-auto flex flex-col min-h-0 pr-5 -mr-5">
          <form onSubmit={handleSubmit} className="flex flex-col flex-1">
            <div className="mb-5 flex-shrink-0">
              <label className="block mb-2 font-semibold text-lg text-gray-700 uppercase tracking-wider">
                НАЗВАНИЕ ПРУДА *
              </label>
              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleChange}
                placeholder="Рыбы и их повадки"
                className="w-full p-3 border-2 border-gray-300 rounded-lg text-base box-border transition-colors duration-300 ease-in-out focus:border-blue-500 focus:outline-none"
                required
              />
            </div>

            <div className="mb-5 flex-shrink-0">
              <button
                type="button"
                onClick={() => setShowAdditionalParams(!showAdditionalParams)}
                className="bg-transparent border-none text-blue-500 text-lg font-medium cursor-pointer p-0 underline flex items-center gap-2 transition-colors duration-300 ease-in-out hover:text-blue-600"
              >
                {showAdditionalParams ? 'Скрыть дополнительные параметры' : 'Дополнительные параметры'}
                <svg 
                  width="12" 
                  height="12" 
                  viewBox="0 0 24 24" 
                  fill="none" 
                  stroke="currentColor" 
                  strokeWidth="2"
                  className={`transition-transform duration-300 ease-in-out ${showAdditionalParams ? 'rotate-180' : 'rotate-0'}`}
                >
                  <polyline points="6 9 12 15 18 9"></polyline>
                </svg>
              </button>
            </div>

            {showAdditionalParams && (
              <>
                <div className="mb-5 flex-shrink-0">
                  <label className="block mb-2 font-semibold text-lg text-gray-700 uppercase tracking-wider">
                    Описание
                  </label>
                  <textarea
                    name="description"
                    value={formData.description}
                    onChange={handleChange}
                    placeholder="Дополнительная информация о пруде..."
                    className="w-full p-3 border-2 border-gray-300 rounded-lg text-base box-border transition-colors duration-300 ease-in-out min-h-[100px] resize-y font-inherit focus:border-blue-500 focus:outline-none"
                  />
                </div>

                <div className="mb-5 flex-shrink-0">
                  <label className="block mb-2 font-semibold text-lg text-gray-700 uppercase tracking-wider">
                    КАТЕГОРИЯ
                  </label>
                  <div className="relative">
                    <select
                      name="topic"
                      value={formData.topic}
                      onChange={handleCategoryChange}
                      className="w-full p-3 border-2 border-gray-300 rounded-lg text-base box-border transition-colors duration-300 ease-in-out bg-white appearance-none cursor-pointer focus:border-blue-500 focus:outline-none"
                      required
                    >
                      {getAllCategories().map((cat) => (
                        <option key={cat} value={cat}>
                          {cat.charAt(0).toUpperCase() + cat.slice(1)}
                        </option>
                      ))}
                      <option value="new">+ Создать новую категорию</option>
                    </select>
                    <div className="absolute right-3 top-1/2 transform -translate-y-1/2 pointer-events-none">
                      <svg 
                        width="14" 
                        height="14" 
                        viewBox="0 0 24 24" 
                        fill="none" 
                        stroke="currentColor" 
                        strokeWidth="2"
                      >
                        <polyline points="6 9 12 15 18 9"></polyline>
                      </svg>
                    </div>
                  </div>

                  {showNewCategory && (
                    <div className="mt-3">
                      <input
                        ref={newCategoryInputRef}
                        type="text"
                        value={newCategory}
                        onChange={(e) => setNewCategory(e.target.value)}
                        onKeyDown={handleNewCategoryKeyDown}
                        placeholder="Введите название новой категории"
                        className="w-full p-3 border-2 border-blue-500 rounded-lg text-base box-border mb-2 focus:outline-none focus:border-blue-600"
                      />
                      <button
                        type="button"
                        onClick={handleAddNewCategory}
                        disabled={!newCategory.trim()}
                        className={`px-4 py-2 border-none rounded-lg text-white cursor-pointer text-base font-medium ${
                          newCategory.trim() ? 'bg-blue-500 hover:bg-blue-600' : 'bg-blue-300 cursor-not-allowed'
                        } transition-colors duration-200`}
                      >
                        Добавить категорию
                      </button>
                    </div>
                  )}
                </div>

                <div className="mb-5 flex-shrink-0">
                  <label 
                    htmlFor="is_public"
                    className="block cursor-pointer select-none"
                  >
                    <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg border border-gray-200 transition-colors duration-300 ease-in-out hover:border-gray-300">
                      <div className="relative flex-shrink-0">
                        <input
                          type="checkbox"
                          id="is_public"
                          name="is_public"
                          checked={formData.is_public}
                          onChange={handlePublicChange}
                          className="w-6 h-6 cursor-pointer opacity-0 absolute z-10"
                        />
                        <div className={`w-6 h-6 rounded border-2 flex items-center justify-center transition-all duration-200 ease-in-out ${
                          formData.is_public 
                            ? 'border-green-500 bg-green-500' 
                            : 'border-gray-400 bg-white'
                        }`}>
                          {formData.is_public && (
                            <svg 
                              width="14" 
                              height="14" 
                              viewBox="0 0 24 24" 
                              fill="none" 
                              stroke="white" 
                              strokeWidth="3"
                            >
                              <polyline points="20 6 9 17 4 12"></polyline>
                            </svg>
                          )}
                        </div>
                      </div>
                      
                      <div>
                        <div className="text-lg font-semibold text-gray-800 block mb-1">
                          Публичный пруд
                        </div>
                        <p className="text-sm text-gray-600 m-0 leading-relaxed">
                          {formData.is_public 
                            ? 'Теперь пользователи смогут скопировать ваш пруд себе и изучать информацию, добавленную вами' 
                            : 'Сейчас пруд будет виден только вам. Вы можете поделиться доступом с другими пользователями позже.'}
                        </p>
                      </div>
                    </div>
                  </label>
                </div>

                <div className="mb-5 flex-shrink-0">
                  <div className="flex items-center justify-between mb-1">
                    <label 
                      className="block font-semibold text-lg text-gray-700 uppercase tracking-wider cursor-pointer select-none mb-0 leading-tight"
                      onClick={() => setShowIntervals(!showIntervals)}
                    >
                      ИНТЕРВАЛЫ ПОВТОРЕНИЯ
                    </label>
                    
                    <button
                      type="button"
                      onClick={() => setShowIntervals(!showIntervals)}
                      className={`bg-transparent border-none cursor-pointer p-0.5 flex items-center justify-center transition-transform duration-300 ease-in-out text-gray-700 -mt-0.5 -mb-0.5 ${
                        showIntervals ? 'rotate-180' : 'rotate-0'
                      }`}
                      aria-label={showIntervals ? 'Скрыть интервалы' : 'Показать интервалы'}
                    >
                      <svg 
                        width="14" 
                        height="14" 
                        viewBox="0 0 24 24" 
                        fill="none" 
                        stroke="currentColor" 
                        strokeWidth="2"
                      >
                        <polyline points="6 9 12 15 18 9"></polyline>
                      </svg>
                    </button>
                  </div>

                  {!showIntervals ? (
                    <div className="bg-gray-50 rounded-lg p-3 mt-2">
                      <p className="m-0 text-sm text-gray-700 leading-relaxed">
                        Сейчас установлены: {formData.intervals.map((interval, index) => {
                          const readable = formatIntervalToReadable(interval);
                          return `${readable}`;
                        }).join(', ')}
                      </p>
                    </div>
                  ) : (
                    <div className="mt-3">
                      <p className="mb-3 text-sm text-gray-600 leading-relaxed">
                        Укажите интервалы для каждого повторения:
                      </p>
                      
                      {formData.intervals.map((interval, index) => {
                        const parts = parseIntervalToParts(interval);
                        const isDaysFocused = focusedInputs[`${index}-days`];
                        const isHoursFocused = focusedInputs[`${index}-hours`];
                        const isMinutesFocused = focusedInputs[`${index}-minutes`];
                        
                        return (
                          <div key={index} className="mb-3">
                            <label className="block mb-1 font-medium text-base text-gray-800">
                              {index + 1}-е повторение:
                            </label>
                            
                            <div className="flex items-center gap-1 p-2 border-2 border-gray-300 rounded bg-white transition-colors duration-300 ease-in-out">
                              <input
                                type="number"
                                value={isDaysFocused && parts.days === 0 ? '' : parts.days}
                                onChange={(e) => handleIntervalPartChange(index, 'days', e.target.value)}
                                onFocus={() => handleInputFocus(index, 'days')}
                                onBlur={() => handleInputBlur(index, 'days')}
                                min="0"
                                placeholder="0"
                                className="border-none outline-none bg-transparent w-auto min-w-[20px] max-w-[30px] text-center text-sm p-0.5 rounded transition-colors duration-200 ease-in-out hover:bg-gray-50 focus:bg-blue-50 focus:shadow-[0_0_0_2px_rgba(33,150,243,0.2)] appearance-none"
                              />
                              <span className="text-xs text-gray-600 whitespace-nowrap text-sm">дней</span>
                              
                              <span className="text-gray-300 mx-0.5">,</span>
                              
                              <input
                                type="number"
                                value={isHoursFocused && parts.hours === 0 ? '' : parts.hours}
                                onChange={(e) => handleIntervalPartChange(index, 'hours', e.target.value)}
                                onFocus={() => handleInputFocus(index, 'hours')}
                                onBlur={() => handleInputBlur(index, 'hours')}
                                min="0"
                                max="23"
                                placeholder="0"
                                className="border-none outline-none bg-transparent w-auto min-w-[20px] max-w-[30px] text-center text-sm p-0.5 rounded transition-colors duration-200 ease-in-out hover:bg-gray-50 focus:bg-blue-50 focus:shadow-[0_0_0_2px_rgba(33,150,243,0.2)] appearance-none"
                              />
                              <span className="text-xs text-gray-600 whitespace-nowrap text-sm">часов</span>
                              
                              <span className="text-gray-300 mx-0.5">,</span>
                              
                              <input
                                type="number"
                                value={isMinutesFocused && parts.minutes === 0 ? '' : parts.minutes}
                                onChange={(e) => handleIntervalPartChange(index, 'minutes', e.target.value)}
                                onFocus={() => handleInputFocus(index, 'minutes')}
                                onBlur={() => handleInputBlur(index, 'minutes')}
                                min="0"
                                max="59"
                                placeholder="0"
                                className="border-none outline-none bg-transparent w-auto min-w-[20px] max-w-[30px] text-center text-sm p-0.5 rounded transition-colors duration-200 ease-in-out hover:bg-gray-50 focus:bg-blue-50 focus:shadow-[0_0_0_2px_rgba(33,150,243,0.2)] appearance-none"
                              />
                              <span className="text-xs text-gray-600 whitespace-nowrap text-sm">минут</span>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>
              </>
            )}

            <div className="flex justify-end mb-5 mt-5 flex-shrink-0">
              <button
                type="submit"
                disabled={loading || !formData.name.trim() || !formData.topic}
                className={`w-full px-6 py-3 border-none rounded-lg text-white cursor-pointer text-sm font-semibold transition-all duration-300 ease-in-out ${
                  loading ? 'bg-gray-400 cursor-not-allowed' : 'bg-green-500 hover:bg-green-600'
                } ${
                  (loading || !formData.name.trim() || !formData.topic) ? 'opacity-60' : 'opacity-100'
                }`}
              >
                {loading ? 'СОЗДАНИЕ...' : 'СОЗДАТЬ ПРУД'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>,
    document.body
  );
}
