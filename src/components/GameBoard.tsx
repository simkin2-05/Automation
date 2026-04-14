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
  busStops: Array<{ x: number; y: number; width: number; height: number }>;
  trees: Array<{ x: number; y: number; size: number }>;
  flashDirection: 'left' | 'right' | null;
}

const taxiRotation = (direction: Direction) => `${direction}deg`;

const PassengerSprite = () => (
  <View style={styles.passengerSprite}>
    <View style={styles.passengerHat} />
    <View style={styles.passengerHead} />
    <View style={styles.passengerBody} />
    <View style={styles.passengerLegs}>
      <View style={styles.passengerLeg} />
      <View style={styles.passengerLeg} />
    </View>
  </View>
);

const TaxiSprite = ({ color = '#39a953' }: { color?: string }) => (
  <View style={[styles.taxiSprite, { backgroundColor: color }]}>
    <View style={styles.taxiRoof} />
    <View style={styles.taxiWindowsRow}>
      <View style={styles.taxiWindowLarge} />
      <View style={styles.taxiWindow} />
      <View style={styles.taxiWindow} />
    </View>
    <View style={styles.taxiBumper} />
    <View style={[styles.taxiWheel, styles.taxiWheelFront]} />
    <View style={[styles.taxiWheel, styles.taxiWheelRear]} />
  </View>
);

const PoliceSprite = () => (
  <View style={styles.policeSprite}>
    <View style={styles.policeCabin} />
    <View style={styles.policeStripeBlue} />
    <View style={styles.policeStripeGold} />
    <View style={styles.policeLightBar} />
    <View style={[styles.taxiWheel, styles.taxiWheelFront]} />
    <View style={[styles.taxiWheel, styles.taxiWheelRear]} />
  </View>
);

const TreeSprite = ({ size }: { size: number }) => (
  <View style={[styles.treeWrapper, { width: size, height: size + 6 }]}>
    <View style={[styles.treeCanopy, { width: size, height: size }]} />
    <View style={[styles.treeTrunk, { top: size - 2 }]} />
  </View>
);

