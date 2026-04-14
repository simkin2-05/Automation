import React from 'react';
import { StyleSheet, Text, View } from 'react-native';

interface HudProps {
  timeRemaining: number;
  passengerCount: number;
  deliveredCount: number;
  targetPassengers: number;
  capacity: number;
  money: number;
  wanted: boolean;
}

export const Hud = ({
  timeRemaining,
  passengerCount,
  deliveredCount,
  targetPassengers,
  capacity,
  money,
  wanted,
}: HudProps) => {
  const lowTime = timeRemaining <= 10;
  const full = passengerCount >= capacity;

  return (
    <View style={styles.container}>
      <View style={styles.row}>
        <Text style={[styles.timer, lowTime && styles.timerUrgent]}>⏱ {timeRemaining}s</Text>
        <Text style={styles.money}>R {money}</Text>
      </View>
      <View style={styles.row}>
        <Text style={styles.text}>
          👥 Onboard {passengerCount}/{capacity}
        </Text>
        <Text style={[styles.text, full && styles.full]}>{full ? 'FULL' : `Delivered ${deliveredCount}/${targetPassengers}`}</Text>
      </View>
      <Text style={[styles.wanted, wanted ? styles.wantedOn : styles.wantedOff]}>
        {wanted ? 'WANTED' : 'CLEAR'}
      </Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    width: '100%',
    backgroundColor: 'rgba(27, 36, 56, 0.9)',
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 8,
    gap: 4,
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  timer: {
    color: '#f4f6f8',
    fontSize: 18,
    fontWeight: '700',
  },
  timerUrgent: {
    color: '#ff4b4b',
  },
  money: {
    color: '#ffdd57',
    fontSize: 18,
    fontWeight: '800',
  },
  text: {
    color: '#f4f6f8',
    fontSize: 15,
    fontWeight: '600',
  },
  full: {
    color: '#ff8b3d',
  },
  wanted: {
    textAlign: 'center',
    fontWeight: '800',
    letterSpacing: 1,
  },
  wantedOn: {
    color: '#ff4b4b',
  },
  wantedOff: {
    color: '#62d16f',
  },
});
