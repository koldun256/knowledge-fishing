// services/sessionService.js
// Мок-API для начала/конца рыбалки (хранит состояние в памяти)

let _sessions = [];
let _counter = 1;

const delay = (ms) => new Promise((r) => setTimeout(r, ms));

export const sessionService = {
  async start() {
    // имитируем сетевую задержку
    await delay(250);
    const session = {
      id: String(_counter++),
      start_time: new Date().toISOString(),
      end_time: null,
      fishes_caught: 0,
      session_score: null,
    };
    _sessions.push(session);
    return { id: session.id, ...session };
  },

  async end(sessionId, { fishes_caught = 1, session_score = null } = {}) {
    await delay(200);
    const s = _sessions.find((x) => x.id === String(sessionId));
    if (!s) throw new Error('Mock session not found');
    s.end_time = new Date().toISOString();
    s.fishes_caught = fishes_caught;
    s.session_score = session_score;
    return { ...s };
  },

  // опционально: получить список мок-сессий
  async list() {
    await delay(100);
    return _sessions.map((s) => ({ ...s }));
  },
};
