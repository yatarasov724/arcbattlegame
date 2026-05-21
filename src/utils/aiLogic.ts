import type { Board, Position } from '../types';
import { GRID_SIZE } from '../constants/game';
import { posKey, getOrthogonalNeighbors } from './gridUtils';

interface AIState {
  mode: 'hunt' | 'target';
  // Cells confirmed as hits but artifact not yet sunk
  pendingHits: Position[];
  // Queue of cells to try when in target mode
  targetQueue: Position[];
  // Cells already probed
  probed: Set<string>;
}

// Stored in module scope — AI state persists between turns within a game
let aiState: AIState = makeInitialAIState();

function makeInitialAIState(): AIState {
  return {
    mode: 'hunt',
    pendingHits: [],
    targetQueue: [],
    probed: new Set(),
  };
}

export function resetAI(): void {
  aiState = makeInitialAIState();
}

/**
 * Record the result of the last AI dig.
 * Call this AFTER applying the dig to the board.
 */
export function notifyAIResult(pos: Position, wasHit: boolean, wasSunk: boolean): void {
  aiState.probed.add(posKey(pos));

  if (wasSunk) {
    // Remove all pending hits belonging to the sunk artifact (clear them)
    // We don't know exactly which cells — just clear pending and restart hunt
    aiState.pendingHits = [];
    aiState.targetQueue = [];
    aiState.mode = 'hunt';
    return;
  }

  if (wasHit) {
    aiState.pendingHits.push(pos);
    aiState.mode = 'target';

    // Build or refine target queue
    aiState.targetQueue = buildTargetQueue(aiState.pendingHits, aiState.probed);
  }
}

/**
 * Get next AI move.
 * Returns a position to dig on the human's board.
 */
export function getAIMove(board: Board): Position {
  if (aiState.mode === 'target' && aiState.targetQueue.length > 0) {
    // Pop next unprobed target
    while (aiState.targetQueue.length > 0) {
      const next = aiState.targetQueue.shift()!;
      if (!aiState.probed.has(posKey(next)) && isUndug(board, next)) {
        return next;
      }
    }
    // Target queue exhausted, fall back to hunt
    aiState.mode = 'hunt';
    aiState.pendingHits = [];
  }

  return huntMove(board);
}

/** Checkerboard-pattern hunt for efficiency */
function huntMove(board: Board): Position {
  const candidates: Position[] = [];

  for (let row = 0; row < GRID_SIZE; row++) {
    for (let col = 0; col < GRID_SIZE; col++) {
      // Checkerboard parity to skip half the cells in hunt mode
      if ((row + col) % 2 !== 0) continue;
      const pos = { row, col };
      if (!aiState.probed.has(posKey(pos)) && isUndug(board, pos)) {
        candidates.push(pos);
      }
    }
  }

  // If checkerboard exhausted, try all remaining
  if (candidates.length === 0) {
    for (let row = 0; row < GRID_SIZE; row++) {
      for (let col = 0; col < GRID_SIZE; col++) {
        const pos = { row, col };
        if (!aiState.probed.has(posKey(pos)) && isUndug(board, pos)) {
          candidates.push(pos);
        }
      }
    }
  }

  return candidates[Math.floor(Math.random() * candidates.length)];
}

function isUndug(board: Board, pos: Position): boolean {
  const cell = board.cells[pos.row]?.[pos.col];
  return cell?.state === 'hidden';
}

/**
 * Build a prioritized queue of cells to try given known hit positions.
 * If hits are aligned, prioritize extending that line first.
 */
function buildTargetQueue(hits: Position[], probed: Set<string>): Position[] {
  const queue: Position[] = [];

  if (hits.length >= 2) {
    // Detect alignment
    const allSameRow = hits.every((h) => h.row === hits[0].row);
    const allSameCol = hits.every((h) => h.col === hits[0].col);

    if (allSameRow) {
      const cols = hits.map((h) => h.col).sort((a, b) => a - b);
      const row = hits[0].row;
      // Try extending left and right
      const left = { row, col: cols[0] - 1 };
      const right = { row, col: cols[cols.length - 1] + 1 };
      if (left.col >= 0 && !probed.has(posKey(left))) queue.push(left);
      if (right.col < GRID_SIZE && !probed.has(posKey(right))) queue.push(right);
    } else if (allSameCol) {
      const rows = hits.map((h) => h.row).sort((a, b) => a - b);
      const col = hits[0].col;
      const up = { row: rows[0] - 1, col };
      const down = { row: rows[rows.length - 1] + 1, col };
      if (up.row >= 0 && !probed.has(posKey(up))) queue.push(up);
      if (down.row < GRID_SIZE && !probed.has(posKey(down))) queue.push(down);
    }
  }

  // Add all orthogonal neighbors of all hits as fallback
  for (const hit of hits) {
    for (const n of getOrthogonalNeighbors(hit)) {
      if (!probed.has(posKey(n)) && !queue.some((q) => posKey(q) === posKey(n))) {
        queue.push(n);
      }
    }
  }

  return queue;
}
