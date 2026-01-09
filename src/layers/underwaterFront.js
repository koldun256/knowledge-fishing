// layers/underwaterFront.js
// Эффекты: глубинный туман, взвесь (частички), редкие пузырьки.
export default function createUnderwaterFrontLayer(options = {}) {
  const {
    enableDepthFog = true,
    enableMotes = true,
    enableBubbles = true,
    fog = { start: 0.20, end: 1.00, maxAlpha: 0.35 },
    motes = { count: 140, size: [0.5, 1.8], speed: [6, 18], alpha: [0.05, 0.18] },
    bubbles = { 
      rate: 0.012, 
      speed: [24, 48], 
      size: [2, 5], 
      alpha: 0.25,
      maxCount: 50 // 👈 Ограничиваем максимальное количество
    },
  } = options;

  // частицы и пузырьки
  let motesArr = [];
  let bubblesArr = [];
  let seeded = false;

  const randIn = (a, b) => a + Math.random() * (b - a);

  const seed = (w, h, pondTop) => {
    if (seeded) return;
    // взвесь размечаем по объёму воды
    const waterH = Math.max(0, h - pondTop);
    motesArr = Array.from({ length: motes.count }, () => ({
      x: Math.random() * w,
      y: pondTop + Math.random() * waterH,
      r: randIn(motes.size[0], motes.size[1]),
      v: randIn(motes.speed[0], motes.speed[1]),
      a: randIn(motes.alpha[0], motes.alpha[1]),
      drift: Math.random() * Math.PI * 2,
    }));
    bubblesArr = [];
    seeded = true;
  };

  return {
    id: 'underwater-front',
    order: 25,
    draw: (frame, getState) => {
      const { ctx, t, dt, w, h, pondTop } = frame;
      const { getWaveFn } = getState?.() || {};
      const waveFn = getWaveFn?.() || ((time, x, fr) => (fr?.pondTop ?? pondTop));

      seed(w, h, pondTop);

      // клип по воде
      ctx.save();
      ctx.beginPath();
      ctx.moveTo(0, waveFn(t, 0, frame));
      const stepX = 2;
      for (let x = stepX; x <= w; x += stepX) ctx.lineTo(x, waveFn(t, x, frame));
      ctx.lineTo(w, h); ctx.lineTo(0, h); ctx.closePath();
      ctx.clip();

      const waterH = h - pondTop;

      // 1) глубинный туман
      if (enableDepthFog) {
        const g = ctx.createLinearGradient(0, pondTop, 0, h);
        g.addColorStop(fog.start, 'rgba(0,0,0,0)');
        g.addColorStop(fog.end, `rgba(0,0,0,${fog.maxAlpha})`);
        ctx.fillStyle = g;
        ctx.fillRect(0, pondTop, w, waterH);
      }

      // 2) взвесь (мелкие точки, дрейфуют вниз)
      if (enableMotes) {
        ctx.save();
        ctx.globalCompositeOperation = 'screen';
        ctx.fillStyle = 'white';
        motesArr.forEach(p => {
          p.y += p.v * dt * 0.5;
          p.x += Math.sin(t * 0.5 + p.drift) * 6 * dt;
          if (p.y > h) p.y = pondTop;
          const ySurf = waveFn(t, p.x, frame);
          if (p.y < ySurf + 1) p.y = ySurf + 1;

          ctx.globalAlpha = p.a;
          ctx.beginPath();
          ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
          ctx.fill();
        });
        ctx.restore();
      }

      // 3) пузырьки (редкие, всплывают вверх) - ИСПРАВЛЕНО
      if (enableBubbles) {
        // Удаляем пузырьки, которые достигли поверхности или вышли за границы
        bubblesArr = bubblesArr.filter(b => {
          const ySurf = waveFn(t, b.x, frame);
          // Условия для удаления пузырька:
          // 1. Вышел за верхний край (y < pondTop - 20)
          // 2. Достиг поверхности воды (y < ySurf + b.r)
          // 3. Слишком сильно сместился по горизонтали (x < -b.r || x > w + b.r)
          return b.y > pondTop - 20 && 
                 b.y > ySurf + b.r && 
                 b.x > -b.r && b.x < w + b.r;
        });

        // Спавним новый пузырёк только если не превышен лимит
        if (bubblesArr.length < bubbles.maxCount) {
          const spawnProb = bubbles.rate * Math.max(1, w / 800) * dt * 60; // 👈 Учитываем dt
          if (Math.random() < spawnProb) {
            const x = Math.random() * w;
            // Спавним ближе ко дну
            const y0 = pondTop + waterH * (0.7 + Math.random() * 0.25);
            bubblesArr.push({
              x,
              y: y0,
              v: -randIn(bubbles.speed[0], bubbles.speed[1]),
              r: randIn(bubbles.size[0], bubbles.size[1]),
              a: bubbles.alpha * (0.8 + Math.random() * 0.4),
              wobble: Math.random() * Math.PI * 2,
              lifetime: 0, // 👈 Добавляем счётчик времени жизни
              maxLifetime: 5 + Math.random() * 5 // Максимальное время жизни в секундах
            });
          }
        }

        ctx.save();
        ctx.strokeStyle = 'rgba(255,255,255,0.8)';
        
        bubblesArr.forEach(b => {
          // Увеличиваем время жизни
          b.lifetime += dt;
          
          // Если пузырёк жил слишком долго - постепенно исчезаем
          const lifeRatio = Math.max(0, 1 - (b.lifetime / b.maxLifetime));
          
          // Обновляем позицию
          b.y += b.v * dt;
          b.x += Math.sin(t * 3 + b.wobble) * 12 * dt;
          
          const ySurf = waveFn(t, b.x, frame);
          
          // Если близко к поверхности, ускоряемся (эффект всплытия)
          if (b.y < ySurf + waterH * 0.3) {
            b.y += (b.v * 0.5) * dt; // Дополнительное ускорение
          }

          // Рисуем с учётом времени жизни
          ctx.globalAlpha = b.a * lifeRatio;
          ctx.lineWidth = 1;
          ctx.beginPath();
          ctx.arc(b.x, b.y, b.r, 0, Math.PI * 2);
          ctx.stroke();

          // маленький бликовый полукруг
          ctx.beginPath();
          ctx.arc(b.x - b.r * 0.3, b.y - b.r * 0.3, b.r * 0.35, 0, Math.PI * 2);
          ctx.stroke();
        });
        ctx.restore();
      }

      ctx.restore();
    },
  };
}
