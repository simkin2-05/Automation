export type CityName = 'Durban' | 'Johannesburg' | 'Cape Town' | 'Pretoria';

export type UpgradeKey = 'engine' | 'tyres' | 'tintedWindows';

export type LevelDifficulty = 'Easy' | 'Medium' | 'Hard';

export interface Upgrades {
  engine: number;
  tyres: number;
  tintedWindows: number;
}

export interface LevelProgress {
  bestScore: number;
  completed: boolean;
  stars: 0 | 1 | 2 | 3;
}

export interface GameState {
  currentLevelId: string;
  money: number;
  upgrades: Upgrades;
  highScores: Record<string, LevelProgress>;
  unlockedLevelIds: string[];
  settings: {
    muteMusic: boolean;
    muteSfx: boolean;
  };
}

export interface LevelConfig {
  id: string;
  city: CityName;
  difficulty: LevelDifficulty;
  index: number;
  timeLimit: number;
  targetPassengers: number;
  trafficCount: number;
  trafficSpeedMultiplier: number;
  policeCount: number;
  policeSpeedMultiplier: number;
  policeSpawnDelay: number;
  randomSpawnInterval: number;
  basePay: number;
  bonusPerSecond: number;
}

export interface Vec2 {
  x: number;
  y: number;
}

export type Direction = 0 | 90 | 180 | 270;

export interface TaxiRuntimeStats {
  taxiSpeed: number;
  brakeMultiplier: number;
  policeDetectRadiusMultiplier: number;
}

export interface RuntimeEntity {
  id: string;
  kind: 'passenger' | 'traffic' | 'police';
  x: number;
  y: number;
  width: number;
  height: number;
  direction?: Direction;
  vx?: number;
  vy?: number;
  speed?: number;
  state?: 'PATROL' | 'CHASE';
  nextSwitchAt?: number;
}

export interface LevelResult {
  levelId: string;
  won: boolean;
  reason: 'completed' | 'time-up' | 'busted';
  deliveredPassengers: number;
  moneyEarned: number;
  timeRemaining: number;
}

export interface UpgradeDefinition {
  key: UpgradeKey;
  label: string;
  description: string;
  costs: [number, number, number];
}
