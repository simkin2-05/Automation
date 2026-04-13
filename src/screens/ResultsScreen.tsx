import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import React from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { LEVELS } from '../data/levels';
import { RootStackParamList } from './types';

type Props = NativeStackScreenProps<RootStackParamList, 'Results'>;

export const ResultsScreen = ({ navigation, route }: Props) => {
  const { result } = route.params;
  const level = LEVELS.find((item) => item.id === result.levelId);
  const title = result.won ? 'Route Complete!' : result.reason === 'busted' ? 'BUSTED' : 'TIME UP';
  const subtitle = level ? `${level.city} • ${level.difficulty}` : result.levelId;

  return (
    <View style={styles.container}>
      <Text style={styles.title}>{title}</Text>
      <Text style={styles.subtitle}>{subtitle}</Text>

      <View style={styles.card}>
        <Row label="Delivered" value={`${result.deliveredPassengers}`} />
        <Row label="Time Left" value={`${result.timeRemaining}s`} />
        <Row label="Money" value={`R ${result.moneyEarned}`} />
      </View>

      <View style={styles.buttons}>
        <Pressable
          style={styles.primary}
          onPress={() => navigation.navigate('Game', { levelId: result.levelId })}
        >
          <Text style={styles.primaryText}>Retry</Text>
        </Pressable>

        <Pressable style={styles.secondary} onPress={() => navigation.navigate('LevelSelect')}>
          <Text style={styles.secondaryText}>Next Level / Select</Text>
        </Pressable>

        <Pressable style={styles.secondary} onPress={() => navigation.navigate('Home')}>
          <Text style={styles.secondaryText}>Main Menu</Text>
        </Pressable>
      </View>
    </View>
  );
};

const Row = ({ label, value }: { label: string; value: string }) => (
  <View style={styles.row}>
    <Text style={styles.rowLabel}>{label}</Text>
    <Text style={styles.rowValue}>{value}</Text>
  </View>
);

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#1d2433',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 20,
  },
  title: {
    color: '#ffd447',
    fontSize: 36,
    fontWeight: '900',
  },
  subtitle: {
    color: '#c5cedd',
    marginTop: 6,
    marginBottom: 18,
  },
  card: {
    width: '100%',
    backgroundColor: '#2a3348',
    borderRadius: 14,
    borderColor: '#44506d',
    borderWidth: 1,
    padding: 14,
    gap: 8,
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  rowLabel: {
    color: '#c5cedd',
    fontWeight: '600',
  },
  rowValue: {
    color: '#fff3b0',
    fontWeight: '800',
  },
  buttons: {
    width: '100%',
    gap: 10,
    marginTop: 18,
  },
  primary: {
    backgroundColor: '#ff8b3d',
    borderRadius: 10,
    alignItems: 'center',
    paddingVertical: 12,
  },
  primaryText: {
    color: '#1b2231',
    fontWeight: '900',
  },
  secondary: {
    backgroundColor: '#435174',
    borderRadius: 10,
    alignItems: 'center',
    paddingVertical: 11,
  },
  secondaryText: {
    color: '#edf1fa',
    fontWeight: '700',
  },
});
