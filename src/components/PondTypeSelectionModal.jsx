// src/components/PondTypeSelectionModal.jsx
import React, { useState, useEffect } from 'react';
import ReactDOM from 'react-dom';
import { useNavigate } from 'react-router-dom';
import CreatePondModal from './CreatePondModal';
import AddPondByLinkModal from './AddPondByLinkModal';

export default function PondTypeSelectionModal({ isOpen, onClose, onCreate, onAddByLink }) {
  const [currentStep, setCurrentStep] = useState('select');
  const [modalType, setModalType] = useState(null);
  const navigate = useNavigate();

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
      setCurrentStep('select');
      setModalType(null);
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleSelectType = (type) => {
    if (type === 'public') {
      // Закрываем модалку и переходим на страницу публичных прудов
      handleClose();
      navigate('/public_ponds');
    } else {
      setModalType(type);
      setCurrentStep(type);
    }
  };

  const handleClose = () => {
    setCurrentStep('select');
    setModalType(null);
    onClose();
  };

  const handlePondCreated = (pondData) => {
    onCreate(pondData);
    handleClose();
  };

  const handleLinkPondAdded = (pondData) => {
    onAddByLink(pondData);
    handleClose();
  };

  const handleBackToSelection = () => {
    setCurrentStep('select');
    setModalType(null);
  };

  // Конфигурация всех шагов
  const steps = {
    select: {
      component: StepSelect,
      props: { 
        onSelect: handleSelectType,
        onClose: handleClose 
      },
      showBackButton: false
    },
    create: {
      component: CreatePondModal,
      props: { 
        isOpen: true,
        onClose: handleBackToSelection,
        onCreate: handlePondCreated
      },
      showBackButton: true
    },
    link: {
      component: AddPondByLinkModal,
      props: { 
        isOpen: true,
        onClose: handleBackToSelection,
        onAdd: handleLinkPondAdded
      },
      showBackButton: true
    }
  };

  const CurrentStep = steps[currentStep].component;
  const currentProps = steps[currentStep].props;
  const showBackButton = steps[currentStep].showBackButton;

  if (currentStep === 'create' || currentStep === 'link') {
    // Рендерим дочернее модальное окно напрямую
    return <CurrentStep {...currentProps} />;
  }

  // Рендерим основное модальное окно выбора типа
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
        padding: '32px',
        borderRadius: '12px',
        width: '90%',
        maxWidth: '480px',
        maxHeight: '90vh',
        boxShadow: '0 10px 25px rgba(0,0,0,0.2)',
        overflow: 'hidden',
        display: 'flex',
        flexDirection: 'column',
        position: 'relative'
      }}>
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
        
        <h2 style={{ 
          margin: '0 0 32px 0', 
          fontSize: '28px', 
          fontWeight: '800',
          color: '#013b45ff',
          textAlign: 'center',
          paddingRight: '40px',
          flexShrink: 0
        }}>
          Добавить пруд
        </h2>
        
        <div style={{
          flex: 1,
          overflow: 'auto',
          display: 'flex',
          flexDirection: 'column',
          minHeight: 0,
          paddingRight: '20px',
          marginRight: '-20px'
        }}>
          <CurrentStep {...currentProps} />
        </div>
      </div>
    </div>,
    document.body
  );
}

// Компонент выбора типа пруда
function StepSelect({ onSelect, onClose }) {
  const options = [
    {
      id: 'create',
      title: 'Создать свой пруд',
      description: 'Создайте новый пруд с нуля',
      icon: '✨',
      color: '#27ae60'
    },
    {
      id: 'link',
      title: 'Добавить по ссылке',
      description: 'Вставьте ссылку на пруд и скопируйте его к себе',
      icon: '🔗',
      color: '#3498db'
    },
    {
      id: 'public',
      title: 'Найти публичный пруд',
      description: 'Выберите из коллекции публичных прудов',
      icon: '🌍',
      color: '#9b59b6'
    }
  ];

  return (
    <div style={{
      display: 'flex',
      flexDirection: 'column',
      gap: '16px'
    }}>
      {options.map((option) => (
        <button
          key={option.id}
          onClick={() => onSelect(option.id)}
          style={{
            display: 'flex',
            alignItems: 'flex-start',
            padding: '20px',
            border: `2px solid ${option.color}20`,
            borderRadius: '12px',
            backgroundColor: 'white',
            cursor: 'pointer',
            transition: 'all 0.3s ease',
            textAlign: 'left',
            width: '100%',
            gap: '16px'
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.backgroundColor = `${option.color}08`;
            e.currentTarget.style.borderColor = `${option.color}40`;
            e.currentTarget.style.transform = 'translateY(-2px)';
            e.currentTarget.style.boxShadow = '0 4px 12px rgba(0,0,0,0.1)';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.backgroundColor = 'white';
            e.currentTarget.style.borderColor = `${option.color}20`;
            e.currentTarget.style.transform = 'translateY(0)';
            e.currentTarget.style.boxShadow = 'none';
          }}
        >
          <div style={{
            fontSize: '32px',
            lineHeight: 1,
            flexShrink: 0
          }}>
            {option.icon}
          </div>
          
          <div style={{ flex: 1 }}>
            <h3 style={{
              margin: '0 0 8px 0',
              fontSize: '18px',
              fontWeight: '700',
              color: option.color
            }}>
              {option.title}
            </h3>
            <p style={{
              margin: 0,
              fontSize: '14px',
              color: '#7f8c8d',
              lineHeight: 1.5
            }}>
              {option.description}
            </p>
          </div>
          
          <div style={{
            alignSelf: 'center',
            color: option.color,
            fontSize: '20px',
            flexShrink: 0
          }}>
            →
          </div>
        </button>
      ))}
      
      <div style={{
        marginTop: '8px',
        paddingTop: '16px',
        borderTop: '1px solid #eee',
        display: 'flex',
        justifyContent: 'center'
      }}>
        <button
          onClick={onClose}
          style={{
            padding: '10px 24px',
            border: '2px solid #bdc3c7',
            borderRadius: '8px',
            backgroundColor: 'transparent',
            color: '#7f8c8d',
            cursor: 'pointer',
            fontSize: '14px',
            fontWeight: '600',
            transition: 'all 0.3s ease'
          }}
          onMouseEnter={(e) => {
            e.target.style.backgroundColor = '#f8f9fa';
            e.target.style.borderColor = '#95a5a6';
            e.target.style.color = '#34495e';
          }}
          onMouseLeave={(e) => {
            e.target.style.backgroundColor = 'transparent';
            e.target.style.borderColor = '#bdc3c7';
            e.target.style.color = '#7f8c8d';
          }}
        >
          Отмена
        </button>
      </div>
    </div>
  );
}