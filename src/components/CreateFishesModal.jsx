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

  const queryString = 'Сгенерируй 20 пар вопрос и ответ о снастях для рыбалки. Вопрос - название снасти, ответ - что это такое и для чего предназначено. Вопросы и ответы должны быть длиной не более 1000 символов. Верни ответ в формате {"question1": "answer1", "question2": "answer2", ...}" без другого форматирования и лишних слов.'

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
        flexDirection: 'column'
      }}>
        <h2 style={{ 
          margin: '0 0 20px 0', 
          fontSize: '28px', 
          fontWeight: '800',
          color: '#013b45ff',
          textAlign: 'center',
        }}>
          Добавить несколько рыб
        </h2>
        
        <form onSubmit={handleSubmit} style={{ flex: 1, overflow: 'hidden', display: 'flex', flexDirection: 'column' }}>
          {/* Поле JSON */}
          <div style={{ marginBottom: '20px', flex: 1, display: 'flex', flexDirection: 'column' }}>
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
              rows={12}
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
                flex: 1,
                minHeight: '200px'
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

          {/* Поле для ИИ генерации */}
          <div style={{
            marginBottom: '20px',
            padding: '16px',
            backgroundColor: '#f8f9fa',
            border: '1px solid #e9ecef',
            borderRadius: '8px'
          }}>
            <div style={{
              marginBottom: '12px',
              fontSize: '14px',
              color: '#495057',
              fontWeight: '500'
            }}>
              Вы можете использовать ИИ для генерации вопросов и ответов. Вот пример запроса к ИИ:
            </div>
            
            <div style={{
              display: 'flex',
              gap: '8px',
              alignItems: 'flex-start'
            }}>
              <div style={{
                flex: 1,
                padding: '12px',
                backgroundColor: 'white',
                border: '1px solid #ced4da',
                borderRadius: '6px',
                fontSize: '14px',
                color: '#212529',
                fontFamily: 'monospace',
                wordBreak: 'break-all'
              }}>
                '{queryString}'
              </div>
              
              <button
                type="button"
                onClick={handleCopyToClipboard}
                style={{
                  padding: '12px 16px',
                  border: 'none',
                  borderRadius: '6px',
                  backgroundColor: copySuccess ? '#28a745' : '#6c757d',
                  color: 'white',
                  cursor: 'pointer',
                  fontSize: '14px',
                  fontWeight: '500',
                  transition: 'all 0.3s ease',
                  whiteSpace: 'nowrap'
                }}
              >
                {copySuccess ? 'Скопировано!' : 'Скопировать'}
              </button>
            </div>
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
              fontSize: '14px'
            }}>
              {error}
            </div>
          )}

          {/* Кнопки */}
          <div style={{
            display: 'flex',
            justifyContent: 'flex-end',
            gap: '12px',
            marginTop: 'auto'
          }}>
            <button
              type="button"
              onClick={handleClose}
              disabled={isLoading}
              style={{
                padding: '12px 24px',
                border: '2px solid #95a5a6',
                borderRadius: '8px',
                backgroundColor: '#ecf0f1',
                color: '#7f8c8d',
                cursor: 'pointer',
                fontSize: '14px',
                fontWeight: '600',
                transition: 'all 0.3s ease',
                opacity: isLoading ? 0.6 : 1
              }}
            >
              ОТМЕНА
            </button>
            <button
              type="submit"
              disabled={isLoading}
              style={{
                padding: '12px 24px',
                border: 'none',
                borderRadius: '8px',
                backgroundColor: '#27ae60',
                color: 'white',
                cursor: 'pointer',
                fontSize: '14px',
                fontWeight: '600',
                transition: 'all 0.3s ease',
                opacity: isLoading ? 0.6 : 1
              }}
            >
              {isLoading ? 'СОЗДАНИЕ...' : 'ДОБАВИТЬ РЫБ'}
            </button>
          </div>
        </form>
      </div>
    </div>,
    document.body
  );
};

export default CreateFishesModal;