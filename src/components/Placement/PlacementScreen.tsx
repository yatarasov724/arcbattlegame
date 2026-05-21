import { useState, useEffect, useCallback } from 'react';
import type { Orientation, Position, Artifact } from '../../types';
import { useGame } from '../../store/useGame';
import { FLEET, ARTIFACT_CONFIGS, INITIAL_MOVES } from '../../constants/game';
import { getArtifactCells, isValidPlacement } from '../../utils/gridUtils';
import { ArtifactPalette } from './ArtifactPalette';
import { PlacementGrid } from './PlacementGrid';
import styles from './PlacementScreen.module.css';

let idCounter = 0;
function makeId() { return `h_${Date.now()}_${idCounter++}`; }

export function PlacementScreen() {
  const { state, dispatch } = useGame();
  const [placingConfigKey, setPlacingConfigKey] = useState<string | null>(null);
  const [orientation, setOrientation] = useState<Orientation>('horizontal');

  // Count total needed vs placed
  const totalNeeded = FLEET.reduce((s, f) => s + f.count, 0);
  const totalPlaced = state.humanBoard.artifacts.length;
  const allPlaced = totalPlaced === totalNeeded;

  // Rotate with R key
  const handleKeyDown = useCallback((e: KeyboardEvent) => {
    if (e.key === 'r' || e.key === 'R') {
      setOrientation((o) => (o === 'horizontal' ? 'vertical' : 'horizontal'));
    }
    if (e.key === 'Escape') setPlacingConfigKey(null);
  }, []);

  useEffect(() => {
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [handleKeyDown]);

  function handleSelectArtifact(configKey: string) {
    setPlacingConfigKey(configKey === placingConfigKey ? null : configKey);
  }

  function handlePlaceArtifact(anchor: Position) {
    if (!placingConfigKey) return;
    const cfg = ARTIFACT_CONFIGS[placingConfigKey];

    // Check if we still have quota for this type
    const placed = state.humanBoard.artifacts.filter((a) => a.configKey === placingConfigKey).length;
    const fleet = FLEET.find((f) => f.configKey === placingConfigKey);
    if (!fleet || placed >= fleet.count) return;

    if (!isValidPlacement(state.humanBoard, anchor, cfg.size, orientation)) return;

    const cells = getArtifactCells(anchor, cfg.size, orientation);
    const artifact: Artifact = {
      id: makeId(),
      configKey: placingConfigKey,
      size: cfg.size,
      name: cfg.name,
      emoji: cfg.emoji,
      description: cfg.description,
      cells,
      hits: new Set(),
      isSunk: false,
      orientation,
    };

    dispatch({ type: 'PLACE_ARTIFACT_ON_BOARD', artifact });

    // If quota reached, deselect
    if (placed + 1 >= fleet.count) {
      setPlacingConfigKey(null);
    }
  }

  function handleRemoveArtifact(artifactId: string) {
    dispatch({ type: 'REMOVE_ARTIFACT_FROM_BOARD', artifactId });
  }

  function handleRandomize() {
    dispatch({ type: 'RANDOMIZE_PLACEMENT' });
    setPlacingConfigKey(null);
  }

  function handleClear() {
    for (const artifact of [...state.humanBoard.artifacts]) {
      dispatch({ type: 'REMOVE_ARTIFACT_FROM_BOARD', artifactId: artifact.id });
    }
  }

  function handleStartBattle() {
    if (!allPlaced) return;
    dispatch({ type: 'START_BATTLE' });
  }

  return (
    <div className={styles.screen}>
      <div className={styles.header}>
        <h2 className={styles.title}>Подготовка экспедиции</h2>
        <p className={styles.subtitle}>Разместите ваши ископаемые в слоях породы</p>
      </div>

      {/* Orientation selector */}
      <div className={styles.orientationRow}>
        <span className={styles.orientationLabel}>Ориентация:</span>
        <button
          className={`${styles.orientationBtn} ${orientation === 'horizontal' ? styles.active : ''}`}
          onClick={() => setOrientation('horizontal')}
          type="button"
        >
          ← Горизонталь
        </button>
        <button
          className={`${styles.orientationBtn} ${orientation === 'vertical' ? styles.active : ''}`}
          onClick={() => setOrientation('vertical')}
          type="button"
        >
          ↕ Вертикаль
        </button>
        <span className={styles.orientationHint}>(R — переключить)</span>
      </div>

      <div className={styles.main}>
        <div className={styles.gridWrapper}>
          <button
            className={styles.orientationBtnMobile}
            onClick={() => setOrientation((o) => (o === 'horizontal' ? 'vertical' : 'horizontal'))}
            type="button"
          >
            {orientation === 'horizontal' ? '↔ Горизонталь' : '↕ Вертикаль'}
          </button>
          <PlacementGrid
            board={state.humanBoard}
            placingConfigKey={placingConfigKey}
            placingOrientation={orientation}
            onPlaceArtifact={handlePlaceArtifact}
            onRemoveArtifact={handleRemoveArtifact}
          />
        </div>
        <ArtifactPalette
          board={state.humanBoard}
          placingConfigKey={placingConfigKey}
          onSelectArtifact={handleSelectArtifact}
        />
      </div>

      {/* Progress */}
      <div className={styles.progressBar}>
        <span className={styles.progressLabel}>
          Размещено: {totalPlaced}/{totalNeeded}
        </span>
        <div className={styles.progressDots}>
          {Array.from({ length: totalNeeded }, (_, i) => (
            <div
              key={i}
              className={`${styles.progressDot} ${i < totalPlaced ? styles.progressDotFilled : ''}`}
            />
          ))}
        </div>
        {allPlaced && <span className={styles.readyText}>✓ Готово!</span>}
      </div>

      {/* Move tokens info */}
      <div className={styles.movesInfo}>
        <span>📜</span>
        <span>Перемещений в бою: {INITIAL_MOVES}</span>
        <span style={{ opacity: 0.6 }}>— можно переместить ископаемое вместо раскопки</span>
      </div>

      <div className={styles.actions}>
        <button className={`${styles.btn} ${styles.btnSecondary}`} onClick={handleRandomize} type="button">
          🎲 Случайно
        </button>
        {state.humanBoard.artifacts.length > 0 && (
          <button className={`${styles.btn} ${styles.btnDanger}`} onClick={handleClear} type="button">
            ✕ Очистить
          </button>
        )}
        <button
          className={`${styles.btn} ${styles.btnPrimary}`}
          onClick={handleStartBattle}
          disabled={!allPlaced}
          type="button"
        >
          ⚔️ Начать раскопки!
        </button>
      </div>
    </div>
  );
}
