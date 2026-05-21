import type { Artifact, Direction } from '../../../types';
import { ARTIFACT_CONFIGS } from '../../../constants/game';
import { FossilShape } from './fossilShapes';

export interface GhostArtifact {
  artifact: Artifact;
  direction: Direction;
}

interface ArtifactOverlayProps {
  artifacts: Artifact[];
  isOwn: boolean;
  validMoveGhosts?: GhostArtifact[];
  onGhostClick?: (direction: Direction) => void;
}

export function ArtifactOverlay({ artifacts, isOwn, validMoveGhosts = [], onGhostClick }: ArtifactOverlayProps) {
  const CS = 'var(--cell-size)';
  const G  = 'var(--grid-gap)';

  function layout(cells: { row: number; col: number }[]) {
    const minRow = Math.min(...cells.map((c) => c.row));
    const maxRow = Math.max(...cells.map((c) => c.row));
    const minCol = Math.min(...cells.map((c) => c.col));
    const maxCol = Math.max(...cells.map((c) => c.col));
    const colSpan = maxCol - minCol + 1;
    const rowSpan = maxRow - minRow + 1;
    return {
      colSpan, rowSpan,
      left:   `calc(${G} + ${CS} + ${G} + ${minCol} * (${CS} + ${G}))`,
      top:    `calc(${G} + 18px + ${G} + ${minRow} * (${CS} + ${G}))`,
      width:  `calc(${colSpan} * ${CS} + ${Math.max(colSpan - 1, 0)} * ${G})`,
      height: `calc(${rowSpan} * ${CS} + ${Math.max(rowSpan - 1, 0)} * ${G})`,
    };
  }

  return (
    <>
      {artifacts.map((artifact) => {
        const config = ARTIFACT_CONFIGS[artifact.configKey];
        if (!config) return null;

        const { left, top, width, height, colSpan, rowSpan } = layout(artifact.cells);
        const revealed = isOwn || artifact.isSunk;
        const opacity  = artifact.isSunk ? 1 : revealed ? 0.85 : 0;
        const color    = artifact.isSunk ? '#CD7F32' : '#7a5020';
        const sw       = artifact.isSunk ? 9 : 6;
        const svgW = colSpan * 100;
        const svgH = rowSpan * 100;

        return (
          <div
            key={artifact.id}
            style={{
              position: 'absolute', left, top, width, height,
              pointerEvents: 'none', zIndex: 10,
              transition: 'opacity 0.4s ease', opacity,
            }}
          >
            <svg viewBox={`0 0 ${svgW} ${svgH}`} width="100%" height="100%" preserveAspectRatio="none" style={{ display: 'block' }}>
              <FossilShape svgKey={config.svgKey} width={svgW} height={svgH} color={color} sw={sw} />
            </svg>
          </div>
        );
      })}

      {validMoveGhosts.map(({ artifact: ghost, direction }, i) => {
        const config = ARTIFACT_CONFIGS[ghost.configKey];
        if (!config) return null;

        const { left, top, width, height, colSpan, rowSpan } = layout(ghost.cells);
        const svgW = colSpan * 100;
        const svgH = rowSpan * 100;
        const clickable = !!onGhostClick;

        return (
          <div
            key={`ghost_${i}`}
            style={{
              position: 'absolute', left, top, width, height,
              pointerEvents: clickable ? 'auto' : 'none',
              zIndex: 11,
              opacity: 0.7,
              border: '2px dashed #e6a817',
              borderRadius: 4,
              backgroundColor: 'rgba(230, 168, 23, 0.12)',
              boxShadow: '0 0 10px rgba(230, 168, 23, 0.35)',
              boxSizing: 'border-box',
              cursor: clickable ? 'pointer' : 'default',
              transition: 'opacity 0.15s ease',
            }}
            onClick={() => onGhostClick?.(direction)}
            onMouseEnter={(e) => { if (clickable) (e.currentTarget as HTMLElement).style.opacity = '1'; }}
            onMouseLeave={(e) => { if (clickable) (e.currentTarget as HTMLElement).style.opacity = '0.7'; }}
          >
            <svg viewBox={`0 0 ${svgW} ${svgH}`} width="100%" height="100%" preserveAspectRatio="none" style={{ display: 'block' }}>
              <FossilShape svgKey={config.svgKey} width={svgW} height={svgH} color="#e6a817" sw={3} />
            </svg>
          </div>
        );
      })}
    </>
  );
}
