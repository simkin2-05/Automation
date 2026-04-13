import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import React from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';

import { useGame } from '../context/GameContext';
import { LEVELS_BY_CITY } from '../data/levels';
import { RootStackParamList } from './types';

type Props = NativeStackScreenProps<RootStackParamList, 'LevelSelect'>;

export const LevelSelectScreen = ({ navigation }: Props) => {
  const { state, dispatch } = useGame();

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.title}>Select Route</Text>
      {LEVELS_BY_CITY.map((group) => (
        <View key={group.city} style={styles.cityBlock}>
          <Text style={styles.city}>{group.city}</Text>
          <View style={styles.levelRow}>
            {group.levels.map((level) => {
              const unlocked = state.unlockedLevelIds.includes(level.id);
              const progress = state.highScores[level.id];
              return (
                <Pressable
                  key={level.id}
                  disabled={!unlocked}
                  onPress={() => {
                    dispatch({ type: 'SET_CURRENT_LEVEL', levelId: level.id });
                    navigation.navigate('Game', { levelId: level.id });
                  }}
                  style={[styles.card, !unlocked && styles.cardLocked]}
                >
                  <Text style={styles.cardTitle}>{level.difficulty}</Text>
                  <Text style={styles.cardSub}>L{level.index}</Text>
                  <Text style={styles.stars}>{'★'.repeat(progress?.stars ?? 0) || '☆'}</Text>
                </Pressable>
              );
            })}
          </View>
        </View>
      ))}
      <Pressable style={styles.backButton} onPress={() => navigation.goBack()}>
        <Text style={styles.backText}>Back</Text>
      </Pressable>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    paddingVertical: 22,
    paddingHorizontal: 14,
    backgroundColor: '#1d2433',
    gap: 14,
  },
  title: {
    color: '#ffd447',
    fontSize: 32,
    fontWeight: '900',
    textAlign: 'center',
  },
  cityBlock: {
    backgroundColor: '#2a3348',
    borderRadius: 14,
    padding: 12,
    borderWidth: 1,
    borderColor: '#44506d',
    gap: 10,
  },
  city: {
    color: '#e3e7f4',
    fontSize: 18,
    fontWeight: '800',
  },
  levelRow: {
    flexDirection: 'row',
    gap: 8,
  },
  card: {
    flex: 1,
    backgroundColor: '#3c4b67',
    borderRadius: 10,
    paddingVertical: 10,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#5a6e93',
  },
  cardLocked: {
    opacity: 0.35,
  },
  cardTitle: {
    color: '#fff3b0',
    fontWeight: '700',
  },
  cardSub: {
    color: '#a9b6cf',
    fontSize: 12,
  },
  stars: {
    color: '#ffd447',
    marginTop: 4,
    fontSize: 14,
  },
  backButton: {
    marginTop: 10,
    alignSelf: 'center',
    paddingHorizontal: 18,
    paddingVertical: 10,
    backgroundColor: '#ff8b3d',
    borderRadius: 10,
  },
  backText: {
    color: '#1b2231',
    fontWeight: '800',
  },
});
