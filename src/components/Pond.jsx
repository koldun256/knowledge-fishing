// src/pages/Pond.jsx
import React, { useEffect, useMemo, useState, useRef } from 'react';
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
  
  // Состояние блокировки кнопок во время рыбалки
  const [buttonsDisabled, setButtonsDisabled] = useState(false);
  
  // Состояния для адаптивного дизайна
  const [showBackAsArrow, setShowBackAsArrow] = useState(false);
  const [showMenuButton, setShowMenuButton] = useState(false);
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  // Следим за фазой рыбалки и блокируем кнопки когда рыбалка активна
  useEffect(() => {
    // Если рыбалка не в фазе 'idle' или открыт диалог, блокируем кнопки
    const shouldDisable = fishing.phase !== 'idle' || dialog.open;
    setButtonsDisabled(shouldDisable);
  }, [fishing.phase, dialog.open]);

  // Брейкпоинты для адаптивного дизайна
  const BREAKPOINTS = {
    MEDIUM: 768, // tablet
    SMALL: 480   // mobile
  };

  // Проверка размера экрана и адаптация интерфейса
  useEffect(() => {
    const checkScreenSize = () => {
      const screenWidth = window.innerWidth;
      
      if (screenWidth <= BREAKPOINTS.SMALL) {
        // Маленький экран: стрелка + меню
        setShowBackAsArrow(true);
        setShowMenuButton(true);
      } else if (screenWidth <= BREAKPOINTS.MEDIUM) {
        // Средний экран: стрелка + обычные кнопки
        setShowBackAsArrow(true);
        setShowMenuButton(false);
      } else {
        // Большой экран: полные кнопки
        setShowBackAsArrow(false);
        setShowMenuButton(false);
      }
    };
    
    // Проверяем при загрузке и изменении размера окна
    checkScreenSize();
    window.addEventListener('resize', checkScreenSize);
    
    return () => {
      window.removeEventListener('resize', checkScreenSize);
    };
  }, []);

  // Функция для загрузки данных о рыбах
  const loadFishesData = async () => {
    if (!pondId) return;
    
    try {
      console.log('Refreshing fishes data for pond:', pondId);
      const fishesData = await fishService.getFishesByPondId(pondId);
      setFishes(fishesData);
    } catch (error) {
      console.error('Ошибка при обновлении списка рыб:', error);
    }
  };

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

  // Автоматическое обновление списка рыб каждые 30 секунд
  useEffect(() => {
    if (!pondId) return;

    // Сразу загружаем данные при монтировании
    loadFishesData();

    // Устанавливаем интервал для обновления каждые 30 секунд
    const intervalId = setInterval(() => {
      loadFishesData();
    }, 30000); // 30 секунд

    // Очистка интервала при размонтировании компонента
    return () => {
      clearInterval(intervalId);
    };
  }, [pondId]); // Зависимость от pondId для перезапуска при смене пруда

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
      
      const newFishes = await fishService.createFishes(pondId, fishesData);
      console.log('newFishes = ', newFishes);
      
      for (const fish of newFishes) {
        setFishes(prev => [...prev, fish]);
      }
      console.log('Fishes created and added to list:', newFishes);
      
      return newFishes;
    } catch (error) {
      console.error('Error in handleCreateFishes:', error);
      throw error;
    }
  };

  const startFishing = async () => {
    try {
      // Проверяем, можно ли начать рыбалку
      if (fishing.phase !== 'idle' || dialog.open || buttonsDisabled) return;

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

  // Обработчики для меню
  const handleMenuAction = (action) => {
    setIsMenuOpen(false);
    if (buttonsDisabled) return; // Не выполняем действия если кнопки заблокированы
    
    switch (action) {
      case 'addFish':
        setIsCreateFishModalOpen(true);
        break;
      case 'addFishes':
        setIsCreateFishesModalOpen(true);
        break;
      case 'startFishing':
        startFishing();
        break;
      default:
        break;
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

  const canStart = fishing.phase === 'idle' && !dialog.open && !buttonsDisabled;

  return (
    <>
      <CanvasStage
        skyRatio={0.12}
        layers={layers}
        getState={getState}
        className="fixed inset-0 z-0"
      />

      {/* Левая группа кнопок */}
      <div className="absolute top-4 left-4 z-[9999] transform">
        {!showMenuButton ? (
          <div className="flex items-center gap-2">
            <button
              onClick={() => !buttonsDisabled && navigate('/')}
              disabled={buttonsDisabled}
              className={`
                rounded-lg transition-all
                ${buttonsDisabled ? 'opacity-50 cursor-not-allowed' : ''}
                ${showBackAsArrow 
                  ? 'text-slate-800 flex items-center justify-center bg-green-100 hover:bg-green-200' 
                  : 'px-4 py-2 bg-white/95 hover:bg-white shadow-lg border border-gray-300 text-slate-800'
                }
              `}
            >
              {showBackAsArrow ? (
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" 
                        d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                </svg>
              ) : '← Назад к прудам'}
            </button>
            
            {!showBackAsArrow ? (
              // Большой экран: все кнопки полностью
              <>
                <button
                  onClick={() => !buttonsDisabled && setIsCreateFishModalOpen(true)}
                  disabled={buttonsDisabled}
                  className={`
                    bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg shadow-lg transition-all
                    ${buttonsDisabled ? 'opacity-50 cursor-not-allowed' : ''}
                  `}
                >
                  🐟 Добавить рыбу
                </button>
                
                <button
                  onClick={() => !buttonsDisabled && setIsCreateFishesModalOpen(true)}
                  disabled={buttonsDisabled}
                  className={`
                    bg-green-700 hover:bg-green-800 text-white px-4 py-2 rounded-lg shadow-lg transition-all
                    ${buttonsDisabled ? 'opacity-50 cursor-not-allowed' : ''}
                  `}
                >
                  🐟🐟 Добавить рыб
                </button>
              </>
            ) : (
              // Средний экран: стрелка + обычные кнопки
              <>
                <button
                  onClick={() => !buttonsDisabled && setIsCreateFishModalOpen(true)}
                  disabled={buttonsDisabled}
                  className={`
                    bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg shadow-lg transition-all
                    ${buttonsDisabled ? 'opacity-50 cursor-not-allowed' : ''}
                  `}
                >
                  🐟 Добавить рыбу
                </button>
                
                <button
                  onClick={() => !buttonsDisabled && setIsCreateFishesModalOpen(true)}
                  disabled={buttonsDisabled}
                  className={`
                    bg-green-700 hover:bg-green-800 text-white px-4 py-2 rounded-lg shadow-lg transition-all
                    ${buttonsDisabled ? 'opacity-50 cursor-not-allowed' : ''}
                  `}
                >
                  🐟🐟 Добавить рыб
                </button>
              </>
            )}
          </div>
        ) : (
          // Маленький экран: только стрелка слева
          <button
            onClick={() => !buttonsDisabled && navigate('/')}
            disabled={buttonsDisabled}
            className={`
              text-slate-800 w-10 h-10 flex items-center justify-center rounded-lg transition-all
              ${buttonsDisabled ? 'opacity-50 cursor-not-allowed' : ''}
            `}
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" 
                    d="M10 19l-7-7m0 0l7-7m-7 7h18" />
            </svg>
          </button>
        )}
      </div>

      {/* Правая группа кнопок */}
      <div className="absolute top-4 right-4 z-[9999] transform">
        {!showMenuButton ? (
          // Большой и средний экран: кнопка начала рыбалки
          canStart && (
            <button
              onClick={startFishing}
              disabled={buttonsDisabled}
              className={`
                bg-blue-700 hover:bg-blue-800 text-white px-6 py-2 rounded-lg shadow-lg transition-all
                ${buttonsDisabled ? 'opacity-50 cursor-not-allowed' : ''}
              `}
            >
              🎣 Начать рыбалку
            </button>
          )
        ) : (
          // Маленький экран: кнопка меню в правом верхнем углу
          <button
            onClick={() => !buttonsDisabled && setIsMenuOpen(!isMenuOpen)}
            disabled={buttonsDisabled}
            className={`
              bg-green-600 hover:bg-green-700 text-white w-10 h-10 flex items-center justify-center rounded-lg shadow-lg transition-all
              ${buttonsDisabled ? 'opacity-50 cursor-not-allowed' : ''}
            `}
          >
            ☰
          </button>
        )}
      </div>

      {/* Выезжающее меню для маленьких экранов */}
      {isMenuOpen && (
        <>
          {/* Затемнение фона */}
          <div 
            className="fixed inset-0 bg-black bg-opacity-50 z-[10000]"
            onClick={() => setIsMenuOpen(false)}
          />
          
          {/* Меню */}
          <div className="fixed top-0 right-0 h-full w-64 bg-white shadow-lg z-[10001] transform transition-transform">
            {/* Заголовок меню с кнопкой закрытия */}
            <div className="p-4 flex justify-end">
              <button
                onClick={() => setIsMenuOpen(!isMenuOpen)}
                className="bg-green-600 hover:bg-green-700 text-white w-10 h-10 flex items-center justify-center rounded-lg shadow-lg transition-all"
              >
                ☰
              </button>
            </div>
            
            {/* Кнопки меню */}
            <div className="p-4 space-y-3">
              <button
                onClick={() => handleMenuAction('addFish')}
                disabled={buttonsDisabled}
                className={`
                  w-full bg-green-600 hover:bg-green-700 text-white px-4 py-3 rounded-lg shadow transition-all text-left
                  ${buttonsDisabled ? 'opacity-50 cursor-not-allowed' : ''}
                `}
              >
                🐟 Добавить рыбу
              </button>
              
              <button
                onClick={() => handleMenuAction('addFishes')}
                disabled={buttonsDisabled}
                className={`
                  w-full bg-green-700 hover:bg-green-800 text-white px-4 py-3 rounded-lg shadow transition-all text-left
                  ${buttonsDisabled ? 'opacity-50 cursor-not-allowed' : ''}
                `}
              >
                🐟🐟 Добавить рыб
              </button>
              
              {canStart && (
                <button
                  onClick={() => handleMenuAction('startFishing')}
                  disabled={buttonsDisabled}
                  className={`
                    w-full bg-blue-700 hover:bg-blue-800 text-white px-4 py-3 rounded-lg shadow transition-all text-left
                    ${buttonsDisabled ? 'opacity-50 cursor-not-allowed' : ''}
                  `}
                >
                  🎣 Начать рыбалку
                </button>
              )}
            </div>
          </div>
        </>
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
