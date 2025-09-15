// layers/underwaterBack.js
export default function createUnderwaterBackLayer(options = {}) {
    const {
      enableGradient = true,
      enableInternalWaves = false, // ← по умолчанию выкл
      enableCaustics = false,      // ← по умолчанию выкл
      enableVegetation = true,
      gradientStops = [
        { offset: 0.00, color: 'rgba(0,0,0,0)' }, // мы уже красим уровни сверху, тут можно оставить лёгкую модификацию
        { offset: 1.00, color: 'rgba(0,0,0,0.08)' },
      ],
      vegetation = { count: 7, minR: 40, maxR: 120, alpha: 0.08 },
    } = options;
  
    let vegPatches = null;
    const ensureVegetation = (w, h, pondTop) => {
      if (!enableVegetation) return;
      if (vegPatches && vegPatches.w === w && vegPatches.h === h && vegPatches.pondTop === pondTop) return;
      const list = [];
      for (let i = 0; i < vegetation.count; i++) {
        list.push({
          x: Math.random() * w,
          y: pondTop + (h - pondTop) * (0.55 + Math.random() * 0.4),
          r: vegetation.minR + Math.random() * (vegetation.maxR - vegetation.minR),
        });
      }
      vegPatches = { list, w, h, pondTop };
    };
  
    return {
      id: 'underwater-back',
      order: 15,
      draw: (frame, getState) => {
        const { ctx, t, w, h, pondTop } = frame;
        const { getWaveFn } = getState?.() || {};
        const waveFn = getWaveFn?.() || ((time, x, fr) => (fr?.pondTop ?? pondTop));
        ensureVegetation(w, h, pondTop);
  
        ctx.save();
        ctx.beginPath();
        ctx.moveTo(0, waveFn(t, 0, frame));
        const stepX = 2;
        for (let x = stepX; x <= w; x += stepX) ctx.lineTo(x, waveFn(t, x, frame));
        ctx.lineTo(w, h); ctx.lineTo(0, h); ctx.closePath();
        ctx.clip();
  
        // Небольшая теневая «глубинная» вуаль поверх слоёв (очень деликатная)
        if (enableGradient) {
          const g = ctx.createLinearGradient(0, pondTop, 0, h);
          gradientStops.forEach(s => g.addColorStop(s.offset, s.color));
          ctx.fillStyle = g;
          ctx.fillRect(0, pondTop, w, h - pondTop);
        }
  
        if (enableVegetation && vegPatches) {
          ctx.save();
          ctx.globalAlpha = vegetation.alpha;
          ctx.fillStyle = '#05264D';
          vegPatches.list.forEach(p => {
            ctx.beginPath();
            ctx.ellipse(p.x, p.y, p.r, p.r * 0.5, 0, 0, Math.PI * 2);
            ctx.fill();
          });
          ctx.restore();
        }
  
        ctx.restore();
      },
    };
  }
  