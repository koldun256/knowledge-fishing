// src/components/CreateFishModal.jsx
import React, { useState, useEffect, useCallback } from 'react';
import ReactDOM from 'react-dom';
import { formatString } from '../helper/stringFormating'

export default function CreateFishModal({ isOpen, onClose, onCreate, pondId }) {
  const [formData, setFormData] = useState({
    question: '',
    answer: '',
    depth_level: 0
  });

  const handleClose = useCallback(() => {
    setFormData({
      question: '',
      answer: '',
      depth_level: 0
    });
    onClose();
  }, [onClose]);

  const handleBackdropClick = useCallback((e) => {
    if (e.target === e.currentTarget) {
      handleClose();
    }
  }, [handleClose]);

  const handleChange = useCallback((e) => {
    setFormData(prev => ({
      ...prev,
      [e.target.name]: e.target.value
    }));
  }, []);

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
      setFormData({
        question: '',
        answer: '',
        depth_level: 0
      });
    }
  }, [isOpen]);
  
  if (!isOpen) return null;

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!formData.question.trim()) {
      alert('Заполните вопрос');
      return;
    }
    
    // Экранируем специальные символы перед отправкой
    const processedData = {
      ...formData,
      question: formatString(formData.question),
      answer: formatString(formData.answer)
    };
    
    onCreate(pondId, processedData);
    handleClose();
  };

  return ReactDOM.createPortal(
    <div 
      className="fixed inset-0 bg-black/50 flex justify-center items-center z-[10000] p-4"
      onClick={handleBackdropClick}
    >
      <div className="bg-white p-6 rounded-xl w-full max-w-[500px] max-h-[90vh] shadow-2xl overflow-hidden flex flex-col relative">
        {/* Крестик закрытия в правом верхнем углу */}
        <button
          onClick={handleClose}
          className="absolute top-4 right-4 bg-none border-none text-2xl cursor-pointer text-gray-600 w-8 h-8 flex items-center justify-center rounded transition-all duration-300 ease-in-out hover:bg-gray-100 hover:text-gray-800 z-10"
        >
          ×
        </button>
        
        {/* Заголовок - фиксированный */}
        <h2 className="m-0 mb-5 text-2xl font-extrabold text-[#013b45] text-center pr-10 flex-shrink-0">
          Добавить новую рыбу
        </h2>
        
        {/* Основной контент - прокручиваемый с правильным отступом */}
        <div className="flex-1 overflow-auto flex flex-col min-h-0 pr-5 -mr-5">
          <form onSubmit={handleSubmit} className="flex flex-col flex-1">
            {/* Поле Вопрос */}
            <div className="mb-5 flex-shrink-0">
              <label className="block mb-2 font-semibold text-lg text-gray-700 uppercase tracking-wider">
                ВОПРОС *
              </label>
              <textarea
                name="question"
                value={formData.question}
                onChange={handleChange}
                placeholder="Чем занимаются карпы в свободное время?"
                rows={3}
                className="w-full p-3 border-2 border-gray-300 rounded-lg text-base box-border transition-colors duration-300"
                required
              />
            </div>

            {/* Поле Ответ */}
            <div className="mb-5 flex-shrink-0">
              <label className="block mb-2 font-semibold text-lg text-gray-700 uppercase tracking-wider">
                ОТВЕТ
              </label>
              <textarea
                name="answer"
                value={formData.answer}
                onChange={handleChange}
                placeholder="Замаривают червячка"
                rows={3}
                className="w-full p-3 border-2 border-gray-300 rounded-lg text-base box-border transition-colors duration-300"
              />
            </div>

            {/* Кнопка добавления */}
            <div className="flex justify-end mb-5 flex-shrink-0">
              <button
                type="submit"
                className="p-3 border-none rounded-lg bg-green-500 text-white cursor-pointer text-base font-semibold transition-all duration-300 ease-in-out hover:bg-green-600"
              >
                ДОБАВИТЬ РЫБУ
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>,
    document.body
  );
}
