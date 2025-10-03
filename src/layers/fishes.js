// layers/fishes.js
// Спрайтовые рыбы: плавают туда-сюда, не доходя до краёв,
// меняют высоту в пределах уровня. "Готовые" — цветные,
// "неготовые" — серые силуэты и плывут медленнее.
// Во время рыбалки рыба-цель подплывает к крючку и "вываживается".

import { Assets } from '../utils/assets';
import { setExternalResetFishState } from '../components/FishingDialog.jsx'

export default function createFishesLayer(options = {}) {
  const {
    leftMargin = 36,
    rightMargin = 36,
    speedRangeReady = [28, 72],
    speedRangeIdle  = [18, 46],
    vertAmpRange = [6, 18],
    vertFreqRange = [0.3, 0.9],
    levelCount = 4,
    levelPadding = 8,
    sheetKey = 'fishSheet',
    SPR_W = 16,
    SPR_H = 12,
    FRAMES = 4,
    scale = 2.5,
    idleAlpha = 0.85,
    useGrayscaleFilter = true,
    // параметры "приманивания" и вываживания
    lureSpeedBoost = 400,     // скорость сближения к крючку (px/s)
    reelFollowOffset = 10,    // рыба висит чуть ниже крючка при вываживании
    lureSnapDist = 18,        // дистанция "схватился" (px)
  } = options;

  const fishState = new Map();
  const randIn = (a, b) => a + Math.random() * (b - a);
  const pickDir = () => (Math.random() < 0.5 ? -1 : 1);
  const clampLevel = (lvl, count) => Math.min(count - 1, Math.max(0, lvl | 0));
  const levelToRow = (level) => Math.min(2, Math.max(0, level)); // 3 вида в спрайте

  const levelCenterY = (level, pondTop, levelH) => {
    const top = pondTop + level * levelH + levelPadding;
    const bottom = pondTop + (level + 1) * levelH - levelPadding;
    return (top + bottom) * 0.5;
  };
  const levelRange = (level, pondTop, levelH) => {
    const top = pondTop + level * levelH + levelPadding;
    const bottom = pondTop + (level + 1) * levelH - levelPadding;
    return [top, bottom];
  };

  const resetFishState = (fishId) => {
    fishState.delete(fishId);
  };

  // Экспортируем функцию для сброса
  setExternalResetFishState(resetFishState);

  const ensureFishState = (f, w, pondTop, levelH, isReady) => {
    let s = fishState.get(f.id);
    if (!s) {
      const level = clampLevel(f.depth_level ?? 0, levelCount);
      s = {
        x: randIn(leftMargin + SPR_W * scale, w - rightMargin - SPR_W * scale),
        dir: pickDir(),
        speed: randIn(...(isReady ? speedRangeReady : speedRangeIdle)),
        phase: Math.random() * Math.PI * 2,
        amp: randIn(...vertAmpRange),
        freq: randIn(...vertFreqRange) * Math.PI * 2,
        level,
        centerY: levelCenterY(level, pondTop, levelH),
      };
      fishState.set(f.id, s);
    } else {
      const newLevel = clampLevel(f.depth_level ?? 0, levelCount);
      if (newLevel !== s.level) {
        s.level = newLevel;
        s.centerY = levelCenterY(newLevel, pondTop, levelH);
        s.amp = randIn(...vertAmpRange);
      }
      // подстройка скорости под готовность
      const target = randIn(...(isReady ? speedRangeReady : speedRangeIdle));
      s.speed = s.speed * 0.85 + target * 0.15;
    }
    return s;
  };

  const frameIndex = (t, speed, isReady) => {
    const baseFps = isReady ? 8 : 6;
    const plus = Math.min(6, speed / 14);
    return Math.floor(t * (baseFps + plus)) % FRAMES;
  };

  function drawSprite(ctx, img, sx, sy, sw, sh, dx, dy, flipX, scale, asGray, alpha) {
    ctx.save();
    ctx.translate(dx, dy);
    if (flipX) ctx.scale(-1, 1);
    ctx.imageSmoothingEnabled = false;
    if (asGray && useGrayscaleFilter) {
      ctx.filter = 'grayscale(100%) saturate(0%) brightness(85%)';
      ctx.globalAlpha = alpha;
    } else if (asGray) {
      ctx.globalAlpha = alpha;
    }
    ctx.drawImage(img, sx, sy, sw, sh, -sw * 0.5 * scale, -sh * 0.5 * scale, sw * scale, sh * scale);
    if (asGray && useGrayscaleFilter) ctx.filter = 'none';
    ctx.restore();
  }

  return {
    id: 'fishes',
    order: 20,
    draw: (frame, getState) => {
      const { ctx, t, dt, w, h, pondTop } = frame;
      const gs = getState?.() || {};
    const fishes = gs.fishes || [];
    const fishing = gs.fishing || {};
    const dialogOpen = !!gs.dialog?.open;

      if (!fishes.length) return;

      const pondH = Math.max(0, h - pondTop);
      const levelH = pondH / 4;
      const sheet = Assets.get(sheetKey);

      fishes.forEach((f) => {
        const isReady = (new Date(f.next_review_date) <= new Date()); 
        const s = ensureFishState(f, w, pondTop, levelH, isReady);

        // базовое движение (если нет захвата сценарием рыбалки)
        let overridePos = false;

        // если эта рыба — цель рыбалки
        if (fishing?.targetFishId === f.id && fishing?.phase) {
          if (fishing.phase === 'luring') {
            // быстро подплывает к крючку
            const tx = fishing.hookX;
            const ty = fishing.hookY;
            const dx = tx - s.x;
            const dy = ty - (s.centerY + Math.sin(t * s.freq + s.phase) * s.amp);
            const dist = Math.hypot(dx, dy);
            if (dist > 1e-3) {
              const vx = (dx / dist) * lureSpeedBoost;
              const vy = (dy / dist) * lureSpeedBoost;
              s.x += vx * dt;
              // верт. вести к цели без строгого ограничения диапазоном уровня (чуть свободнее)
              const newY = (s.centerY) + vy * dt;
              s.centerY = newY; // смещаем центр, чтобы рыба могла подняться/опуститься к крючку
            }
            // если почти у крючка — дальше стадия "reeling" (решает fishingLayer)
            overridePos = true; // ничего больше по базовой логике не делаем
            if (dist <= lureSnapDist && gs.setFishing) {
                gs.setFishing(prev => prev?.phase === 'luring' ? { ...prev, phase: 'reeling' } : prev);
            }
          } else if (fishing.phase === 'reeling') {
            // «прилипает» к крючку, чуть ниже
            s.x = fishing.hookX;
            s.centerY = fishing.hookY + reelFollowOffset;
            overridePos = true;
          } else if (fishing.phase === 'done' && dialogOpen) {
            // диалог открыт — рыба продолжает висеть на крючке у лодки
            s.x = fishing.hookX;
            s.centerY = fishing.hookY + reelFollowOffset;
            overridePos = true;
          }
        }

        if (!overridePos) {
          // Горизонталь + разворот до границ
          s.x += s.dir * s.speed * dt;
          const halfW = (SPR_W * scale) * 0.5;
          const leftLimit = leftMargin + halfW;
          const rightLimit = w - rightMargin - halfW;
          if (s.x <= leftLimit) { s.x = leftLimit; s.dir = 1; }
          else if (s.x >= rightLimit) { s.x = rightLimit; s.dir = -1; }

          // Вертикальные колебания внутри уровня
          const [yMin, yMax] = levelRange(s.level, pondTop, levelH);
          const yOsc = Math.sin(t * s.freq + s.phase) * s.amp;
          let ny = s.centerY + yOsc;
          if (ny < yMin) ny = yMin;
          if (ny > yMax) ny = yMax;
          s.centerY = (s.centerY * 0.9) + (ny * 0.1); // лёгкая инерция
        }

        // итоговая Y
        const y = s.centerY;

        // отрисовка
        if (sheet) {
          const row = levelToRow(s.level);
          const col = frameIndex(t, s.speed, isReady);
          const sx = col * SPR_W;
          const sy = row * SPR_H;

          // ВАЖНО: раньше рыбы «плыли задом наперёд». Меняем знак flipX:
          // flipX = (s.dir < 0)  было → стало:
          const flipX = (s.dir > 0); // теперь спрайт разворачивается корректно

          if (isReady) {
            drawSprite(ctx, sheet, sx, sy, SPR_W, SPR_H, s.x, y, flipX, scale, false, 1);
          } else {
            drawSprite(ctx, sheet, sx, sy, SPR_W, SPR_H, s.x, y, flipX, scale, true, idleAlpha);
          }
        } else {
          // fallback
          ctx.save();
          ctx.fillStyle = isReady ? '#FFD54F' : 'rgba(180,180,180,0.8)';
          ctx.beginPath();
          ctx.arc(s.x, y, SPR_H * 0.6, 0, Math.PI * 2);
          ctx.fill();
          ctx.restore();
        }
      });
    },
  };
}
