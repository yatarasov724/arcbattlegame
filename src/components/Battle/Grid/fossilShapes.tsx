export interface FossilShapeProps {
  svgKey: string;
  width: number;
  height: number;
  color: string;
  sw: number;
}

export function FossilShape({ svgKey, width: w, height: h, color, sw }: FossilShapeProps) {
  switch (svgKey) {
    case 'plesiosaur':   return <PlesiosaurFossil  w={w} h={h} color={color} sw={sw} />;
    case 'ancient_fish': return <AncientFishFossil w={w} h={h} color={color} sw={sw} />;
    case 'ammonite':     return <AmmoniteFossil    w={w} h={h} color={color} sw={sw} />;
    case 'megalodont':   return <MegalodontFossil  w={w} h={h} color={color} sw={sw} />;
    default: return null;
  }
}

// ─── Plesiosaur ──────────────────────────────────────────────────────────────

export function PlesiosaurFossil({ w, h, color, sw }: { w: number; h: number; color: string; sw: number }) {
  const isH = w >= h;

  if (isH) {
    const hcx = w * 0.13, hcy = h * 0.38;
    const hrx = w * 0.036, hry = h * 0.14;
    const bcx = w * 0.63, bcy = h * 0.57;
    const brx = w * 0.165, bry = h * 0.33;

    return (
      <g stroke={color} strokeLinecap="round" strokeLinejoin="round" fill="none">
        <ellipse cx={bcx} cy={bcy} rx={brx} ry={bry}
                 fill={color} fillOpacity={0.2} strokeWidth={sw} />
        <ellipse cx={hcx} cy={hcy} rx={hrx} ry={hry}
                 fill={color} fillOpacity={0.32} strokeWidth={sw * 0.85} />
        <circle cx={hcx + hrx * 0.55} cy={hcy - hry * 0.3}
                r={hrx * 0.65} fill={color} fillOpacity={0.88} stroke="none" />
        <path d={`M ${hcx + hrx},${hcy} C ${w*0.28},${hcy - h*0.1} ${w*0.4},${bcy - bry*0.9} ${bcx - brx},${bcy}`}
              strokeWidth={sw * 0.9} opacity={0.78} />
        <path d={`M ${bcx - brx*0.6},${bcy - bry} C ${bcx - brx*0.8},${bcy - bry - h*0.38} ${bcx - brx*1.2},${bcy - bry - h*0.2} ${bcx - brx*0.6},${bcy - bry}`}
              fill={color} fillOpacity={0.15} strokeWidth={sw * 0.8} opacity={0.72} />
        <path d={`M ${bcx - brx*0.6},${bcy + bry} C ${bcx - brx*0.8},${bcy + bry + h*0.34} ${bcx - brx*1.2},${bcy + bry + h*0.18} ${bcx - brx*0.6},${bcy + bry}`}
              fill={color} fillOpacity={0.15} strokeWidth={sw * 0.8} opacity={0.72} />
        <path d={`M ${bcx + brx*0.32},${bcy - bry} C ${bcx + brx*0.52},${bcy - bry - h*0.3} ${bcx + brx*0.82},${bcy - bry - h*0.15} ${bcx + brx*0.32},${bcy - bry}`}
              fill={color} fillOpacity={0.15} strokeWidth={sw * 0.8} opacity={0.72} />
        <path d={`M ${bcx + brx*0.32},${bcy + bry} C ${bcx + brx*0.52},${bcy + bry + h*0.27} ${bcx + brx*0.82},${bcy + bry + h*0.13} ${bcx + brx*0.32},${bcy + bry}`}
              fill={color} fillOpacity={0.15} strokeWidth={sw * 0.8} opacity={0.72} />
        <path d={`M ${bcx + brx},${bcy} C ${w*0.85},${bcy - h*0.05} ${w*0.93},${bcy - h*0.1} ${w*0.97},${bcy - h*0.2}`}
              strokeWidth={sw * 0.75} opacity={0.72} />
        <line x1={w*0.97} y1={bcy - h*0.2} x2={w*0.91} y2={bcy - h*0.36}
              stroke={color} strokeWidth={sw*0.58} opacity={0.55} />
        <line x1={w*0.97} y1={bcy - h*0.2} x2={w*0.91} y2={bcy - h*0.05}
              stroke={color} strokeWidth={sw*0.58} opacity={0.55} />
        {[0.5, 0.57, 0.63, 0.7].map((t, i) => (
          <circle key={i} cx={w*t} cy={bcy} r={sw * 0.95}
                  fill={color} fillOpacity={0.52} stroke="none" />
        ))}
      </g>
    );
  } else {
    const hcx = w * 0.62, hcy = h * 0.1;
    const hrx = w * 0.14, hry = h * 0.036;
    const bcx = w * 0.44, bcy = h * 0.63;
    const brx = w * 0.33, bry = h * 0.165;

    return (
      <g stroke={color} strokeLinecap="round" strokeLinejoin="round" fill="none">
        <ellipse cx={bcx} cy={bcy} rx={brx} ry={bry}
                 fill={color} fillOpacity={0.2} strokeWidth={sw} />
        <ellipse cx={hcx} cy={hcy} rx={hrx} ry={hry}
                 fill={color} fillOpacity={0.32} strokeWidth={sw * 0.85} />
        <circle cx={hcx + hrx * 0.3} cy={hcy + hry * 0.55}
                r={hry * 0.65} fill={color} fillOpacity={0.88} stroke="none" />
        <path d={`M ${hcx},${hcy + hry} C ${hcx + w*0.1},${h*0.27} ${bcx + brx*0.88},${bcy - bry*1.35} ${bcx},${bcy - bry}`}
              strokeWidth={sw * 0.9} opacity={0.78} />
        <path d={`M ${bcx - brx},${bcy - bry*0.6} C ${bcx - brx - w*0.38},${bcy - bry*0.8} ${bcx - brx - w*0.2},${bcy - bry*1.18} ${bcx - brx},${bcy - bry*0.6}`}
              fill={color} fillOpacity={0.15} strokeWidth={sw * 0.8} opacity={0.72} />
        <path d={`M ${bcx + brx},${bcy - bry*0.6} C ${bcx + brx + w*0.34},${bcy - bry*0.8} ${bcx + brx + w*0.18},${bcy - bry*1.18} ${bcx + brx},${bcy - bry*0.6}`}
              fill={color} fillOpacity={0.15} strokeWidth={sw * 0.8} opacity={0.72} />
        <path d={`M ${bcx - brx},${bcy + bry*0.32} C ${bcx - brx - w*0.3},${bcy + bry*0.52} ${bcx - brx - w*0.16},${bcy + bry*0.82} ${bcx - brx},${bcy + bry*0.32}`}
              fill={color} fillOpacity={0.15} strokeWidth={sw * 0.8} opacity={0.72} />
        <path d={`M ${bcx + brx},${bcy + bry*0.32} C ${bcx + brx + w*0.26},${bcy + bry*0.52} ${bcx + brx + w*0.14},${bcy + bry*0.82} ${bcx + brx},${bcy + bry*0.32}`}
              fill={color} fillOpacity={0.15} strokeWidth={sw * 0.8} opacity={0.72} />
        <path d={`M ${bcx},${bcy + bry} C ${bcx - w*0.04},${h*0.84} ${bcx - w*0.08},${h*0.92} ${bcx - w*0.2},${h*0.97}`}
              strokeWidth={sw * 0.75} opacity={0.72} />
        <line x1={bcx - w*0.2} y1={h*0.97} x2={bcx - w*0.36} y2={h*0.91}
              stroke={color} strokeWidth={sw*0.58} opacity={0.55} />
        <line x1={bcx - w*0.2} y1={h*0.97} x2={bcx - w*0.05} y2={h*0.91}
              stroke={color} strokeWidth={sw*0.58} opacity={0.55} />
        {[0.5, 0.57, 0.63, 0.7].map((t, i) => (
          <circle key={i} cx={bcx} cy={h*t} r={sw * 0.95}
                  fill={color} fillOpacity={0.52} stroke="none" />
        ))}
      </g>
    );
  }
}

