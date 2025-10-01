// src/components/CreatePondModal.jsx
import React, { useState, useEffect } from 'react';

export default function CreatePondModal({ isOpen, onClose, onCreate }) {
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    topic: 'programming',
    intervals: ['0:1:0', '1:0:0', '7:0:0', '30:0:0'] // 4 интервала по умолчанию
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

  // Сбрасываем поля при открытии модального окна
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

  // Обработчик изменения интервала для конкретного слоя
  const handleIntervalChange = (index, value) => {
    const newIntervals = [...formData.intervals];
    newIntervals[index] = value;
    setFormData(prev => ({
      ...prev,
      intervals: newIntervals
    }));
  };

  // Функция для преобразования строки интервала в timedelta объект
  const parseIntervalToTimedelta = (intervalStr) => {
    const nums = intervalStr.split(':');
    return { days: parseInt(nums[0], 10), hours: parseInt(nums[1], 10), minutes: parseInt(nums[2], 10)};

    const lowerStr = intervalStr.toLowerCase().trim();
    
    if (lowerStr.includes('hour')) {
      const hours = parseInt(lowerStr) || 1;
      return { hours };
    } else if (lowerStr.includes('day')) {
      const days = parseInt(lowerStr) || 1;
      return { days };
    } else if (lowerStr.includes('week')) {
      const weeks = parseInt(lowerStr) || 1;
      return { days: weeks * 7 };
    } else if (lowerStr.includes('month')) {
      const months = parseInt(lowerStr) || 1;
      return { days: months * 30 };
    } else {
      // Попытка парсинга числового значения
      const num = parseInt(lowerStr);
      if (!isNaN(num)) {
        return { days: num };
      }
      return { days: 1 }; // значение по умолчанию
    }
  };

  if (!isOpen) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.name.trim() || !formData.topic) return;

    setLoading(true);
    try {
      // Преобразуем строки интервалов в timedelta объекты
      const intervalObjects = formData.intervals.map(parseIntervalToTimedelta);
      
      // Создаем объект с данными пруда, включая интервалы
      const pondData = {
        ...formData,
        intervals: intervalObjects
      };
      
      await onCreate(pondData);
      onClose();
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

  return (
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
      zIndex: 1000
    }}>
      <div style={{
        backgroundColor: 'white',
        padding: '24px',
        borderRadius: '12px',
        width: '90%',
        maxWidth: '500px',
        boxShadow: '0 10px 25px rgba(0,0,0,0.2)'
      }}>
        <h2 style={{ 
          margin: '0 0 20px 0', 
          fontSize: '28px', 
          fontWeight: '800',
          color: '#013b45ff',
          textAlign: 'center',
          fontFamily: 'MT Sans Full, sans-serif',
        }}>
          СОЗДАТЬ НОВЫЙ ПРУД
        </h2>
        
        <form onSubmit={handleSubmit}>
          {/* Название пруда */}
          <div style={{ marginBottom: '20px' }}>
            <label style={{
              display: 'block',
              marginBottom: '8px',
              fontWeight: '600',
              fontSize: '16px',
              color: '#34495e',
              fontFamily: 'Arial, sans-serif',
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
              placeholder="Например: JavaScript основы"
              style={{
                width: '100%',
                padding: '12px',
                border: '2px solid #bdc3c7',
                borderRadius: '8px',
                fontSize: '14px',
                boxSizing: 'border-box',
                fontFamily: 'Arial, sans-serif',
                transition: 'border-color 0.3s ease'
              }}
              required
            />
          </div>

          {/* Описание */}
          <div style={{ marginBottom: '20px' }}>
            <label style={{
              display: 'block',
              marginBottom: '8px',
              fontWeight: '600',
              fontSize: '16px',
              color: '#34495e',
              fontFamily: 'Arial, sans-serif',
              textTransform: 'uppercase',
              letterSpacing: '0.5px'
            }}>
              ОПИСАНИЕ
            </label>
            <textarea
              name="description"
              value={formData.description}
              onChange={handleChange}
              placeholder="Описание темы пруда..."
              rows={3}
              style={{
                width: '100%',
                padding: '12px',
                border: '2px solid #bdc3c7',
                borderRadius: '8px',
                fontSize: '14px',
                boxSizing: 'border-box',
                fontFamily: 'Arial, sans-serif',
                transition: 'border-color 0.3s ease'
              }}
            />
          </div>

          {/* Категория */}
          <div style={{ marginBottom: '20px' }}>
            <label style={{
              display: 'block',
              marginBottom: '8px',
              fontWeight: '600',
              fontSize: '16px',
              color: '#34495e',
              fontFamily: 'Arial, sans-serif',
              textTransform: 'uppercase',
              letterSpacing: '0.5px'
            }}>
              КАТЕГОРИЯ *
            </label>
            
            {!showNewCategory ? (
              <>
                <select
                  name="topic"
                  value={formData.topic}
                  onChange={handleCategoryChange}
                  style={{
                    width: '100%',
                    padding: '12px',
                    border: '2px solid #bdc3c7',
                    borderRadius: '8px',
                    fontSize: '14px',
                    boxSizing: 'border-box',
                    fontFamily: 'Arial, sans-serif',
                    backgroundColor: 'white',
                    cursor: 'pointer',
                    marginBottom: '8px'
                  }}
                >
                  {categories.map(category => (
                    <option key={category} value={category}>
                      {category.charAt(0).toUpperCase() + category.slice(1)}
                    </option>
                  ))}
                  <option value="new">+ Добавить новую категорию</option>
                </select>
              </>
            ) : (
              <div style={{
                display: 'flex',
                gap: '8px',
                alignItems: 'center'
              }}>
                <input
                  type="text"
                  value={newCategory}
                  onChange={(e) => setNewCategory(e.target.value)}
                  placeholder="Введите название категории..."
                  style={{
                    flex: 1,
                    padding: '12px',
                    border: '2px solid #bdc3c7',
                    borderRadius: '8px',
                    fontSize: '14px',
                    boxSizing: 'border-box',
                    fontFamily: 'Arial, sans-serif'
                  }}
                />
                <button
                  type="button"
                  onClick={handleAddNewCategory}
                  disabled={!newCategory.trim()}
                  style={{
                    padding: '12px 16px',
                    border: 'none',
                    borderRadius: '8px',
                    backgroundColor: '#27ae60',
                    color: 'white',
                    cursor: newCategory.trim() ? 'pointer' : 'not-allowed',
                    fontSize: '14px',
                    fontWeight: '600',
                    fontFamily: 'Arial, sans-serif',
                    opacity: newCategory.trim() ? 1 : 0.6
                  }}
                >
                  ✓
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setShowNewCategory(false);
                    setNewCategory('');
                    setFormData(prev => ({ ...prev, topic: 'programming' }));
                  }}
                  style={{
                    padding: '12px 16px',
                    border: '2px solid #95a5a6',
                    borderRadius: '8px',
                    backgroundColor: '#ecf0f1',
                    color: '#7f8c8d',
                    cursor: 'pointer',
                    fontSize: '14px',
                    fontWeight: '600',
                    fontFamily: 'Arial, sans-serif'
                  }}
                >
                  ✕
                </button>
              </div>
            )}
            
            {showNewCategory && (
              <p style={{
                fontSize: '12px',
                color: '#7f8c8d',
                fontFamily: 'Arial, sans-serif',
                margin: '8px 0 0 0'
              }}>
                Введите название новой категории и нажмите ✓ для добавления
              </p>
            )}
          </div>

          {/* Интервалы времени для каждого слоя */}
          <div style={{ marginBottom: '24px' }}>
            <label style={{
              display: 'block',
              marginBottom: '6px',
              fontWeight: '600',
              fontSize: '16px',
              color: '#34495e',
              fontFamily: 'Arial, sans-serif',
              textTransform: 'uppercase',
              letterSpacing: '0.5px'
            }}>
              ИНТЕРВАЛЫ ПОВТОРЕНИЯ
            </label>

            <p style={{
              marginBottom: '6px',
              fontSize: '12px',
              color: '#7f8c8d',
              fontFamily: 'Arial, sans-serif',
              margin: '8px 0 0 0',
              lineHeight: '1.4'
            }}>
              В формате дни:часы:минуты (сейчас установлены час, день, неделя и месяц)
            </p>
            
            {formData.intervals.map((interval, index) => (
              <div key={index} style={{ marginBottom: '10px' }}>
                <label style={{
                  display: 'block',
                  marginBottom: '6px',
                  fontWeight: '500',
                  fontSize: '14px',
                  color: '#2c3e50',
                  fontFamily: 'Arial, sans-serif'
                }}>
                  {index + 1}-е повторение:
                </label>
                <input
                  type="text"
                  value={interval}
                  onChange={(e) => handleIntervalChange(index, e.target.value)}
                  placeholder={`Интервал для слоя ${index + 1}`}
                  style={{
                    width: '100%',
                    padding: '10px',
                    border: '2px solid #bdc3c7',
                    borderRadius: '6px',
                    fontSize: '14px',
                    boxSizing: 'border-box',
                    fontFamily: 'Arial, sans-serif',
                    transition: 'border-color 0.3s ease'
                  }}
                />
              </div>
            ))}
          </div>

          {/* Кнопки */}
          <div style={{
            display: 'flex',
            justifyContent: 'flex-end',
            gap: '12px'
          }}>
            <button
              type="button"
              onClick={onClose}
              disabled={loading}
              style={{
                padding: '12px 24px',
                border: '2px solid #95a5a6',
                borderRadius: '8px',
                backgroundColor: '#ecf0f1',
                color: '#7f8c8d',
                cursor: loading ? 'not-allowed' : 'pointer',
                fontSize: '14px',
                fontWeight: '600',
                fontFamily: 'Arial, sans-serif',
                transition: 'all 0.3s ease',
                opacity: loading ? 0.6 : 1
              }}
            >
              ОТМЕНА
            </button>
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
                fontFamily: 'Arial, sans-serif',
                transition: 'all 0.3s ease',
                opacity: (loading || !formData.name.trim() || !formData.topic) ? 0.6 : 1
              }}
            >
              {loading ? 'СОЗДАНИЕ...' : 'СОЗДАТЬ ПРУД'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}