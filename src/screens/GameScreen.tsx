import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import React, { useEffect, useMemo, useRef, useState } from 'react';
import { PanResponder, Pressable, StyleSheet, Text, View } from 'react-native';

import { GameBoard } from '../components/GameBoard';
import { Hud } from '../components/Hud';
import { useGame } from '../context/GameContext';
import { LEVELS } from '../data/levels';
import {
  BOARD_HEIGHT,
  BOARD_WIDTH,
  MAX_TAXI_CAPACITY,
  NPC_SIZE,
  PICKUP_RADIUS,
  TAXI_SIZE,
  TILE_SIZE,
} from '../game/constants';
import { clampToRoad, directionVector, intersects, taxiRuntimeStatsFromUpgrades } from '../game/logic';
import { RootStackParamList } from './types';
import { Direction, LevelResult, RuntimeEntity, TrafficColor } from '../types/game';

type Props = NativeStackScreenProps<RootStackParamList, 'Game'>;

const makeId = (prefix: string) => `${prefix}-${Math.random().toString(36).slice(2, 9)}`;
const randomBetween = (min: number, max: number) => min + Math.random() * (max - min);
const TRAFFIC_COLORS: TrafficColor[] = ['purple', 'yellow', 'red'];
const SIDEWALK_INSET = 6;
const SIDEWALK_OUTER = 28;

const busStops = [
  { x: 18, y: BOARD_HEIGHT * 0.22, width: 24, height: 15 },
  { x: BOARD_WIDTH - 18, y: BOARD_HEIGHT * 0.5, width: 24, height: 15 },
  { x: 18, y: BOARD_HEIGHT * 0.78, width: 24, height: 15 },
];

const randomSidewalkPosition = () => ({
  x:
    Math.random() < 0.5
      ? randomBetween(SIDEWALK_INSET, SIDEWALK_OUTER)
      : randomBetween(BOARD_WIDTH - SIDEWALK_OUTER, BOARD_WIDTH - SIDEWALK_INSET),
  y: randomBetween(16, BOARD_HEIGHT - 16),
});

const randomPassenger = (): RuntimeEntity => {
  const stopSpawn = Math.random() < 0.6;
  const anchor = stopSpawn
    ? busStops[Math.floor(Math.random() * busStops.length)]
    : randomSidewalkPosition();

  return {
    id: makeId('passenger'),
    kind: 'passenger',
    x: anchor.x + (stopSpawn ? randomBetween(-4, 4) : 0),
    y: Math.max(14, Math.min(BOARD_HEIGHT - 14, anchor.y + (stopSpawn ? randomBetween(-10, 10) : 0))),
    width: 14,
    height: 14,
  };
};

const spawnTraffic = (count: number, speedMultiplier: number): RuntimeEntity[] =>
  Array.from({ length: count }).map((_, index) => {
    const direction: Direction = index % 2 === 0 ? 180 : 0;
    const laneX = index % 2 === 0 ? BOARD_WIDTH / 2 - TILE_SIZE : BOARD_WIDTH / 2 + TILE_SIZE;
    return {
      id: makeId('traffic'),
      kind: 'traffic',
      x: laneX,
      y: randomBetween(30, BOARD_HEIGHT - 30),
      width: NPC_SIZE,
      height: NPC_SIZE,
      direction,
      speed: (38 + index * 2) * speedMultiplier,
      trafficColor: TRAFFIC_COLORS[Math.floor(Math.random() * TRAFFIC_COLORS.length)],
    };
  });

const spawnPolice = (count: number, speedMultiplier: number): RuntimeEntity[] =>
  Array.from({ length: count }).map((_, index) => ({
    id: makeId('police'),
    kind: 'police',
    x: BOARD_WIDTH / 2 + (index % 2 === 0 ? -50 : 50),
    y: 20 + index * 30,
    width: NPC_SIZE,
    height: NPC_SIZE,
    direction: 180,
    speed: (62 + index * 3) * speedMultiplier,
    state: 'PATROL',
    nextSwitchAt: performance.now() + 2600 + index * 600,
  }));

