import type { GameState, GameAction, Board, Artifact, Position, LogEntry } from '../types';
import { FLEET, ARTIFACT_CONFIGS, INITIAL_MOVES, COLUMN_LABELS } from '../constants/game';
import {
  createEmptyBoard,
  generateRandomBoard,
  placeArtifact,
  removeArtifact,
  moveArtifact,
  posKey,
  getNeighbors,
} from '../utils/gridUtils';
import { resetAI } from '../utils/aiLogic';

let logCounter = 0;

function makeLogEntry(text: string, kind: LogEntry['kind']): LogEntry {
  return { id: logCounter++, text, kind };
}

function appendLog(log: LogEntry[], text: string, kind: LogEntry['kind']): LogEntry[] {
  return [makeLogEntry(text, kind), ...log].slice(0, 12);
}

function coordLabel(pos: Position): string {
  return `${COLUMN_LABELS[pos.col]}${pos.row + 1}`;
}

function buildFleetSpecs() {
  const specs: Array<{
    configKey: string;
    size: number;
    name: string;
    emoji: string;
    description: string;
  }> = [];
  for (const { configKey, count } of FLEET) {
    const cfg = ARTIFACT_CONFIGS[configKey];
    for (let i = 0; i < count; i++) {
      specs.push({
        configKey,
        size: cfg.size,
        name: cfg.name,
        emoji: cfg.emoji,
        description: cfg.description,
      });
    }
  }
  return specs;
}

export const initialState: GameState = {
  phase: 'menu',
  turn: 'human',
  humanBoard: createEmptyBoard(),
  aiBoard: createEmptyBoard(),
  movesLeft: INITIAL_MOVES,
  actionMode: 'dig',
  selectedArtifactId: null,
  validMovePositions: [],
  lastAction: null,
  winner: null,
  message: 'Добро пожаловать на раскопки!',
  tutorialSeen: localStorage.getItem('archaeology-tutorial-seen') === 'true',
  humanScore: 0,
  aiScore: 0,
  log: [],
};

function checkWinner(board: Board): boolean {
  return board.artifacts.every((a) => a.isSunk);
}

function applyDig(board: Board, pos: Position): {
  board: Board;
  wasHit: boolean;
  wasSunk: boolean;
  sunkArtifact: Artifact | null;
} {
  const cell = board.cells[pos.row][pos.col];
  const artifactId = cell.artifactId;

  const newCells = board.cells.map((row) => row.map((c) => ({ ...c })));
  newCells[pos.row][pos.col] = {
    ...newCells[pos.row][pos.col],
    state: artifactId ? 'hit' : 'miss',
    isAnimating: true,
  };

  let newArtifacts = [...board.artifacts];
  let wasSunk = false;
  let sunkArtifact: Artifact | null = null;

  if (artifactId) {
    newArtifacts = newArtifacts.map((a) => {
      if (a.id !== artifactId) return a;
      const newHits = new Set(a.hits);
      newHits.add(posKey(pos));
      const isSunk = newHits.size === a.size;
      if (isSunk) {
        wasSunk = true;
        // Mark all artifact cells as sunk
        for (const c of a.cells) {
          newCells[c.row][c.col] = { ...newCells[c.row][c.col], state: 'sunk', isAnimating: true };
        }
        // Mark 8-directional neighbors as buffer (safe zone — no fossils here)
        for (const c of a.cells) {
          for (const n of getNeighbors(c)) {
            if (newCells[n.row][n.col].state === 'hidden') {
              newCells[n.row][n.col] = { ...newCells[n.row][n.col], state: 'buffer' };
            }
          }
        }
        sunkArtifact = { ...a, hits: newHits, isSunk: true };
        return sunkArtifact;
      }
      return { ...a, hits: newHits };
    });
  }

  return {
    board: { cells: newCells, artifacts: newArtifacts },
    wasHit: !!artifactId,
    wasSunk,
    sunkArtifact,
  };
}

