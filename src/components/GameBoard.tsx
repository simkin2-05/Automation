import React from 'react';
import { StyleSheet, View } from 'react-native';

import { BOARD_COLS, BOARD_ROWS, BOARD_WIDTH, TILE_SIZE } from '../game/constants';
import { Direction, RuntimeEntity } from '../types/game';

interface Props {
  taxi: {
    x: number;
    y: number;
    direction: Direction;
  };
  entities: RuntimeEntity[];
  rankZone: { x: number; y: number; width: number; height: number };
  flashDirection: 'left' | 'right' | null;
}

const taxiRotation = (direction: Direction) => `${direction}deg`;

export const GameBoard = ({ taxi, entities, rankZone, flashDirection }: Props) => {
  const tiles = React.useMemo(
    () =>
      Array.from({ length: BOARD_ROWS }).flatMap((_, row) =>
        Array.from({ length: BOARD_COLS }).map((__, col) => {
          const index = `${row}-${col}`;
          const isRoad = col > 1 && col < BOARD_COLS - 2;
          const isDivider = col === Math.floor(BOARD_COLS / 2);
          return (
            <View
              key={index}
              style={[
                styles.tile,
                {
                  left: col * TILE_SIZE,
                  top: row * TILE_SIZE,
                  backgroundColor: isRoad ? '#4b5563' : '#60a56f',
                },
                isDivider && row % 2 === 0 && styles.divider,
              ]}
            />
          );
        }),
      ),
    [],
  );

  return (
    <View style={styles.board}>
      {tiles}
      <View
        style={[
          styles.rank,
          {
            left: rankZone.x - rankZone.width / 2,
            top: rankZone.y - rankZone.height / 2,
            width: rankZone.width,
            height: rankZone.height,
          },
        ]}
      />

      {entities.map((entity) => (
        <View
          key={entity.id}
          style={[
            styles.entity,
            entity.kind === 'passenger' && styles.passenger,
            entity.kind === 'traffic' && styles.traffic,
            entity.kind === 'police' && styles.police,
            {
              left: entity.x - entity.width / 2,
              top: entity.y - entity.height / 2,
              width: entity.width,
              height: entity.height,
              transform: [{ rotate: `${entity.direction ?? 0}deg` }],
            },
          ]}
        />
      ))}

      <View
        style={[
          styles.taxi,
          {
            left: taxi.x - 9,
            top: taxi.y - 9,
            transform: [{ rotate: taxiRotation(taxi.direction) }],
          },
        ]}
      />

      {flashDirection ? (
        <View style={[styles.flashArrow, flashDirection === 'left' ? styles.leftFlash : styles.rightFlash]} />
      ) : null}
    </View>
  );
};

const styles = StyleSheet.create({
  board: {
    width: BOARD_WIDTH,
    height: BOARD_ROWS * TILE_SIZE,
    borderRadius: 12,
    overflow: 'hidden',
    backgroundColor: '#60a56f',
    position: 'relative',
    borderWidth: 2,
    borderColor: '#1d2433',
  },
  tile: {
    position: 'absolute',
    width: TILE_SIZE,
    height: TILE_SIZE,
  },
  divider: {
    backgroundColor: '#f6d365',
    width: TILE_SIZE * 0.2,
    left: BOARD_WIDTH / 2 - TILE_SIZE * 0.1,
  },
  rank: {
    position: 'absolute',
    backgroundColor: 'rgba(240, 102, 49, 0.7)',
    borderColor: '#ff9b57',
    borderWidth: 2,
    borderRadius: 10,
  },
  taxi: {
    position: 'absolute',
    width: 18,
    height: 18,
    backgroundColor: '#ffd447',
    borderWidth: 2,
    borderColor: '#1d2433',
    borderRadius: 4,
  },
  entity: {
    position: 'absolute',
    borderRadius: 4,
  },
  passenger: {
    backgroundColor: '#d9f99d',
    borderColor: '#517b27',
    borderWidth: 1,
    borderRadius: 9,
  },
  traffic: {
    backgroundColor: '#86b6ff',
    borderColor: '#1a4c95',
    borderWidth: 1,
  },
  police: {
    backgroundColor: '#ff7b9c',
    borderColor: '#7d1a3e',
    borderWidth: 1,
  },
  flashArrow: {
    position: 'absolute',
    top: '45%',
    width: 0,
    height: 0,
    borderTopWidth: 14,
    borderBottomWidth: 14,
    borderTopColor: 'transparent',
    borderBottomColor: 'transparent',
    opacity: 0.8,
  },
  leftFlash: {
    left: 18,
    borderRightWidth: 20,
    borderRightColor: '#ffffff',
  },
  rightFlash: {
    right: 18,
    borderLeftWidth: 20,
    borderLeftColor: '#ffffff',
  },
});
