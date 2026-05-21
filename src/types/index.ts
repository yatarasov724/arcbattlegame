export type GamePhase = 'menu' | 'placement' | 'battle' | 'gameover';
export type Turn = 'human' | 'ai';
export type CellState = 'hidden' | 'miss' | 'hit' | 'sunk' | 'buffer';
export type ActionMode = 'dig' | 'move';
export type Direction = 'up' | 'down' | 'left' | 'right';
export type Orientation = 'horizontal' | 'vertical';

export interface Position {
  row: number;
  col: number;
}

export interface ArtifactConfig {
  size: number;
  name: string;
  emoji: string;
  description: string;
  svgKey: string; // identifies which SVG fossil shape to render
}

export interface Artifact {
  id: string;
  configKey: string; // refers to ARTIFACT_CONFIGS key
  size: number;
  name: string;
  emoji: string;
  description: string;
  cells: Position[];
  hits: Set<string>; // "row,col" strings for O(1) lookup
  isSunk: boolean;
  orientation: Orientation;
}

export interface Cell {
  state: CellState;
  artifactId: string | null;
  isAnimating: boolean;
}

export interface Board {
  cells: Cell[][];
  artifacts: Artifact[];
}

export interface ActionResult {
  type: 'hit' | 'miss' | 'sunk' | 'move';
  position?: Position;
  artifactId?: string;
  artifactName?: string;
}

export interface LogEntry {
  id: number;
  text: string;
  kind: 'hit' | 'miss' | 'sunk' | 'move';
}

export interface GameState {
  phase: GamePhase;
  turn: Turn;
  humanBoard: Board;
  aiBoard: Board;
  movesLeft: number;
  actionMode: ActionMode;
  selectedArtifactId: string | null;
  validMovePositions: Position[]; // valid destination cells for selected artifact move
  lastAction: ActionResult | null;
  winner: Turn | null;
  message: string;
  tutorialSeen: boolean;
  humanScore: number;
  aiScore: number;
  log: LogEntry[];
}

export type GameAction =
  | { type: 'START_PLACEMENT' }
  | { type: 'PLACE_ARTIFACT_ON_BOARD'; artifact: Artifact }
  | { type: 'REMOVE_ARTIFACT_FROM_BOARD'; artifactId: string }
  | { type: 'RANDOMIZE_PLACEMENT' }
  | { type: 'START_BATTLE' }
  | { type: 'DIG_CELL'; position: Position }
  | { type: 'SET_ACTION_MODE'; mode: ActionMode }
  | { type: 'SELECT_ARTIFACT_TO_MOVE'; artifactId: string }
  | { type: 'MOVE_ARTIFACT'; artifactId: string; direction: Direction }
  | { type: 'AI_DIG_CELL'; position: Position }
  | { type: 'DISMISS_TUTORIAL' }
  | { type: 'RESTART' }
  | { type: 'CLEAR_ANIMATION'; row: number; col: number; boardOwner: Turn };
