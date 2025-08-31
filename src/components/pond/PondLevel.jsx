import React from 'react';
import Fish from './Fish';

const PondLevel = ({ level, fishes, onDepthChange }) => {
  const getLevelInfo = () => {
    switch (level) {
      case 1: return { title: 'Мелководье (Новые знания)', color: 'border-blue-300 bg-blue-50' };
      case 2: return { title: 'Средняя глубина (Повторение)', color: 'border-yellow-300 bg-yellow-50' };
      case 3: return { title: 'Глубоководье (Усвоенные)', color: 'border-green-300 bg-green-50' };
      default: return { title: 'Неопределено', color: 'border-gray-300 bg-gray-50' };
    }
  };

  const { title, color } = getLevelInfo();

  return (
    <div className={`border-2 rounded-lg p-4 mb-4 ${color}`}>
      <h3 className="font-bold text-lg mb-3 text-gray-800">{title}</h3>
      {fishes.length === 0 ? (
        <p className="text-gray-500 italic">Нет рыб на этом уровне</p>
      ) : (
        fishes.map(fish => (
          <Fish 
            key={fish.id} 
            fish={fish} 
            onDepthChange={onDepthChange}
          />
        ))
      )}
    </div>
  );
};

export default PondLevel;