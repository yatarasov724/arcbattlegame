import { useContext } from 'react';
import { GameContext } from './contextDef';
import type { GameContextValue } from './contextDef';

export function useGame(): GameContextValue {
  const ctx = useContext(GameContext);
  if (!ctx) throw new Error('useGame must be used inside GameProvider');
  return ctx;
}
