// src/pages/Pond.jsx
import React, { useEffect, useMemo, useState } from 'react';
import ReactDOM from 'react-dom';
import { useParams, useNavigate } from 'react-router-dom';

// контекст
import { PondProvider, usePond } from '../context/PondContext';

// канвас-сцена
import CanvasStage from '../components/CanvasStage';

// слои
import createWaterSurfaceLayer from '../layers/waterSurface';
import createUnderwaterBackLayer from '../layers/underwaterBack';
import createUnderwaterFrontLayer from '../layers/underwaterFront';
import createFishesLayer from '../layers/fishes';
import createFishingLineLayer from '../layers/fishingLine';
import createBoatLayer from '../layers/boat';

// диалог
import FishingDialog from '../components/FishingDialog';
import CreateFishModal from '../components/CreateFishModal';
import CreateFishesModal from '../components/CreateFishesModal'; // Новый компонент

// сервисы (моки)
import { pondService } from '../services/pondService';
import { fishService } from '../services/fishService';

// ассеты (спрайт рыб)
import { Assets } from '../utils/assets';

function PondInner() {
  const { pondId } = useParams(); // Получаем pondId из URL
  const navigate = useNavigate();
  const {
    pond, setPond,
    fishes, setFishes,
    getState,
    fishing, setFishing,
    boat,
    dialog,
  } = usePond();

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isCreateFishModalOpen, setIsCreateFishModalOpen] = useState(false);
  const [isCreateFishesModalOpen, setIsCreateFishesModalOpen] = useState(false); // Новое состояние

  // Загрузка ассетов + данных пруда/рыб
  useEffect(() => {
    if (!pondId) {
      setError('ID пруда не указан');
      setLoading(false);
      return;
    }

    let cancelled = false;
    
    (async () => {
      try {
        setLoading(true);
        setError(null);
        
        console.log('Loading pond data for ID:', pondId);
        
        await Assets.loadImage('fishSheet', '/assets/fish_spritesheet_px.png').catch((e) => {
          console.warn('Failed to load fish sprite:', e);
        });
        
        const [pondData, fishesData] = await Promise.all([
          pondService.getPondById(pondId),
          fishService.getFishesByPondId(pondId),
        ]);
        
        if (!cancelled) {
          setPond(pondData);
          setFishes(fishesData);
          console.log('Pond and fishes data loaded successfully');
        }
      } catch (e) {
        console.error('Ошибка загрузки данных:', e);
        if (!cancelled) {
          setError('Не удалось загрузить данные пруда');
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    
    return () => { cancelled = true; };
  }, [pondId, setPond, setFishes]);

  const handleCreateFish = async (pondId, fishData) => {
    try {
      console.log('Creating fish with data:', fishData);
      const newFish = await fishService.createFish(pondId, fishData);
      
      setFishes(prev => [...prev, newFish]);
      console.log('Fish created and added to list:', newFish);
      
      return newFish;
    } catch (error) {
      console.error('Error in handleCreateFish:', error);
      throw error;
    }
  };

  // Новая функция для создания нескольких рыб
  const handleCreateFishes = async (pondId, fishesData) => {
    try {
      console.log('Creating multiple fishes with data:', fishesData);
      
      // Создаем массив промисов для создания всех рыб
      // const createPromises = Object.entries(fishesData).map(([key, fishData]) => {
      //   return fishService.createFish(pondId, fishData);
      // });

      
      // Ждем завершения всех запросов
      const newFishes = await fishService.createFishes(pondId, fishesData);
      
      // Добавляем всех новых рыб в список
      setFishes(prev => [...prev, ...newFishes]);
      console.log('Fishes created and added to list:', newFishes);
      
      return newFishes;
    } catch (error) {
      console.error('Error in handleCreateFishes:', error);
      throw error;
    }
  };

  const layers = useMemo(() => ([
    createWaterSurfaceLayer({
      levelGradients: [
        ['#7EC8FA', '#5FB4F5'],
        ['#57ABF2', '#2F8EE8'],
        ['#277FD7', '#1B63B9'],
        ['#134A97', '#0C3877'],
      ],
    }),
    createUnderwaterBackLayer({
      enableGradient: true,
      enableVegetation: true,
      enableInternalWaves: false,
      enableCaustics: false,
    }),
    createFishesLayer(),
    createUnderwaterFrontLayer({
      enableDepthFog: true,
      enableMotes: true,
      enableBubbles: true,
    }),
    createFishingLineLayer(),
    createBoatLayer(),
  ]), []);

  const startFishing = async () => {
    try {
      if (fishing.phase !== 'idle' || dialog.open) return;

      const nextFish = await pondService.getNextFish(pondId);

      setFishing(prev => ({
        ...prev,
        phase: 'casting',
        targetFishId: nextFish.id,
        boatX: boat?.x ?? window.innerWidth * 0.5,
        hookX: null,
        hookY: null,
      }));
    } catch (e) {
      console.error('Ошибка начала рыбалки:', e);
    }
  };

  if (loading) return <div className="p-8 text-center">Загрузка пруда...</div>;
  if (error) return (
    <div className="p-8 text-center">
      <div className="text-red-500 mb-4">{error}</div>
      <button 
        onClick={() => navigate('/')}
        className="bg-blue-600 text-white px-4 py-2 rounded"
      >
        Вернуться к списку прудов
      </button>
    </div>
  );
  if (!pond) return <div className="p-8 text-center text-red-500">Пруд не найден</div>;

  const canStart = fishing.phase === 'idle' && !dialog.open;

  return (
    <>
      <CanvasStage
        skyRatio={0.12}
        layers={layers}
        getState={getState}
        className="fixed inset-0 z-0"
      />

      {/* Кнопки с transform для создания нового контекста стекинга */}
      <div className="absolute top-4 left-4 z-[9999] transform">
        <div className="flex items-center gap-2">
          <button
            onClick={() => navigate('/')}
            className="bg-white/95 hover:bg-white text-slate-800 px-4 py-2 rounded-lg shadow-lg border border-gray-300 transition-all"
          >
            ← Назад к прудам
          </button>
          
          <button
            onClick={() => setIsCreateFishModalOpen(true)}
            className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg shadow-lg transition-all"
          >
            🐟 Создать рыбу
          </button>
          
          {/* Новая кнопка для создания нескольких рыб */}
          <button
            onClick={() => setIsCreateFishesModalOpen(true)}
            className="bg-green-700 hover:bg-green-800 text-white px-4 py-2 rounded-lg shadow-lg transition-all"
          >
            🐟🐟 Создать рыб
          </button>
        </div>
      </div>

      {canStart && (
        <div className="absolute top-4 right-4 z-[9999] transform">
          <button
            onClick={startFishing}
            className="bg-blue-700 hover:bg-blue-800 text-white px-6 py-2 rounded-lg shadow-lg transition-all"
          >
            🎣 Начать рыбалку
          </button>
        </div>
      )}

      <FishingDialog />
      <CreateFishModal
        isOpen={isCreateFishModalOpen}
        onClose={() => setIsCreateFishModalOpen(false)}
        onCreate={handleCreateFish}
        pondId={pondId}
      />
      
      {/* Новое модальное окно для создания нескольких рыб */}
      <CreateFishesModal
        isOpen={isCreateFishesModalOpen}
        onClose={() => setIsCreateFishesModalOpen(false)}
        onCreate={handleCreateFishes}
        pondId={pondId}
      />
    </>
  );
}
      

export default function Pond() {
  return (
    <PondProvider>
      <PondInner />
    </PondProvider>
  );
}