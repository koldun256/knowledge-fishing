import React, { useRef, useEffect, useState } from 'react';
import { pondService } from '../../services/pondService';
import { fishService } from '../../services/fishService';

const Pond = ({ pondId }) => {
  const canvasRef = useRef(null);
  const rafRef = useRef(null);
  const [pond, setPond] = useState(null);
  const [fishes, setFishes] = useState([]);
  const [loading, setLoading] = useState(true);

  const [vw, setVw] = useState(() => window.innerWidth);
  const [vh, setVh] = useState(() => window.innerHeight);

  useEffect(() => {
    const loadData = async () => {
      setLoading(true);
      try {
        const [pondData, fishesData] = await Promise.all([
          pondService.getPondById(pondId),
          fishService.getFishesByPondId(pondId),
        ]);
        setPond(pondData);
        setFishes(fishesData);
      } catch (e) {
        console.error('Ошибка загрузки данных:', e);
      } finally {
        setLoading(false);
      }
    };
    if (pondId) loadData();
  }, [pondId]);

  useEffect(() => {
    const handleResize = () => {
      setVw(window.innerWidth);
      setVh(window.innerHeight);
    };
    window.addEventListener('resize', handleResize, { passive: true });
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const splitHeights = (total, n) => {
    const base = Math.floor(total / n);
    const rem = total - base * n;
    return Array.from({ length: n }, (_, i) => base + (i < rem ? 1 : 0));
  };

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas || loading) return;

    const ctx = canvas.getContext('2d');
    const dpr = Math.max(1, Math.floor(window.devicePixelRatio || 1));

    const cssW = Math.round(vw);
    const cssH = Math.round(vh);

    const skyH = Math.round(cssH * 0.12);
    const pondTop = skyH;
    const pondH = Math.max(0, cssH - skyH);

    // DPR
    canvas.width = cssW * dpr;
    canvas.height = cssH * dpr;
    canvas.style.width = `${cssW}px`;
    canvas.style.height = `${cssH}px`;
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

    const layerHeights = splitHeights(pondH, 4);
    const colors = ['#64B5F6', '#42A5F5', '#1E88E5', '#0D47A1'];

    // волны
    const wave = {
      a1: 6, f1: 1.2, s1: 0.015,
      a2: 4, f2: 2.1, s2: 0.027,
      a3: 2, f3: 3.4, s3: 0.042,
      stepX: 2
    };
    const crestPad = Math.ceil(Math.abs(wave.a1) + Math.abs(wave.a2) + Math.abs(wave.a3)) + 2;

    const waveHeight = (t, x) =>
      wave.a1 * Math.sin(wave.f1 * t + wave.s1 * x) +
      wave.a2 * Math.sin(wave.f2 * t + wave.s2 * x) +
      wave.a3 * Math.sin(wave.f3 * t + wave.s3 * x);

    const draw = (nowMs) => {
      const t = nowMs / 1000;

      // 1) заливаем небо на ВЕСЬ экран
      ctx.fillStyle = '#87CEEB';
      ctx.fillRect(0, 0, cssW, cssH);

      // 2) клип-область воды — ниже кривой волны
      ctx.save();
      ctx.beginPath();
      ctx.moveTo(0, pondTop + waveHeight(t, 0));
      for (let x = wave.stepX; x <= cssW; x += wave.stepX) {
        ctx.lineTo(x, pondTop + waveHeight(t, x));
      }
      ctx.lineTo(cssW, cssH);
      ctx.lineTo(0, cssH);
      ctx.closePath();
      ctx.clip();

      // 3) рисуем 4 слоя воды:
      // верхний слой стартует выше pondTop на crestPad,
      // чтобы покрыть гребни, выступающие над базовой линией
      let y = pondTop - crestPad;

      // слой 0 (верхний)
      const h0 = layerHeights[0] + crestPad;
      ctx.fillStyle = colors[0];
      ctx.fillRect(0, y, cssW, h0);
      y = pondTop + layerHeights[0]; // вернуть базовую границу слоя 1

      // слой 1
      const h1 = layerHeights[1];
      ctx.fillStyle = colors[1];
      ctx.fillRect(0, y, cssW, h1);
      y += h1;

      // слой 2
      const h2 = layerHeights[2];
      ctx.fillStyle = colors[2];
      ctx.fillRect(0, y, cssW, h2);
      y += h2;

      // слой 3
      const h3 = layerHeights[3];
      ctx.fillStyle = colors[3];
      ctx.fillRect(0, y, cssW, h3);

      ctx.restore();

      rafRef.current = requestAnimationFrame(draw);
    };

    rafRef.current = requestAnimationFrame(draw);
    return () => rafRef.current && cancelAnimationFrame(rafRef.current);
  }, [vw, vh, loading]);

  if (loading) return <div className="p-8 text-center">Загрузка пруда...</div>;
  if (!pond) return <div className="p-8 text-center text-red-500">Пруд не найден</div>;

  return (
    <canvas
      ref={canvasRef}
      className="fixed inset-0 block"
    />
  );
};

export default Pond;
