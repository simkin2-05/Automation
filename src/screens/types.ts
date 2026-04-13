import { LevelResult } from '../types/game';

export type RootStackParamList = {
  Home: undefined;
  LevelSelect: undefined;
  Game: { levelId: string };
  Results: { result: LevelResult };
  Shop: undefined;
  Settings: undefined;
};
