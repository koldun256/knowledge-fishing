// context/PondContext.jsx
import React, { createContext, useContext, useRef, useState, useMemo } from 'react';

const PondContext = createContext(null);

export function PondProvider({ children }) {
  const [pond, setPond] = useState(null);
  const [fishes, setFishes] = useState([]);
  const [boat, setBoat] = useState({ x: 200 });

  // fishing state
  const [fishing, setFishingState] = useState({
    phase: 'idle',        // 'idle' | 'casting' | 'luring' | 'reeling' | 'done'
    sessionId: null,
    targetFishId: null,
    hookX: null,
    hookY: null,
    boatX: 200,
  });

  // dialog state
  const [dialog, setDialog] = useState({
    open: false,
    fish: null,            // объект рыбы
    sessionId: null,
  });

  const setFishing = (updater) => {
    setFishingState((prev) => (typeof updater === 'function' ? updater(prev) : updater));
  };

  const resetFishing = () => {
    setFishingState({
      phase: 'idle',
      sessionId: null,
      targetFishId: null,
      hookX: null,
      hookY: null,
      boatX: boat?.x ?? 200,
    });
  };

  const stateRef = useRef({ pond: null, fishes: [], boat: { x: 200 }, fishing: null, dialog: null });
  stateRef.current = { pond, fishes, boat, fishing, dialog };

  const setBoatX = (x) => setBoat((prev) => ({ ...prev, x }));

  // волны
  const waveFnRef = useRef(null);
  const setWaveFn = (fn) => { waveFnRef.current = fn; };
  const getWaveFn = () => waveFnRef.current;

  const value = useMemo(() => ({
    pond, fishes, boat, fishing, dialog,
    setPond, setFishes, setBoatX,
    setFishing, resetFishing,
    setDialog,
    setWaveFn, getWaveFn,
    getState: () => ({
      pond, fishes, boat, fishing, dialog,
      setFishing, resetFishing, setDialog,
      setWaveFn, getWaveFn,
    }),
  }), [pond, fishes, boat, fishing, dialog]);

  return <PondContext.Provider value={value}>{children}</PondContext.Provider>;
}

export function usePond() {
  const ctx = useContext(PondContext);
  if (!ctx) throw new Error('usePond must be used within PondProvider');
  return ctx;
}
