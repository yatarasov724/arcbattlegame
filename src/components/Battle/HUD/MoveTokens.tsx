import { INITIAL_MOVES } from '../../../constants/game';
import styles from './MoveTokens.module.css';

interface MoveTokensProps {
  movesLeft: number;
}

export function MoveTokens({ movesLeft }: MoveTokensProps) {
  return (
    <div className={styles.container}>
      <span className={styles.label}>Перемещений:</span>
      <div className={styles.tokens}>
        {Array.from({ length: INITIAL_MOVES }, (_, i) => {
          const isActive = i < movesLeft;
          return (
            <div
              key={i}
              className={`${styles.token} ${isActive ? styles.tokenActive : styles.tokenUsed}`}
              title={isActive ? 'Перемещение доступно' : 'Использовано'}
            >
              <div className={styles.scroll}>
                <span className={styles.scrollGlyph}>{isActive ? '𓂀' : '·'}</span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
