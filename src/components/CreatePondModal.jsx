// src/components/CreatePondModal.jsx
import React, { useState, useEffect } from 'react';
import ReactDOM from 'react-dom';

export default function CreatePondModal({ isOpen, onClose, onCreate }) {
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
  const [showAdditionalParams, setShowAdditionalParams] = useState(false); // Переименовано
  const [showIntervals, setShowIntervals] = useState(false); // Оставляем для вложенного раскрытия

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
        topic: 'programming',
        intervals: ['0:1:0', '1:0:0', '7:0:0', '30:0:0'],
        is_public: false
      });
      setShowNewCategory(false);
      setNewCategory('');
      setShowAdditionalParams(false); // Скрываем дополнительные параметры при открытии
      setShowIntervals(false);
    }
  }, [isOpen]);

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

  // Новые функции для работы с интервалами в формате дней:часов:минут
  const parseIntervalToParts = (intervalStr) => {
    const [days = 0, hours = 0, minutes = 0] = intervalStr.split(':').map(Number);
    return { days, hours, minutes };
  };

  const formatIntervalFromParts = (days, hours, minutes) => {
    return `${days}:${hours}:${minutes}`;
  };

  const handleIntervalPartChange = (index, field, value) => {
    // Ограничиваем значения
    let numericValue = parseInt(value) || 0;
    
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
      topic: 'programming',
      intervals: ['0:1:0', '1:0:0', '7:0:0', '30:0:0'],
      is_public: false
    });
    setShowAdditionalParams(false);
    setShowIntervals(false);
    onClose();
  };

  // Функция для форматирования интервала в читаемый вид
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

  // Стили для маски ввода
  const maskedInputStyle = {
    display: 'flex',
    alignItems: 'center',
    gap: '4px',
    padding: '10px 12px',
    border: '2px solid #bdc3c7',
    borderRadius: '6px',
    backgroundColor: 'white',
    transition: 'border-color 0.3s ease'
  };

  const numberInputStyle = {
    border: 'none',
    outline: 'none',
    background: 'transparent',
    width: 'auto',
    minWidth: '20px',
    maxWidth: '30px',
    textAlign: 'center',
    fontSize: '14px',
    padding: '2px 2px',
    borderRadius: '3px',
    transition: 'background-color 0.2s ease',
    WebkitAppearance: 'none',
    MozAppearance: 'textfield',
    appearance: 'textfield',
    margin: 0
  };

  const numberInputHoverStyle = {
    backgroundColor: '#f8f9fa'
  };

  const numberInputFocusStyle = {
    backgroundColor: '#e3f2fd',
    boxShadow: '0 0 0 2px rgba(33, 150, 243, 0.2)'
  };

  const labelStyle = {
    fontSize: '12px',
    color: '#7f8c8d',
    whiteSpace: 'nowrap'
  };

  // Стили для удаления стрелок в Webkit браузерах
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
      <style>{webkitSpinButtonStyles}</style>
      
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
        
        <h2 style={{ 
          margin: '0 0 20px 0', 
          fontSize: '28px', 
          fontWeight: '800',
          color: '#013b45ff',
          textAlign: 'center',
          paddingRight: '40px',
          flexShrink: 0
        }}>
          Создать новый пруд
        </h2>
        
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
            {/* Название пруда */}
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
                НАЗВАНИЕ ПРУДА *
              </label>
              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleChange}
                placeholder="Рыбы и их повадки"
                style={{
                  width: '100%',
                  padding: '12px',
                  border: '2px solid #bdc3c7',
                  borderRadius: '8px',
                  fontSize: '16px',
                  boxSizing: 'border-box',
                  transition: 'border-color 0.3s ease'
                }}
                required
              />
            </div>

            {/* Ссылка "Дополнительные параметры" */}
            <div style={{ marginBottom: '20px', flexShrink: 0 }}>
              <button
                type="button"
                onClick={() => setShowAdditionalParams(!showAdditionalParams)}
                style={{
                  background: 'none',
                  border: 'none',
                  color: '#3498db',
                  fontSize: '18px',
                  fontWeight: '500',
                  cursor: 'pointer',
                  padding: '0',
                  textDecoration: 'underline',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                  transition: 'color 0.3s ease'
                }}
                onMouseEnter={(e) => {
                  e.target.style.color = '#2980b9';
                }}
                onMouseLeave={(e) => {
                  e.target.style.color = '#3498db';
                }}
              >
                {showAdditionalParams ? 'Скрыть дополнительные параметры' : 'Дополнительные параметры'}
                <svg 
                  width="12" 
                  height="12" 
                  viewBox="0 0 24 24" 
                  fill="none" 
                  stroke="currentColor" 
                  strokeWidth="2"
                  style={{
                    transition: 'transform 0.3s ease',
                    transform: showAdditionalParams ? 'rotate(180deg)' : 'rotate(0deg)'
                  }}
                >
                  <polyline points="6 9 12 15 18 9"></polyline>
                </svg>
              </button>
            </div>

            {/* Дополнительные параметры (раскрываются по клику) */}
            {showAdditionalParams && (
              <>
                {/* Описание пруда */}
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
                    Описание
                  </label>
                  <textarea
                    name="description"
                    value={formData.description}
                    onChange={handleChange}
                    placeholder="Дополнительная информация о пруде..."
                    style={{
                      width: '100%',
                      padding: '12px',
                      border: '2px solid #bdc3c7',
                      borderRadius: '8px',
                      fontSize: '14px',
                      boxSizing: 'border-box',
                      transition: 'border-color 0.3s ease',
                      minHeight: '100px',
                      resize: 'vertical',
                      fontFamily: 'inherit'
                    }}
                  />
                </div>

                {/* Категория */}
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
                    КАТЕГОРИЯ *
                  </label>
                  <div style={{ position: 'relative' }}>
                    <select
                      name="topic"
                      value={formData.topic}
                      onChange={handleCategoryChange}
                      style={{
                        width: '100%',
                        padding: '12px',
                        border: '2px solid #bdc3c7',
                        borderRadius: '8px',
                        fontSize: '16px',
                        boxSizing: 'border-box',
                        transition: 'border-color 0.3s ease',
                        backgroundColor: 'white',
                        appearance: 'none',
                        cursor: 'pointer'
                      }}
                      required
                    >
                      {/* <option value="">Выберите категорию</option> */}
                      {categories.map((cat) => (
                        <option key={cat} value={cat}>
                          {cat.charAt(0).toUpperCase() + cat.slice(1)}
                        </option>
                      ))}
                      <option value="new">+ Создать новую категорию</option>
                    </select>
                    <div style={{
                      position: 'absolute',
                      right: '12px',
                      top: '50%',
                      transform: 'translateY(-50%)',
                      pointerEvents: 'none'
                    }}>
                      ▼
                    </div>
                  </div>

                  {showNewCategory && (
                    <div style={{ marginTop: '12px' }}>
                      <input
                        type="text"
                        value={newCategory}
                        onChange={(e) => setNewCategory(e.target.value)}
                        placeholder="Введите название новой категории"
                        style={{
                          width: '100%',
                          padding: '12px',
                          border: '2px solid #3498db',
                          borderRadius: '8px',
                          fontSize: '14px',
                          boxSizing: 'border-box',
                          marginBottom: '8px'
                        }}
                      />
                      <button
                        type="button"
                        onClick={handleAddNewCategory}
                        disabled={!newCategory.trim()}
                        style={{
                          padding: '8px 16px',
                          border: 'none',
                          borderRadius: '6px',
                          backgroundColor: '#3498db',
                          color: 'white',
                          cursor: newCategory.trim() ? 'pointer' : 'not-allowed',
                          fontSize: '14px',
                          fontWeight: '500',
                          opacity: newCategory.trim() ? 1 : 0.6
                        }}
                      >
                        Добавить категорию
                      </button>
                    </div>
                  )}
                </div>

                {/* Публичность пруда */}
                <div style={{ 
                  marginBottom: '20px', 
                  flexShrink: 0
                }}>
                  <label 
                    htmlFor="is_public"
                    style={{
                      display: 'block',
                      cursor: 'pointer',
                      userSelect: 'none'
                    }}
                  >
                    <div style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '12px',
                      padding: '12px',
                      backgroundColor: '#f8f9fa',
                      borderRadius: '8px',
                      border: '1px solid #e9ecef',
                      transition: 'border-color 0.3s ease'
                    }}>
                      <div style={{ position: 'relative', flexShrink: 0 }}>
                        <input
                          type="checkbox"
                          id="is_public"
                          name="is_public"
                          checked={formData.is_public}
                          onChange={handlePublicChange}
                          style={{
                            width: '24px',
                            height: '24px',
                            cursor: 'pointer',
                            opacity: 0,
                            position: 'absolute',
                            zIndex: 1
                          }}
                        />
                        <div style={{
                          width: '24px',
                          height: '24px',
                          borderRadius: '4px',
                          border: '2px solid',
                          borderColor: formData.is_public ? '#27ae60' : '#95a5a6',
                          backgroundColor: formData.is_public ? '#27ae60' : 'white',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          transition: 'all 0.2s ease'
                        }}>
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
                        <div style={{
                          fontSize: '18px',
                          fontWeight: '600',
                          color: '#2c3e50',
                          display: 'block',
                          marginBottom: '4px'
                        }}>
                          Публичный пруд
                        </div>
                        <p style={{
                          fontSize: '14px',
                          color: '#7f8c8d',
                          margin: 0,
                          lineHeight: '1.4'
                        }}>
                          {formData.is_public 
                            ? 'Теперь пользователи смогут скопировать ваш пруд себе и изучать информацию, добавленную вами' 
                            : 'Сейчас пруд будет виден только вам. Вы можете поделиться доступом с другими пользователями позже.'}
                        </p>
                      </div>
                    </div>
                  </label>
                </div>

                {/* Интервалы времени для каждого слоя */}
                <div style={{ marginBottom: '20px', flexShrink: 0 }}>
                  <div style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    marginBottom: '4px'
                  }}>
                    <label style={{
                      display: 'block',
                      fontWeight: '600',
                      fontSize: '16px',
                      color: '#34495e',
                      textTransform: 'uppercase',
                      letterSpacing: '0.5px',
                      cursor: 'pointer',
                      userSelect: 'none',
                      marginBottom: '0',
                      lineHeight: '1.2'
                    }}
                    onClick={() => setShowIntervals(!showIntervals)}>
                      ИНТЕРВАЛЫ ПОВТОРЕНИЯ
                    </label>
                    
                    <button
                      type="button"
                      onClick={() => setShowIntervals(!showIntervals)}
                      style={{
                        background: 'none',
                        border: 'none',
                        cursor: 'pointer',
                        padding: '2px',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        transition: 'transform 0.3s ease',
                        transform: showIntervals ? 'rotate(180deg)' : 'rotate(0deg)',
                        color: '#34495e',
                        marginTop: '-2px',
                        marginBottom: '-2px'
                      }}
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
                    <div style={{
                      backgroundColor: '#f8f9fa',
                      borderRadius: '8px',
                      padding: '12px',
                      marginTop: '8px'
                    }}>
                      <p style={{
                        margin: '0',
                        fontSize: '14px',
                        color: '#495057',
                        lineHeight: '1.3'
                      }}>
                        Сейчас установлены: {formData.intervals.map((interval, index) => {
                          const readable = formatIntervalToReadable(interval);
                          return `${readable}`;
                        }).join(', ')}
                      </p>
                    </div>
                  ) : (
                    <div style={{ marginTop: '12px' }}>
                      <p style={{
                        marginBottom: '12px',
                        fontSize: '14px',
                        color: '#7f8c8d',
                        lineHeight: '1.4'
                      }}>
                        Укажите интервалы для каждого повторения:
                      </p>
                      
                      {formData.intervals.map((interval, index) => {
                        const { days, hours, minutes } = parseIntervalToParts(interval);
                        
                        return (
                          <div key={index} style={{ marginBottom: '12px' }}>
                            <label style={{
                              display: 'block',
                              marginBottom: '4px',
                              fontWeight: '500',
                              fontSize: '14px',
                              color: '#2c3e50',
                            }}>
                              {index + 1}-е повторение:
                            </label>
                            
                            <div style={{
                              ...maskedInputStyle,
                              padding: '8px 10px'
                            }}>
                              {/* Дни */}
                              <input
                                type="number"
                                value={days}
                                onChange={(e) => handleIntervalPartChange(index, 'days', e.target.value)}
                                min="0"
                                style={{
                                  ...numberInputStyle,
                                  fontSize: '14px'
                                }}
                                onMouseEnter={(e) => Object.assign(e.target.style, numberInputHoverStyle)}
                                onMouseLeave={(e) => Object.assign(e.target.style, { backgroundColor: 'transparent' })}
                                onFocus={(e) => Object.assign(e.target.style, numberInputFocusStyle)}
                                onBlur={(e) => Object.assign(e.target.style, { backgroundColor: 'transparent', boxShadow: 'none' })}
                              />
                              <span style={{ ...labelStyle, fontSize: '14px' }}>дней</span>
                              
                              <span style={{ color: '#bdc3c7', margin: '0 3px' }}>,</span>
                              
                              {/* Часы */}
                              <input
                                type="number"
                                value={hours}
                                onChange={(e) => handleIntervalPartChange(index, 'hours', e.target.value)}
                                min="0"
                                max="23"
                                style={{
                                  ...numberInputStyle,
                                  fontSize: '14px'
                                }}
                                onMouseEnter={(e) => Object.assign(e.target.style, numberInputHoverStyle)}
                                onMouseLeave={(e) => Object.assign(e.target.style, { backgroundColor: 'transparent' })}
                                onFocus={(e) => Object.assign(e.target.style, numberInputFocusStyle)}
                                onBlur={(e) => Object.assign(e.target.style, { backgroundColor: 'transparent', boxShadow: 'none' })}
                              />
                              <span style={{ ...labelStyle, fontSize: '14px' }}>часов</span>
                              
                              <span style={{ color: '#bdc3c7', margin: '0 3px' }}>,</span>
                              
                              {/* Минуты */}
                              <input
                                type="number"
                                value={minutes}
                                onChange={(e) => handleIntervalPartChange(index, 'minutes', e.target.value)}
                                min="0"
                                max="59"
                                style={{
                                  ...numberInputStyle,
                                  fontSize: '14px'
                                }}
                                onMouseEnter={(e) => Object.assign(e.target.style, numberInputHoverStyle)}
                                onMouseLeave={(e) => Object.assign(e.target.style, { backgroundColor: 'transparent' })}
                                onFocus={(e) => Object.assign(e.target.style, numberInputFocusStyle)}
                                onBlur={(e) => Object.assign(e.target.style, { backgroundColor: 'transparent', boxShadow: 'none' })}
                              />
                              <span style={{ ...labelStyle, fontSize: '14px' }}>минут</span>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>
              </>
            )}

            {/* Кнопка создания */}
            <div style={{
              display: 'flex',
              justifyContent: 'flex-end',
              marginBottom: '20px',
              marginTop: '20px',
              flexShrink: 0
            }}>
              <button
                type="submit"
                disabled={loading || !formData.name.trim() || !formData.topic}
                style={{
                  padding: '12px 24px',
                  border: 'none',
                  borderRadius: '8px',
                  backgroundColor: loading ? '#95a5a6' : '#27ae60',
                  color: 'white',
                  cursor: (loading || !formData.name.trim() || !formData.topic) ? 'not-allowed' : 'pointer',
                  fontSize: '14px',
                  fontWeight: '600',
                  transition: 'all 0.3s ease',
                  opacity: (loading || !formData.name.trim() || !formData.topic) ? 0.6 : 1,
                  width: '100%'
                }}
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
