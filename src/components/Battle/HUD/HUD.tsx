import type { GameState } from '../../../types';
import { MoveTokens } from './MoveTokens';
import styles from './HUD.module.css';

interface HUDProps {
  state: GameState;
}

export function HUD({ state }: HUDProps) {
  const isHumanTurn = state.turn === 'human';

  return (
    <div className={styles.hud}>
      <div className={styles.turnIndicator}>
        <div className={`${styles.turnDot} ${isHumanTurn ? styles.turnDotHuman : styles.turnDotAI}`} />
        <span className={styles.turnLabel}>
          {isHumanTurn ? 'Ваш ход — раскапывайте' : 'Противник копает...'}
        </span>
      </div>

      <p className={styles.message} key={state.message}>
        {state.message}
      </p>

      <div className={styles.scores}>
        <div className={styles.scoreItem}>
          <span className={styles.scoreLabel}>Вы</span>
          <span className={styles.scoreValue}>{state.humanScore}</span>
        </div>
        <div className={styles.scoreItem}>
          <span className={styles.scoreLabel}>Ии</span>
          <span className={styles.scoreValue}>{state.aiScore}</span>
        </div>
      </div>

      <MoveTokens movesLeft={state.movesLeft} />
    </div>
  );
}
