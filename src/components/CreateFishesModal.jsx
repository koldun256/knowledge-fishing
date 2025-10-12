// src/components/CreateFishesModal.jsx
import React, { useState, useEffect } from 'react';
import ReactDOM from 'react-dom';

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
      const fishesData = JSON.parse(jsonInput);
      
      if (typeof fishesData !== 'object' || fishesData === null || Array.isArray(fishesData)) {
        throw new Error('JSON должен быть объектом в формате {"question1": "answer1", "question2": "answer2", ...}');
      }

      setIsLoading(true);
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
    '1. Количество пар "вопрос-ответ" - 20',
    '2. Тема: рыболовные снасти',
    '3. Вопрос должен содержать название снасти',
    '4. Ответ должен объяснять что это и для чего предназначено',
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
                fontSize: '16px',
                color: '#34495e',
                textTransform: 'uppercase',
                letterSpacing: '0.5px'
              }}>
                ВВЕДИТЕ ДАННЫЕ РЫБ В ФОРМАТЕ JSON *
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
              <div style={{
                marginTop: '8px',
                fontSize: '12px',
                color: '#7f8c8d',
                fontWeight: '600'
              }}>
                <strong>Формат: {"{\"question1\": \"answer1\", \"question2\": \"answer2\", ...}"}</strong>
              </div>
            </div>

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
                  fontSize: '14px',
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
              <div style={{
                marginBottom: '8px',
                fontSize: '14px',
                color: '#495057',
                fontWeight: '500',
                paddingRight: '80px'
              }}>
                Вы можете использовать ИИ для генерации вопросов и ответов. Вот пример запроса к ИИ (изменяемые параметры запроса находятся в первых четырех пунктах):
              </div>
              
              <div style={{
                fontSize: '14px',
                color: '#6c757d',
                lineHeight: '1.4',
                whiteSpace: 'pre-line'
              }}>
                {queryString}
              </div>

              {/* Маленькая кнопка копирования в правом верхнем углу блока */}
              <button
                type="button"
                onClick={handleCopyToClipboard}
                style={{
                  position: 'absolute',
                  top: '12px',
                  right: '12px',
                  padding: '6px 10px',
                  border: 'none',
                  borderRadius: '4px',
                  color: 'gray',
                  cursor: 'pointer',
                  fontSize: '11px',
                  fontWeight: '500',
                  transition: 'all 0.3s ease',
                  whiteSpace: 'nowrap'
                }}
              >
                {copySuccess ? 'Скопировано!' : 'Копировать'}
              </button>
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
          </form>
        </div>
      </div>
    </div>,
    document.body
  );
};

export default CreateFishesModal;