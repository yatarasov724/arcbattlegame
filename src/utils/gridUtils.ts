import { GRID_SIZE } from '../constants/game';
import type { Artifact, Board, Cell, Direction, Orientation, Position } from '../types';

export function createEmptyBoard(): Board {
  const cells: Cell[][] = Array.from({ length: GRID_SIZE }, () =>
    Array.from({ length: GRID_SIZE }, () => ({
      state: 'hidden',
      artifactId: null,
      isAnimating: false,
    }))
  );
  return { cells, artifacts: [] };
}

export function posKey(pos: Position): string {
  return `${pos.row},${pos.col}`;
}

export function parseKey(key: string): Position {
  const [row, col] = key.split(',').map(Number);
  return { row, col };
}

export function isInBounds(pos: Position): boolean {
  return pos.row >= 0 && pos.row < GRID_SIZE && pos.col >= 0 && pos.col < GRID_SIZE;
}

/** Returns all cells an artifact with given anchor + orientation + size would occupy */
export function getArtifactCells(
  anchor: Position,
  size: number,
  orientation: Orientation
): Position[] {
  return Array.from({ length: size }, (_, i) => ({
    row: orientation === 'vertical' ? anchor.row + i : anchor.row,
    col: orientation === 'horizontal' ? anchor.col + i : anchor.col,
  }));
}

/** 8-directional neighbors (for adjacency rule) */
export function getNeighbors(pos: Position): Position[] {
  const neighbors: Position[] = [];
  for (let dr = -1; dr <= 1; dr++) {
    for (let dc = -1; dc <= 1; dc++) {
      if (dr === 0 && dc === 0) continue;
      const n = { row: pos.row + dr, col: pos.col + dc };
      if (isInBounds(n)) neighbors.push(n);
    }
  }
  return neighbors;
}

/** 4-directional neighbors only */
export function getOrthogonalNeighbors(pos: Position): Position[] {
  return [
    { row: pos.row - 1, col: pos.col },
    { row: pos.row + 1, col: pos.col },
    { row: pos.row, col: pos.col - 1 },
    { row: pos.row, col: pos.col + 1 },
  ].filter(isInBounds);
}

/**
 * Checks if an artifact can be placed at given anchor on a board.
 * excludeId: skip checking against an existing artifact (used when moving).
 */
export function isValidPlacement(
  board: Board,
  anchor: Position,
  size: number,
  orientation: Orientation,
  excludeId?: string
): boolean {
  const candidateCells = getArtifactCells(anchor, size, orientation);

  // All cells must be in bounds
  if (!candidateCells.every(isInBounds)) return false;

  // Collect occupied cells from other artifacts
  const occupied = new Set<string>();
  for (const artifact of board.artifacts) {
    if (artifact.id === excludeId) continue;
    for (const cell of artifact.cells) {
      occupied.add(posKey(cell));
      // Also mark 8-directional neighbors as forbidden
      for (const n of getNeighbors(cell)) {
        occupied.add(posKey(n));
      }
    }
  }

  return candidateCells.every((cell) => !occupied.has(posKey(cell)));
}

/** Place an artifact onto a board (mutates a copy) */
export function placeArtifact(board: Board, artifact: Artifact): Board {
  const newCells = board.cells.map((row) => row.map((cell) => ({ ...cell })));
  for (const pos of artifact.cells) {
    newCells[pos.row][pos.col] = {
      ...newCells[pos.row][pos.col],
      artifactId: artifact.id,
    };
  }
  return {
    cells: newCells,
    artifacts: [...board.artifacts, artifact],
  };
}

/** Remove an artifact from a board */
export function removeArtifact(board: Board, artifactId: string): Board {
  const artifact = board.artifacts.find((a) => a.id === artifactId);
  if (!artifact) return board;

  const newCells = board.cells.map((row) => row.map((cell) => ({ ...cell })));
  for (const pos of artifact.cells) {
    newCells[pos.row][pos.col] = {
      ...newCells[pos.row][pos.col],
      artifactId: null,
    };
  }
  return {
    cells: newCells,
    artifacts: board.artifacts.filter((a) => a.id !== artifactId),
  };
}

/** Shift in a direction */
export function applyDirection(pos: Position, direction: Direction): Position {
  const deltas: Record<Direction, Position> = {
    up: { row: -1, col: 0 },
    down: { row: 1, col: 0 },
    left: { row: 0, col: -1 },
    right: { row: 0, col: 1 },
  };
  const d = deltas[direction];
  return { row: pos.row + d.row, col: pos.col + d.col };
}

/**
 * Move an artifact one step in a direction.
 * Returns new board or null if move is invalid.
 */
export function moveArtifact(
  board: Board,
  artifactId: string,
  direction: Direction
): Board | null {
  const artifact = board.artifacts.find((a) => a.id === artifactId);
  if (!artifact || artifact.isSunk) return null;

  const newCells = artifact.cells.map((c) => applyDirection(c, direction));
  if (!newCells.every(isInBounds)) return null;

  // Destination cells must be hidden or currently belong to this artifact
  const ownKeys = new Set(artifact.cells.map(posKey));
  const allClear = newCells.every((c) => {
    const state = board.cells[c.row][c.col].state;
    return state === 'hidden' || ownKeys.has(posKey(c));
  });
  if (!allClear) return null;

  // Compute new anchor (first cell)
  const newAnchor = newCells[0];

  // Validate placement excluding current artifact
  if (!isValidPlacement(board, newAnchor, artifact.size, artifact.orientation, artifactId)) {
    return null;
  }

  // Remove old, place new
  const withoutOld = removeArtifact(board, artifactId);
  const movedArtifact: Artifact = { ...artifact, cells: newCells };
  return placeArtifact(withoutOld, movedArtifact);
}

/**
 * Generate a random valid board for the given fleet configs.
 * Retries up to maxAttempts times per artifact.
 */
export function generateRandomBoard(
  fleet: Array<{ configKey: string; size: number; name: string; emoji: string; description: string }>
): Board {
  let board = createEmptyBoard();
  let idCounter = 0;

  for (const spec of fleet) {
    let placed = false;
    let attempts = 0;
    while (!placed && attempts < 200) {
      attempts++;
      const orientation: Orientation = Math.random() < 0.5 ? 'horizontal' : 'vertical';
      const maxRow = orientation === 'vertical' ? GRID_SIZE - spec.size : GRID_SIZE - 1;
      const maxCol = orientation === 'horizontal' ? GRID_SIZE - spec.size : GRID_SIZE - 1;
      const anchor: Position = {
        row: Math.floor(Math.random() * (maxRow + 1)),
        col: Math.floor(Math.random() * (maxCol + 1)),
      };

      if (isValidPlacement(board, anchor, spec.size, orientation)) {
        const cells = getArtifactCells(anchor, spec.size, orientation);
        const artifact: Artifact = {
          id: `artifact_${idCounter++}`,
          configKey: spec.configKey,
          size: spec.size,
          name: spec.name,
          emoji: spec.emoji,
          description: spec.description,
          cells,
          hits: new Set(),
          isSunk: false,
          orientation,
        };
        board = placeArtifact(board, artifact);
        placed = true;
      }
    }
  }

  return board;
}
