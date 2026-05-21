import React, {
  useReducer,
  useCallback,
  useEffect,
  useLayoutEffect,
  useRef,
} from 'react';
import type { Position, Direction } from '../types';
import { gameReducer, initialState } from './gameReducer';
import { getAIMove, notifyAIResult } from '../utils/aiLogic';
import { playDig, playHit, playMiss, playSunk, playMove } from '../utils/audioUtils';
import { GameContext } from './contextDef';

export function GameProvider({ children }: { children: React.ReactNode }) {
  const [state, dispatch] = useReducer(gameReducer, initialState);
  const aiTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const stateRef = useRef(state);
  // Sync ref after every commit so timer callbacks read fresh state
  useLayoutEffect(() => {
    stateRef.current = state;
  });

  useEffect(() => {
    if (state.phase !== 'battle' || state.turn !== 'ai') return;

    aiTimerRef.current = setTimeout(() => {
      const current = stateRef.current;
      if (current.phase !== 'battle' || current.turn !== 'ai') return;

      const pos = getAIMove(current.humanBoard);
      const cell = current.humanBoard.cells[pos.row][pos.col];
      const wasHit = cell.artifactId !== null;

      let wasSunk = false;
      if (wasHit && cell.artifactId) {
        const artifact = current.humanBoard.artifacts.find((a) => a.id === cell.artifactId);
        if (artifact) wasSunk = artifact.hits.size + 1 === artifact.size;
      }

      notifyAIResult(pos, wasHit, wasSunk);
      dispatch({ type: 'AI_DIG_CELL', position: pos });

      if (wasSunk) playSunk();
      else if (wasHit) playHit();
      else playMiss();
    }, 900);

    return () => {
      if (aiTimerRef.current) clearTimeout(aiTimerRef.current);
    };
  }, [state.phase, state.turn, state.humanBoard]);

  const digCell = useCallback(
    (pos: Position) => {
      const current = stateRef.current;
      if (current.phase !== 'battle' || current.turn !== 'human') return;
      playDig();
      dispatch({ type: 'DIG_CELL', position: pos });
    },
    []
  );

  const moveSelectedArtifact = useCallback(
    (direction: Direction) => {
      const current = stateRef.current;
      if (!current.selectedArtifactId) return;
      playMove();
      dispatch({ type: 'MOVE_ARTIFACT', artifactId: current.selectedArtifactId, direction });
    },
    []
  );

  return (
    <GameContext.Provider value={{ state, dispatch, digCell, moveSelectedArtifact }}>
      {children}
    </GameContext.Provider>
  );
}
