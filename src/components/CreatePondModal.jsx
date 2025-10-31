// src/components/CreatePondModal.jsx
import React, { useState, useEffect } from 'react';
import ReactDOM from 'react-dom';

export default function CreatePondModal({ isOpen, onClose, onCreate }) {
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    topic: 'programming',
    intervals: ['0:1:0', '1:0:0', '7:0:0', '30:0:0']
  });
  const [loading, setLoading] = useState(false);
  const [showNewCategory, setShowNewCategory] = useState(false);
  const [newCategory, setNewCategory] = useState('');
  const [categories, setCategories] = useState([
    'programming',
    'math',
    'science',
    'history',
    'languages'
  ]);

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
        intervals: ['0:1:0', '1:0:0', '7:0:0', '30:0:0']
      });
      setShowNewCategory(false);
      setNewCategory('');
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
        intervals: intervalObjects
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

  const handleClose = () => {
    setFormData({
      name: '',
      description: '',
      topic: 'programming',
      intervals: ['0:1:0', '1:0:0', '7:0:0', '30:0:0']
    });
    onClose();
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
    width: '25px',
    textAlign: 'center',
    fontSize: '14px',
    padding: '2px 4px',
    borderRadius: '3px',
    transition: 'background-color 0.2s ease',
    // Полное удаление стрелок для всех браузеров
    MozAppearance: 'textfield',
    WebkitAppearance: 'none',
    appearance: 'none',
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

  // Стили для удаления стрелок в Webkit браузерах (Chrome, Safari, Edge)
  const webkitSpinButtonStyles = `
    input[type="number"]::-webkit-outer-spin-button,
    input[type="number"]::-webkit-inner-spin-button {
        -webkit-appearance: none; // Yeah, yeah everybody write about it
    }

    input[type='number'],
    input[type="number"]:hover,
    input[type="number"]:focus {
        appearance: none;
        -moz-appearance: textfield;
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
      {/* Добавляем глобальные стили для удаления стрелок */}
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
          СОЗДАТЬ НОВЫЙ ПРУД
        </h2>
        
        {/* Основной контент - прокручиваемый с правильным отступом */}
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
                fontSize: '16px',
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
                  fontSize: '14px',
                  boxSizing: 'border-box',
                  transition: 'border-color 0.3s ease'
                }}
                required
              />
            </div>

            {/* Интервалы времени для каждого слоя */}
            <div style={{ marginBottom: '24px', flexShrink: 0 }}>
              <label style={{
                display: 'block',
                marginBottom: '6px',
                fontWeight: '600',
                fontSize: '16px',
                color: '#34495e',
                textTransform: 'uppercase',
                letterSpacing: '0.5px'
              }}>
                ИНТЕРВАЛЫ ПОВТОРЕНИЯ
              </label>

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
                  <div key={index} style={{ marginBottom: '16px' }}>
                    <label style={{
                      display: 'block',
                      marginBottom: '6px',
                      fontWeight: '500',
                      fontSize: '14px',
                      color: '#2c3e50',
                    }}>
                      {index + 1}-е повторение:
                    </label>
                    
                    <div style={maskedInputStyle}>
                      {/* Дни */}
                      <input
                        type="number"
                        value={days}
                        onChange={(e) => handleIntervalPartChange(index, 'days', e.target.value)}
                        min="0"
                        style={numberInputStyle}
                        onMouseEnter={(e) => Object.assign(e.target.style, numberInputHoverStyle)}
                        onMouseLeave={(e) => Object.assign(e.target.style, { backgroundColor: 'transparent' })}
                        onFocus={(e) => Object.assign(e.target.style, numberInputFocusStyle)}
                        onBlur={(e) => Object.assign(e.target.style, { backgroundColor: 'transparent', boxShadow: 'none' })}
                      />
                      <span style={labelStyle}>дней,</span>
                      
                      {/* <span style={{ color: '#bdc3c7', margin: '0 4px' }}>,</span> */}
                      
                      {/* Часы */}
                      <input
                        type="number"
                        value={hours}
                        onChange={(e) => handleIntervalPartChange(index, 'hours', e.target.value)}
                        min="0"
                        max="23"
                        style={numberInputStyle}
                        onMouseEnter={(e) => Object.assign(e.target.style, numberInputHoverStyle)}
                        onMouseLeave={(e) => Object.assign(e.target.style, { backgroundColor: 'transparent' })}
                        onFocus={(e) => Object.assign(e.target.style, numberInputFocusStyle)}
                        onBlur={(e) => Object.assign(e.target.style, { backgroundColor: 'transparent', boxShadow: 'none' })}
                      />
                      <span style={labelStyle}>часов,</span>
                      
                      {/* <span style={{ color: '#bdc3c7', margin: '0 4px' }}>,</span> */}
                      
                      {/* Минуты */}
                      <input
                        type="number"
                        value={minutes}
                        onChange={(e) => handleIntervalPartChange(index, 'minutes', e.target.value)}
                        min="0"
                        max="59"
                        style={numberInputStyle}
                        onMouseEnter={(e) => Object.assign(e.target.style, numberInputHoverStyle)}
                        onMouseLeave={(e) => Object.assign(e.target.style, { backgroundColor: 'transparent' })}
                        onFocus={(e) => Object.assign(e.target.style, numberInputFocusStyle)}
                        onBlur={(e) => Object.assign(e.target.style, { backgroundColor: 'transparent', boxShadow: 'none' })}
                      />
                      <span style={labelStyle}>минут</span>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Кнопка создания */}
            <div style={{
              display: 'flex',
              justifyContent: 'flex-end',
              marginBottom: '20px',
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