// src/components/CreateFishesModal.jsx
import React, { useState, useEffect } from 'react';
import ReactDOM from 'react-dom';

// Импортируем функцию экранирования
import { formatString, cleanJsonString } from '../helper/stringFormating';

const CreateFishesModal = ({ isOpen, onClose, onCreate, pondId }) => {
  const [jsonInput, setJsonInput] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [copySuccess, setCopySuccess] = useState(false);

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
      setJsonInput('');
      setError('');
      setCopySuccess(false);
    }
  }, [isOpen]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    
    if (!jsonInput.trim()) {
      setError('Введите JSON данные');
      return;
    }

    try {
      jsonInput.trim();
      const correctedInput = cleanJsonString(jsonInput);
      console.log("jsonInput = ", correctedInput);
      const fishesData = JSON.parse(correctedInput);
      
      if (typeof fishesData !== 'object' || fishesData === null || Array.isArray(fishesData)) {
        throw new Error('Информация о рыбах должна быть в формате {"question1": "answer1", "question2": "answer2", ...}');
      }

      setIsLoading(true);
      // Передаем обработанные данные с экранированными символами
      await onCreate(pondId, fishesData);
      setJsonInput('');
      onClose();
      
    } catch (err) {
      console.error('Error creating fishes:', err);
      setError(`Ошибка: ${err.message}`);
    } finally {
      setIsLoading(false);
    }
  };

  const handleClose = () => {
    setJsonInput('');
    setError('');
    onClose();
  };

  const queryString = [
    'Сгенерируй пары "вопрос-ответ". Требования:',
    '1. Количество пар "вопрос-ответ" - *20*',
    '2. Тема: *рыболовные снасти*',
    '3. Вопрос должен содержать *название снасти*',
    '4. Ответ должен *объяснять что это и для чего предназначено*',
    '5. Верни ТОЛЬКО строку ответ без форматирования и дополнительного текста',
    '6. Структура: {\"question1\": \"answer1\", \"question2\": \"answer2\", ...}',
    '7. Длина вопроса и ответа не должна превышать 1000 символов',
    '',
    'Пример: {\"Что такое спиннинг?\": \"Спиннинг - удилище для ловли хищной рыбы...\"}'
  ].join('\n');
  
  const handleCopyToClipboard = () => {
    navigator.clipboard.writeText(queryString)
      .then(() => {
        setCopySuccess(true);
        setTimeout(() => setCopySuccess(false), 2000);
      })
      .catch(err => {
        console.error('Ошибка копирования: ', err);
      });
  };

  const exampleJson = `{
  "Какая рыба самая быстрая?": "Парусник",
  "Сколько лет живет карп?": "20-30 лет",
  "Какого размера достигает щука?": "до 1.5 метров"
}`;

  // Пример JSON с специальными символами для демонстрации
  const exampleWithSpecialChars = `{
  "Что такое 'спиннинг'?": "Спиннинг - удилище для ловли хищной рыбы\\nОбычно используется с катушкой",
  "Как выбрать леску?": "Леска бывает:\\n- Монофильная\\n- Плетеная\\n- Флюорокарбоновая",
  "Что означает 'тест' удилища?": "Тест удилища - это рекомендуемый вес приманки.\\tНапример: 5-20 г"
}`;

  if (!isOpen) return null;

  return ReactDOM.createPortal(
    <div 
      className="fixed inset-0 bg-black/50 flex justify-center items-center z-[10000] p-4"
      onClick={handleBackdropClick}
    >
      <div className="bg-white p-6 rounded-xl w-full max-w-[600px] max-h-[90vh] shadow-2xl overflow-hidden flex flex-col relative">
        {/* Крестик закрытия в правом верхнем углу */}
        <button
          onClick={handleClose}
          className="absolute top-4 right-4 bg-none border-none text-2xl cursor-pointer text-gray-600 w-8 h-8 flex items-center justify-center rounded transition-all duration-300 ease-in-out hover:bg-gray-100 hover:text-gray-800 z-10"
        >
          ×
        </button>
        
        {/* Заголовок - фиксированный */}
        <h2 className="m-0 mb-5 text-2xl font-extrabold text-[#013b45] text-center pr-10 flex-shrink-0">
          Добавить несколько рыб
        </h2>
        
        {/* Основной контент - прокручиваемый с правильным отступом */}
        <div className="flex-1 overflow-auto flex flex-col min-h-0 pr-5 -mr-5">
          <form onSubmit={handleSubmit} className="flex flex-col flex-1">
            {/* Поле JSON - уменьшенное */}
            <div className="mb-5 flex-shrink-0">
              <label className="block mb-2 font-semibold text-lg text-gray-700 uppercase tracking-wider">
                ВВЕДИТЕ ДАННЫЕ РЫБ В ФОРМАТЕ {"{\"question1\": \"answer1\", \"question2\": \"answer2\", ...}"} *
              </label>
              <textarea
                value={jsonInput}
                onChange={(e) => setJsonInput(e.target.value)}
                placeholder={exampleJson}
                rows={8}
                className="w-full p-3 border-2 border-gray-300 rounded-lg text-sm box-border transition-colors duration-300 font-mono resize-none min-h-[150px] overflow-auto"
                spellCheck="false"
                required
              />
            </div>

            {/* Сообщение об ошибке */}
            {error && (
              <div className="mb-5 p-3 bg-red-50 border-2 border-red-500 rounded-lg text-red-700 text-sm flex-shrink-0">
                {error}
              </div>
            )}

            {/* Кнопка создания - ПЕРЕМЕЩЕНА ВВЕРХ */}
            <div className="flex justify-end gap-3 mb-5 flex-shrink-0">
              <button
                type="submit"
                disabled={isLoading}
                className={`p-3 border-none rounded-lg text-white cursor-pointer text-base font-semibold transition-all duration-300 ease-in-out ${
                  isLoading 
                    ? 'bg-gray-400 cursor-not-allowed opacity-60' 
                    : 'bg-green-500 hover:bg-green-600'
                }`}
              >
                {isLoading ? 'СОЗДАНИЕ...' : 'ДОБАВИТЬ РЫБ'}
              </button>
            </div>

            {/* Блок с запросом для ИИ - БЕЗ прокрутки */}
            <div className="mb-5 p-4 bg-gray-50 border border-gray-200 rounded-lg relative flex-shrink-0">
              {/* Пояснение отдельно */}
              <div className="mb-3 text-sm text-gray-700 font-medium">
                Вы можете использовать ИИ для генерации вопросов и ответов. Вот пример запроса к ИИ (изменяемые параметры запроса находятся в первых четырех пунктах):
              </div>
              
              {/* Контейнер для промпта с относительным позиционированием */}
              <div className="relative">
                {/* Текст запроса с отступом для иконки */}
                <div className="text-sm text-gray-600 leading-relaxed whitespace-pre-line bg-white p-3 rounded border border-gray-300 font-mono text-[13px] pr-10">
                  {queryString}
                </div>
                
                {/* Иконка для копирования в правом верхнем углу контейнера промпта */}
                <div 
                  onClick={handleCopyToClipboard}
                  className="cursor-pointer absolute top-2 right-2 w-6 h-6 flex items-center justify-center bg-white rounded border border-gray-300 z-10 opacity-70 transition-all duration-300 ease-in-out hover:opacity-100 hover:bg-gray-50 hover:shadow-md"
                  title="Копировать промпт"
                >
                  {/* SVG иконка копирования */}
                  <svg 
                    xmlns="http://www.w3.org/2000/svg" 
                    width="16" 
                    height="16" 
                    viewBox="0 0 24 24" 
                    fill="none" 
                    stroke="#6c757d" 
                    strokeWidth="1.5"
                  >
                    <rect x="9" y="9" width="13" height="13" rx="2" ry="2"></rect>
                    <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"></path>
                  </svg>
                </div>
              </div>

              {/* Сообщение об успешном копировании */}
              {copySuccess && (
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 px-4 py-2 bg-green-500 text-white text-sm rounded whitespace-nowrap z-50 shadow-lg animate-fadeInOut">
                  Скопировано!
                </div>
              )}

              {/* Добавляем стили для анимации */}
              <style>{`
                @keyframes fadeInOut {
                  0% { opacity: 0; }
                  20% { opacity: 1; }
                  80% { opacity: 1; }
                  100% { opacity: 0; }
                }
                .animate-fadeInOut {
                  animation: fadeInOut 2s ease;
                }
              `}</style>
            </div>
          </form>
        </div>
      </div>
    </div>,
    document.body
  );
};

export default CreateFishesModal;