const rankZone = {
  x: BOARD_WIDTH / 2,
  y: BOARD_HEIGHT - 26,
  width: 95,
  height: 28,
};

const trees = Array.from({ length: 14 }).map((_, index) => {
  const onLeft = index % 2 === 0;
  return {
    x: onLeft ? randomBetween(8, 35) : randomBetween(BOARD_WIDTH - 35, BOARD_WIDTH - 8),
    y: randomBetween(10, BOARD_HEIGHT - 10),
    size: randomBetween(9, 14),
  };
});

export const GameScreen = ({ navigation, route }: Props) => {
  const { state, dispatch } = useGame();
  const level = useMemo(
    () => LEVELS.find((item) => item.id === route.params.levelId) ?? LEVELS[0],
    [route.params.levelId],
  );

  const stats = useMemo(() => taxiRuntimeStatsFromUpgrades(state.upgrades), [state.upgrades]);

  const [timeRemaining, setTimeRemaining] = useState(level.timeLimit);
  const [taxi, setTaxi] = useState({ x: BOARD_WIDTH / 2, y: BOARD_HEIGHT - 52, direction: 0 as Direction });
  const [passengersOnBoard, setPassengersOnBoard] = useState(0);
  const [deliveredPassengers, setDeliveredPassengers] = useState(0);
  const [entities, setEntities] = useState<RuntimeEntity[]>(() => [
    ...Array.from({ length: Math.min(level.targetPassengers + 2, 15) }).map(() => randomPassenger()),
    ...spawnTraffic(level.trafficCount, level.trafficSpeedMultiplier),
  ]);
  const [flashDirection, setFlashDirection] = useState<'left' | 'right' | null>(null);
  const [wanted, setWanted] = useState(false);
  const [moveDirection, setMoveDirection] = useState<Direction>(0);
  const [roadOffset, setRoadOffset] = useState({ x: 0, y: 0 });

  const brakeUntilRef = useRef<number>(0);
  const velocityRef = useRef({ x: 0, y: 0 });
  const keyInputRef = useRef({ up: false, down: false, left: false, right: false });
  const keyboardModeRef = useRef(false);
  const policeSpawnedRef = useRef(false);
  const lostWantedAtRef = useRef<number | null>(null);
  const endedRef = useRef(false);
  const animationRef = useRef<number | null>(null);
  const previousFrameRef = useRef<number>(0);
  const randomSpawnAccumulatorRef = useRef(0);
  const timeAccumulatorRef = useRef(0);

  const triggerBrake = () => {
    brakeUntilRef.current = performance.now() + 1000;
  };

  const turnTaxi = (turn: 'left' | 'right') => {
    setTaxi((current) => {
      const direction =
        turn === 'right'
          ? (((current.direction + 90) % 360) as Direction)
          : (((current.direction + 270) % 360) as Direction);
      setMoveDirection(direction);
      keyboardModeRef.current = false;
      const carrySpeed = Math.hypot(velocityRef.current.x, velocityRef.current.y);
      const nextVector = directionVector(direction);
      velocityRef.current = {
        x: nextVector.x * carrySpeed,
        y: nextVector.y * carrySpeed,
      };
      return {
        ...current,
        direction,
      };
    });
    setFlashDirection(turn);
    setTimeout(() => setFlashDirection(null), 300);
  };

  const finishLevel = (won: boolean, reason: LevelResult['reason'], finalTime: number) => {
    if (endedRef.current) {
      return;
    }
    endedRef.current = true;

    const timeBonus = won ? finalTime * level.bonusPerSecond : 0;
    const moneyEarned = won ? level.basePay + timeBonus : 0;

    const result: LevelResult = {
      levelId: level.id,
      won,
      reason,
      deliveredPassengers,
      moneyEarned,
      timeRemaining: finalTime,
    };

    dispatch({ type: 'COMPLETE_LEVEL', payload: result });
    navigation.replace('Results', { result });
  };

  useEffect(() => {
    const loop = (timestamp: number) => {
      if (endedRef.current) {
        return;
      }

      if (!previousFrameRef.current) {
        previousFrameRef.current = timestamp;
      }
      const dt = Math.min((timestamp - previousFrameRef.current) / 1000, 0.04);
      previousFrameRef.current = timestamp;

      const braking = timestamp < brakeUntilRef.current;
      const keyInput = keyInputRef.current;
      const keyX = (keyInput.right ? 1 : 0) - (keyInput.left ? 1 : 0);
      const keyY = (keyInput.down ? 1 : 0) - (keyInput.up ? 1 : 0);
      const hasKeyboardInput = keyX !== 0 || keyY !== 0;

      let targetX = 0;
      let targetY = 0;
      if (hasKeyboardInput) {
        keyboardModeRef.current = true;
        const magnitude = Math.hypot(keyX, keyY) || 1;
        targetX = (keyX / magnitude) * stats.taxiSpeed;
        targetY = (keyY / magnitude) * stats.taxiSpeed;
      } else if (!keyboardModeRef.current) {
        const vector = directionVector(moveDirection);
        targetX = vector.x * stats.taxiSpeed;
        targetY = vector.y * stats.taxiSpeed;
      }

      const speedFactor = braking ? stats.brakeMultiplier : 1;
      targetX *= speedFactor;
      targetY *= speedFactor;

      const smoothingRate = braking ? 14 : hasKeyboardInput ? 12 : 8;
      const blend = Math.min(1, dt * smoothingRate);
      velocityRef.current.x += (targetX - velocityRef.current.x) * blend;
      velocityRef.current.y += (targetY - velocityRef.current.y) * blend;
      if (!hasKeyboardInput && keyboardModeRef.current && Math.hypot(velocityRef.current.x, velocityRef.current.y) < 2) {
        velocityRef.current = { x: 0, y: 0 };
      }
      const currentSpeed = Math.hypot(velocityRef.current.x, velocityRef.current.y);

      setRoadOffset((current) => ({
        x: current.x + velocityRef.current.x * dt,
        y: current.y + velocityRef.current.y * dt,
      }));

      setTaxi((current) => {
        const nextX = current.x + velocityRef.current.x * dt;
        const nextY = current.y + velocityRef.current.y * dt;
        let direction = current.direction;
        if (currentSpeed > 4) {
          if (Math.abs(velocityRef.current.x) > Math.abs(velocityRef.current.y)) {
            direction = velocityRef.current.x >= 0 ? 90 : 270;
          } else {
            direction = velocityRef.current.y >= 0 ? 180 : 0;
          }
        }
        return {
          ...current,
          ...clampToRoad(nextX, nextY, TAXI_SIZE / 2),
          direction,
        };
      });

      setEntities((current) => {
        const next = current.map((entity) => {
          if (entity.kind === 'traffic') {
            const dir = directionVector(entity.direction ?? 180);
            let nextY = entity.y + dir.y * (entity.speed ?? 30) * dt;
            if (nextY < 12) {
              nextY = BOARD_HEIGHT - 12;
            } else if (nextY > BOARD_HEIGHT - 12) {
              nextY = 12;
            }
            return { ...entity, y: nextY };
          }

          if (entity.kind === 'police') {
            const tx = taxi.x - entity.x;
            const ty = taxi.y - entity.y;
            const distance = Math.hypot(tx, ty);
            const detectRadius = TILE_SIZE * 5 * stats.policeDetectRadiusMultiplier;

            let stateForUpdate = entity.state ?? 'PATROL';
            if (distance <= detectRadius) {
              stateForUpdate = 'CHASE';
              setWanted(true);
              lostWantedAtRef.current = null;
            }

            if (stateForUpdate === 'CHASE' && distance > TILE_SIZE * 8) {
              if (lostWantedAtRef.current === null) {
                lostWantedAtRef.current = timestamp;
              }
              if (timestamp - lostWantedAtRef.current > 5000) {
                stateForUpdate = 'PATROL';
                setWanted(false);
              }
            }

            let direction = entity.direction ?? 180;
            if (stateForUpdate === 'CHASE') {
              if (Math.abs(tx) > Math.abs(ty)) {
                direction = tx >= 0 ? 90 : 270;
              } else {
                direction = ty >= 0 ? 180 : 0;
              }
            } else if (entity.nextSwitchAt && timestamp > entity.nextSwitchAt) {
              const options: Direction[] = [0, 90, 180, 270];
              direction = options[Math.floor(Math.random() * options.length)];
              entity.nextSwitchAt = timestamp + 2000 + Math.random() * 1800;
            }

            const dir = directionVector(direction);
            const speed = (entity.speed ?? 55) * (stateForUpdate === 'CHASE' ? 1.1 : 0.8);
            const nx = entity.x + dir.x * speed * dt;
            const ny = entity.y + dir.y * speed * dt;
            const clamped = clampToRoad(nx, ny, NPC_SIZE / 2);

            return {
              ...entity,
              x: clamped.x,
              y: clamped.y,
              direction,
              state: stateForUpdate,
            };
          }

          return entity;
        });

        const filtered = next.filter((entity) => {
          if (entity.kind !== 'passenger') {
            return true;
          }

          const distance = Math.hypot(taxi.x - entity.x, taxi.y - entity.y);
          if (
            distance <= PICKUP_RADIUS &&
            passengersOnBoard < MAX_TAXI_CAPACITY &&
            currentSpeed < stats.taxiSpeed * 0.85
          ) {
            setPassengersOnBoard((currentCount) => Math.min(MAX_TAXI_CAPACITY, currentCount + 1));
            return false;
          }
          return true;
        });

        randomSpawnAccumulatorRef.current += dt;
        if (randomSpawnAccumulatorRef.current >= level.randomSpawnInterval) {
          randomSpawnAccumulatorRef.current = 0;
          const livePassengers = filtered.filter((item) => item.kind === 'passenger').length;
          if (livePassengers < 15) {
            filtered.push(randomPassenger());
          }
        }

        return filtered;
      });

      if (
        passengersOnBoard > 0 &&
        intersects(
          { x: taxi.x, y: taxi.y, width: TAXI_SIZE, height: TAXI_SIZE },
          rankZone,
        )
      ) {
        setDeliveredPassengers((current) => current + passengersOnBoard);
        setPassengersOnBoard(0);
      }

      if (!policeSpawnedRef.current && level.timeLimit - timeRemaining >= level.policeSpawnDelay) {
        policeSpawnedRef.current = true;
        setEntities((current) => [...current, ...spawnPolice(level.policeCount, level.policeSpeedMultiplier)]);
      }

      const taxiBox = { x: taxi.x, y: taxi.y, width: TAXI_SIZE, height: TAXI_SIZE };
      const collision = entities.find(
        (entity) =>
          (entity.kind === 'traffic' || entity.kind === 'police') &&
          intersects(taxiBox, { x: entity.x, y: entity.y, width: entity.width, height: entity.height }),
      );
      if (collision) {
        velocityRef.current = { x: 0, y: 0 };
        keyInputRef.current = { up: false, down: false, left: false, right: false };
        keyboardModeRef.current = false;
        setMoveDirection(taxi.direction);
        brakeUntilRef.current = timestamp + 1500;
        if (collision.kind === 'traffic') {
          finishLevel(false, 'crashed', timeRemaining);
          return;
        }
        if (collision.kind === 'police') {
          finishLevel(false, 'busted', timeRemaining);
          return;
        }
      }

      if (deliveredPassengers >= level.targetPassengers) {
        finishLevel(true, 'completed', timeRemaining);
        return;
      }

      timeAccumulatorRef.current += dt;
      if (timeAccumulatorRef.current >= 1) {
        timeAccumulatorRef.current -= 1;
        setTimeRemaining((current) => {
          const next = current - 1;
          if (next <= 0) {
            finishLevel(false, 'time-up', 0);
            return 0;
          }
          return next;
        });
      }

      animationRef.current = requestAnimationFrame(loop);
    };

    animationRef.current = requestAnimationFrame(loop);
    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [passengersOnBoard, deliveredPassengers, timeRemaining, entities, stats, moveDirection, taxi.x, taxi.y]);

  useEffect(() => {
    if (typeof window === 'undefined') {
      return;
    }

    const setKeyState = (code: string, isPressed: boolean) => {
      if (code === 'ArrowUp') {
        keyInputRef.current.up = isPressed;
      } else if (code === 'ArrowDown') {
        keyInputRef.current.down = isPressed;
      } else if (code === 'ArrowLeft') {
        keyInputRef.current.left = isPressed;
      } else if (code === 'ArrowRight') {
        keyInputRef.current.right = isPressed;
      }
    };

    const onKeyDown = (event: KeyboardEvent) => {
      if (
        event.code === 'ArrowUp' ||
        event.code === 'ArrowDown' ||
        event.code === 'ArrowLeft' ||
        event.code === 'ArrowRight'
      ) {
        event.preventDefault();
        setKeyState(event.code, true);
        if (event.code === 'ArrowLeft') {
          setFlashDirection('left');
          setTimeout(() => setFlashDirection(null), 180);
        } else if (event.code === 'ArrowRight') {
          setFlashDirection('right');
          setTimeout(() => setFlashDirection(null), 180);
        }
      } else if (event.code === 'Space') {
        event.preventDefault();
        triggerBrake();
      }
    };

    const onKeyUp = (event: KeyboardEvent) => {
      setKeyState(event.code, false);
    };

    const clearKeyboardInput = () => {
      keyInputRef.current = { up: false, down: false, left: false, right: false };
    };

    window.addEventListener('keydown', onKeyDown);
    window.addEventListener('keyup', onKeyUp);
    window.addEventListener('blur', clearKeyboardInput);
    return () => {
      window.removeEventListener('keydown', onKeyDown);
      window.removeEventListener('keyup', onKeyUp);
      window.removeEventListener('blur', clearKeyboardInput);
    };
  }, []);

  const panResponder = useMemo(
    () =>
      PanResponder.create({
        onMoveShouldSetPanResponder: (_, gestureState) =>
          Math.abs(gestureState.dx) > 20 || Math.abs(gestureState.dy) > 20,
        onPanResponderRelease: (_, gestureState) => {
          if (gestureState.dx > 30) {
            turnTaxi('right');
          } else if (gestureState.dx < -30) {
            turnTaxi('left');
          }
        },
      }),
    [],
  );

  return (
    <View style={styles.container}>
      <Hud
        timeRemaining={timeRemaining}
        passengerCount={passengersOnBoard}
        deliveredCount={deliveredPassengers}
        targetPassengers={level.targetPassengers}
        capacity={MAX_TAXI_CAPACITY}
        money={state.money}
        wanted={wanted}
      />

      <Pressable onPress={triggerBrake} style={styles.boardWrap} {...panResponder.panHandlers}>
        <GameBoard
          taxi={taxi}
          entities={entities}
          rankZone={rankZone}
          busStops={busStops}
          trees={trees}
          roadOffset={roadOffset}
          flashDirection={flashDirection}
        />
      </Pressable>

      <View style={styles.footer}>
        <Text style={styles.helper}>Hold arrow keys for smooth movement • Space or Tap to brake</Text>
        <Pressable style={styles.menuButton} onPress={() => navigation.navigate('Home')}>
          <Text style={styles.menuButtonText}>Exit</Text>
        </Pressable>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#111827',
    paddingTop: 14,
    paddingHorizontal: 10,
    paddingBottom: 18,
    gap: 10,
    alignItems: 'center',
  },
  boardWrap: {
    borderRadius: 12,
    overflow: 'hidden',
  },
  footer: {
    width: '100%',
    alignItems: 'center',
    gap: 8,
  },
  helper: {
    color: '#c4cde0',
    fontSize: 13,
    textAlign: 'center',
  },
  menuButton: {
    backgroundColor: '#435174',
    borderRadius: 10,
    paddingHorizontal: 16,
    paddingVertical: 9,
  },
  menuButtonText: {
    color: '#f4f6f8',
    fontWeight: '700',
  },
});
