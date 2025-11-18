// src/components/FishingDialog.jsx
import React, { useEffect, useState, useCallback, useRef } from 'react';
import ReactDOM from 'react-dom';
import { usePond } from '../context/PondContext';
import { fishService } from '../services/fishService';
import { sessionService } from '../services/sessionService';
import formatStringForDisplay from '../helper/stringFormating';

let externalResetFishState = null;
export function setExternalResetFishState(fn) {
  externalResetFishState = fn;
}

export default function FishingDialog() {
  const { dialog, setDialog, resetFishing, fishes, setFishes } = usePond();
  const [score, setScore] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [showAnswer, setShowAnswer] = useState(false);
  const fish = dialog?.fish || null;

  const handleBackdropClick = (e) => {
    if (e.target === e.currentTarget) {
      handleCancel();
    }
  };

  useEffect(() => {
    const handleEscape = (e) => {
      if (e.key === 'Escape' && dialog.open) {
        handleCancel();
      }
    };

    document.addEventListener('keydown', handleEscape);
    return () => document.removeEventListener('keydown', handleEscape);
  }, [dialog.open]);

  useEffect(() => {
    if (dialog.open) {
      setScore(null);
      setSubmitting(false);
      setShowAnswer(false);
    }
  }, [dialog.open]);

  const handleScoreSelect = useCallback((selectedScore) => {
    if (!dialog.open || submitting) return;
    
    setScore(selectedScore);
    // Автоматически отправляем и закрываем окно
    handleSubmit(selectedScore);
  }, [dialog.open, submitting]);

  const onKey = useCallback((e) => {
  if (!dialog.open) return;
  
  if (e.key === 'o' || e.key === 'O' || e.key === 'щ' || e.key === 'Щ') {
    e.preventDefault();
    setShowAnswer(prev => !prev);
  } else if (e.key === 'ArrowUp' || e.key === 'ArrowDown' || e.key === '0' || e.key === 'Enter') {
    e.preventDefault();
    let selectedScore = null;
    if (e.key === 'ArrowUp') selectedScore = -1;
    else if (e.key === 'ArrowDown' || e.key === 'Enter') selectedScore = 1; // Enter теперь тоже стрелка вниз
    else if (e.key === '0') selectedScore = 0;
    
    if (selectedScore !== null) {
      handleScoreSelect(selectedScore);
    }
  }
}, [dialog.open, handleScoreSelect]);

  useEffect(() => {
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [onKey]);

  const closeAndReset = () => {
    setDialog({ open: false, fish: null, sessionId: null });
    resetFishing();
  };

  const handleCancel = () => {
    if (submitting) return;
    closeAndReset();
  };

  const handleSubmit = async (selectedScore = score) => {
    if (selectedScore == null || submitting || !fish) return;
    setSubmitting(true);
    try {
      const quality = parseInt(selectedScore, 10);
      const updated = await fishService.reviewFish(fish.id, { quality });

      if (externalResetFishState) {
        externalResetFishState(fish.id);
      }

      const idx = fishes.findIndex((x) => String(x.id) === String(fish.id));
      if (idx !== -1) {
        const next = fishes.slice();
        next[idx] = updated;
        setFishes(next);
      }

    } catch (err) {
      console.error('Ошибка при отправке результата:', err);
    } finally {
      setSubmitting(false);
      closeAndReset();
    }
  };

  const toggleAnswer = () => {
    setShowAnswer(prev => !prev);
  };

  if (!dialog.open || !fish) return null;

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
          onClick={handleCancel}
          disabled={submitting}
          style={{
            position: 'absolute',
            top: '16px',
            right: '16px',
            background: 'none',
            border: 'none',
            fontSize: '24px',
            cursor: submitting ? 'not-allowed' : 'pointer',
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
            if (!submitting) {
              e.target.style.backgroundColor = '#f5f5f5';
              e.target.style.color = '#333';
            }
          }}
          onMouseLeave={(e) => {
            e.target.style.backgroundColor = 'transparent';
            e.target.style.color = '#666';
          }}
        >
          ×
        </button>
        
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
          {/* Вопрос */}
          <div style={{ marginBottom: '20px', flexShrink: 0 }}>
            <div style={{
              padding: '12px',
              borderRadius: '8px',
              fontSize: '16px',
              backgroundColor: '#ffffffff',
              minHeight: '60px',
              lineHeight: '1.4'
            }}
            dangerouslySetInnerHTML={{ __html: formatStringForDisplay(fish.question) }}
            />
          </div>

          {/* Ответ */}
          <div style={{ marginBottom: '20px', flexShrink: 0 }}>
            <div 
              onClick={toggleAnswer}
              style={{
                padding: '12px',
                borderRadius: '8px',
                fontSize: '16px',
                backgroundColor: showAnswer ? '#ffffffff' : '#a2a8adff',
                minHeight: '80px',
                lineHeight: '1.4',
                cursor: 'pointer',
                transition: 'all 0.3s ease',
                position: 'relative',
                overflow: 'hidden'
              }}
            >
              {showAnswer ? (
                <div dangerouslySetInnerHTML={{ __html: formatStringForDisplay(fish.answer) }} />
              ) : (
                <div style={{
                  position: 'relative',
                  height: '100%',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center'
                }}>
                  {/* Реальный текст ответа с эффектом размытия */}
                  <div style={{
                    filter: 'blur(4px)',
                    opacity: 0.7,
                    position: 'absolute',
                    top: 0,
                    left: 0,
                    right: 0,
                    bottom: 0,
                    padding: '12px',
                    pointerEvents: 'none'
                  }}
                  dangerouslySetInnerHTML={{ __html: formatStringForDisplay(fish.answer) }}
                  />
                  
                  {/* Наложение с градиентом и текстом */}
                  {/* <div style={{
                    position: 'relative',
                    zIndex: 2,
                    background: '#f8f9fa',
                    padding: '8px 16px',
                    borderRadius: '20px',
                    fontSize: '14px',
                    fontStyle: 'italic',
                    color: '#7f8c8d',
                    border: '1px solid #e9ecef'
                  }}>
                    Нажмите, чтобы посмотреть ответ
                  </div> */}
                </div>
              )}
            </div>
          </div>

          {/* Оценка */}
          <div style={{ marginBottom: '24px', flexShrink: 0 }}>
            <div style={{
              display: 'block',
              marginBottom: '8px',
              fontWeight: '600',
              fontSize: '16px',
              color: '#34495e',
              textTransform: 'uppercase',
              letterSpacing: '0.5px'
            }}>
              КУДА ПЕРЕМЕСТИТЬ РЫБУ?
            </div>
            
            <div style={{
              display: 'grid',
              gridTemplateColumns: '1fr 1fr 3fr',
              gap: '8px',
              marginBottom: '8px'
            }}>
              {/* Стрелка вверх (-1) */}
              <button
                onClick={() => handleScoreSelect(-1)}
                disabled={submitting}
                style={{
                  padding: '12px',
                  border: '2px solid',
                  borderRadius: '8px',
                  fontSize: '16px',
                  fontWeight: '600',
                  cursor: submitting ? 'not-allowed' : 'pointer',
                  transition: 'all 0.3s ease',
                  borderColor: score === -1 ? '#27ae60' : '#bdc3c7',
                  backgroundColor: score === -1 ? '#27ae60' : 'white',
                  color: score === -1 ? 'white' : '#34495e',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center'
                }}
                aria-pressed={score === -1}
              >
                ↑
              </button>

              {/* Ноль (0) */}
              <button
                onClick={() => handleScoreSelect(0)}
                disabled={submitting}
                style={{
                  padding: '12px',
                  border: '2px solid',
                  borderRadius: '8px',
                  fontSize: '16px',
                  fontWeight: '600',
                  cursor: submitting ? 'not-allowed' : 'pointer',
                  transition: 'all 0.3s ease',
                  borderColor: score === 0 ? '#27ae60' : '#bdc3c7',
                  backgroundColor: score === 0 ? '#27ae60' : 'white',
                  color: score === 0 ? 'white' : '#34495e',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center'
                }}
                aria-pressed={score === 0}
              >
                0
              </button>

              {/* Стрелка вниз (+1) */}
              <button
                onClick={() => handleScoreSelect(1)}
                disabled={submitting}
                style={{
                  padding: '12px',
                  border: '2px solid',
                  borderRadius: '8px',
                  fontSize: '16px',
                  fontWeight: '600',
                  cursor: submitting ? 'not-allowed' : 'pointer',
                  transition: 'all 0.3s ease',
                  borderColor: score === 1 ? '#27ae60' : '#bdc3c7',
                  backgroundColor: score === 1 ? '#27ae60' : '#27ae60',
                  color: score === 1 ? 'white' : '#2d3436',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center'
                }}
                aria-pressed={score === 1}
              >
                ↓
              </button>
            </div>
            
            <p style={{
              fontSize: '12px',
              color: '#7f8c8d',
              margin: 0
            }}>
              Горячие клавиши: ↑/0/↓/Enter для выбора, O — показать/скрыть ответ, Esc — закрыть.
            </p>
          </div>
        </div>
      </div>
    </div>,
    document.body
  );
}
