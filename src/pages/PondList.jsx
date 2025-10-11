// src/pages/PondsList.jsx
import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { pondService } from '../services/pondService';
import { authService } from '../services/authService';
import CreatePondModal from '../components/CreatePondModal';
import EditPondModal from '../components/EditPondModal';
import '../index.css';

export default function PondsList() {
  const [ponds, setPonds] = useState([]);
  const [loading, setLoading] = useState(true);
  const [userInitialized, setUserInitialized] = useState(false);
  const [error, setError] = useState(null);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [editingPond, setEditingPond] = useState(null);

  // Функция для правильного склонения слова "рыба"
  const getFishWord = (count) => {
    if (count === 1) return 'рыба';
    if (count >= 2 && count <= 4) return 'рыбы';
    return 'рыб';
  };

  useEffect(() => {
    console.log('PondsList component mounted - useEffect triggered');
    
    const initializeApp = async () => {
      try {
        console.log('Step 1: Starting user initialization...');
        
        await authService.initializeUser();
        console.log('User initialized successfully');
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

  const handleEditPond = async (pondData) => {
    try {
      console.log('Editing pond with data:', pondData);
      const updatedPond = await pondService.updatePond(editingPond.id, pondData);
      
      setPonds(prev => prev.map(pond => 
        pond.id === editingPond.id ? updatedPond : pond
      ));
      console.log('Pond updated:', updatedPond);
      
      setEditingPond(null);
      return updatedPond;
    } catch (error) {
      console.error('Error in handleEditPond:', error);
      throw error;
    }
  };

  const handleDeletePond = async (pondId) => {
    try {
      console.log('Deleting pond:', pondId);
      await pondService.deletePond(pondId);
      
      setPonds(prev => prev.filter(pond => pond.id !== pondId));
      console.log('Pond deleted successfully');
      
      setEditingPond(null);
    } catch (error) {
      console.error('Error in handleDeletePond:', error);
      throw error;
    }
  };

  const handleContextMenu = (e, pond) => {
    e.preventDefault();
    e.stopPropagation();
    setEditingPond(pond);
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
        <div className="mx-auto">
          <header className="flex justify-between items-center mb-8">
            <div>
              <h1 className="text-4xl font-bold text-gray-800">Где будем рыбачить?</h1>
            </div>
          </header>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 2xl:grid-cols-4 gap-4">
            {ponds.map((pond) => (
              <div key={pond.id} className="relative group">
                <Link
                  to={`/pond/${pond.id}`}
                  className="block"
                  onContextMenu={(e) => handleContextMenu(e, pond)}
                >
                  <img 
                    src={getPondImage(pond.id)} 
                    alt={pond.name}
                    className="w-full h-auto transition-transform group-hover:scale-105"
                  />
                  <div 
                    className="absolute inset-0 flex flex-col items-center justify-center"
                    style={{
                      margin: '23%',
                      pointerEvents: 'none'
                    }}
                  >
                    <h3 
                      className="text-black text-2xl font-bold text-center w-full mb-2"
                      style={{
                        overflow: 'hidden',
                        textOverflow: 'ellipsis',
                        display: '-webkit-box',
                        WebkitLineClamp: 2,
                        WebkitBoxOrient: 'vertical',
                        lineHeight: '1.2',
                        maxHeight: '2.4em',
                        wordBreak: 'break-word'
                      }}
                      title={pond.name}
                    >
                      {pond.name}
                    </h3>
                    {/* Добавленная надпись о голодных рыбах */}
                    <div className="text-black text-base font-medium text-center w-full px-2 leading-tight">
                      {pond.cnt_ready_fishes !== undefined && pond.cnt_fishes !== undefined ? (
                        <div className="flex flex-col items-center">
                          <span className="whitespace-nowrap">
                            {pond.cnt_ready_fishes} {getFishWord(pond.cnt_ready_fishes)} из {pond.cnt_fishes}
                          </span>
                          <span>уже проголодались</span>
                        </div>
                      ) : (
                        <span className="text-gray-500 text-sm">Информация о рыбах недоступна</span>
                      )}
                    </div>
                  </div>
                </Link>
              </div>
            ))}
            
            <button 
              onClick={() => setIsCreateModalOpen(true)}
              className="block relative focus:outline-none group"
            >
              <img 
                src={`${process.env.PUBLIC_URL}/assets/pond_add.png`} 
                alt="Создать новый пруд"
                className="w-full h-auto transition-transform group-hover:scale-105"
              />
            </button>
          </div>
        </div>
      </div>

      <CreatePondModal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        onCreate={handleCreatePond}
      />

      <EditPondModal
        isOpen={!!editingPond}
        onClose={() => setEditingPond(null)}
        onSave={handleEditPond}
        onDelete={handleDeletePond}
        pond={editingPond}
      />
    </>
  );
}