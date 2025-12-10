// src/components/InfoModal.jsx
import React, { useState, useEffect, useCallback, useRef } from 'react';
import ReactDOM from 'react-dom';
import { formatStringForDisplay } from '../helper/stringFormating';

export default function InfoModal({ isOpen, onClose, infoItems = [], triggerPosition }) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [animationState, setAnimationState] = useState('closed');
  const modalRef = useRef(null);
  
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
    return {
      top: '50%',
      left: '50%',
      transform: 'translate(-50%, -50%) scale(1)',
      opacity: 1
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
    padding: '16px',
    borderRadius: '12px',
    width: '90%',
    maxWidth: '600px',
    maxHeight: '90vh',
    boxShadow: animationState === 'open' ? '0 10px 25px rgba(0,0,0,0.2)' : 'none',
    overflow: 'hidden',
    display: 'flex',
    flexDirection: 'column',
    transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
    zIndex: 10000,
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
      <div style={backdropStyle} onClick={handleBackdropClick} />
      
      <div style={modalStyle} ref={modalRef} onClick={(e) => e.stopPropagation()}>
        {/* Крестик закрытия */}
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
            zIndex: 10,
            opacity: animationState === 'open' ? 1 : 0,
            transition: 'opacity 0.2s ease 0.1s'
          }}
          onMouseEnter={(e) => {
            if (animationState === 'open') {
              e.target.style.backgroundColor = '#f5f5f5';
              e.target.style.color = '#333';
            }
          }}
          onMouseLeave={(e) => {
            if (animationState === 'open') {
              e.target.style.backgroundColor = 'transparent';
              e.target.style.color = '#666';
            }
          }}
        >
          ×
        </button>
        
        {/* Основной контент */}
        <div style={{
          flex: 1,
          display: 'flex',
          flexDirection: 'column',
          position: 'relative',
          minHeight: '300px',
          opacity: animationState === 'open' ? 1 : 0,
          transition: 'opacity 0.2s ease 0.1s'
        }}>
          {/* Левая стрелка */}
          <button
            onClick={handlePrev}
            disabled={!canGoPrev}
            style={{
              position: 'absolute',
              left: '6px',
              top: '50%',
              transform: 'translateY(-50%)',
              background: 'none',
              border: 'none',
              cursor: canGoPrev ? 'pointer' : 'default',
              fontSize: '50px',
              color: canGoPrev ? '#013b45ff' : '#cccccc',
              transition: 'all 0.3s ease',
              zIndex: 1,
              padding: '6px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              opacity: canGoPrev ? 1 : 0.6
            }}
            onMouseEnter={(e) => {
              if (canGoPrev && animationState === 'open') {
                e.target.style.color = '#027d8d';
              }
            }}
            onMouseLeave={(e) => {
              if (canGoPrev && animationState === 'open') {
                e.target.style.color = '#013b45ff';
              }
            }}
            aria-label="Предыдущий"
          >
            ‹
          </button>

          {/* Правая стрелка */}
          <button
            onClick={handleNext}
            disabled={!canGoNext}
            style={{
              position: 'absolute',
              right: '6px',
              top: '50%',
              transform: 'translateY(-50%)',
              background: 'none',
              border: 'none',
              cursor: canGoNext ? 'pointer' : 'default',
              fontSize: '50px',
              color: canGoNext ? '#013b45ff' : '#cccccc',
              transition: 'all 0.3s ease',
              zIndex: 1,
              padding: '6px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              opacity: canGoNext ? 1 : 0.6
            }}
            onMouseEnter={(e) => {
              if (canGoNext && animationState === 'open') {
                e.target.style.color = '#027d8d';
              }
            }}
            onMouseLeave={(e) => {
              if (canGoNext && animationState === 'open') {
                e.target.style.color = '#013b45ff';
              }
            }}
            aria-label="Следующий"
          >
            ›
          </button>

          {/* Контейнер для текста */}
          <div style={{
            flex: 1,
            display: 'flex',
            flexDirection: 'column',
            padding: '10px',
            borderRadius: '8px',
            backgroundColor: '#ffffffff',
            border: '2px solid #ffffffff',
            overflow: 'auto',
            margin: '0 30px',
            transition: 'margin 0.3s ease'
          }}>
            <h2 style={{ 
              margin: '0 0 20px 0', 
              fontSize: '28px', 
              fontWeight: '800',
              color: '#013b45ff',
              textAlign: 'center',
              paddingRight: '40px',
              flexShrink: 0
            }}>
              {currentItem.title}
            </h2>

            <div style={{
              flex: 1,
              fontSize: '18px',
              lineHeight: '1.6',
              color: '#000000ff',
              whiteSpace: 'pre-line',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              textAlign: 'justify',
              width: '100%'
              }}>
              <div 
                style={{
                width: '100%',
                maxHeight: '100%',
                overflowY: 'auto',
                padding: '10px 0'
                }}
                dangerouslySetInnerHTML={{ __html: formatStringForDisplay(currentItem.text) }}
              />
              </div>
          </div>

          {/* Индикаторы */}
          <div style={{
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            marginTop: '20px',
            gap: '8px'
          }}>
            {infoItems.map((_, index) => (
              <button
                key={index}
                onClick={() => animationState === 'open' && setCurrentIndex(index)}
                style={{
                  width: '12px',
                  height: '12px',
                  borderRadius: '50%',
                  border: 'none',
                  backgroundColor: index === currentIndex ? '#013b45ff' : '#bdc3c7',
                  cursor: 'pointer',
                  transition: 'all 0.3s ease',
                  padding: 0
                }}
                aria-label={`Перейти к слайду ${index + 1}`}
              />
            ))}
          </div>

          <div style={{
            textAlign: 'center',
            marginTop: '12px',
            fontSize: '14px',
            color: '#7f8c8d',
            fontWeight: '500'
          }}>
            {currentIndex + 1} / {infoItems.length}
          </div>
        </div>

        {/* Кнопка закрытия */}
        {isLastItem && (
          <div style={{
            display: 'flex',
            justifyContent: 'center',
            marginTop: '24px',
            flexShrink: 0,
            opacity: animationState === 'open' ? 1 : 0,
            transition: 'opacity 0.3s ease 0.1s'
          }}>
            <button
              onClick={handleClose}
              style={{
                padding: '12px 32px',
                border: '2px solid #013b45ff',
                borderRadius: '8px',
                backgroundColor: 'white',
                color: '#013b45ff',
                cursor: 'pointer',
                fontSize: '16px',
                fontWeight: '600',
                transition: 'all 0.3s ease',
                textTransform: 'uppercase',
                letterSpacing: '0.5px'
              }}
              onMouseEnter={(e) => {
                if (animationState === 'open') {
                  e.target.style.backgroundColor = '#013b45ff';
                  e.target.style.color = 'white';
                }
              }}
              onMouseLeave={(e) => {
                if (animationState === 'open') {
                  e.target.style.backgroundColor = 'white';
                  e.target.style.color = '#013b45ff';
                }
              }}
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