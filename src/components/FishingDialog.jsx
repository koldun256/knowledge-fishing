// src/components/FishingDialog.jsx
import React, { useEffect, useState, useCallback, useRef } from 'react';
import ReactDOM from 'react-dom';
import { usePond } from '../context/PondContext';
import { fishService } from '../services/fishService';
import { sessionService } from '../services/sessionService';

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

  const onKey = useCallback((e) => {
    if (!dialog.open) return;
    
    if (e.key === 'o' || e.key === 'O' || e.key === 'щ' || e.key === 'Щ') {
      e.preventDefault();
      setShowAnswer(prev => !prev);
    } else if (e.key == '0') {
      setScore(0);
    } else if (e.key == '-') {
      setScore(-1);
    } else if (e.key == '+') {
      setScore(1);
    } else if (e.key === 'Enter' && score != null && !submitting) {
      e.preventDefault();
      handleSubmit();
    }
  }, [dialog.open, score, submitting]);

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

  const handleSubmit = async () => {
    if (score == null || submitting || !fish) return;
    setSubmitting(true);
    try {
      const quality = parseInt(score, 10);
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

  const scoreByChar = (c) => {
    if (c == '-') return -1;
    else if (c == '+') return 1;
    else return 0;
  }

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
          Оцените вспоминание
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
          {/* Вопрос */}
          <div style={{ marginBottom: '20px', flexShrink: 0 }}>
            <div style={{
              display: 'block',
              marginBottom: '8px',
              fontWeight: '600',
              fontSize: '16px',
              color: '#34495e',
              textTransform: 'uppercase',
              letterSpacing: '0.5px'
            }}>
              ВОПРОС
            </div>
            <div style={{
              padding: '12px',
              border: '2px solid #bdc3c7',
              borderRadius: '8px',
              fontSize: '14px',
              backgroundColor: '#f8f9fa',
              minHeight: '60px',
              lineHeight: '1.4'
            }}>
              {fish.question}
            </div>
          </div>

          {/* Ответ */}
          <div style={{ marginBottom: '20px', flexShrink: 0 }}>
            <div style={{
              display: 'block',
              marginBottom: '8px',
              fontWeight: '600',
              fontSize: '16px',
              color: '#34495e',
              textTransform: 'uppercase',
              letterSpacing: '0.5px'
            }}>
              ОТВЕТ
            </div>
            <div 
              onClick={toggleAnswer}
              style={{
                padding: '12px',
                border: '2px solid #bdc3c7',
                borderRadius: '8px',
                fontSize: '14px',
                backgroundColor: showAnswer ? '#f8f9fa' : '#e8f4f8',
                minHeight: '80px',
                lineHeight: '1.4',
                cursor: 'pointer',
                transition: 'all 0.3s ease',
                position: 'relative',
                color: showAnswer ? 'inherit' : '#7f8c8d'
              }}
            >
              {showAnswer ? (
                fish.answer
              ) : (
                <div style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  height: '100%',
                  fontStyle: 'italic'
                }}>
                  Нажмите, чтобы посмотреть ответ
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
              КАК ПОМЕНЯТЬ УРОВЕНЬ?
            </div>
            
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(3, 1fr)',
              gap: '8px',
              marginBottom: '8px'
            }}>
              {['-', '0', '+'].map((v) => (
                <button
                  key={v}
                  onClick={() => setScore(scoreByChar(v))}
                  disabled={submitting}
                  style={{
                    padding: '12px',
                    border: '2px solid',
                    borderRadius: '8px',
                    fontSize: '16px',
                    fontWeight: '600',
                    cursor: submitting ? 'not-allowed' : 'pointer',
                    transition: 'all 0.3s ease',
                    borderColor: score === scoreByChar(v) ? '#27ae60' : '#bdc3c7',
                    backgroundColor: score === scoreByChar(v) ? '#27ae60' : 'white',
                    color: score === scoreByChar(v) ? 'white' : '#34495e'
                  }}
                  aria-pressed={score === scoreByChar(v)}
                >
                  {v}
                </button>
              ))}
            </div>
            
            <p style={{
              fontSize: '12px',
              color: '#7f8c8d',
              margin: 0
            }}>
              Горячие клавиши: -, 0, + для выбора, Enter — отправить, O — показать/скрыть ответ, Esc — закрыть.
            </p>
          </div>

          {/* Кнопка отправки */}
          <div style={{
            display: 'flex',
            justifyContent: 'flex-end',
            marginBottom: '20px',
            flexShrink: 0
          }}>
            <button
              onClick={handleSubmit}
              disabled={score == null || submitting}
              style={{
                padding: '12px 24px',
                border: 'none',
                borderRadius: '8px',
                backgroundColor: submitting ? '#95a5a6' : '#27ae60',
                color: 'white',
                cursor: (score == null || submitting) ? 'not-allowed' : 'pointer',
                fontSize: '14px',
                fontWeight: '600',
                transition: 'all 0.3s ease',
                width: '100%'
              }}
            >
              {submitting ? 'СОХРАНЯЕМ…' : 'СОХРАНИТЬ'}
            </button>
          </div>
        </div>
      </div>
    </div>,
    document.body
  );
}