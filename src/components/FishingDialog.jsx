  // src/components/FishingDialog.jsx
  import React, { useEffect, useState, useCallback } from 'react';
  import { usePond } from '../context/PondContext';
  import { fishService } from '../services/fishService';
  import { sessionService } from '../services/sessionService';

  export default function FishingDialog() {
    const { dialog, setDialog, resetFishing, fishes, setFishes } = usePond();
    const [score, setScore] = useState(null);
    const [submitting, setSubmitting] = useState(false);
    const [showAnswer, setShowAnswer] = useState(false); // Новое состояние для показа ответа
    const fish = dialog?.fish || null;

    // Сброс локального состояния при открытии/закрытии
    useEffect(() => {
      if (dialog.open) {
        setScore(null);
        setSubmitting(false);
        setShowAnswer(false); // Сбрасываем показ ответа при открытии
      }
    }, [dialog.open]);

    // Хоткеи: 1..4 — выбрать оценку, Enter — отправить, Esc — отмена
    const onKey = useCallback((e) => {
      if (!dialog.open) return;
      if (e.key == '0') {
        setScore(0);
      } else if (e.key == '-') {
        setScore(-1);
      } else if (e.key == '+') {
        setScore(1);
      } else if (e.key === 'Enter' && score != null && !submitting) {
        e.preventDefault();
        handleSubmit();
      } else if (e.key === 'Escape' && !submitting) {
        handleCancel();
      }
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [dialog.open, score, submitting]);

    useEffect(() => {
      window.addEventListener('keydown', onKey);
      return () => window.removeEventListener('keydown', onKey);
    }, [onKey]);

    const closeAndReset = () => {
      setDialog({ open: false, fish: null, sessionId: null });
      resetFishing(); // переведёт FSM в 'idle' и освободит крючок/рыбу
    };

    const handleCancel = () => {
      if (submitting) return;
      closeAndReset();
    };

    const handleSubmit = async () => {
      if (score == null || submitting || !fish) return;
      setSubmitting(true);
      try {
        // 1) Отправляем оценку — возвращается обновлённая рыба (новый depth_level и т.п.)
        console.log('score = ', score);
        const quality = parseInt(score, 10);
        const updated = await fishService.reviewFish(fish.id, { quality });

        // 2) Обновляем локальный список рыб
        const idx = fishes.findIndex((x) => String(x.id) === String(fish.id));
        if (idx !== -1) {
          const next = fishes.slice();
          next[idx] = updated;
          setFishes(next);
        }

      } catch (err) {
        console.error('Ошибка при отправке результата:', err);
        // Можно показать тост/сообщение — пока просто закрываем диалог, чтобы не блокировать цикл
      } finally {
        setSubmitting(false);
        closeAndReset();
      }
    };

    const toggleAnswer = () => {
      setShowAnswer(prev => !prev);
    };

    if (!dialog.open || !fish) return null;

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
            Оцените вспоминание
          </h2>

          {/* Вопрос */}
          <div style={{ marginBottom: '20px' }}>
            <div style={{
              display: 'block',
              marginBottom: '8px',
              fontWeight: '600',
              fontSize: '16px',
              color: '#34495e',
              fontFamily: 'Arial, sans-serif',
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
              fontFamily: 'Arial, sans-serif',
              backgroundColor: '#f8f9fa',
              minHeight: '60px',
              lineHeight: '1.4'
            }}>
              {fish.question || '—'}
            </div>
          </div>

          {/* Ответ */}
          <div style={{ marginBottom: '20px' }}>
            <div style={{
              display: 'block',
              marginBottom: '8px',
              fontWeight: '600',
              fontSize: '16px',
              color: '#34495e',
              fontFamily: 'Arial, sans-serif',
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
                fontFamily: 'Arial, sans-serif',
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
                fish.answer || '—'
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
              {/* {!showAnswer && (
                <div style={{
                  position: 'absolute',
                  top: '8px',
                  right: '8px',
                  fontSize: '12px',
                  color: '#3498db'
                }}>
                  🔍
                </div>
              )} */}
            </div>
          </div>

          {/* Оценка */}
          <div style={{ marginBottom: '24px' }}>
            <div style={{
              display: 'block',
              marginBottom: '8px',
              fontWeight: '600',
              fontSize: '16px',
              color: '#34495e',
              fontFamily: 'Arial, sans-serif',
              textTransform: 'uppercase',
              letterSpacing: '0.5px'
            }}>
              КАК ПОМЕНЯТЬ УРОВЕНЬ?
            </div>
            
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(4, 1fr)',
              gap: '8px',
              marginBottom: '8px'
            }}>
              {[-1, 0, 1].map((v) => (
                <button
                  key={v}
                  onClick={() => setScore(v)}
                  disabled={submitting}
                  style={{
                    padding: '12px',
                    border: '2px solid',
                    borderRadius: '8px',
                    fontSize: '16px',
                    fontWeight: '600',
                    fontFamily: 'Arial, sans-serif',
                    cursor: submitting ? 'not-allowed' : 'pointer',
                    transition: 'all 0.3s ease',
                    borderColor: score === v ? '#27ae60' : '#bdc3c7',
                    backgroundColor: score === v ? '#27ae60' : 'white',
                    color: score === v ? 'white' : '#34495e'
                  }}
                  aria-pressed={score === v}
                >
                  {v}
                </button>
              ))}
            </div>
            
            <p style={{
              fontSize: '12px',
              color: '#7f8c8d',
              fontFamily: 'Arial, sans-serif',
              margin: 0
            }}>
              Горячие клавиши: -, 0, + для выбора, Enter — отправить, Esc — отмена.
            </p>
          </div>

          {/* Кнопки */}
          <div style={{
            display: 'flex',
            justifyContent: 'flex-end',
            gap: '12px'
          }}>
            <button
              onClick={handleCancel}
              disabled={submitting}
              style={{
                padding: '12px 24px',
                border: '2px solid #95a5a6',
                borderRadius: '8px',
                backgroundColor: '#ecf0f1',
                color: '#7f8c8d',
                cursor: submitting ? 'not-allowed' : 'pointer',
                fontSize: '14px',
                fontWeight: '600',
                fontFamily: 'Arial, sans-serif',
                transition: 'all 0.3s ease'
              }}
            >
              ОТМЕНА
            </button>
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
                fontFamily: 'Arial, sans-serif',
                transition: 'all 0.3s ease'
              }}
            >
              {submitting ? 'СОХРАНЯЕМ…' : 'СОХРАНИТЬ'}
            </button>
          </div>
        </div>
      </div>
    );
  }