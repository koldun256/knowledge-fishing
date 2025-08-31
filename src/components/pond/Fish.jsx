import React from 'react';

const Fish = ({ fish, onDepthChange }) => {
  const getStatusColor = () => {
    switch (fish.status) {
      case 'new': return 'bg-blue-100 border-blue-300';
      case 'reviewing': return 'bg-yellow-100 border-yellow-300';
      case 'mastered': return 'bg-green-100 border-green-300';
      default: return 'bg-gray-100 border-gray-300';
    }
  };

  const getDepthLabel = () => {
    switch (fish.depth_level) {
      case 1: return 'Мелководье';
      case 2: return 'Средняя глубина';
      case 3: return 'Глубоководье';
      default: return 'Неопределено';
    }
  };

  return (
    <div className={`p-4 mb-3 border rounded-lg ${getStatusColor()} shadow-sm`}>
      <div className="font-semibold text-gray-800 mb-2">{fish.question}</div>
      <div className="text-sm text-gray-600 mb-3">{fish.answer}</div>
      <div className="flex justify-between items-center">
        <span className="text-xs px-2 py-1 bg-gray-200 rounded">
          {getDepthLabel()}
        </span>
        <div className="flex space-x-2">
          {[1, 2, 3].map(level => (
            <button
              key={level}
              onClick={() => onDepthChange(fish.id, level)}
              className={`w-8 h-8 rounded-full text-xs font-bold ${
                fish.depth_level === level 
                  ? 'bg-indigo-600 text-white' 
                  : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
              }`}
            >
              {level}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Fish;