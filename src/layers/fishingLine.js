// layers/fishingLine.js
const easeOutCubic = (p) => 1 - Math.pow(1 - p, 3);

export default function createFishingLineLayer(options = {}) {
  const {
    lineColor = 'rgba(230,230,230,0.9)',
    hookColor = '#cfd8dc',
    hookSize = 8,
    castDuration = 700,
    reelDuration = 900,
  } = options;

  let castStart = null;
  let reelStart = null;
  let targetDepthY = null;

  const resetLocal = () => {
    castStart = null;
    reelStart = null;
    targetDepthY = null;
  };

  return {
    id: 'fishing-line',
    order: 27,
    draw: (frame, getState) => {
      const { ctx, t, w, h, pondTop } = frame;
      const gs = getState?.() || {};
      const { fishing, setFishing, setDialog, fishes, getWaveFn } = gs;
      const waveFn = getWaveFn?.() || ((time, x, fr) => (fr?.pondTop ?? pondTop));

      if (!fishing || fishing.phase === 'idle') {
        // на всякий случай чистим локальные таймеры
        resetLocal();
        return;
      }

      const boatX = fishing.boatX ?? (w * 0.5);
      const anchorY = waveFn(t, boatX, frame) - 6;

      // При входе в casting — высчитать целевую глубину и старт
      if (fishing.phase === 'casting' && castStart === null) {
        const levelCount = 4;
        const fish = fishes?.find(ff => ff.id === fishing.targetFishId);
        const level = Math.min(levelCount - 1, Math.max(0, (fish?.depth_level ?? 0) | 0));
        const levelH = (h - pondTop) / levelCount;
        const levelTop = pondTop + level * levelH;
        const levelBottom = pondTop + (level + 1) * levelH;
        targetDepthY = (levelTop + levelBottom) * 0.5;
        castStart = performance.now();
      }

      let hookX = boatX;
      let hookY = anchorY + 20;

      if (fishing.phase === 'casting') {
        const elapsed = performance.now() - castStart;
        const p = Math.min(1, elapsed / castDuration);
        const k = easeOutCubic(p);
        hookY = anchorY + (targetDepthY - anchorY) * k;

        if (p >= 1) {
          setFishing(prev => ({ ...prev, phase: 'luring', hookX: hookX, hookY: hookY }));
        }

      } else if (fishing.phase === 'luring') {
        hookY = targetDepthY;
        // рыба сама подтянется в fishes.js; здесь просто держим крючок

      } else if (fishing.phase === 'reeling') {
        if (reelStart === null) reelStart = performance.now();
        const elapsed = performance.now() - reelStart;
        const p = Math.min(1, elapsed / reelDuration);
        const k = easeOutCubic(p);
        hookY = targetDepthY + (anchorY - targetDepthY) * k;

        if (p >= 1) {
          // открываем диалог + финализируем фазу
          const fish = fishes?.find(ff => ff.id === fishing.targetFishId);
          setDialog && setDialog({ open: true, fish, sessionId: fishing.sessionId });
          setFishing(prev => ({ ...prev, phase: 'done', hookX: hookX, hookY: hookY }));
          // локальные таймеры не сбрасываем до выхода в idle — пусть 'done' держит позицию до закрытия диалога
        }

      } else if (fishing.phase === 'done') {
        hookY = anchorY; // висим у лодки
      }

      // синк координат для других слоёв
      setFishing(prev => (prev?.phase ? { ...prev, hookX, hookY } : prev));

      // леска
      ctx.save();
      ctx.strokeStyle = lineColor;
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.moveTo(boatX, anchorY);
      ctx.lineTo(hookX, hookY);
      ctx.stroke();

      // крючок
      ctx.fillStyle = hookColor;
      ctx.beginPath();
      ctx.arc(hookX, hookY, hookSize * 0.2, 0, Math.PI * 2);
      ctx.fill();

      ctx.beginPath();
      ctx.moveTo(hookX, hookY + hookSize * 0.2);
      ctx.lineTo(hookX + 4, hookY + 6);
      ctx.strokeStyle = hookColor;
      ctx.stroke();

      ctx.restore();
    },
  };
}