// ─── Ancient Fish ────────────────────────────────────────────────────────────

export function AncientFishFossil({ w, h, color, sw }: { w: number; h: number; color: string; sw: number }) {
  const isH = w >= h;
  const RIBS = 7;

  if (isH) {
    const cy = h * 0.52;
    const headX = w * 0.1, tailX = w * 0.9;
    const span = tailX - headX;
    const bodyRy = h * 0.3;
    const topCurve = `M ${headX},${cy} C ${headX + span*0.28},${cy - bodyRy*1.1} ${headX + span*0.6},${cy - bodyRy} ${tailX},${cy}`;
    const botCurve = `C ${headX + span*0.6},${cy + bodyRy} ${headX + span*0.28},${cy + bodyRy*0.92} ${headX},${cy}`;

    return (
      <g stroke={color} strokeLinecap="round" fill="none">
        <path d={`${topCurve} ${botCurve} Z`} fill={color} fillOpacity={0.16} stroke="none" />
        <path d={topCurve} strokeWidth={sw * 0.65} opacity={0.48} />
        <path d={`M ${tailX},${cy} ${botCurve}`} strokeWidth={sw * 0.65} opacity={0.48} />
        <line x1={headX} y1={cy} x2={tailX} y2={cy} stroke={color} strokeWidth={sw * 1.25} opacity={0.9} />
        <circle cx={headX} cy={cy} r={h * 0.15}
                fill={color} fillOpacity={0.25} stroke={color} strokeWidth={sw * 0.85} />
        <circle cx={headX + h*0.07} cy={cy - h*0.07}
                r={h * 0.04} fill={color} fillOpacity={0.82} stroke="none" />
        <path d={`M ${tailX},${cy} L ${tailX + span*0.08},${cy - h*0.32} Q ${tailX + span*0.06},${cy} ${tailX + span*0.08},${cy + h*0.32}`}
              strokeWidth={sw * 0.8} opacity={0.72} />
        <path d={`M ${headX + span*0.28},${cy - bodyRy*0.82} C ${headX + span*0.36},${cy - bodyRy - h*0.16} ${headX + span*0.52},${cy - bodyRy - h*0.12} ${headX + span*0.6},${cy - bodyRy*0.72}`}
              strokeWidth={sw * 0.58} opacity={0.5} />
        {Array.from({ length: RIBS }, (_, i) => {
          const t = (i + 1) / (RIBS + 1);
          const rx = headX + span * t * 0.86;
          const rl = bodyRy * (0.5 + 0.5 * Math.sin(t * Math.PI)) * 0.85;
          return (
            <g key={i}>
              <line x1={rx} y1={cy} x2={rx} y2={cy - rl} stroke={color} strokeWidth={sw * 0.62} opacity={0.62} />
              <line x1={rx} y1={cy} x2={rx} y2={cy + rl * 0.82} stroke={color} strokeWidth={sw * 0.62} opacity={0.62} />
            </g>
          );
        })}
      </g>
    );
  } else {
    const cx = w * 0.52;
    const headY = h * 0.1, tailY = h * 0.9;
    const span = tailY - headY;
    const bodyRx = w * 0.3;
    const leftCurve = `M ${cx},${headY} C ${cx - bodyRx*1.1},${headY + span*0.28} ${cx - bodyRx},${headY + span*0.6} ${cx},${tailY}`;
    const rightCurve = `C ${cx + bodyRx},${headY + span*0.6} ${cx + bodyRx*0.92},${headY + span*0.28} ${cx},${headY}`;

    return (
      <g stroke={color} strokeLinecap="round" fill="none">
        <path d={`${leftCurve} ${rightCurve} Z`} fill={color} fillOpacity={0.16} stroke="none" />
        <path d={leftCurve} strokeWidth={sw * 0.65} opacity={0.48} />
        <path d={`M ${cx},${tailY} ${rightCurve}`} strokeWidth={sw * 0.65} opacity={0.48} />
        <line x1={cx} y1={headY} x2={cx} y2={tailY} stroke={color} strokeWidth={sw * 1.25} opacity={0.9} />
        <circle cx={cx} cy={headY} r={w * 0.15}
                fill={color} fillOpacity={0.25} stroke={color} strokeWidth={sw * 0.85} />
        <circle cx={cx + w*0.07} cy={headY + w*0.07}
                r={w * 0.04} fill={color} fillOpacity={0.82} stroke="none" />
        <path d={`M ${cx},${tailY} L ${cx - w*0.32},${tailY + span*0.08} Q ${cx},${tailY + span*0.06} ${cx + w*0.32},${tailY + span*0.08}`}
              strokeWidth={sw * 0.8} opacity={0.72} />
        <path d={`M ${cx - bodyRx*0.82},${headY + span*0.28} C ${cx - bodyRx - w*0.16},${headY + span*0.36} ${cx - bodyRx - w*0.12},${headY + span*0.52} ${cx - bodyRx*0.72},${headY + span*0.6}`}
              strokeWidth={sw * 0.58} opacity={0.5} />
        {Array.from({ length: RIBS }, (_, i) => {
          const t = (i + 1) / (RIBS + 1);
          const ry = headY + span * t * 0.86;
          const rl = bodyRx * (0.5 + 0.5 * Math.sin(t * Math.PI)) * 0.85;
          return (
            <g key={i}>
              <line x1={cx} y1={ry} x2={cx - rl} y2={ry} stroke={color} strokeWidth={sw * 0.62} opacity={0.62} />
              <line x1={cx} y1={ry} x2={cx + rl * 0.82} y2={ry} stroke={color} strokeWidth={sw * 0.62} opacity={0.62} />
            </g>
          );
        })}
      </g>
    );
  }
}

