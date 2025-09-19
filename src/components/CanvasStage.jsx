// components/CanvasStage.jsx
import React, { useRef, useEffect } from 'react';

export default function CanvasStage({
  className = 'fixed inset-0 block z-0',
  style,
  skyRatio = 0.12,
  layers = [],
  getState, // <- возьмём из контекста
}) {
  const canvasRef = useRef(null);
  const rafRef = useRef(null);
  const lastTimeRef = useRef(0);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d', { alpha: false });
    const resize = () => {
      const w = Math.round(window.innerWidth);
      const h = Math.round(window.innerHeight);
      const dpr = Math.max(1, Math.floor(window.devicePixelRatio || 1));
      canvas.width = w * dpr;
      canvas.height = h * dpr;
      canvas.style.width = `${w}px`;
      canvas.style.height = `${h}px`;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    };

    resize();
    window.addEventListener('resize', resize, { passive: true });

    const loop = (nowMs) => {
      const w = Math.round(window.innerWidth);
      const h = Math.round(window.innerHeight);
      const t = nowMs / 1000;
      const dt = lastTimeRef.current ? (nowMs - lastTimeRef.current) / 1000 : 0;
      lastTimeRef.current = nowMs;

      ctx.fillStyle = '#87CEEB';
      ctx.fillRect(0, 0, w, h);

      const frame = { ctx, t, dt, w, h, pondTop: Math.round(h * skyRatio), skyRatio };

      for (const layer of layers.sort((a, b) => (a.order ?? 0) - (b.order ?? 0))) {
        layer.draw && layer.draw(frame, getState);
      }

      rafRef.current = requestAnimationFrame(loop);
    };

    rafRef.current = requestAnimationFrame(loop);
    return () => {
      window.removeEventListener('resize', resize);
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
    };
  }, [layers, getState, skyRatio]);

  return (
    <canvas 
      ref={canvasRef} 
      className={className} 
      style={{ 
        ...style, 
        zIndex: 0, // Принудительно устанавливаем низкий z-index
        pointerEvents: 'none' // Разрешаем клики сквозь канвас
      }} 
    />
  );
}
