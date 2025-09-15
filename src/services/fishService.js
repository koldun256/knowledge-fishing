// services/fishService.js
// Мок-API для рыб. Берёт данные из data/mockData.js и имитирует поведение бэка.

import { mockFishes /*, mockPonds */ } from '../data/mockData';

const delay = (ms) => new Promise((r) => setTimeout(r, ms));

// утилита: случайный элемент
const sample = (arr) => arr[Math.floor(Math.random() * arr.length)];

// простая логика выбора "следующей рыбы":
// 1) сначала среди готовых (ready: true); если нет — среди всех
// 2) лёгкое приоритетное смещение к более мелким depth_level
function pickNextFish(fishes) {
  const ready = fishes.filter((f) => f.ready);
  const pool = ready.length ? ready : fishes;

  // приоритизируем верхние уровни: вес = 1 / (1 + depth_level)
  const weighted = pool.flatMap((f) => {
    const w = Math.max(1, Math.floor(3 - Math.min(3, f.depth_level || 0))); // 3..1
    return Array.from({ length: w }, () => f);
  });
  return sample(weighted.length ? weighted : pool);
}

export const fishService = {
  // уже существующие методы можешь оставить как есть

  async getNextFish() {
    await delay(300);
    const fish = pickNextFish(mockFishes);
    if (!fish) throw new Error('No fishes available in mock data');
    // возвращаем копию (как будто с бэка)
    return { ...fish };
  },

  async reviewFish(id, payload = {}) {
    // имитируем, что после вылова рыба становится "неготовой" и уходит глубже
    await delay(200);
    const idx = mockFishes.findIndex((f) => String(f.id) === String(id));
    if (idx === -1) throw new Error('Fish not found (mock)');

    const current = mockFishes[idx];

    // простая эволюция: готовность сбрасываем, глубину увеличиваем (до 3)
    const updated = {
      ...current,
      ready: false,
      depth_level: Math.min(3, (current.depth_level || 0) + 1),
      status: payload.status || current.status, // если передаёшь
      last_review_at: new Date().toISOString(),
    };

    mockFishes[idx] = updated;
    return { ...updated };
  },

  // вспомогательно — получить всех рыб пруда (если нужно где-то в UI)
  async getFishesByPondId(pondId) {
    await delay(120);
    return mockFishes.filter((f) => String(f.pond_id) === String(pondId)).map((f) => ({ ...f }));
  },

  // вспомогательно — получить рыбу по id
  async getFishById(id) {
    await delay(100);
    const f = mockFishes.find((x) => String(x.id) === String(id));
    if (!f) throw new Error('Fish not found (mock)');
    return { ...f };
  },
};
