import { Upgrades, TaxiRuntimeStats } from '../types/game';
import {
  BASE_BRAKE_MULTIPLIER,
  BASE_TAXI_SPEED,
  BOARD_HEIGHT,
  BOARD_WIDTH,
  TILE_SIZE,
} from './constants';

export const directionVector = (direction: 0 | 90 | 180 | 270) => {
  switch (direction) {
    case 0:
      return { x: 0, y: -1 };
    case 90:
      return { x: 1, y: 0 };
    case 180:
      return { x: 0, y: 1 };
    default:
      return { x: -1, y: 0 };
  }
};

export const clampToRoad = (x: number, y: number, halfSize: number) => ({
  x: Math.max(halfSize, Math.min(BOARD_WIDTH - halfSize, x)),
  y: Math.max(halfSize, Math.min(BOARD_HEIGHT - halfSize, y)),
});

export const intersects = (
  a: { x: number; y: number; width: number; height: number },
  b: { x: number; y: number; width: number; height: number },
) => {
  const dx = Math.abs(a.x - b.x);
  const dy = Math.abs(a.y - b.y);
  return dx < (a.width + b.width) / 2 && dy < (a.height + b.height) / 2;
};

export const taxiRuntimeStatsFromUpgrades = (upgrades: Upgrades): TaxiRuntimeStats => ({
  taxiSpeed: BASE_TAXI_SPEED * (1 + upgrades.engine * 0.12),
  brakeMultiplier: Math.max(0.18, BASE_BRAKE_MULTIPLIER - upgrades.tyres * 0.04),
  policeDetectRadiusMultiplier: Math.max(0.6, 1 - upgrades.tintedWindows * 0.1),
});

export const tileToWorld = (col: number, row: number) => ({
  x: col * TILE_SIZE + TILE_SIZE / 2,
  y: row * TILE_SIZE + TILE_SIZE / 2,
});
