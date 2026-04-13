import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import React from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { RootStackParamList } from './types';
import { useGame } from '../context/GameContext';

type Props = NativeStackScreenProps<RootStackParamList, 'Home'>;

export const HomeScreen = ({ navigation }: Props) => {
  const { state } = useGame();

  return (
    <View style={styles.container}>
      <Text style={styles.title}>TAXI RUSH</Text>
      <Text style={styles.subtitle}>South African minibus taxi simulator</Text>

      <View style={styles.moneyCard}>
        <Text style={styles.moneyLabel}>Bank</Text>
        <Text style={styles.money}>R {state.money}</Text>
      </View>

      <View style={styles.buttonGroup}>
        <MenuButton label="Play" onPress={() => navigation.navigate('LevelSelect')} />
        <MenuButton label="Shop" onPress={() => navigation.navigate('Shop')} />
        <MenuButton label="Settings" onPress={() => navigation.navigate('Settings')} />
      </View>
    </View>
  );
};

const MenuButton = ({ label, onPress }: { label: string; onPress: () => void }) => (
  <Pressable style={styles.button} onPress={onPress}>
    <Text style={styles.buttonText}>{label}</Text>
  </Pressable>
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
    fontSize: 42,
    fontWeight: '900',
    color: '#ffd447',
    letterSpacing: 2,
  },
  subtitle: {
    color: '#c5cedd',
    marginTop: 8,
    marginBottom: 28,
    textAlign: 'center',
  },
  moneyCard: {
    backgroundColor: '#2b3447',
    borderRadius: 14,
    paddingHorizontal: 24,
    paddingVertical: 12,
    marginBottom: 26,
    borderColor: '#45506a',
    borderWidth: 1,
    alignItems: 'center',
  },
  moneyLabel: {
    color: '#9fb0d4',
    fontWeight: '600',
    fontSize: 14,
  },
  money: {
    color: '#fff3b0',
    fontWeight: '900',
    fontSize: 28,
  },
  buttonGroup: {
    width: '100%',
    gap: 12,
  },
  button: {
    backgroundColor: '#ff8b3d',
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: 'center',
    borderColor: '#ffc56f',
    borderWidth: 2,
  },
  buttonText: {
    color: '#1a1f2f',
    fontWeight: '800',
    fontSize: 18,
  },
});
