// layers/waterSurface.js
export default function createWaterSurfaceLayer(options = {}) {
    const {
      stepX = 2,
      wave = { a1: 6, f1: 1.2, s1: 0.015, a2: 4, f2: 2.1, s2: 0.027, a3: 2, f3: 3.4, s3: 0.042 },
      // массив из 4 пар цветов [topColor, bottomColor] для КАЖДОГО уровня
      levelGradients = [
        ['#64B5F6', '#42A5F5'],
        ['#3A97E3', '#1E88E5'],
        ['#2A78D1', '#1C5FB7'],
        ['#154D9A', '#0D47A1'],
      ],
    } = options;
  
    const crestPad = Math.ceil(Math.abs(wave.a1) + Math.abs(wave.a2) + Math.abs(wave.a3)) + 2;
  
    const waveHeight = (t, x) =>
      wave.a1 * Math.sin(wave.f1 * t + wave.s1 * x) +
      wave.a2 * Math.sin(wave.f2 * t + wave.s2 * x) +
      wave.a3 * Math.sin(wave.f3 * t + wave.s3 * x);
  
    const splitHeights = (total, n) => {
      const base = Math.floor(total / n);
      const rem = total - base * n;
      return Array.from({ length: n }, (_, i) => base + (i < rem ? 1 : 0));
    };
  
    return {
      id: 'water-surface',
      order: 10,
      draw: ({ ctx, t, w, h, pondTop }, getState) => {
        const { setWaveFn } = getState?.() || {};
        if (setWaveFn) {
          setWaveFn((time, x, frame) => (frame?.pondTop ?? pondTop) + waveHeight(time, x));
        }
  
        const pondH = Math.max(0, h - pondTop);
        const layerHeights = splitHeights(pondH, 4);
  
        // клип по поверхности
        ctx.save();
        ctx.beginPath();
        ctx.moveTo(0, pondTop + waveHeight(t, 0));
        for (let x = stepX; x <= w; x += stepX) {
          ctx.lineTo(x, pondTop + waveHeight(t, x));
        }
        ctx.lineTo(w, h);
        ctx.lineTo(0, h);
        ctx.closePath();
        ctx.clip();
  
        // Рисуем уровни ОТДЕЛЬНО, каждый — СВОИМ вертикальным градиентом.
        // Границы между уровнями — резкие, т.к. прямоугольники не перекрываются и нет прозрачности/обводок.
        // Уровень 0 (верхний) поднимаем на crestPad, чтобы не «резало» гребни.
        let yTop = pondTop - crestPad;
  
        // Уровень 0
        {
          const top = yTop;
          const bottom = top + (layerHeights[0] + crestPad);
          const g = ctx.createLinearGradient(0, top, 0, bottom);
          const [cTop, cBottom] = levelGradients[0];
          g.addColorStop(0, cTop);
          g.addColorStop(1, cBottom);
          ctx.fillStyle = g;
          ctx.fillRect(0, top, w, bottom - top);
          yTop = pondTop + layerHeights[0]; // вернуть базовую границу следующего уровня
        }
  
        // Уровни 1..3
        for (let i = 1; i < 4; i++) {
          const top = yTop;
          const bottom = top + layerHeights[i];
          const g = ctx.createLinearGradient(0, top, 0, bottom);
          const [cTop, cBottom] = levelGradients[i] || levelGradients[levelGradients.length - 1];
          g.addColorStop(0, cTop);
          g.addColorStop(1, cBottom);
          ctx.fillStyle = g;
          ctx.fillRect(0, top, w, bottom - top);
          yTop = bottom;
        }
  
        ctx.restore();
      },
    };
  }
  