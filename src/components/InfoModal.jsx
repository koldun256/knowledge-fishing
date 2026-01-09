// src/components/InfoModal.jsx
import React, { useState, useEffect, useCallback, useRef } from 'react';
import ReactDOM from 'react-dom';
import { formatStringForDisplay } from '../helper/stringFormating';

export default function InfoModal({ isOpen, onClose, infoItems = [], triggerPosition }) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [animationState, setAnimationState] = useState('closed');
  const [isMobile, setIsMobile] = useState(false);
  const modalRef = useRef(null);
  const touchStartX = useRef(0);
  const touchEndX = useRef(0);
  
  // Функция для проверки ширины экрана
  const checkIsMobile = useCallback(() => {
    setIsMobile(window.innerWidth < 500);
  }, []);

  // Проверяем при монтировании и при изменении размера окна
  useEffect(() => {
    checkIsMobile();
    window.addEventListener('resize', checkIsMobile);
    return () => window.removeEventListener('resize', checkIsMobile);
  }, [checkIsMobile]);

  const handleClose = useCallback(() => {
    setAnimationState('closing');
    setTimeout(() => {
      setCurrentIndex(0);
      setAnimationState('closed');
      onClose();
    }, 300);
  }, [onClose]);

  const handleBackdropClick = useCallback((e) => {
    if (e.target === e.currentTarget && animationState === 'open') {
      handleClose();
    }
  }, [handleClose, animationState]);

  const handlePrev = useCallback(() => {
    if (currentIndex > 0) {
      setCurrentIndex(prev => prev - 1);
    }
  }, [currentIndex]);

  const handleNext = useCallback(() => {
    if (currentIndex < infoItems.length - 1) {
      setCurrentIndex(prev => prev + 1);
    }
  }, [currentIndex, infoItems.length]);

  // Обработка свайпов
  const handleTouchStart = useCallback((e) => {
    touchStartX.current = e.touches[0].clientX;
  }, []);

  const handleTouchMove = useCallback((e) => {
    touchEndX.current = e.touches[0].clientX;
  }, []);

  const handleTouchEnd = useCallback(() => {
    if (!touchStartX.current || !touchEndX.current) return;

    const diff = touchStartX.current - touchEndX.current;
    const minSwipeDistance = 50; // минимальная дистанция для свайпа

    if (Math.abs(diff) > minSwipeDistance) {
      if (diff > 0) {
        // Свайп влево - следующий слайд
        handleNext();
      } else {
        // Свайп вправо - предыдущий слайд
        handlePrev();
      }
    }

    // Сброс значений
    touchStartX.current = 0;
    touchEndX.current = 0;
  }, [handleNext, handlePrev]);

  useEffect(() => {
    if (isOpen && animationState === 'closed') {
      setAnimationState('opening');
      setTimeout(() => {
        setAnimationState('open');
      }, 50);
    }
  }, [isOpen, animationState]);

  useEffect(() => {
    const handleEscape = (e) => {
      if (e.key === 'Escape' && isOpen && animationState === 'open') {
        handleClose();
      }
    };

    document.addEventListener('keydown', handleEscape);
    return () => document.removeEventListener('keydown', handleEscape);
  }, [isOpen, handleClose, animationState]);

  useEffect(() => {
    if (isOpen) {
      setCurrentIndex(0);
    }
  }, [isOpen]);

  useEffect(() => {
    const handleArrowKeys = (e) => {
      if (!isOpen || animationState !== 'open') return;
      
      if (e.key === 'ArrowLeft') {
        handlePrev();
      } else if (e.key === 'ArrowRight') {
        handleNext();
      }
    };

    document.addEventListener('keydown', handleArrowKeys);
    return () => document.removeEventListener('keydown', handleArrowKeys);
  }, [isOpen, handlePrev, handleNext, animationState]);

  if (!isOpen || animationState === 'closed') return null;

  const currentItem = infoItems[currentIndex];
  const canGoPrev = currentIndex > 0;
  const canGoNext = currentIndex < infoItems.length - 1;
  const isLastItem = currentIndex === infoItems.length - 1;

  // Вычисляем стартовую позицию для анимации
  const getInitialStyle = () => {
    if (!triggerPosition) {
      return {
        top: '50%',
        left: '50%',
        transform: 'translate(-50%, -50%) scale(0.3)',
        opacity: 0
      };
    }

    // Конвертируем координаты кнопки относительно viewport
    const buttonRect = triggerPosition;
    const buttonCenterX = buttonRect.left + buttonRect.width / 2;
    const buttonCenterY = buttonRect.top + buttonRect.height / 2;

    return {
      top: `${buttonCenterY}px`,
      left: `${buttonCenterX}px`,
      transform: 'translate(-50%, -50%) scale(0.1)',
      opacity: 0
    };
  };

  const getFinalStyle = () => {
    // Определяем ширину экрана для отступов
    const screenWidth = window.innerWidth;

    return {
      top: '50%',
      left: '50%',
      transform: 'translate(-50%, -50%) scale(1)',
      opacity: 1,
      // Добавляем отступы по бокам на маленьких экранах
      width: `calc(100% - ${isMobile ? '20px' : '40px'})`,
      maxWidth: '600px',
      marginLeft: 0,
      marginRight: 0
    };
  };

  const getClosingStyle = () => {
    if (!triggerPosition) {
      return {
        top: '50%',
        left: '50%',
        transform: 'translate(-50%, -50%) scale(0.3)',
        opacity: 0
      };
    }

    const buttonRect = triggerPosition;
    const buttonCenterX = buttonRect.left + buttonRect.width / 2;
    const buttonCenterY = buttonRect.top + buttonRect.height / 2;

    return {
      top: `${buttonCenterY}px`,
      left: `${buttonCenterX}px`,
      transform: 'translate(-50%, -50%) scale(0.1)',
      opacity: 0
    };
  };

  const modalStyle = {
    position: 'fixed',
    ...(animationState === 'opening' ? getInitialStyle() : 
        animationState === 'closing' ? getClosingStyle() : 
        getFinalStyle()),
    backgroundColor: 'white',
    padding: isMobile ? '12px' : '16px',
    borderRadius: '12px',
    maxHeight: '90vh',
    boxShadow: animationState === 'open' ? '0 10px 25px rgba(0,0,0,0.2)' : 'none',
    overflow: 'hidden',
    display: 'flex',
    flexDirection: 'column',
    transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
    zIndex: 10000,
    // Для свайпов на мобильных устройствах
    touchAction: 'pan-y pinch-zoom',
  };

  const backdropStyle = {
    position: 'fixed',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0,0,0,0.5)',
    opacity: animationState === 'open' ? 1 : 0,
    transition: 'opacity 0.3s ease',
    zIndex: 9999,
  };

  return ReactDOM.createPortal(
    <>
      <div 
        style={backdropStyle} 
        onClick={handleBackdropClick} 
        className={`fixed inset-0 bg-black transition-opacity duration-300 ${
          animationState === 'open' ? 'opacity-50' : 'opacity-0'
        } z-[9999]`}
      />
      
      <div 
        style={modalStyle}
        ref={modalRef} 
        onClick={(e) => e.stopPropagation()}
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
        className={`fixed bg-white rounded-xl max-h-[90vh] overflow-hidden flex flex-col transition-all duration-300 ease-[cubic-bezier(0.4,0,0.2,1)] z-[10000] touch-action-pan-y touch-action-pinch-zoom ${
          isMobile ? 'p-3' : 'p-4'
        }`}
      >
        {/* Крестик закрытия */}
        <button
          onClick={handleClose}
          className={`absolute ${isMobile ? 'top-3 right-3' : 'top-4 right-4'} bg-transparent border-none text-2xl cursor-pointer w-8 h-8 flex items-center justify-center rounded transition-all duration-300 ease-in-out z-10 ${
            animationState === 'open' 
              ? 'text-gray-600 hover:bg-gray-100 hover:text-gray-800 opacity-100' 
              : 'opacity-0'
          }`}
          style={{ transition: 'opacity 0.2s ease 0.1s' }}
        >
          ×
        </button>
        
        {/* Основной контент */}
        <div className={`flex-1 flex flex-col relative min-h-[300px] transition-opacity duration-200 ease-in-out ${
          animationState === 'open' ? 'opacity-100' : 'opacity-0'
        }`} style={{ transitionDelay: '0.1s' }}>
          {/* Левая стрелка */}
          <button
            onClick={handlePrev}
            disabled={!canGoPrev}
            className={`absolute ${isMobile ? '-left-2' : 'left-1.5'} top-1/2 -translate-y-1/2 bg-transparent border-none cursor-pointer z-10 p-1.5 flex items-center justify-center transition-all duration-300 ease-in-out ${
              canGoPrev 
                ? 'text-[#013b45] hover:text-[#027d8d] opacity-100' 
                : 'text-gray-300 opacity-60 cursor-default'
            }`}
            style={{
              fontSize: isMobile ? '40px' : '50px',
              left: isMobile ? '-7px' : '6px'
            }}
            aria-label="Предыдущий"
          >
            ‹
          </button>

          {/* Правая стрелка */}
          <button
            onClick={handleNext}
            disabled={!canGoNext}
            className={`absolute ${isMobile ? '-right-2' : 'right-1.5'} top-1/2 -translate-y-1/2 bg-transparent border-none cursor-pointer z-10 p-1.5 flex items-center justify-center transition-all duration-300 ease-in-out ${
              canGoNext 
                ? 'text-[#013b45] hover:text-[#027d8d] opacity-100' 
                : 'text-gray-300 opacity-60 cursor-default'
            }`}
            style={{
              fontSize: isMobile ? '40px' : '50px',
              right: isMobile ? '-7px' : '6px'
            }}
            aria-label="Следующий"
          >
            ›
          </button>

          {/* Контейнер для текста - с поддержкой свайпов */}
          <div 
            className={`flex-1 flex flex-col ${isMobile ? 'p-2' : 'p-2.5'} rounded-lg bg-white border-2 border-white overflow-auto transition-margin duration-300 ease-in-out select-none ${
              isMobile ? 'mx-4' : 'mx-7'
            }`}
            onTouchStart={handleTouchStart}
            onTouchMove={handleTouchMove}
            onTouchEnd={handleTouchEnd}
          >
            <h2 className={`m-0 mb-5 font-extrabold text-[#013b45] text-center flex-shrink-0 ${
              isMobile ? 'text-2xl pr-10' : 'text-[28px] pr-10'
            }`}>
              {currentItem.title}
            </h2>

            <div className={`flex-1 flex items-center justify-center text-justify w-full ${
              isMobile ? 'text-base' : 'text-lg'
            }`}>
              <div 
                className="w-full max-h-full overflow-y-auto py-2.5 leading-relaxed text-black whitespace-pre-line"
                dangerouslySetInnerHTML={{ __html: formatStringForDisplay(currentItem.text) }}
              />
            </div>
          </div>

          {/* Индикаторы */}
          <div className="flex justify-center items-center mt-5 gap-2">
            {infoItems.map((_, index) => (
              <button
                key={index}
                onClick={() => animationState === 'open' && setCurrentIndex(index)}
                className={`rounded-full border-none cursor-pointer transition-all duration-300 ease-in-out p-0 ${
                  index === currentIndex ? 'bg-[#013b45]' : 'bg-gray-400'
                }`}
                style={{
                  width: isMobile ? '10px' : '12px',
                  height: isMobile ? '10px' : '12px'
                }}
                aria-label={`Перейти к слайду ${index + 1}`}
              />
            ))}
          </div>

          <div className={`text-center mt-3 font-medium ${
            isMobile ? 'text-xs text-gray-600' : 'text-sm text-gray-600'
          }`}>
            {currentIndex + 1} / {infoItems.length}
          </div>
        </div>

        {/* Кнопка закрытия */}
        {isLastItem && (
          <div className={`flex justify-center mt-6 flex-shrink-0 transition-opacity duration-300 ease-in-out ${
            animationState === 'open' ? 'opacity-100' : 'opacity-0'
          }`} style={{ transitionDelay: '0.1s' }}>
            <button
              onClick={handleClose}
              className={`px-8 py-3 border-2 border-[#013b45] rounded-lg bg-white text-[#013b45] cursor-pointer font-semibold transition-all duration-300 ease-in-out uppercase tracking-wider ${
                isMobile ? 'text-sm py-2.5 px-6' : 'text-base'
              } hover:bg-[#10b132] hover:text-white`}
            >
              За уловом!
            </button>
          </div>
        )}
      </div>
    </>,
    document.body
  );
}
