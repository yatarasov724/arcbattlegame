import { createContext } from 'react';
import type React from 'react';
import type { GameState, GameAction, Position, Direction } from '../types';

export interface GameContextValue {
  state: GameState;
  dispatch: React.Dispatch<GameAction>;
  digCell: (pos: Position) => void;
  moveSelectedArtifact: (direction: Direction) => void;
}

export const GameContext = createContext<GameContextValue | null>(null);
