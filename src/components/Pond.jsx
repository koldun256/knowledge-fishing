// src/pages/Pond.jsx
import React, { useEffect, useMemo, useState } from 'react';
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
  const [isCreateFishModalOpen, setIsCreateFishModalOpen] = useState(false); // Состояние для модалки

  // Загрузка ассетов + данных пруда/рыб
  useEffect(() => {
    // Если pondId не передан, не пытаемся загружать данные
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
        
        // Сначала загружаем спрайт
        await Assets.loadImage('fishSheet', '/assets/fish_spritesheet_px.png').catch((e) => {
          console.warn('Failed to load fish sprite:', e);
        });
        
        // Затем загружаем данные пруда и рыб
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
      
      // Добавляем новую рыбу в список
      setFishes(prev => [...prev, newFish]);
      console.log('Fish created and added to list:', newFish);
      
      return newFish;
    } catch (error) {
      console.error('Error in handleCreateFish:', error);
      throw error;
    }
  };

  // слои сцены
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

  // запуск рыбалки
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
      />

      {/* Контейнер для кнопок вверху страницы */}
      <div className="fixed top-0 left-0 right-0 z-[100] bg-gradient-to-r from-blue-500/10 to-purple-500/10 backdrop-blur-sm p-4">
        <div className="max-w-7xl mx-auto flex justify-between items-center">
          {/* Левая группа кнопок */}
          <div className="flex items-center gap-3">
            <button
              onClick={() => navigate('/')}
              className="flex items-center gap-2 bg-white/90 hover:bg-white text-slate-800 px-4 py-2 rounded-xl shadow-md border border-gray-200/50 transition-all hover:shadow-lg"
            >
              <span className="text-lg">←</span>
              <span className="font-medium">К прудам</span>
            </button>

            {/* Кнопка создания рыбы */}
            <button
              onClick={() => setIsCreateFishModalOpen(true)}
              className="flex items-center gap-2 bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded-xl shadow-md transition-all hover:shadow-lg"
              title="Создать новую рыбу"
            >
              <span className="text-lg">🐟</span>
              <span className="font-medium">Создать рыбу</span>
            </button>
          </div>

          {/* Название пруда по центру */}
          <div className="text-center">
            <h1 className="text-xl font-bold text-white drop-shadow-md">
              {pond?.name || 'Пруд знаний'}
            </h1>
            <p className="text-sm text-white/80">
              Рыб: {fishes.length} | Уровень: {pond?.completion_rate || 0}%
            </p>
          </div>

          {/* Кнопка "Начать рыбалку" */}
          {canStart && (
            <button
              onClick={startFishing}
              className="flex items-center gap-2 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white px-6 py-3 rounded-xl shadow-md transition-all hover:shadow-lg font-semibold"
            >
              <span className="text-lg">🎣</span>
              <span>Начать рыбалку</span>
            </button>
          )}
        </div>
      </div>

      <FishingDialog />
      
      {/* Модальное окно создания рыбы */}
      <CreateFishModal
        isOpen={isCreateFishModalOpen}
        onClose={() => setIsCreateFishModalOpen(false)}
        onCreate={handleCreateFish}
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
