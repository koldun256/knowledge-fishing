// src/components/FishingDialog.jsx
import React, { useEffect, useState, useCallback } from 'react';
import { usePond } from '../context/PondContext';
import { fishService } from '../services/fishService';
import { sessionService } from '../services/sessionService';

export default function FishingDialog() {
  const { dialog, setDialog, resetFishing, fishes, setFishes } = usePond();
  const [score, setScore] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const fish = dialog?.fish || null;

  // Сброс локального состояния при открытии/закрытии
  useEffect(() => {
    if (dialog.open) {
      setScore(null);
      setSubmitting(false);
    }
  }, [dialog.open]);

  // Хоткеи: 1..4 — выбрать оценку, Enter — отправить, Esc — отмена
  const onKey = useCallback((e) => {
    if (!dialog.open) return;
    if (e.key >= '1' && e.key <= '4') {
      setScore(Number(e.key));
    } else if (e.key === 'Enter' && score != null && !submitting) {
      e.preventDefault();
      handleSubmit();
    } else if (e.key === 'Escape' && !submitting) {
      handleCancel();
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [dialog.open, score, submitting]);

  useEffect(() => {
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [onKey]);

  const closeAndReset = () => {
    setDialog({ open: false, fish: null, sessionId: null });
    resetFishing(); // переведёт FSM в 'idle' и освободит крючок/рыбу
  };

  const handleCancel = () => {
    if (submitting) return;
    closeAndReset();
  };

  const handleSubmit = async () => {
    if (score == null || submitting || !fish) return;
    setSubmitting(true);
    try {
      // 1) Отправляем оценку — возвращается обновлённая рыба (новый depth_level и т.п.)
      const updated = await fishService.reviewFish(fish.id, { score });

      // 2) Обновляем локальный список рыб
      const idx = fishes.findIndex((x) => String(x.id) === String(fish.id));
      if (idx !== -1) {
        const next = fishes.slice();
        next[idx] = updated;
        setFishes(next);
      }

      // 3) Завершаем мок-сессию (если есть)
      if (dialog.sessionId) {
        await sessionService.end(dialog.sessionId, { fishes_caught: 1, session_score: score });
      }
    } catch (err) {
      console.error('Ошибка при отправке результата:', err);
      // Можно показать тост/сообщение — пока просто закрываем диалог, чтобы не блокировать цикл
    } finally {
      setSubmitting(false);
      closeAndReset();
    }
  };

  if (!dialog.open || !fish) return null;

  return (
    <div className="fixed inset-0 z-[100] bg-black/50 flex items-center justify-center p-4">
      <div className="w-full max-w-xl bg-white rounded-lg shadow-lg p-6">
        <h2 className="text-xl font-semibold mb-2">Оцените вспоминание</h2>

        <div className="mb-3">
          <div className="text-sm text-gray-500">Вопрос</div>
          <div className="font-medium text-gray-900 whitespace-pre-wrap">
            {fish.question || '—'}
          </div>
        </div>

        <div className="mb-4">
          <div className="text-sm text-gray-500">Ответ</div>
          <div className="p-3 bg-gray-50 rounded text-gray-800 whitespace-pre-wrap">
            {fish.answer || '—'}
          </div>
        </div>

        <div className="mb-4">
          <div className="font-semibold mb-2">Насколько хорошо вы вспомнили?</div>
          <div className="grid grid-cols-4 gap-2">
            {[1, 2, 3, 4].map((v) => (
              <button
                key={v}
                onClick={() => setScore(v)}
                disabled={submitting}
                className={`py-2 rounded border transition ${
                  score === v
                    ? 'bg-blue-600 text-white border-blue-600'
                    : 'bg-white hover:bg-gray-50'
                }`}
                aria-pressed={score === v}
              >
                {v}
              </button>
            ))}
          </div>
          <p className="text-xs text-gray-500 mt-2">
            Горячие клавиши: 1–4 для выбора, Enter — отправить, Esc — отмена.
          </p>
        </div>

        <div className="flex justify-end gap-2">
          <button
            onClick={handleCancel}
            disabled={submitting}
            className="px-4 py-2 rounded border hover:bg-gray-50 disabled:opacity-50"
          >
            Отмена
          </button>
          <button
            onClick={handleSubmit}
            disabled={score == null || submitting}
            className="px-4 py-2 rounded bg-blue-600 text-white disabled:opacity-50"
          >
            {submitting ? 'Сохраняю…' : 'Сохранить'}
          </button>
        </div>
      </div>
    </div>
  );
}
