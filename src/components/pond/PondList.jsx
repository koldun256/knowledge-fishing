import React, { useState, useEffect } from 'react';
import { pondService } from '../../services/pondService';

const PondList = ({ onPondSelect }) => {
  const [ponds, setPonds] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadPonds = async () => {
      try {
        const data = await pondService.getAllPonds();
        setPonds(data);
      } catch (error) {
        console.error('Ошибка загрузки прудов:', error);
      } finally {
        setLoading(false);
      }
    };

    loadPonds();
  }, []);

  if (loading) {
    return <div className="p-8 text-center">Загрузка прудов...</div>;
  }

  return (
    <div className="max-w-4xl mx-auto p-6">
      <h1 className="text-3xl font-bold text-gray-800 mb-6">Мои пруды знаний</h1>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {ponds.map(pond => (
          <div 
            key={pond.id}
            className="border rounded-lg p-6 hover:shadow-md transition-shadow cursor-pointer bg-white"
            onClick={() => onPondSelect(pond.id)}
          >
            <h2 className="text-xl font-semibold text-gray-800 mb-2">{pond.name}</h2>
            <p className="text-gray-600 mb-3">{pond.description}</p>
            <div className="text-sm text-gray-500">
              <div>Тема: {pond.topic}</div>
              <div>Обновлен: {new Date(pond.updated_at).toLocaleDateString()}</div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default PondList;