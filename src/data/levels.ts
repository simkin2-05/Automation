import { LevelConfig } from '../types/game';

const cities = ['Durban', 'Johannesburg', 'Cape Town', 'Pretoria'] as const;
const difficulties = ['Easy', 'Medium', 'Hard'] as const;

const levelMatrix = [
  { timeLimit: 90, targetPassengers: 6, traffic: 3, police: 1, spawnDelay: 28 },
  { timeLimit: 110, targetPassengers: 8, traffic: 5, police: 1, spawnDelay: 22 },
  { timeLimit: 130, targetPassengers: 10, traffic: 7, police: 2, spawnDelay: 18 },
];

const configs: LevelConfig[] = [];

cities.forEach((city, cityIndex) => {
  difficulties.forEach((difficulty, difficultyIndex) => {
    const base = levelMatrix[difficultyIndex];
    const id = `${city.toLowerCase().replace(/\s+/g, '-')}-${difficulty.toLowerCase()}`;
    configs.push({
      id,
      city,
      difficulty,
      index: cityIndex * 3 + difficultyIndex + 1,
      timeLimit: base.timeLimit + cityIndex * 8,
      targetPassengers: base.targetPassengers + cityIndex,
      trafficCount: base.traffic + cityIndex,
      trafficSpeedMultiplier: 0.8 + difficultyIndex * 0.2 + cityIndex * 0.05,
      policeCount: base.police + (cityIndex > 1 ? 1 : 0),
      policeSpeedMultiplier: 0.9 + difficultyIndex * 0.15 + cityIndex * 0.08,
      policeSpawnDelay: Math.max(8, base.spawnDelay - cityIndex * 2),
      randomSpawnInterval: Math.max(5, 9 - difficultyIndex - cityIndex),
      basePay: 120 + cityIndex * 40 + difficultyIndex * 30,
      bonusPerSecond: 4 + difficultyIndex,
    });
  });
});

export const LEVELS: LevelConfig[] = configs;

export const LEVELS_BY_CITY = cities.map((city) => ({
  city,
  levels: configs.filter((level) => level.city === city),
}));

export const FIRST_LEVEL_ID = LEVELS[0].id;
