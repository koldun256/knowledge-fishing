export const mockPonds = [
  {
    id: 1,
    name: "Математический анализ",
    description: "Пределы, производные, интегралы",
    topic: "Математика",
    created_at: "2024-01-15",
    updated_at: "2024-01-20"
  },
  {
    id: 2,
    name: "Физика квантовых процессов",
    description: "Квантовая механика и термодинамика",
    topic: "Физика",
    created_at: "2024-01-10",
    updated_at: "2024-01-18"
  }
];

export const mockFishes = [
  {
    id: 1,
    pond_id: 1,
    question: "Что такое производная функции?",
    ready: false,
    answer: "Производная функции в точке — это скорость изменения функции в этой точке.",
    depth_level: 1,
    status: "new"
  },
  {
    id: 2,
    pond_id: 1,
    ready: true,
    question: "Формула Ньютона-Лейбница",
    answer: "∫ₐᵇ f(x)dx = F(b) - F(a), где F — первообразная f",
    depth_level: 2,
    status: "reviewing"
  },
  {
    id: 3,
    pond_id: 1,
    question: "Определение предела функции",
    answer: "Число A называется пределом функции f(x) при x→a, если для любого ε>0 существует δ>0 такое, что |f(x)-A|<ε при 0<|x-a|<δ",
    ready: true,
    depth_level: 3,
    status: "mastered"
  },
  {
    id: 4,
    pond_id: 2,
    question: "Принцип неопределенности Гейзенберга",
    answer: "Δx·Δp ≥ ℏ/2, где Δx — неопределенность координаты, Δp — импульса",
    ready: false,
    depth_level: 1,
    status: "new"
  }
];