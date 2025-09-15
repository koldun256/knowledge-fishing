// layers/boat.js
export default function createBoatLayer() {
    const hullOffset = 10;     // насколько корпус «врезан» в воду (px)
    const tiltScale = 0.04;    // коэффициент поворота лодки по наклону волны
  
    return {
      id: 'boat',
      order: 30,
      draw: (frame, getState) => {
        const { ctx, t } = frame;
        const { boat, getWaveFn } = getState?.() || {};
        const x = (boat?.x ?? frame.w * 0.5);
  
        // Текущая функция поверхности
        const waveFn = getWaveFn?.() || ((time, xx, fr) => (fr?.pondTop ?? 0));
  
        // высота поверхности в x
        const ySurface = waveFn(t, x, frame);
  
        // приближённый наклон поверхности (производная по x)
        const yL = waveFn(t, x - 1, frame);
        const yR = waveFn(t, x + 1, frame);
        const slope = (yR - yL) / 2; // dy/dx
        const angle = Math.atan(slope) * tiltScale; // мягкий поворот лодки
  
        // Рисуем лодку на поверхности (немного погружена)
        const y = ySurface - hullOffset;
  
        ctx.save();
        ctx.translate(x, y);
        ctx.rotate(angle);
  
        // корпус
        ctx.fillStyle = '#4E342E';
        ctx.beginPath();
        ctx.moveTo(-40, 0);
        ctx.lineTo( 40, 0);
        ctx.lineTo( 30, 12);
        ctx.lineTo(-30, 12);
        ctx.closePath();
        ctx.fill();
  
        // рыбак
        ctx.strokeStyle = '#1B1B1B';
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.moveTo(0, -6);
        ctx.lineTo(0, -22);
        ctx.stroke();
  
        // удочка
        ctx.beginPath();
        ctx.moveTo(0, -16);
        ctx.lineTo(50, -40);
        ctx.stroke();
  
        ctx.restore();
      },
    };
  }
  