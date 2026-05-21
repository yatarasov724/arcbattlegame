import type { Board } from '../../types';
import { FLEET, ARTIFACT_CONFIGS } from '../../constants/game';
import { FossilShape } from '../Battle/Grid/fossilShapes';
import styles from './ArtifactPalette.module.css';

interface ArtifactPaletteProps {
  board: Board;
  placingConfigKey: string | null;
  onSelectArtifact: (configKey: string) => void;
}

const ICON_H = 44;
const ICON_COLOR = '#8a6a3a';
const ICON_SW = 5;

function FossilIcon({ svgKey, size }: { svgKey: string; size: number }) {
  // Natural aspect ratio: size:1 (horizontal). Cap width so icon fits the card.
  const rawW = size * ICON_H;
  const maxW = 56;
  const iconW = Math.min(rawW, maxW);
  const iconH = ICON_H;

  // ViewBox matches natural proportions so the shape isn't distorted
  const vbW = size * 100;
  const vbH = 100;

  return (
    <svg
      width={iconW}
      height={iconH}
      viewBox={`0 0 ${vbW} ${vbH}`}
      preserveAspectRatio="xMidYMid meet"
      style={{ display: 'block', flexShrink: 0 }}
    >
      <FossilShape svgKey={svgKey} width={vbW} height={vbH} color={ICON_COLOR} sw={ICON_SW} />
    </svg>
  );
}

export function ArtifactPalette({ board, placingConfigKey, onSelectArtifact }: ArtifactPaletteProps) {
  const placedCounts: Record<string, number> = {};
  for (const artifact of board.artifacts) {
    placedCounts[artifact.configKey] = (placedCounts[artifact.configKey] ?? 0) + 1;
  }

  return (
    <div className={styles.palette}>
      <div className={styles.paletteTitle}>Ваши ископаемые</div>

      {FLEET.map(({ configKey, count }) => {
        const cfg = ARTIFACT_CONFIGS[configKey];
        const placed = placedCounts[configKey] ?? 0;
        const remaining = count - placed;
        const isFullyPlaced = remaining === 0;
        const isPlacing = placingConfigKey === configKey;

        return (
          <button
            key={configKey}
            className={[
              styles.artifactCard,
              isFullyPlaced ? styles.placed : '',
              isPlacing ? styles.placing : '',
            ].join(' ')}
            onClick={() => !isFullyPlaced && onSelectArtifact(configKey)}
            title={cfg.description}
            type="button"
          >
            <div className={styles.iconWrap}>
              <FossilIcon svgKey={cfg.svgKey} size={cfg.size} />
            </div>
            <div className={styles.info}>
              <div className={styles.name}>{cfg.name}</div>
              <div className={styles.sizeBlocks}>
                {Array.from({ length: cfg.size }, (_, i) => (
                  <div key={i} className={styles.sizeBlock} />
                ))}
              </div>
            </div>
            <span className={`${styles.count} ${placed > 0 ? styles.countPlaced : ''}`}>
              {placed}/{count}
            </span>
          </button>
        );
      })}
    </div>
  );
}
