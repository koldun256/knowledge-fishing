// Простой CreateFishModal.jsx
import React, { useState, useEffect } from 'react';

export default function CreateFishModal({ isOpen, onClose, onCreate, pondId }) {
  const [formData, setFormData] = useState({
    question: '',
    answer: '',
    depth_level: 0
  });

  useEffect(() => {
    if (isOpen) {
      setFormData({
        question: '',
        answer: '',
        depth_level: 0
      });
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!formData.question.trim()) {
      alert('Заполните вопрос');
      return;
    }
    onCreate(pondId, formData);
    onClose();
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
          fontFamily: 'MT Sans Full', // Шрифт
        }}>
          Добавить новую рыбу
        </h2>
        
        <form onSubmit={handleSubmit}>
          {/* Поле Вопрос */}
          <div style={{ marginBottom: '20px' }}>
            <label style={{
              display: 'block',
              marginBottom: '8px',
              fontWeight: '600',        // Более жирный шрифт
              fontSize: '16px',         // Увеличенный размер
              color: '#34495e',         // Цвет текста
              fontFamily: 'Arial, sans-serif', // Шрифт
              textTransform: 'uppercase', // Заглавные буквы
              letterSpacing: '0.5px'    // Межбуквенное расстояние
            }}>
              ВОПРОС *
            </label>
            <textarea
              name="question"
              value={formData.question}
              onChange={handleChange}
              placeholder="Введите вопрос..."
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
              required
            />
          </div>

          {/* Поле Ответ */}
          <div style={{ marginBottom: '20px' }}>
            <label style={{
              display: 'block',
              marginBottom: '8px',
              fontWeight: '600',        // Более жирный шрифт
              fontSize: '16px',         // Увеличенный размер
              color: '#34495e',         // Цвет текста
              fontFamily: 'Arial, sans-serif', // Шрифт
              textTransform: 'uppercase', // Заглавные буквы
              letterSpacing: '0.5px'    // Межбуквенное расстояние
            }}>
              ОТВЕТ
            </label>
            <textarea
              name="answer"
              value={formData.answer}
              onChange={handleChange}
              placeholder="Введите ответ..."
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
              required
            />
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
              style={{
                padding: '12px 24px',
                border: '2px solid #95a5a6',
                borderRadius: '8px',
                backgroundColor: '#ecf0f1',
                color: '#7f8c8d',
                cursor: 'pointer',
                fontSize: '14px',
                fontWeight: '600',
                fontFamily: 'Arial, sans-serif',
                transition: 'all 0.3s ease'
              }}
            >
              ОТМЕНА
            </button>
            <button
              type="submit"
              style={{
                padding: '12px 24px',
                border: 'none',
                borderRadius: '8px',
                backgroundColor: '#27ae60',
                color: 'white',
                cursor: 'pointer',
                fontSize: '14px',
                fontWeight: '600',
                fontFamily: 'Arial, sans-serif',
                transition: 'all 0.3s ease'
              }}
            >
              СОЗДАТЬ РЫБУ
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}