import React, { useEffect, useRef } from 'react';
import { useGame } from '../../store/useGame';
import { playVictory, playDefeat } from '../../utils/audioUtils';
import styles from './GameOverScreen.module.css';

const VICTORY_GLYPHS = ['𓂀', '𓃭', '𓆣', '𓇋', '𓊪', '𓏏', '𓁹', '𓃀'];
const VICTORY_QUOTES = [
  'Тайна тысячелетий наконец раскрыта.',
  'История снова заговорила с живыми.',
  'Песок хранил секрет — вы его нашли.',
];
const DEFEAT_QUOTES = [
  'Пески сомкнулись над историей.',
  'Некоторые тайны остаются погребёнными.',
  'Экспедиция потерпела поражение. Попробуйте снова.',
];

// Pre-computed decorative positions — deterministic, stable across re-renders
const VICTORY_PARTICLES = Array.from({ length: 14 }, (_, i) => ({
  left: `${5 + (i / 13) * 90}%`,
  bottom: `${10 + (i % 4) * 7}%`,
  delay: `${(i * 0.11).toFixed(2)}s`,
  spin: `${(i - 6.5) * 9}deg`,
  glyph: VICTORY_GLYPHS[i % VICTORY_GLYPHS.length],
}));

const SAND_GRAINS = Array.from({ length: 20 }, (_, i) => ({
  left: `${(i / 19) * 100}%`,
  delay: `${(i * 0.1).toFixed(2)}s`,
}));

export function GameOverScreen() {
  const { state, dispatch } = useGame();
  const soundPlayed = useRef(false);

  const isVictory = state.winner === 'human';

  useEffect(() => {
    if (soundPlayed.current) return;
    soundPlayed.current = true;
    const t = setTimeout(() => {
      if (isVictory) playVictory();
      else playDefeat();
    }, 300);
    return () => clearTimeout(t);
  }, [isVictory]);

  function newGame() {
    dispatch({ type: 'START_PLACEMENT' });
  }

  function goMenu() {
    dispatch({ type: 'RESTART' });
  }

  // Deterministic quote: varies by score so different games feel different
  const quotePool = isVictory ? VICTORY_QUOTES : DEFEAT_QUOTES;
  const quote = quotePool[(state.humanScore + state.movesLeft) % quotePool.length];

  return (
    <div className={`${styles.screen} ${isVictory ? styles.screenVictory : styles.screenDefeat}`}>
      {/* Ambient particles */}
      {isVictory &&
        VICTORY_PARTICLES.map((p, i) => (
          <span
            key={i}
            className={styles.particle}
            style={{
              left: p.left,
              bottom: p.bottom,
              '--delay': p.delay,
              '--spin': p.spin,
            } as React.CSSProperties}
          >
            {p.glyph}
          </span>
        ))}

      {!isVictory &&
        SAND_GRAINS.map((g, i) => (
          <div
            key={i}
            className={styles.sandGrain}
            style={{
              left: g.left,
              top: '-10px',
              '--delay': g.delay,
            } as React.CSSProperties}
          />
        ))}

      <div className={`${styles.card} ${isVictory ? styles.cardVictory : styles.cardDefeat}`}>
        <span className={styles.artifactReveal}>
          {isVictory ? '𓂀' : '💀'}
        </span>

        <h2 className={`${styles.resultTitle} ${isVictory ? styles.resultTitleVictory : styles.resultTitleDefeat}`}>
          {isVictory ? 'Раскопки завершены!' : 'Экспедиция провалена'}
        </h2>

        <p className={`${styles.resultSubtitle} ${isVictory ? styles.resultSubtitleVictory : styles.resultSubtitleDefeat}`}>
          {isVictory ? 'Вы победили противника!' : 'Противник опередил вас'}
        </p>

        <div className={`${styles.divider} ${isVictory ? styles.dividerVictory : styles.dividerDefeat}`} />

        <div className={styles.scores}>
          <div className={styles.scoreItem}>
            <span className={`${styles.scoreLabel} ${isVictory ? styles.scoreLabelVictory : styles.scoreLabelDefeat}`}>
              Ваши очки
            </span>
            <span className={`${styles.scoreValue} ${isVictory ? styles.scoreValueVictory : styles.scoreValueDefeat}`}>
              {state.humanScore}
            </span>
          </div>
          <div className={styles.scoreItem}>
            <span className={`${styles.scoreLabel} ${isVictory ? styles.scoreLabelVictory : styles.scoreLabelDefeat}`}>
              Очки ИИ
            </span>
            <span className={`${styles.scoreValue} ${isVictory ? styles.scoreValueVictory : styles.scoreValueDefeat}`}>
              {state.aiScore}
            </span>
          </div>
          <div className={styles.scoreItem}>
            <span className={`${styles.scoreLabel} ${isVictory ? styles.scoreLabelVictory : styles.scoreLabelDefeat}`}>
              Перемещений осталось
            </span>
            <span className={`${styles.scoreValue} ${isVictory ? styles.scoreValueVictory : styles.scoreValueDefeat}`}>
              {state.movesLeft}
            </span>
          </div>
        </div>

        <div className={styles.buttons}>
          <button
            className={`${styles.btnPrimary} ${isVictory ? styles.btnPrimaryVictory : styles.btnPrimaryDefeat}`}
            onClick={newGame}
            type="button"
          >
            {isVictory ? '⚒ Новая экспедиция' : '↺ Попробовать снова'}
          </button>
          <button
            className={`${styles.btnSecondary} ${isVictory ? styles.btnSecondaryVictory : styles.btnSecondaryDefeat}`}
            onClick={goMenu}
            type="button"
          >
            ← Главное меню
          </button>
        </div>

        <p className={`${styles.flavor} ${isVictory ? styles.flavorVictory : styles.flavorDefeat}`}>
          {quote}
        </p>
      </div>
    </div>
  );
}
