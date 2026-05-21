import type { ArtifactConfig } from '../types';

export const GRID_SIZE = 10;
export const INITIAL_MOVES = 3;

// One fossil type per size — all instances of the same size share the same visual
export const ARTIFACT_CONFIGS: Record<string, ArtifactConfig> = {
  plesiosaur: {
    size: 4,
    name: 'Позвоночник плезиозавра',
    emoji: '🦕',
    description: 'Цепочка позвонков крупного морского ящера',
    svgKey: 'plesiosaur',
  },
  ancient_fish: {
    size: 3,
    name: 'Отпечаток древней рыбы',
    emoji: '🐟',
    description: 'Полный скелет доисторической рыбы в сланце',
    svgKey: 'ancient_fish',
  },
  ammonite: {
    size: 2,
    name: 'Аммонит',
    emoji: '🐚',
    description: 'Спиральная раковина головоногого моллюска',
    svgKey: 'ammonite',
  },
  megalodont: {
    size: 1,
    name: 'Зуб мегалодона',
    emoji: '🦷',
    description: 'Огромный зуб доисторической акулы',
    svgKey: 'megalodont',
  },
};

// Game fleet: how many of each artifact type
export const FLEET: Array<{ configKey: string; count: number }> = [
  { configKey: 'plesiosaur', count: 1 },
  { configKey: 'ancient_fish', count: 2 },
  { configKey: 'ammonite', count: 3 },
  { configKey: 'megalodont', count: 4 },
];

export const COLUMN_LABELS = ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I', 'J'];
