import { useState } from 'react';
import type { Board, Orientation, Position } from '../../types';
import { GRID_SIZE, COLUMN_LABELS, ARTIFACT_CONFIGS } from '../../constants/game';
import { isValidPlacement, getArtifactCells, posKey } from '../../utils/gridUtils';
import { ArtifactOverlay } from '../Battle/Grid/ArtifactOverlay';
import styles from './PlacementGrid.module.css';

interface PlacementGridProps {
  board: Board;
  placingConfigKey: string | null;
  placingOrientation: Orientation;
  onPlaceArtifact: (anchor: Position) => void;
  onRemoveArtifact: (artifactId: string) => void;
}

export function PlacementGrid({
  board,
  placingConfigKey,
  placingOrientation,
  onPlaceArtifact,
  onRemoveArtifact,
}: PlacementGridProps) {
  const [hoverPos, setHoverPos] = useState<Position | null>(null);

  const cfg = placingConfigKey ? ARTIFACT_CONFIGS[placingConfigKey] : null;

  // Cells that would be occupied by the preview
  const previewCells = cfg && hoverPos
    ? getArtifactCells(hoverPos, cfg.size, placingOrientation)
    : [];
  const previewValid = previewCells.length > 0
    ? isValidPlacement(board, hoverPos!, cfg!.size, placingOrientation)
    : false;
  const previewKeys = new Set(previewCells.map(posKey));

  // Map occupied cells
  const occupiedCells = new Map<string, string>(); // posKey → artifactId
  for (const artifact of board.artifacts) {
    for (const cell of artifact.cells) {
      occupiedCells.set(posKey(cell), artifact.id);
    }
  }

  function handleCellClick(row: number, col: number) {
    if (placingConfigKey) {
      onPlaceArtifact({ row, col });
    } else {
      // Click on occupied cell = remove artifact
      const key = posKey({ row, col });
      const artifactId = occupiedCells.get(key);
      if (artifactId) onRemoveArtifact(artifactId);
    }
  }

  function getCellClasses(row: number, col: number): string {
    const key = posKey({ row, col });
    const isPreview = previewKeys.has(key);
    const isOccupied = occupiedCells.has(key);

    if (isPreview && previewValid) return `${styles.cell} ${styles.cellPreviewValid}`;
    if (isPreview && !previewValid) return `${styles.cell} ${styles.cellPreviewInvalid}`;
    if (isOccupied) return `${styles.cell} ${styles.cellOccupied}`;
    return styles.cell;
  }

  return (
    <div className={styles.wrapper}>
      <div className={styles.title}>Ваш участок раскопок</div>
        <div className={styles.gridContainer}>
          <div className={styles.headerRow}>
            {COLUMN_LABELS.map((label) => (
              <div key={label} className={styles.headerCell}>{label}</div>
            ))}
          </div>

          {Array.from({ length: GRID_SIZE }, (_, row) => (
            <div key={row} className={styles.gridRow}>
              <div className={styles.rowLabel}>{row + 1}</div>
              {Array.from({ length: GRID_SIZE }, (_, col) => (
                <div
                  key={col}
                  className={getCellClasses(row, col)}
                  onClick={() => handleCellClick(row, col)}
                  onMouseEnter={() => setHoverPos({ row, col })}
                  onMouseLeave={() => setHoverPos(null)}
                  role="button"
                  tabIndex={0}
                  aria-label={`${COLUMN_LABELS[col]}${row + 1}`}
                />
              ))}
            </div>
          ))}

          {/* SVG fossil overlay spanning multiple cells */}
          <ArtifactOverlay artifacts={board.artifacts} isOwn />
        </div>
    </div>
  );
}
