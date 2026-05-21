import { useEffect, useCallback } from 'react';
import type { Direction, ActionMode } from '../../../types';
import { useGame } from '../../../store/useGame';
import styles from './ActionPanel.module.css';

const DIRECTIONS: Array<{ dir: Direction; label: string; gridArea: string }> = [
  { dir: 'up', label: '↑', gridArea: '1 / 2' },
  { dir: 'left', label: '←', gridArea: '2 / 1' },
  { dir: 'right', label: '→', gridArea: '2 / 3' },
  { dir: 'down', label: '↓', gridArea: '3 / 2' },
];

export function ActionPanel() {
  const { state, dispatch, moveSelectedArtifact } = useGame();
  const { actionMode, movesLeft, selectedArtifactId, turn } = state;

  const isHumanTurn = turn === 'human';
  const canMove = movesLeft > 0 && isHumanTurn;
  const isMoving = actionMode === 'move';
  const hasSelected = !!selectedArtifactId;

  function setMode(mode: ActionMode) {
    dispatch({ type: 'SET_ACTION_MODE', mode });
  }

  const handleDirection = useCallback((dir: Direction) => {
    moveSelectedArtifact(dir);
  }, [moveSelectedArtifact]);

  const cancelMove = useCallback(() => {
    dispatch({ type: 'SET_ACTION_MODE', mode: 'dig' });
  }, [dispatch]);

  // Keyboard support for direction arrows
  useEffect(() => {
    if (!isMoving || !hasSelected) return;

    function handleKeyDown(e: KeyboardEvent) {
      let direction: Direction | null = null;

      if (e.key === 'ArrowUp') {
        direction = 'up';
        e.preventDefault();
      } else if (e.key === 'ArrowDown') {
        direction = 'down';
        e.preventDefault();
      } else if (e.key === 'ArrowLeft') {
        direction = 'left';
        e.preventDefault();
      } else if (e.key === 'ArrowRight') {
        direction = 'right';
        e.preventDefault();
      } else if (e.key === 'Escape') {
        cancelMove();
        e.preventDefault();
      }

      if (direction) {
        handleDirection(direction);
      }
    }

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isMoving, hasSelected, cancelMove, handleDirection]);

  return (
    <div className={styles.panel}>
      <span className={styles.panelTitle}>Действие</span>

      {!hasSelected && (
        <div className={styles.modeButtons}>
          <button
            className={`${styles.modeBtn} ${actionMode === 'dig' ? styles.modeBtnActive : ''}`}
            onClick={() => setMode('dig')}
            disabled={!isHumanTurn}
            type="button"
            title="Раскопать клетку на поле противника"
          >
            <span className={styles.modeIcon}>⛏️</span>
            Раскопать
          </button>
          <button
            className={`${styles.modeBtn} ${isMoving ? styles.modeBtnActive : ''}`}
            onClick={() => setMode('move')}
            disabled={!canMove}
            type="button"
            title={movesLeft > 0 ? 'Переместить ископаемое' : 'Перемещения исчерпаны'}
          >
            <span className={styles.modeIcon}>📜</span>
            Переместить
            {movesLeft > 0 && <small style={{ opacity: 0.7 }}>×{movesLeft}</small>}
          </button>
        </div>
      )}

      {isMoving && !hasSelected && (
        <p className={styles.hint}>
          Нажмите на своё ископаемое слева, чтобы выбрать его
        </p>
      )}

      {hasSelected && (
        <>
          <p className={styles.hint}>Выберите направление перемещения</p>
          <div className={styles.directionPad}>
            {DIRECTIONS.map(({ dir, label, gridArea }) => (
              <button
                key={dir}
                className={styles.dirBtn}
                style={{ gridArea }}
                onClick={() => handleDirection(dir)}
                type="button"
                aria-label={`Переместить ${dir}`}
              >
                {label}
              </button>
            ))}
            <div className={`${styles.dirBtn} ${styles.dirCenter}`} style={{ gridArea: '2 / 2' }} />
          </div>
          <button className={styles.cancelBtn} onClick={cancelMove} type="button">
            ✕ Отмена
          </button>
        </>
      )}
    </div>
  );
}
