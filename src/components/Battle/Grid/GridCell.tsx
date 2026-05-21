import { useEffect, useRef } from 'react';
import type { Cell, Position } from '../../../types';
import styles from './GridCell.module.css';

interface GridCellProps {
  cell: Cell;
  row: number;
  col: number;
  isOwn: boolean;
  isMovable?: boolean;
  isSelected?: boolean;
  showLabel?: boolean;
  validMovePositions?: Position[];
  onClick?: () => void;
}

export function GridCell({
  cell,
  row,
  col,
  isOwn,
  isMovable = false,
  isSelected = false,
  showLabel = false,
  validMovePositions = [],
  onClick,
}: GridCellProps) {
  const cellRef = useRef<HTMLDivElement>(null);

  // Spawn dust particles on hit/miss animation
  useEffect(() => {
    if (!cell.isAnimating || !cellRef.current) return;
    const el = cellRef.current;
    const particles = Array.from({ length: 6 }, (_, i) => {
      const p = document.createElement('div');
      p.className = styles.dustParticle;
      const angle = (i / 6) * Math.PI * 2;
      const dist = 12 + Math.random() * 10;
      p.style.setProperty('--dx', `${Math.cos(angle) * dist}px`);
      p.style.setProperty('--dy', `${Math.sin(angle) * dist}px`);
      p.style.left = `${40 + Math.cos(angle) * 4}%`;
      p.style.top = `${40 + Math.sin(angle) * 4}%`;
      return p;
    });
    particles.forEach((p) => el.appendChild(p));
    const timer = setTimeout(() => particles.forEach((p) => p.remove()), 600);
    return () => {
      clearTimeout(timer);
      particles.forEach((p) => p.remove());
    };
  }, [cell.isAnimating]);

  const stateClass = styles[cell.state as keyof typeof styles] ?? '';
  const ownerClass = isOwn
    ? isMovable
      ? styles.ownMovable
      : styles.own
    : '';
  const selectedClass = isSelected ? styles.selected : '';
  const nonInteractiveClass = onClick ? '' : styles.nonInteractive;

  // Check if this cell is a valid move destination
  const isValidMove = validMovePositions.some((p) => p.row === row && p.col === col);
  const validMoveClass = isValidMove && isOwn ? styles.validMove : '';

  const isSunk = cell.state === 'sunk';

  return (
    <div
      ref={cellRef}
      className={`${styles.cell} ${stateClass} ${ownerClass} ${selectedClass} ${validMoveClass} ${nonInteractiveClass}`}
      onClick={onClick}
      role="button"
      tabIndex={onClick ? 0 : -1}
      onKeyDown={(e) => e.key === 'Enter' && onClick?.()}
      aria-label={`Клетка ${String.fromCharCode(65 + col)}${row + 1}`}
    >
      {showLabel && (
        <span className={styles.colLabel}>
          {String.fromCharCode(65 + col)}{row + 1}
        </span>
      )}

      {/* State markers */}
      <div className={styles.marker}>
        {cell.state === 'miss' && <span className={styles.markerMiss}>·</span>}
        {cell.state === 'hit' && !isSunk && <span className={styles.markerHit}>✕</span>}
        {isSunk && <span className={styles.markerSunk}>★</span>}
        {cell.state === 'buffer' && <span className={styles.markerBuffer}>·</span>}
      </div>
    </div>
  );
}
