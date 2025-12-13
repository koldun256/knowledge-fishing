// src/components/CreateFishesModal.jsx
import React, { useState, useEffect } from 'react';
import ReactDOM from 'react-dom';

// Импортируем функцию экранирования
import { formatString, cleanJsonString } from '../helper/stringFormating';

const CreateFishesModal = ({ isOpen, onClose, onCreate, pondId }) => {
  const [jsonInput, setJsonInput] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [copySuccess, setCopySuccess] = useState(false);

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
      setJsonInput('');
      setError('');
      setCopySuccess(false);
    }
  }, [isOpen]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    
    if (!jsonInput.trim()) {
      setError('Введите JSON данные');
      return;
    }

    try {
      jsonInput.trim();
      const correctedInput = cleanJsonString(jsonInput);
      console.log("jsonInput = ", correctedInput);
      const fishesData = JSON.parse(correctedInput);
      
      if (typeof fishesData !== 'object' || fishesData === null || Array.isArray(fishesData)) {
        throw new Error('Информация о рыбах должна быть в формате {"question1": "answer1", "question2": "answer2", ...}');
      }

      setIsLoading(true);
      // Передаем обработанные данные с экранированными символами
      await onCreate(pondId, fishesData);
      setJsonInput('');
      onClose();
      
    } catch (err) {
      console.error('Error creating fishes:', err);
      setError(`Ошибка: ${err.message}`);
    } finally {
      setIsLoading(false);
    }
  };

  const handleClose = () => {
    setJsonInput('');
    setError('');
    onClose();
  };

  const queryString = [
    'Сгенерируй пары "вопрос-ответ". Требования:',
    '1. Количество пар "вопрос-ответ" - *20*',
    '2. Тема: *рыболовные снасти*',
    '3. Вопрос должен содержать *название снасти*',
    '4. Ответ должен *объяснять что это и для чего предназначено*',
    '5. Верни ТОЛЬКО строку ответ без форматирования и дополнительного текста',
    '6. Структура: {\"question1\": \"answer1\", \"question2\": \"answer2\", ...}',
    '7. Длина вопроса и ответа не должна превышать 1000 символов',
    '',
    'Пример: {\"Что такое спиннинг?\": \"Спиннинг - удилище для ловли хищной рыбы...\"}'
  ].join('\n');
  
  const handleCopyToClipboard = () => {
    navigator.clipboard.writeText(queryString)
      .then(() => {
        setCopySuccess(true);
        setTimeout(() => setCopySuccess(false), 2000);
      })
      .catch(err => {
        console.error('Ошибка копирования: ', err);
      });
  };

  const exampleJson = `{
  "Какая рыба самая быстрая?": "Парусник",
  "Сколько лет живет карп?": "20-30 лет",
  "Какого размера достигает щука?": "до 1.5 метров"
}`;

  // Пример JSON с специальными символами для демонстрации
  const exampleWithSpecialChars = `{
  "Что такое 'спиннинг'?": "Спиннинг - удилище для ловли хищной рыбы\\nОбычно используется с катушкой",
  "Как выбрать леску?": "Леска бычает:\\n- Монофильная\\n- Плетеная\\n- Флюорокарбоновая",
  "Что означает 'тест' удилища?": "Тест удилища - это рекомендуемый вес приманки.\\tНапример: 5-20 г"
}`;

  if (!isOpen) return null;

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
      <div style={{
        backgroundColor: 'white',
        padding: '24px',
        borderRadius: '12px',
        width: '90%',
        maxWidth: '600px',
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
          Добавить несколько рыб
        </h2>
        
        {/* Основной контент - прокручиваемый с правильным отступом */}
        <div style={{
          flex: 1,
          overflow: 'auto',
          display: 'flex',
          flexDirection: 'column',
          minHeight: 0,
          paddingRight: '20px', // Отступ для скроллбара
          marginRight: '-20px' // Компенсируем отступ чтобы контент был на своем месте
        }}>
          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', flex: 1 }}>
            {/* Поле JSON - уменьшенное */}
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
                ВВЕДИТЕ ДАННЫЕ РЫБ В ФОРМАТЕ {"{\"question1\": \"answer1\", \"question2\": \"answer2\", ...}"} *
              </label>
              <textarea
                value={jsonInput}
                onChange={(e) => setJsonInput(e.target.value)}
                placeholder={exampleJson}
                rows={8}
                style={{
                  width: '100%',
                  padding: '12px',
                  border: '2px solid #bdc3c7',
                  borderRadius: '8px',
                  fontSize: '14px',
                  boxSizing: 'border-box',
                  transition: 'border-color 0.3s ease',
                  fontFamily: 'monospace',
                  resize: 'none',
                  minHeight: '150px',
                  overflow: 'auto'
                }}
                spellCheck="false"
                required
              />
              {/* <div style={{
                marginTop: '8px',
                fontSize: '12px',
                color: '#7f8c8d',
                fontWeight: '600'
              }}>
                <strong>Формат: {"{\"question1\": \"answer1\", \"question2\": \"answer2\", ...}"}</strong>
                <div style={{ marginTop: '4px', fontSize: '11px', color: '#95a5a6' }}>
                  Чтобы использовать кавычки, добавьте экранирование: \"
                </div>
              </div> */}
            </div>

            {/* Сообщение об ошибке */}
            {error && (
              <div style={{
                marginBottom: '20px',
                padding: '12px',
                backgroundColor: '#fde8e8',
                border: '2px solid #f56565',
                borderRadius: '8px',
                color: '#c53030',
                fontSize: '14px',
                flexShrink: 0
              }}>
                {error}
              </div>
            )}

            {/* Кнопка создания - ПЕРЕМЕЩЕНА ВВЕРХ */}
            <div style={{
              display: 'flex',
              justifyContent: 'flex-end',
              gap: '12px',
              marginBottom: '20px',
              flexShrink: 0
            }}>
              <button
                type="submit"
                disabled={isLoading}
                style={{
                  padding: '12px 24px',
                  border: 'none',
                  borderRadius: '8px',
                  backgroundColor: '#27ae60',
                  color: 'white',
                  cursor: isLoading ? 'not-allowed' : 'pointer',
                  fontSize: '16px',
                  fontWeight: '600',
                  transition: 'all 0.3s ease',
                  opacity: isLoading ? 0.6 : 1
                }}
              >
                {isLoading ? 'СОЗДАНИЕ...' : 'ДОБАВИТЬ РЫБ'}
              </button>
            </div>

            {/* Блок с запросом для ИИ - БЕЗ прокрутки */}
            <div style={{
              marginBottom: '20px',
              padding: '16px',
              backgroundColor: '#f8f9fa',
              border: '1px solid #e9ecef',
              borderRadius: '8px',
              position: 'relative',
              flexShrink: 0
            }}>
              {/* Пояснение отдельно */}
              <div style={{
                marginBottom: '12px',
                fontSize: '14px',
                color: '#495057',
                fontWeight: '500'
              }}>
                Вы можете использовать ИИ для генерации вопросов и ответов. Вот пример запроса к ИИ (изменяемые параметры запроса находятся в первых четырех пунктах):
              </div>
              
              {/* Контейнер для промпта с относительным позиционированием */}
              <div style={{
                position: 'relative'
              }}>
                {/* Текст запроса с отступом для иконки */}
                <div style={{
                  fontSize: '14px',
                  color: '#6c757d',
                  lineHeight: '1.4',
                  whiteSpace: 'pre-line',
                  backgroundColor: '#fff',
                  padding: '12px',
                  borderRadius: '6px',
                  border: '1px solid #dee2e6',
                  fontFamily: 'monospace',
                  fontSize: '13px',
                  paddingRight: '40px' // Больше отступа справа для иконки
                }}>
                  {queryString}
                </div>
                
                {/* Иконка для копирования в правом верхнем углу контейнера промпта */}
                <div 
                  onClick={handleCopyToClipboard}
                  style={{
                    cursor: 'pointer',
                    position: 'absolute',
                    top: '8px', // Отступ сверху
                    right: '8px', // Отступ справа
                    width: '24px',
                    height: '24px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    backgroundColor: 'white',
                    borderRadius: '4px',
                    border: '1px solid #dee2e6',
                    zIndex: 2,
                    opacity: 0.7,
                    transition: 'all 0.3s ease',
                    boxShadow: '0 1px 3px rgba(0,0,0,0.1)'
                  }}
                  onMouseEnter={(e) => {
                    e.target.style.opacity = '1';
                    e.target.style.backgroundColor = '#f8f9fa';
                    e.target.style.boxShadow = '0 2px 5px rgba(0,0,0,0.15)';
                  }}
                  onMouseLeave={(e) => {
                    e.target.style.opacity = '0.7';
                    e.target.style.backgroundColor = 'white';
                    e.target.style.boxShadow = '0 1px 3px rgba(0,0,0,0.1)';
                  }}
                  title="Копировать промпт"
                >
                  {/* SVG иконка копирования */}
                  <svg 
                    xmlns="http://www.w3.org/2000/svg" 
                    width="16" 
                    height="16" 
                    viewBox="0 0 24 24" 
                    fill="none" 
                    stroke="#6c757d" 
                    strokeWidth="1.5"
                  >
                    <rect x="9" y="9" width="13" height="13" rx="2" ry="2"></rect>
                    <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"></path>
                  </svg>
                </div>
              </div>

              {/* Сообщение об успешном копировании */}
              {copySuccess && (
                <div style={{
                  position: 'absolute',
                  top: '50%',
                  left: '50%',
                  transform: 'translate(-50%, -50%)',
                  padding: '8px 16px',
                  backgroundColor: '#28a745',
                  color: 'white',
                  fontSize: '14px',
                  borderRadius: '4px',
                  whiteSpace: 'nowrap',
                  zIndex: 100,
                  boxShadow: '0 2px 10px rgba(0,0,0,0.2)',
                  animation: 'fadeInOut 2s ease'
                }}>
                  Скопировано!
                </div>
              )}

              {/* Добавляем стили для анимации */}
              <style>{`
                @keyframes fadeInOut {
                  0% { opacity: 0; }
                  20% { opacity: 1; }
                  80% { opacity: 1; }
                  100% { opacity: 0; }
                }
              `}</style>

            </div>

          </form>
        </div>
      </div>
    </div>,
    document.body
  );
};

export default CreateFishesModal;