import AsyncStorage from '@react-native-async-storage/async-storage';
import React, { createContext, useContext, useEffect, useMemo, useReducer, useRef } from 'react';

import { FIRST_LEVEL_ID, LEVELS } from '../data/levels';
import { UPGRADE_DEFINITIONS } from '../data/upgrades';
import { GameState, LevelResult, UpgradeKey } from '../types/game';

const STORAGE_KEY = 'taxi-rush-save-v1';

type GameAction =
  | { type: 'SET_CURRENT_LEVEL'; levelId: string }
  | { type: 'COMPLETE_LEVEL'; payload: LevelResult }
  | { type: 'BUY_UPGRADE'; key: UpgradeKey }
  | { type: 'TOGGLE_SETTING'; key: 'muteMusic' | 'muteSfx' }
  | { type: 'HYDRATE'; payload: GameState }
  | { type: 'RESET_SAVE' };

interface GameContextValue {
  state: GameState;
  dispatch: React.Dispatch<GameAction>;
  hydrated: boolean;
}

const defaultState: GameState = {
  currentLevelId: FIRST_LEVEL_ID,
  money: 0,
  upgrades: {
    engine: 0,
    tyres: 0,
    tintedWindows: 0,
  },
  highScores: {},
  unlockedLevelIds: [FIRST_LEVEL_ID],
  settings: {
    muteMusic: false,
    muteSfx: false,
  },
};

const GameContext = createContext<GameContextValue | undefined>(undefined);

const nextLevelId = (levelId: string) => {
  const index = LEVELS.findIndex((item) => item.id === levelId);
  if (index >= 0 && index < LEVELS.length - 1) {
    return LEVELS[index + 1].id;
  }
  return undefined;
};

const calculateStars = (won: boolean, delivered: number, target: number, timeRemaining: number): 0 | 1 | 2 | 3 => {
  if (!won) {
    return 0;
  }
  let stars: 0 | 1 | 2 | 3 = 1;
  if (delivered >= target) {
    stars = 2;
  }
  if (timeRemaining > 25) {
    stars = 3;
  }
  return stars;
};

const reducer = (state: GameState, action: GameAction): GameState => {
  switch (action.type) {
    case 'SET_CURRENT_LEVEL':
      return {
        ...state,
        currentLevelId: action.levelId,
      };
    case 'COMPLETE_LEVEL': {
      const levelConfig = LEVELS.find((item) => item.id === action.payload.levelId);
      const target = levelConfig?.targetPassengers ?? 1;
      const stars = calculateStars(
        action.payload.won,
        action.payload.deliveredPassengers,
        target,
        action.payload.timeRemaining,
      );
      const currentProgress = state.highScores[action.payload.levelId];
      const updatedBest = Math.max(currentProgress?.bestScore ?? 0, action.payload.moneyEarned);
      const updatedStars = Math.max(currentProgress?.stars ?? 0, stars) as 0 | 1 | 2 | 3;
      const unlocked = [...state.unlockedLevelIds];
      if (action.payload.won) {
        const upcoming = nextLevelId(action.payload.levelId);
        if (upcoming && !unlocked.includes(upcoming)) {
          unlocked.push(upcoming);
        }
      }

      return {
        ...state,
        money: state.money + action.payload.moneyEarned,
        highScores: {
          ...state.highScores,
          [action.payload.levelId]: {
            completed: (currentProgress?.completed ?? false) || action.payload.won,
            bestScore: updatedBest,
            stars: updatedStars,
          },
        },
        unlockedLevelIds: unlocked,
      };
    }
    case 'BUY_UPGRADE': {
      const definition = UPGRADE_DEFINITIONS.find((item) => item.key === action.key);
      if (!definition) {
        return state;
      }
      const currentTier = state.upgrades[action.key];
      if (currentTier >= 3) {
        return state;
      }
      const cost = definition.costs[currentTier];
      if (state.money < cost) {
        return state;
      }
      return {
        ...state,
        money: state.money - cost,
        upgrades: {
          ...state.upgrades,
          [action.key]: currentTier + 1,
        },
      };
    }
    case 'TOGGLE_SETTING':
      return {
        ...state,
        settings: {
          ...state.settings,
          [action.key]: !state.settings[action.key],
        },
      };
    case 'HYDRATE':
      return action.payload;
    case 'RESET_SAVE':
      return defaultState;
    default:
      return state;
  }
};

export const GameProvider = ({ children }: { children: React.ReactNode }) => {
  const [state, dispatch] = useReducer(reducer, defaultState);
  const [hydrated, setHydrated] = React.useState(false);
  const saveTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    const load = async () => {
      try {
        const raw = await AsyncStorage.getItem(STORAGE_KEY);
        if (raw) {
          const parsed = JSON.parse(raw) as GameState;
          dispatch({ type: 'HYDRATE', payload: parsed });
        }
      } catch {
        // fall back to defaults on parse/storage error
      } finally {
        setHydrated(true);
      }
    };

    void load();
  }, []);

  useEffect(() => {
    if (!hydrated) {
      return;
    }
    if (saveTimerRef.current) {
      clearTimeout(saveTimerRef.current);
    }
    saveTimerRef.current = setTimeout(() => {
      void AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(state));
    }, 300);

    return () => {
      if (saveTimerRef.current) {
        clearTimeout(saveTimerRef.current);
      }
    };
  }, [state, hydrated]);

  const value = useMemo(() => ({ state, dispatch, hydrated }), [state, hydrated]);

  return <GameContext.Provider value={value}>{children}</GameContext.Provider>;
};

export const useGame = () => {
  const value = useContext(GameContext);
  if (!value) {
    throw new Error('useGame must be used inside GameProvider');
  }
  return value;
};

export const clearSavedGame = async () => {
  await AsyncStorage.removeItem(STORAGE_KEY);
};