// ─── Ammonite ────────────────────────────────────────────────────────────────

export function AmmoniteFossil({ w, h, color, sw }: { w: number; h: number; color: string; sw: number }) {
  const cx = w / 2, cy = h / 2;
  const R = Math.min(w, h) * 0.43;

  const shellPath = Array.from({ length: 65 }, (_, i) => {
    const a = (i / 64) * Math.PI * 2 - Math.PI / 2;
    const r = R * (1 + 0.07 * Math.sin(a * 7));
    return `${i === 0 ? 'M' : 'L'} ${(cx + Math.cos(a)*r).toFixed(2)} ${(cy + Math.sin(a)*r).toFixed(2)}`;
  }).join(' ') + ' Z';

  const spiralPath = Array.from({ length: 150 }, (_, i) => {
    const t = i / 149;
    const a = t * 2.8 * Math.PI * 2 - Math.PI / 2;
    const r = R * (0.08 + 0.92 * t);
    return `${i === 0 ? 'M' : 'L'} ${(cx + Math.cos(a)*r).toFixed(2)} ${(cy + Math.sin(a)*r).toFixed(2)}`;
  }).join(' ');

  return (
    <g stroke={color} fill="none" strokeLinecap="round">
      <path d={shellPath} fill={color} fillOpacity={0.18} strokeWidth={sw} opacity={0.78} />
      <path d={spiralPath} strokeWidth={sw * 1.5} opacity={0.92} />
      {Array.from({ length: 14 }, (_, i) => {
        const a = (i / 14) * Math.PI * 2;
        return (
          <line key={i}
            x1={cx + Math.cos(a)*R*0.1} y1={cy + Math.sin(a)*R*0.1}
            x2={cx + Math.cos(a)*R*0.96} y2={cy + Math.sin(a)*R*0.96}
            opacity={0.28} strokeWidth={sw * 0.42}
          />
        );
      })}
      <circle cx={cx} cy={cy} r={R * 0.1}
              fill={color} fillOpacity={0.55} stroke={color} strokeWidth={sw * 0.7} />
    </g>
  );
}

