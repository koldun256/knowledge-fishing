// src/components/CreateFishesModal.jsx
import React, { useState } from 'react';
import ReactDOM from 'react-dom';

const CreateFishesModal = ({ isOpen, onClose, onCreate, pondId }) => {
  const [jsonInput, setJsonInput] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    
    if (!jsonInput.trim()) {
      setError('Введите JSON данные');
      return;
    }

    try {
      // Парсим JSON
      const fishesData = JSON.parse(jsonInput);
      
      // Проверяем, что это объект с вопросами-ответами
      if (typeof fishesData !== 'object' || fishesData === null || Array.isArray(fishesData)) {
        throw new Error('JSON должен быть объектом в формате {"question1": "answer1", "question2": "answer2", ...}');
      }

      setIsLoading(true);
      
      // Вызываем функцию создания рыб
      await onCreate(pondId, fishesData);
      
      // Закрываем модальное окно и очищаем форму
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

  // Пример правильного формата для подсказки
  const exampleJson = `{
  "Какая рыба самая быстрая?": "Парусник",
  "Сколько лет живет карп?": "20-30 лет",
  "Какого размера достигает щука?": "до 1.5 метров"
}`;

  if (!isOpen) return null;

  return ReactDOM.createPortal(
    <div className="fixed inset-0 z-[10000] flex items-center justify-center bg-black/50">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-2xl mx-4">
        <div className="p-6">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-bold text-gray-800">Создать несколько рыб</h2>
            <button
              onClick={handleClose}
              className="text-gray-500 hover:text-gray-700 text-2xl"
            >
              ×
            </button>
          </div>
          
          <form onSubmit={handleSubmit}>
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Введите данные рыб в формате JSON:
              </label>
              <textarea
                value={jsonInput}
                onChange={(e) => setJsonInput(e.target.value)}
                placeholder={exampleJson}
                className="w-full h-64 p-3 border border-gray-300 rounded-md font-mono text-sm resize-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
                spellCheck="false"
              />
              <div className="mt-1 text-xs text-gray-500">
                Формат: {"{\"question1\": \"answer1\", \"question2\": \"answer2\", ...}"}
              </div>
            </div>
            
            {error && (
              <div className="mb-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded">
                {error}
              </div>
            )}
            
            <div className="flex justify-end gap-3">
              <button
                type="button"
                onClick={handleClose}
                className="px-4 py-2 text-gray-600 border border-gray-300 rounded-md hover:bg-gray-50"
                disabled={isLoading}
              >
                Отмена
              </button>
              <button
                type="submit"
                disabled={isLoading}
                className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isLoading ? 'Создание...' : 'Создать рыб'}
              </button>
            </div>
          </form>
          
          <div className="mt-4 p-3 bg-blue-50 rounded-md">
            <h3 className="font-medium text-blue-800 mb-1">Пример правильного формата:</h3>
            <pre className="text-xs text-blue-700 whitespace-pre-wrap">{exampleJson}</pre>
          </div>
        </div>
      </div>
    </div>,
    document.body
  );
};

export default CreateFishesModal;
