// src/components/FishingDialog.jsx
import React, { useEffect, useState, useCallback, useRef } from 'react';
import ReactDOM from 'react-dom';
import { usePond } from '../context/PondContext';
import { fishService } from '../services/fishService';
import { sessionService } from '../services/sessionService';
import { formatStringForDisplay } from '../helper/stringFormating';

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
  // Если это информационное сообщение (нет рыбы)
  const isInfoDialog = dialog.open && !fish && dialog.message;

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

  if (!dialog.open) return null;
  
  // Если это информационное сообщение
  if (isInfoDialog) {
    return ReactDOM.createPortal(
      <div 
        className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-[10000] p-4"
        onClick={() => setDialog({ open: false, fish: null })}
      >
        <div className="bg-white p-6 rounded-xl w-[90%] max-w-[400px] shadow-2xl relative">
          <h3 className="mt-0 mb-4 text-xl font-semibold text-gray-800">
            {dialog.title || 'Сообщение'}
          </h3>
          
          <p className="mb-6 text-base leading-relaxed text-gray-600">
            {dialog.message}
          </p>
          
          <div className="flex justify-end gap-2">
            {dialog.options?.map((option, index) => (
              <button
                key={index}
                onClick={(e) => {
                  e.stopPropagation();
                  option.action?.();
                }}
                className="px-4 py-2 border-none rounded-lg bg-blue-500 text-white text-sm font-medium cursor-pointer transition-colors duration-200 hover:bg-blue-600"
              >
                {option.text || 'Ок'}
              </button>
            )) || (
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  setDialog({ open: false, fish: null });
                }}
                className="px-4 py-2 border-none rounded-lg bg-blue-500 text-white text-sm font-medium cursor-pointer transition-colors duration-200 hover:bg-blue-600"
              >
                Ок
              </button>
            )}
          </div>
        </div>
      </div>,
      document.body
    );
  }

  if (!fish) return null;

  return ReactDOM.createPortal(
    <div 
      className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-[10000] p-4"
      onClick={handleBackdropClick}
    >
      <div className="bg-white p-6 rounded-xl w-[90%] max-w-[500px] max-h-[90vh] shadow-2xl overflow-hidden flex flex-col relative">
        {/* Крестик закрытия в правом верхнем углу */}
        <button
          onClick={handleCancel}
          disabled={submitting}
          className={`absolute top-4 right-4 bg-transparent border-none text-2xl cursor-pointer w-8 h-8 flex items-center justify-center rounded transition-all duration-300 ease-in-out z-10 ${
            submitting 
              ? 'text-gray-300 cursor-not-allowed' 
              : 'text-gray-600 hover:bg-gray-100 hover:text-gray-800'
          }`}
        >
          ×
        </button>
        
        {/* Основной контент - прокручиваемый с правильным отступом */}
        <div className="flex-1 overflow-auto flex flex-col min-h-0 pr-5 -mr-5">
          {/* Вопрос */}
          <div className="mb-5 flex-shrink-0">
            <div 
              className="p-3 rounded-lg text-base bg-white min-h-[60px] leading-relaxed"
              dangerouslySetInnerHTML={{ __html: formatStringForDisplay(fish.question) }}
            />
          </div>

          {/* Ответ */}
          <div className="mb-5 flex-shrink-0">
            <div 
              onClick={toggleAnswer}
              className={`p-3 rounded-lg text-base min-h-[80px] leading-relaxed cursor-pointer transition-all duration-300 ease-in-out relative overflow-hidden ${
                showAnswer ? 'bg-white' : 'bg-gray-400'
              }`}
            >
              {showAnswer ? (
                <div dangerouslySetInnerHTML={{ __html: formatStringForDisplay(fish.answer) }} />
              ) : (
                <div className="relative h-full flex items-center justify-center">
                  {/* Реальный текст ответа с эффектом размытия */}
                  <div 
                    className="blur-sm opacity-70 absolute inset-0 p-3 pointer-events-none"
                    dangerouslySetInnerHTML={{ __html: formatStringForDisplay(fish.answer) }}
                  />
                </div>
              )}
            </div>
          </div>

          {/* Оценка */}
          <div className="mb-6 flex-shrink-0">
            <div className="block mb-2 font-semibold text-base text-gray-700 uppercase tracking-wider">
              КУДА ПЕРЕМЕСТИТЬ РЫБУ?
            </div>
            
            <div className="grid grid-cols-3 gap-2 mb-2">
              {/* Стрелка вверх (-1) */}
              <button
                onClick={() => handleScoreSelect(-1)}
                disabled={submitting}
                aria-pressed={score === -1}
                className={`p-3 border-2 rounded-lg text-base font-semibold cursor-pointer transition-all duration-300 ease-in-out flex items-center justify-center ${
                  score === -1
                    ? 'border-green-500 bg-green-500 text-white'
                    : 'border-gray-300 bg-white text-gray-800 hover:border-green-500'
                } ${submitting ? 'cursor-not-allowed opacity-70' : ''}`}
              >
                ↑
              </button>

              {/* Ноль (0) */}
              <button
                onClick={() => handleScoreSelect(0)}
                disabled={submitting}
                aria-pressed={score === 0}
                className={`p-3 border-2 rounded-lg text-base font-semibold cursor-pointer transition-all duration-300 ease-in-out flex items-center justify-center ${
                  score === 0
                    ? 'border-green-500 bg-green-500 text-white'
                    : 'border-gray-300 bg-white text-gray-800 hover:border-green-500'
                } ${submitting ? 'cursor-not-allowed opacity-70' : ''}`}
              >
                0
              </button>

              {/* Стрелка вниз (+1) */}
              <button
                onClick={() => handleScoreSelect(1)}
                disabled={submitting}
                aria-pressed={score === 1}
                className={`p-3 border-2 rounded-lg text-base font-semibold cursor-pointer transition-all duration-300 ease-in-out flex items-center justify-center ${
                  score === 1
                    ? 'border-green-500 bg-green-500 text-white'
                    : 'border-green-500 bg-green-500 text-gray-800 hover:bg-green-600'
                } ${submitting ? 'cursor-not-allowed opacity-70' : ''}`}
              >
                ↓
              </button>
            </div>
            
            <p className="text-xs text-gray-600 m-0">
              Горячие клавиши: ↑/0/↓/Enter для выбора, O — показать/скрыть ответ, Esc — закрыть.
            </p>
          </div>
        </div>
      </div>
    </div>,
    document.body
  );
}
