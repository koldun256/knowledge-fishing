// src/components/AddPondByLinkModal.jsx
import React, { useState, useEffect } from 'react';
import ReactDOM from 'react-dom';

import { shareUrlPrefix } from './SharePondModal';

export default function AddPondByLinkModal({ isOpen, onClose, onAddByLink }) {
  const [link, setLink] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [trackUpdates, setTrackUpdates] = useState(true);

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
      setLink('');
      setError('');
      setTrackUpdates(true);
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const validateUuid = (uuid) => {
    const regex = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
    return regex.test(uuid);
  };

  const validateUsernamePondName = (path) => {
    // Проверяем формат: username/pond-name
    // Разрешаем буквы, цифры, дефисы и подчеркивания в имени пользователя и имени пруда
    const regex = /^[a-zA-Z0-9_-]+\/[a-zA-Z0-9_-]+$/;
    return regex.test(path);
  };

  const extractPondIdentifier = (url) => {
    // Убираем префикс и начальные/конечные слеши
    let path = url.replace(shareUrlPrefix, '').replace(/^\/+|\/+$/g, '');
    
    // Проверяем, является ли путь UUID
    if (validateUuid(path)) {
      return { type: 'uuid', identifier: path };
    }
    
    // Проверяем, является ли путь форматом username/pond-name
    if (validateUsernamePondName(path)) {
      return { type: 'username_pondname', identifier: path };
    }
    
    return null;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!link.trim()) {
      setError('Введите ссылку на пруд');
      return;
    }

    if (!link.startsWith(shareUrlPrefix)) {
      setError(`Ссылка должна начинаться с ${shareUrlPrefix}`);
      return;
    }

    const pondInfo = extractPondIdentifier(link);
    if (!pondInfo) {
      setError(`Ссылка должна быть в одном из форматов:\n1. ${shareUrlPrefix}/корректный_id_пруда\n2. ${shareUrlPrefix}/имя_пользователя/имя_пруда`);
      return;
    }

    setLoading(true);
    setError('');

    try {
      console.log(pondInfo.identifier, trackUpdates);
      await onAddByLink(pondInfo.identifier, trackUpdates, pondInfo.type);
      handleClose();
    } catch (error) {
      console.error('Error creating pond:', error);
      setError('Не удалось добавить пруд. Проверьте ссылку и попробуйте снова.');
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    setLink(e.target.value);
    if (error) setError('');
  };

  const handleClose = () => {
    setLink('');
    setError('');
    setLoading(false);
    setTrackUpdates(true);
    onClose();
  };

  return ReactDOM.createPortal(
    <div 
      className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-[10000] p-0"
      onClick={handleBackdropClick}
    >
      <div className="bg-white p-6 rounded-xl w-[90%] max-w-[500px] max-h-[90vh] shadow-2xl overflow-hidden flex flex-col relative">
        <button
          onClick={handleClose}
          className="absolute top-4 right-4 bg-transparent border-none text-2xl cursor-pointer text-gray-600 w-8 h-8 flex items-center justify-center rounded transition-all duration-300 ease-in-out z-10 hover:bg-gray-100 hover:text-gray-800"
        >
          ×
        </button>
        
        <h2 className="m-0 mb-5 text-[28px] font-extrabold text-blue-500 text-center pr-10 flex-shrink-0">
          Добавить пруд по ссылке
        </h2>
        
        <div className="flex-1 overflow-auto flex flex-col min-h-0 pr-5 -mr-5">
          <form onSubmit={handleSubmit} className="flex flex-col flex-1">
            {/* Поле для ввода ссылки */}
            <div className="mb-3 flex-shrink-0">
              <label className="block mb-3 font-semibold text-lg text-gray-700 uppercase tracking-wider">
                ССЫЛКА НА ПРУД *
              </label>
              <input
                type="url"
                value={link}
                onChange={handleChange}
                placeholder={`${shareUrlPrefix}pond_identificator`}
                className={`w-full p-3.5 border-2 rounded-lg text-base box-border transition-colors duration-300 ease-in-out font-mono ${
                  error ? 'border-red-500' : 'border-gray-300'
                }`}
                required
                autoFocus
              />
              
              {error && (
                <div className="mt-2 p-2.5 bg-red-50 border border-red-500 rounded-lg text-red-700 text-sm">
                  ⚠️ {error}
                </div>
              )}
              
              <div className="mt-3 p-3 bg-gray-50 rounded-lg text-sm text-gray-600">
                <p className="m-0 mb-2 font-semibold">
                  Как получить ссылку на пруд?
                </p>
                <ul className="m-0 pl-5">
                  <li>Попросите у владельца пруда ссылку для копирования или найдите в интернете ссылку на публичный пруд</li>
                </ul>
              </div>
            </div>

            {/* Окошко с галочкой для отслеживания обновлений */}
            <div className="mb-5 flex-shrink-0 p-4 bg-white rounded-lg border-0 border-gray-300">
              <label className="flex items-start cursor-pointer m-0">
                <input
                  type="checkbox"
                  checked={trackUpdates}
                  onChange={(e) => setTrackUpdates(e.target.checked)}
                  className="mr-3 mt-3 w-7 h-7 cursor-pointer accent-blue-500"
                />
                <div>
                  <div className="font-semibold text-lg text-gray-800 mb-1">
                    Отслеживать обновления
                  </div>
                  <div className="text-sm text-gray-600 leading-relaxed">
                    Если автор изменит пруд, ваш пруд также поменяется
                  </div>
                </div>
              </label>
            </div>

            {/* Кнопки действий */}
            <div className="flex justify-between mt-auto pt-5 flex-shrink-0">
              <button
                type="button"
                onClick={handleClose}
                className="px-6 py-3 border-2 border-gray-300 rounded-lg bg-transparent text-gray-600 cursor-pointer text-sm font-semibold transition-all duration-300 ease-in-out min-w-[120px] hover:bg-gray-50 hover:border-gray-400 hover:text-gray-700"
              >
                Назад
              </button>
              
              <button
                type="submit"
                disabled={loading || !link.trim()}
                className={`px-6 py-3 border-none rounded-lg text-white cursor-pointer text-sm font-semibold transition-all duration-300 ease-in-out min-w-[120px] ${
                  loading ? 'bg-gray-400 cursor-not-allowed' : 'bg-blue-500'
                } ${(loading || !link.trim()) ? 'opacity-60' : 'opacity-100'}`}
              >
                {loading ? 'ДОБАВЛЕНИЕ...' : 'ДОБАВИТЬ ПРУД'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>,
    document.body
  );
}
