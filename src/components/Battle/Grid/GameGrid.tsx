import type { Board, Artifact, Position, Direction } from '../../../types';
import { GRID_SIZE, COLUMN_LABELS } from '../../../constants/game';
import { GridCell } from './GridCell';
import { ArtifactOverlay, type GhostArtifact } from './ArtifactOverlay';
import styles from './GameGrid.module.css';

interface GameGridProps {
  board: Board;
  isOwn: boolean;
  title: string;
  selectedArtifactId?: string | null;
  movableArtifactIds?: Set<string>;
  validMovePositions?: Position[];
  validMoveGhosts?: GhostArtifact[];
  onCellClick?: (row: number, col: number) => void;
  onArtifactClick?: (artifactId: string) => void;
  onGhostClick?: (direction: Direction) => void;
}

export function GameGrid({
  board,
  isOwn,
  title,
  selectedArtifactId,
  movableArtifactIds,
  validMovePositions,
  validMoveGhosts,
  onCellClick,
  onArtifactClick,
  onGhostClick,
}: GameGridProps) {
  function getArtifactForCell(row: number, col: number): Artifact | null {
    const artifactId = board.cells[row][col].artifactId;
    if (!artifactId) return null;
    return board.artifacts.find((a) => a.id === artifactId) ?? null;
  }

  return (
    <div className={`${styles.wrapper} ${isOwn ? styles.own : styles.enemy}`}>
      <div className={styles.title}>{title}</div>
      <div className={styles.gridContainer}>
        {/* Column headers */}
        <div className={styles.headerRow}>
          {COLUMN_LABELS.map((label) => (
            <div key={label} className={styles.headerCell}>{label}</div>
          ))}
        </div>

        {Array.from({ length: GRID_SIZE }, (_, row) => (
          <div key={row} className={styles.gridRow}>
            <div className={styles.rowLabel}>{row + 1}</div>
            {Array.from({ length: GRID_SIZE }, (_, col) => {
              const cell = board.cells[row][col];
              const artifact = getArtifactForCell(row, col);
              const isMovable = isOwn && artifact ? (movableArtifactIds?.has(artifact.id) ?? false) : false;
              const isSelected = isOwn && artifact ? artifact.id === selectedArtifactId : false;

              const isInteractive =
                (isOwn && !!artifact && isMovable) ||
                (!isOwn && !!onCellClick && cell.state === 'hidden');

              function handleClick() {
                if (isOwn && artifact && isMovable && onArtifactClick) {
                  onArtifactClick(artifact.id);
                } else if (!isOwn && onCellClick && cell.state === 'hidden') {
                  onCellClick(row, col);
                }
              }

              return (
                <GridCell
                  key={col}
                  cell={cell}
                  row={row}
                  col={col}
                  isOwn={isOwn}
                  isMovable={isMovable}
                  isSelected={isSelected}
                  validMovePositions={validMovePositions}
                  onClick={isInteractive ? handleClick : undefined}
                />
              );
            })}
          </div>
        ))}

        {/* Multi-cell fossil overlay — one SVG per artifact spanning all its cells */}
        <ArtifactOverlay artifacts={board.artifacts} isOwn={isOwn} validMoveGhosts={validMoveGhosts} onGhostClick={onGhostClick} />
      </div>
    </div>
  );
}
