// src/components/PondTypeSelectionModal.jsx
import React, { useState, useEffect } from 'react';
import ReactDOM from 'react-dom';
import { useNavigate } from 'react-router-dom';
import CreatePondModal from './CreatePondModal';
import AddPondByLinkModal from './AddPondByLinkModal';

export default function PondTypeSelectionModal({ isOpen, onClose, onCreate, onAddByLink, userPonds = [] }) {
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
      navigate('/public-ponds');
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

  const handleLinkPondAdded = (pondId, trackUpdates, type) => {
    onAddByLink(pondId, trackUpdates, type);
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
        onCreate: handlePondCreated,
        userPonds: userPonds
      },
      showBackButton: true
    },
    link: {
      component: AddPondByLinkModal,
      props: { 
        isOpen: true,
        onClose: handleBackToSelection,
        onAddByLink: handleLinkPondAdded
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
    <div 
      className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-[10000] p-4"
      onClick={handleBackdropClick}
    >
      <div className="bg-white p-8 rounded-xl w-[90%] max-w-[480px] max-h-[90vh] shadow-2xl overflow-hidden flex flex-col relative">
        <button
          onClick={handleClose}
          className="absolute top-4 right-4 bg-transparent border-none text-2xl cursor-pointer text-gray-600 w-8 h-8 flex items-center justify-center rounded transition-all duration-300 ease-in-out z-10 hover:bg-gray-100 hover:text-gray-800"
        >
          ×
        </button>
        
        <h2 className="m-0 mb-8 text-[28px] font-extrabold text-[#013b45] text-center pr-10 flex-shrink-0">
          Добавить пруд
        </h2>
        
        <div className="flex-1 overflow-auto flex flex-col min-h-0 pr-5 -mr-5">
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
    <div className="flex flex-col gap-4">
      {options.map((option) => (
        <button
          key={option.id}
          onClick={() => onSelect(option.id)}
          className="flex items-start p-5 border-2 rounded-xl bg-white cursor-pointer transition-all duration-300 ease-in-out text-left w-full gap-4 hover:-translate-y-0.5 hover:shadow-md"
          style={{
            borderColor: `${option.color}20`,
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.backgroundColor = `${option.color}08`;
            e.currentTarget.style.borderColor = `${option.color}40`;
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.backgroundColor = 'white';
            e.currentTarget.style.borderColor = `${option.color}20`;
          }}
        >
          <div className="text-3xl leading-none flex-shrink-0">
            {option.icon}
          </div>
          
          <div className="flex-1">
            <h3 className="m-0 mb-2 text-lg font-bold" style={{ color: option.color }}>
              {option.title}
            </h3>
            <p className="m-0 text-sm text-gray-600 leading-relaxed">
              {option.description}
            </p>
          </div>
          
          <div className="self-center" style={{ color: option.color }}>
            →
          </div>
        </button>
      ))}
      
      <div className="mt-2 pt-4 border-t border-gray-200 flex justify-center">
        <button
          onClick={onClose}
          className="px-6 py-2.5 border-2 border-gray-300 rounded-lg bg-transparent text-gray-600 cursor-pointer text-sm font-semibold transition-all duration-300 ease-in-out hover:bg-gray-50 hover:border-gray-400 hover:text-gray-700"
        >
          Отмена
        </button>
      </div>
    </div>
  );
}