export const GameBoard = ({ taxi, entities, rankZone, busStops, trees, flashDirection }: Props) => {
  const tiles = React.useMemo(
    () =>
      Array.from({ length: BOARD_ROWS }).flatMap((_, row) =>
        Array.from({ length: BOARD_COLS }).map((__, col) => {
          const index = `${row}-${col}`;
          const isRoad = true;
          const isCenterDivider = col === Math.floor(BOARD_COLS / 2) && row % 2 === 0;
          const isShoulder = col <= 1 || col >= BOARD_COLS - 2;
          return (
            <View
              key={index}
              style={[
                styles.tile,
                {
                  left: col * TILE_SIZE,
                  top: row * TILE_SIZE,
                  backgroundColor: isRoad ? '#444f5d' : '#444f5d',
                },
                isShoulder && styles.roadShoulder,
                isCenterDivider && styles.divider,
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
      {trees.map((tree, index) => (
        <View
          key={`tree-${index}`}
          style={[
            styles.tree,
            {
              left: tree.x - tree.size / 2,
              top: tree.y - tree.size / 2,
            },
          ]}
        >
          <TreeSprite size={tree.size} />
        </View>
      ))}

      {busStops.map((stop, index) => (
        <View
          key={`stop-${index}`}
          style={[
            styles.busStop,
            {
              left: stop.x - stop.width / 2,
              top: stop.y - stop.height / 2,
              width: stop.width,
              height: stop.height,
            },
          ]}
        >
          <View style={styles.busStopSignPost} />
          <View style={styles.busStopSignBoard} />
        </View>
      ))}

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
            {
              left: entity.x - entity.width / 2,
              top: entity.y - entity.height / 2,
              width: entity.width,
              height: entity.height,
              transform: [{ rotate: `${entity.direction ?? 0}deg` }],
            },
          ]}
        >
          {entity.kind === 'passenger' ? <PassengerSprite /> : null}
          {entity.kind === 'traffic' ? (
            <TaxiSprite
              color={
                entity.trafficColor === 'yellow'
                  ? '#facc15'
                  : entity.trafficColor === 'red'
                    ? '#ef4444'
                    : '#8b5cf6'
              }
            />
          ) : null}
          {entity.kind === 'police' ? <PoliceSprite /> : null}
        </View>
      ))}

      <View
        style={[
          styles.taxi,
          {
            left: taxi.x - 14,
            top: taxi.y - 8,
            transform: [{ rotate: taxiRotation(taxi.direction) }],
          },
        ]}
      >
        <TaxiSprite />
      </View>

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
    backgroundColor: '#444f5d',
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
    width: TILE_SIZE * 0.25,
    left: BOARD_WIDTH / 2 - TILE_SIZE * 0.12,
    borderRadius: 2,
    height: TILE_SIZE * 0.5,
    top: TILE_SIZE * 0.25,
  },
  roadShoulder: {
    backgroundColor: '#697b67',
  },
  tree: {
    position: 'absolute',
    zIndex: 1,
  },
  treeWrapper: {
    alignItems: 'center',
  },
  treeCanopy: {
    borderRadius: 999,
    backgroundColor: '#2f8f46',
    borderWidth: 1,
    borderColor: '#1f5b2f',
  },
  treeTrunk: {
    position: 'absolute',
    width: 5,
    height: 8,
    borderRadius: 2,
    backgroundColor: '#70462a',
  },
  busStop: {
    position: 'absolute',
    borderRadius: 4,
    borderWidth: 1,
    borderColor: '#f8e16c',
    backgroundColor: '#cfb53b',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 1,
  },
  busStopSignPost: {
    position: 'absolute',
    right: 2,
    width: 2,
    height: '75%',
    backgroundColor: '#5a5d62',
  },
  busStopSignBoard: {
    position: 'absolute',
    right: 0,
    top: 1,
    width: 6,
    height: 5,
    borderRadius: 1,
    backgroundColor: '#f59e0b',
    borderWidth: 1,
    borderColor: '#d97706',
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
    width: 28,
    height: 16,
  },
  entity: {
    position: 'absolute',
    justifyContent: 'center',
    alignItems: 'center',
  },
  passengerSprite: {
    width: '100%',
    height: '100%',
    alignItems: 'center',
    justifyContent: 'flex-end',
    position: 'relative',
  },
  passengerHat: {
    position: 'absolute',
    top: 0,
    width: 8,
    height: 2,
    borderRadius: 2,
    backgroundColor: '#d62828',
  },
  passengerHead: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#f0d2b6',
    marginBottom: 1,
  },
  passengerBody: {
    width: 10,
    height: 7,
    borderRadius: 2,
    backgroundColor: '#31a05f',
    marginBottom: 1,
  },
  passengerLegs: {
    width: 8,
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  passengerLeg: {
    width: 3,
    height: 3,
    borderRadius: 1,
    backgroundColor: '#2d6cdf',
  },
  taxiSprite: {
    width: '100%',
    height: '100%',
    borderRadius: 6,
    borderWidth: 1.5,
    borderColor: '#233127',
    backgroundColor: '#39a953',
    justifyContent: 'center',
    alignItems: 'center',
    position: 'relative',
    overflow: 'visible',
  },
  taxiRoof: {
    position: 'absolute',
    top: 1,
    width: '72%',
    height: 4,
    borderRadius: 3,
    backgroundColor: '#4fc06b',
  },
  taxiWindowsRow: {
    flexDirection: 'row',
    gap: 1,
  },
  taxiWindowLarge: {
    width: 8,
    height: 4,
    borderRadius: 1,
    backgroundColor: '#2f5f7a',
  },
  taxiWindow: {
    width: 5,
    height: 4,
    borderRadius: 1,
    backgroundColor: '#2a5168',
  },
  taxiBumper: {
    position: 'absolute',
    bottom: 1,
    width: '92%',
    height: 3,
    borderRadius: 2,
    backgroundColor: '#2d3436',
  },
  taxiWheel: {
    position: 'absolute',
    width: 4,
    height: 4,
    borderRadius: 2,
    backgroundColor: '#1b1b1b',
  },
  taxiWheelFront: {
    right: -1,
    bottom: 2,
  },
  taxiWheelRear: {
    left: -1,
    bottom: 2,
  },
  policeSprite: {
    width: '100%',
    height: '100%',
    borderRadius: 6,
    borderWidth: 1.2,
    borderColor: '#4f5c70',
    backgroundColor: '#f4f7fc',
    justifyContent: 'center',
    alignItems: 'center',
    position: 'relative',
    overflow: 'visible',
  },
  policeCabin: {
    position: 'absolute',
    top: 1,
    width: '65%',
    height: 4,
    borderRadius: 2,
    backgroundColor: '#b9c4d9',
  },
  policeStripeBlue: {
    width: '88%',
    height: 2,
    backgroundColor: '#2458a7',
    borderRadius: 2,
  },
  policeStripeGold: {
    width: '88%',
    height: 1,
    marginTop: 1,
    backgroundColor: '#f0b429',
    borderRadius: 2,
  },
  policeLightBar: {
    position: 'absolute',
    top: 0,
    width: 7,
    height: 2,
    borderRadius: 2,
    backgroundColor: '#4e73df',
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