export function gameReducer(state: GameState, action: GameAction): GameState {
  switch (action.type) {
    case 'START_PLACEMENT': {
      return {
        ...state,
        phase: 'placement',
        humanBoard: createEmptyBoard(),
        aiBoard: createEmptyBoard(),
        movesLeft: INITIAL_MOVES,
        actionMode: 'dig',
        selectedArtifactId: null,
        validMovePositions: [],
        lastAction: null,
        winner: null,
        turn: 'human',
        humanScore: 0,
        aiScore: 0,
        message: 'Расставьте ваши ископаемые по полю раскопок',
      };
    }

    case 'PLACE_ARTIFACT_ON_BOARD': {
      const newBoard = placeArtifact(state.humanBoard, action.artifact);
      return { ...state, humanBoard: newBoard };
    }

    case 'REMOVE_ARTIFACT_FROM_BOARD': {
      const newBoard = removeArtifact(state.humanBoard, action.artifactId);
      return { ...state, humanBoard: newBoard };
    }

    case 'RANDOMIZE_PLACEMENT': {
      const specs = buildFleetSpecs();
      const newBoard = generateRandomBoard(specs);
      return { ...state, humanBoard: newBoard };
    }

    case 'START_BATTLE': {
      resetAI();
      const specs = buildFleetSpecs();
      const aiBoard = generateRandomBoard(specs);
      return {
        ...state,
        phase: 'battle',
        aiBoard,
        turn: 'human',
        movesLeft: INITIAL_MOVES,
        actionMode: 'dig',
        selectedArtifactId: null,
        validMovePositions: [],
        lastAction: null,
        log: [],
        message: 'Ваш ход — выберите место для раскопок',
      };
    }

    case 'DIG_CELL': {
      if (state.turn !== 'human' || state.phase !== 'battle') return state;

      const { board: newAiBoard, wasHit, wasSunk, sunkArtifact } = applyDig(state.aiBoard, action.position);
      const humanScore = state.humanScore + (wasSunk ? (sunkArtifact?.size ?? 1) * 100 : wasHit ? 50 : 0);

      const didWin = checkWinner(newAiBoard);
      const message = wasSunk
        ? `Найдено: ${sunkArtifact?.name}!`
        : wasHit
        ? 'Фрагмент обнаружен!'
        : 'Пустой слой...';

      const coord = coordLabel(action.position);
      const logText = wasSunk
        ? `★ ${coord}: ${sunkArtifact?.name} раскопан!`
        : wasHit
        ? `✕ ${coord}: Фрагмент найден`
        : `· ${coord}: Пустой слой`;
      const logKind = wasSunk ? 'sunk' : wasHit ? 'hit' : 'miss';

      return {
        ...state,
        aiBoard: newAiBoard,
        humanScore,
        turn: didWin ? 'human' : 'ai',
        phase: didWin ? 'gameover' : 'battle',
        winner: didWin ? 'human' : null,
        actionMode: 'dig',
        selectedArtifactId: null,
        validMovePositions: [],
        lastAction: {
          type: wasSunk ? 'sunk' : wasHit ? 'hit' : 'miss',
          position: action.position,
          artifactId: sunkArtifact?.id,
          artifactName: sunkArtifact?.name,
        },
        log: appendLog(state.log, logText, logKind),
        message,
      };
    }

    case 'SET_ACTION_MODE': {
      if (action.mode === 'move' && state.movesLeft <= 0) return state;
      return {
        ...state,
        actionMode: action.mode,
        selectedArtifactId: null,
        validMovePositions: [],
        message: action.mode === 'move'
          ? 'Выберите ископаемое для перемещения'
          : 'Выберите место для раскопок',
      };
    }

    case 'SELECT_ARTIFACT_TO_MOVE': {
      const artifact = state.humanBoard.artifacts.find((a) => a.id === action.artifactId);
      if (!artifact || artifact.isSunk) return state;

      // Compute valid move positions (target cells if movement succeeds)
      // For each direction, calculate where artifact cells would be after move
      const validPositions: Set<string> = new Set();
      const directions: Array<'up' | 'down' | 'left' | 'right'> = ['up', 'down', 'left', 'right'];

      for (const dir of directions) {
        // Try moving in this direction
        const newBoard = moveArtifact(state.humanBoard, action.artifactId, dir);
        if (newBoard) {
          // Movement is valid — get the new cells of the artifact
          const movedArtifact = newBoard.artifacts.find((a) => a.id === action.artifactId);
          if (movedArtifact) {
            for (const cell of movedArtifact.cells) {
              validPositions.add(posKey(cell));
            }
          }
        }
      }

      return {
        ...state,
        selectedArtifactId: action.artifactId,
        validMovePositions: Array.from(validPositions).map((key) => {
          const [row, col] = key.split(',').map(Number);
          return { row, col };
        }),
        message: 'Выберите направление перемещения',
      };
    }

    case 'MOVE_ARTIFACT': {
      if (!state.selectedArtifactId || state.movesLeft <= 0) return state;

      const newBoard = moveArtifact(state.humanBoard, action.artifactId, action.direction);
      if (!newBoard) {
        return { ...state, message: 'Невозможно переместить туда — препятствие или граница' };
      }

      return {
        ...state,
        humanBoard: newBoard,
        movesLeft: state.movesLeft - 1,
        turn: 'ai',
        actionMode: 'dig',
        selectedArtifactId: null,
        validMovePositions: [],
        lastAction: { type: 'move' },
        log: appendLog(state.log, '📜 Ископаемое перемещено', 'move'),
        message: `Перемещение выполнено. Осталось перемещений: ${state.movesLeft - 1}`,
      };
    }

    case 'AI_DIG_CELL': {
      if (state.phase !== 'battle') return state;

      const { board: newHumanBoard, wasHit, wasSunk, sunkArtifact } = applyDig(state.humanBoard, action.position);
      const aiScore = state.aiScore + (wasSunk ? (sunkArtifact?.size ?? 1) * 100 : wasHit ? 50 : 0);

      const aiWon = checkWinner(newHumanBoard);
      const message = wasSunk
        ? `Противник раскопал: ${sunkArtifact?.name}!`
        : wasHit
        ? 'Противник нашёл фрагмент!'
        : 'Противник промахнулся — ваш ход';

      const aiCoord = coordLabel(action.position);
      const aiLogText = wasSunk
        ? `★ ${aiCoord}: ${sunkArtifact?.name} — противник!`
        : wasHit
        ? `✕ ${aiCoord}: Фрагмент найден пр-ком`
        : `· ${aiCoord}: Противник промахнулся`;
      const aiLogKind = wasSunk ? 'sunk' : wasHit ? 'hit' : 'miss';

      return {
        ...state,
        humanBoard: newHumanBoard,
        aiScore,
        turn: aiWon ? 'ai' : 'human',
        phase: aiWon ? 'gameover' : 'battle',
        winner: aiWon ? 'ai' : null,
        validMovePositions: [],
        lastAction: {
          type: wasSunk ? 'sunk' : wasHit ? 'hit' : 'miss',
          position: action.position,
          artifactId: sunkArtifact?.id,
          artifactName: sunkArtifact?.name,
        },
        log: appendLog(state.log, aiLogText, aiLogKind),
        message,
      };
    }

    case 'DISMISS_TUTORIAL': {
      localStorage.setItem('archaeology-tutorial-seen', 'true');
      return { ...state, tutorialSeen: true };
    }

    case 'RESTART': {
      resetAI();
      return {
        ...initialState,
        tutorialSeen: state.tutorialSeen,
        validMovePositions: [],
      };
    }

    case 'CLEAR_ANIMATION': {
      const board = action.boardOwner === 'human' ? state.humanBoard : state.aiBoard;
      const newCells = board.cells.map((row, r) =>
        row.map((cell, c) => {
          if (r === action.row && c === action.col) return { ...cell, isAnimating: false };
          return cell;
        })
      );
      const newBoard = { ...board, cells: newCells };
      return action.boardOwner === 'human'
        ? { ...state, humanBoard: newBoard }
        : { ...state, aiBoard: newBoard };
    }

    default:
      return state;
  }
}
