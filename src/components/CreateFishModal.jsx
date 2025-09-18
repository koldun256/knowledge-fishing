// src/components/CreateFishModal.jsx
import React, { useState } from 'react';

export default function CreateFishModal({ isOpen, onClose, onCreate, pondId }) {
  const [formData, setFormData] = useState({
    question: '',
    answer: '',
    depth_level: 0
  });
  const [loading, setLoading] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.question.trim() || !formData.answer.trim()) return;

    setLoading(true);
    try {
      await onCreate(pondId, formData);
      setFormData({ question: '', answer: '', depth_level: 0 });
      onClose();
    } catch (error) {
      console.error('Error creating fish:', error);
      alert('Ошибка при создании рыбы');
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    setFormData(prev => ({
      ...prev,
      [e.target.name]: e.target.value
    }));
  };

  return (
    <div className="fixed inset-0 z-[110] bg-black bg-opacity-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-lg w-full max-w-2xl p-6 max-h-[90vh] overflow-y-auto">
        <h2 className="text-2xl font-bold mb-4">Создать новую рыбу</h2>
        <p className="text-gray-600 mb-6">Добавьте вопрос и ответ для новой рыбы в пруде</p>
        
        <form onSubmit={handleSubmit}>
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Вопрос *
            </label>
            <textarea
              name="question"
              value={formData.question}
              onChange={handleChange}
              placeholder="Введите вопрос..."
              rows={3}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
            />
          </div>

          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Ответ *
            </label>
            <textarea
              name="answer"
              value={formData.answer}
              onChange={handleChange}
              placeholder="Введите ответ..."
              rows={4}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
            />
          </div>

          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Уровень глубины
            </label>
            <select
              name="depth_level"
              value={formData.depth_level}
              onChange={handleChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value={0}>🟦 Уровень 0 (Мелководье)</option>
              <option value={1}>🟪 Уровень 1</option>
              <option value={2}>🟫 Уровень 2</option>
              <option value={3}>⬛ Уровень 3 (Глубина)</option>
            </select>
            <p className="text-sm text-gray-500 mt-1">
              Выберите уровень глубины, на котором будет плавать рыба
            </p>
          </div>

          <div className="flex justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              disabled={loading}
              className="px-4 py-2 text-gray-600 border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50"
            >
              Отмена
            </button>
            <button
              type="submit"
              disabled={loading || !formData.question.trim() || !formData.answer.trim()}
              className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? 'Создание...' : 'Создать рыбу'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