// ─── Megalodon Tooth ─────────────────────────────────────────────────────────

export function MegalodontFossil({ w, h, color, sw }: { w: number; h: number; color: string; sw: number }) {
  const cx = w / 2, cy = h / 2;
  const th = Math.min(h, w) * 0.75;
  const tw = th * 0.55;
  const tip = { x: cx, y: cy - th / 2 };
  const bl  = { x: cx - tw / 2, y: cy + th / 2 };
  const br  = { x: cx + tw / 2, y: cy + th / 2 };

  const edge = (from: { x: number; y: number }, to: { x: number; y: number }, dir: 1 | -1) => {
    const pts: Array<[number, number]> = [];
    for (let i = 0; i <= 5; i++) {
      const t = i / 5;
      pts.push([from.x + (to.x - from.x)*t, from.y + (to.y - from.y)*t]);
      if (i < 5) pts.push([from.x + (to.x - from.x)*t + dir*2.5, from.y + (to.y - from.y)*t + 3]);
    }
    return pts.map(([x, y], i) => `${i === 0 ? 'M' : 'L'} ${x.toFixed(1)} ${y.toFixed(1)}`).join(' ');
  };

  return (
    <g stroke={color} fill="none" strokeWidth={sw}>
      <polygon points={`${tip.x},${tip.y} ${bl.x},${bl.y} ${br.x},${br.y}`}
               fill={color} opacity={0.3} />
      <path d={edge(tip, bl, -1)} strokeWidth={sw * 1.2} opacity={0.9} />
      <path d={edge(tip, br,  1)} strokeWidth={sw * 1.2} opacity={0.9} />
      <line x1={cx} y1={tip.y + 4} x2={cx} y2={cy + th*0.3}
            opacity={0.4} strokeWidth={sw * 0.8} />
    </g>
  );
}
