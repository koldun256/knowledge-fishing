// src/pages/Pond.jsx
import React, { useEffect, useMemo, useState } from 'react';

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

// сервисы (моки)
import { pondService } from '../services/pondService';
import { fishService } from '../services/fishService';
import { sessionService } from '../services/sessionService';

// ассеты (спрайт рыб)
import { Assets } from '../utils/assets';

function PondInner({ pondId }) {
  const {
    pond, setPond,
    fishes, setFishes,
    getState,
    fishing, setFishing,
    boat,
    dialog,
  } = usePond();

  const [loading, setLoading] = useState(true);

  // загрузка ассетов + данных пруда/рыб
  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        setLoading(true);
        // спрайт рыб (если уже загружен — вернётся мгновенно)
        await Assets.loadImage('fishSheet', '/assets/fish_spritesheet_px.png').catch(() => {});
        // данные
        const [pondData, fishesData] = await Promise.all([
          pondService.getPondById(pondId),
          fishService.getFishesByPondId(pondId),
        ]);
        if (!cancelled) {
          setPond(pondData);
          setFishes(fishesData);
        }
      } catch (e) {
        console.error('Ошибка загрузки данных:', e);
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => { cancelled = true; };
  }, [pondId, setPond, setFishes]);

  // слои сцены
  const layers = useMemo(() => ([
    createWaterSurfaceLayer({
      // жёсткие границы между уровнями (внутренности — сплошные цвета)
      levelGradients: [
        ['#7EC8FA', '#5FB4F5'], // уровень 0 (верх)
        ['#57ABF2', '#2F8EE8'], // уровень 1
        ['#277FD7', '#1B63B9'], // уровень 2
        ['#134A97', '#0C3877'], // уровень 3 (низ)
      ],
    }),
    createUnderwaterBackLayer({
      enableGradient: true,
      enableVegetation: true,
      enableInternalWaves: false,
      enableCaustics: false,
    }),
    createFishesLayer(), // рыбы учитывают ready из fish.ready и корректный flipX
    createUnderwaterFrontLayer({
      enableDepthFog: true,
      enableMotes: true,
      enableBubbles: true,
    }),
    createFishingLineLayer(), // крючок/леска + управление фазами и открытие диалога
    createBoatLayer(),
  ]), []);

  // запуск рыбалки (мок-API)
  const startFishing = async () => {
    try {
      // не допускаем повторного старта, пока не idle или открыт диалог
      if (fishing.phase !== 'idle' || dialog.open) return;

      const session = await sessionService.start();      // { id, ... } — мок
      const nextFish = await fishService.getNextFish();  // { id, depth_level, ready, ... } — мок

      setFishing(prev => ({
        ...prev,
        sessionId: session.id,
        phase: 'casting',
        targetFishId: nextFish.id,
        boatX: boat?.x ?? window.innerWidth * 0.5,
        hookX: null,
        hookY: null,
      }));
    } catch (e) {
      console.error(e);
    }
  };

  if (loading) return <div className="p-8 text-center">Загрузка пруда...</div>;
  if (!pond) return <div className="p-8 text-center text-red-500">Пруд не найден</div>;

  const canStart = fishing.phase === 'idle' && !dialog.open;

  return (
    <>
      <CanvasStage
        skyRatio={0.12}
        layers={layers}
        getState={getState}
      />

      {/* Кнопка — скрыта, пока предыдущая попытка не завершена */}
      {canStart && (
        <button
          onClick={startFishing}
          className="fixed top-4 left-4 z-[60] bg-white/85 hover:bg-white text-slate-800 px-4 py-2 rounded shadow"
        >
          Начать рыбалку
        </button>
      )}

      {/* Диалог-оверлей с оценкой (1..4) */}
      <FishingDialog />
    </>
  );
}

// Экспорт страницы с провайдером контекста
export default function Pond({ pondId }) {
  return (
    <PondProvider>
      <PondInner pondId={pondId} />
    </PondProvider>
  );
}
