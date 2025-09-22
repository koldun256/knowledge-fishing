// src/pages/PondsList.jsx
import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { pondService } from '../services/pondService';
import { authService } from '../services/authService';
import CreatePondModal from '../components/CreatePondModal';
import '../index.css';

export default function PondsList() {
  const [ponds, setPonds] = useState([]);
  const [loading, setLoading] = useState(true);
  const [userInitialized, setUserInitialized] = useState(false);
  const [error, setError] = useState(null);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);

  useEffect(() => {
    console.log('PondsList component mounted - useEffect triggered');
    
    const initializeApp = async () => {
      try {
        console.log('Step 1: Starting user initialization...');
        
        const userData = await authService.initializeUser();
        console.log('User initialized successfully:', userData);
        setUserInitialized(true);
        
        console.log('Step 2: Loading ponds after user initialization...');
        const pondsData = await pondService.getAllPonds();
        console.log('Ponds loaded:', pondsData);
        setPonds(pondsData);
        
      } catch (error) {
        console.error('Initialization error:', error);
        setError('Не удалось загрузить приложение: ' + error.message);
      } finally {
        console.log('Initialization process completed');
        setLoading(false);
      }
    };

    initializeApp();
  }, []);

  const handleCreatePond = async (pondData) => {
    try {
      console.log('Creating pond with data:', pondData);
      const newPond = await pondService.createPond(pondData);
      
      setPonds(prev => [...prev, newPond]);
      console.log('Pond created and added to list:', newPond);
      
      return newPond;
    } catch (error) {
      console.error('Error in handleCreatePond:', error);
      throw error;
    }
  };

  const pondImages = [
    'pond1.png',
    'pond2.png',
    'pond3.png',
    'pond4.png',
    'pond5.png',
    'pond6.png',
    'pond7.png',
    'pond8.png',
  ];

  const getPondImage = (pondId) => {
    const index = parseInt(pondId[0], 16) % pondImages.length;
    return `${process.env.PUBLIC_URL}/assets/${pondImages[index]}`;
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-green-100 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Инициализация пользователя и загрузка прудов...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-green-100 flex items-center justify-center">
        <div className="text-center">
          <div className="text-red-500 text-4xl mb-4">⚠️</div>
          <h2 className="text-xl font-semibold text-gray-800 mb-2">Ошибка загрузки</h2>
          <p className="text-gray-600 mb-4">{error}</p>
          <button 
            onClick={() => window.location.reload()}
            className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg"
          >
            Обновить страницу
          </button>
        </div>
      </div>
    );
  }

  return (
    <>
      <div className="min-h-screen bg-green-grass p-8" style={{color: '#00a028ff'}}>
        <div className="max-w-6xl mx-auto">
          <header className="flex justify-between items-center mb-8">
            <div>
              <h1 className="text-3xl font-bold text-gray-800">Мои пруды знаний</h1>
              {userInitialized && (
                <p className="text-green-600 text-sm mt-1">✓ Пользователь инициализирован</p>
              )}
            </div>
            <button 
              onClick={() => setIsCreateModalOpen(true)}
              className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg shadow-md transition-colors"
            >
              Создать новый пруд
            </button>
          </header>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {ponds.map((pond) => (
              <Link
                key={pond.id}
                to={`/pond/${pond.id}`}
                className="block relative"
              >
                <img 
                  src={getPondImage(pond.id)} 
                  alt={pond.name}
                  className="w-full h-auto"
                />
                <div className="absolute inset-0 flex items-center justify-center">
                  <h3 className="text-white text-xl font-bold text-center px-4 text-shadow">
                    {pond.name}
                  </h3>
                </div>
              </Link>
            ))}
          </div>

          {ponds.length === 0 && (
            <div className="text-center py-16">
              <div className="text-6xl mb-4">🎣</div>
              <h2 className="text-2xl font-semibold text-gray-700 mb-4">
                У вас пока нет прудов
              </h2>
              <p className="text-gray-600 mb-8">
                Создайте свой первый пруд знаний и начните рыбалку!
              </p>
              <button 
                onClick={() => setIsCreateModalOpen(true)}
                className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-3 rounded-lg text-lg transition-colors"
              >
                Создать первый пруд
              </button>
            </div>
          )}
        </div>
      </div>

      <CreatePondModal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        onCreate={handleCreatePond}
      />
    </>
  );
}