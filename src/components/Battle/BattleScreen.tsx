import { useState, useEffect } from 'react';
import { useGame } from '../../store/useGame';
import { GameGrid } from './Grid/GameGrid';
import { HUD } from './HUD/HUD';
import { ActionPanel } from './ActionPanel/ActionPanel';
import { moveArtifact } from '../../utils/gridUtils';
import type { Direction } from '../../types';
import type { GhostArtifact } from './Grid/ArtifactOverlay';
import styles from './BattleScreen.module.css';

export function BattleScreen() {
  const { state, dispatch, digCell, moveSelectedArtifact } = useGame();
  const log = state.log;

  const [activeTab, setActiveTab] = useState<'human' | 'ai'>('ai');

  // Auto-switch tabs when turn or action mode changes
  useEffect(() => {
    if (state.turn === 'ai') {
      setActiveTab('human');
    } else if (state.actionMode === 'move') {
      setActiveTab('human');
    } else if (state.turn === 'human' && state.actionMode === 'dig') {
      setActiveTab('ai');
    }
  }, [state.turn, state.actionMode]);

  const movableArtifactIds =
    state.actionMode === 'move'
      ? new Set(state.humanBoard.artifacts.filter((a) => !a.isSunk).map((a) => a.id))
      : new Set<string>();

  const validMoveGhosts: GhostArtifact[] = [];
  if (state.selectedArtifactId && state.actionMode === 'move') {
    for (const dir of ['up', 'down', 'left', 'right'] as const) {
      const newBoard = moveArtifact(state.humanBoard, state.selectedArtifactId, dir);
      if (newBoard) {
        const moved = newBoard.artifacts.find((a) => a.id === state.selectedArtifactId);
        if (moved) validMoveGhosts.push({ artifact: moved, direction: dir });
      }
    }
  }

  function handleGhostClick(direction: Direction) {
    moveSelectedArtifact(direction);
  }

  function handleEnemyCellClick(row: number, col: number) {
    if (state.turn !== 'human' || state.actionMode !== 'dig') return;
    digCell({ row, col });
  }

  function handleOwnArtifactClick(artifactId: string) {
    if (state.actionMode !== 'move') return;
    dispatch({ type: 'SELECT_ARTIFACT_TO_MOVE', artifactId });
  }

  return (
    <div className={styles.screen}>
      <div className={styles.header}>
        <div className={styles.titleGroup}>
          <h2 className={styles.title}>Экспедиция</h2>
          <span className={styles.subtitle}>Раскопки идут...</span>
        </div>
        <button
          className={styles.menuBtn}
          onClick={() => dispatch({ type: 'RESTART' })}
          type="button"
        >
          ← В меню
        </button>
      </div>

      <HUD state={state} />

      {/* Tab bar — only visible on mobile (≤640px) */}
      <div className={styles.tabBar}>
        <button
          className={`${styles.tabBtn} ${activeTab === 'human' ? styles.tabBtnActive : ''}`}
          onClick={() => setActiveTab('human')}
          type="button"
        >
          📍 Моё поле
        </button>
        <button
          className={`${styles.tabBtn} ${activeTab === 'ai' ? styles.tabBtnActive : ''}`}
          onClick={() => setActiveTab('ai')}
          type="button"
        >
          ⚔️ Противник
        </button>
      </div>

      <div className={styles.main}>
        {/* Own board */}
        <div className={`${styles.gridSection} ${activeTab !== 'human' ? styles.gridHidden : ''}`}>
          <GameGrid
            board={state.humanBoard}
            isOwn
            title="Ваши раскопки"
            selectedArtifactId={state.selectedArtifactId}
            movableArtifactIds={movableArtifactIds}
            validMovePositions={state.validMovePositions}
            validMoveGhosts={validMoveGhosts}
            onArtifactClick={handleOwnArtifactClick}
            onGhostClick={handleGhostClick}
          />
        </div>

        {/* Center panel */}
        <div className={styles.centerPanel}>
          {state.turn === 'ai' && (
            <div className={styles.aiThinking}>
              <div className={styles.spinner} />
              Противник думает...
            </div>
          )}

          {state.turn === 'human' && <ActionPanel />}

          {/* Excavation log */}
          <div className={styles.log}>
            <div className={styles.logTitle}>Дневник раскопок</div>
            <div className={styles.logEntries}>
              {log.length === 0 && (
                <span className={styles.logEntry} style={{ opacity: 0.4 }}>
                  Записи появятся здесь...
                </span>
              )}
              {[...log].reverse().map((entry) => (
                <span
                  key={entry.id}
                  className={`${styles.logEntry} ${styles[`logEntry${entry.kind.charAt(0).toUpperCase() + entry.kind.slice(1) as string}` as keyof typeof styles]}`}
                >
                  {entry.text}
                </span>
              ))}
            </div>
          </div>
        </div>

        {/* Enemy board */}
        <div className={`${styles.gridSection} ${activeTab !== 'ai' ? styles.gridHidden : ''}`}>
          <GameGrid
            board={state.aiBoard}
            isOwn={false}
            title="Поле противника"
            onCellClick={state.turn === 'human' && state.actionMode === 'dig'
              ? handleEnemyCellClick
              : undefined}
          />
        </div>
      </div>
    </div>
  );
}
