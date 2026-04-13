import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import React from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { useGame } from '../context/GameContext';
import { UPGRADE_DEFINITIONS } from '../data/upgrades';
import { RootStackParamList } from './types';

type Props = NativeStackScreenProps<RootStackParamList, 'Shop'>;

export const ShopScreen = ({ navigation }: Props) => {
  const { state, dispatch } = useGame();

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Taxi Upgrade Shop</Text>
      <Text style={styles.wallet}>Wallet: R {state.money}</Text>

      <View style={styles.list}>
        {UPGRADE_DEFINITIONS.map((upgrade) => {
          const tier = state.upgrades[upgrade.key];
          const maxed = tier >= 3;
          const nextCost = maxed ? null : upgrade.costs[tier];
          const canAfford = nextCost !== null && state.money >= nextCost;

          return (
            <View key={upgrade.key} style={styles.card}>
              <Text style={styles.cardTitle}>{upgrade.label}</Text>
              <Text style={styles.cardDesc}>{upgrade.description}</Text>
              <Text style={styles.level}>Tier {tier}/3</Text>
              <Pressable
                disabled={maxed || !canAfford}
                onPress={() => dispatch({ type: 'BUY_UPGRADE', key: upgrade.key })}
                style={[styles.buyButton, (maxed || !canAfford) && styles.buyDisabled]}
              >
                <Text style={styles.buyText}>{maxed ? 'MAXED' : `Buy R ${nextCost}`}</Text>
              </Pressable>
            </View>
          );
        })}
      </View>

      <Pressable style={styles.backButton} onPress={() => navigation.goBack()}>
        <Text style={styles.backText}>Back</Text>
      </Pressable>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#1d2433',
    paddingHorizontal: 16,
    paddingTop: 20,
    paddingBottom: 28,
  },
  title: {
    color: '#ffd447',
    fontSize: 29,
    fontWeight: '900',
    textAlign: 'center',
  },
  wallet: {
    color: '#f4f6f8',
    textAlign: 'center',
    fontWeight: '700',
    marginTop: 8,
    marginBottom: 14,
  },
  list: {
    gap: 10,
  },
  card: {
    backgroundColor: '#2a3348',
    borderColor: '#44506d',
    borderWidth: 1,
    borderRadius: 12,
    padding: 12,
    gap: 6,
  },
  cardTitle: {
    color: '#fff3b0',
    fontSize: 18,
    fontWeight: '800',
  },
  cardDesc: {
    color: '#c4cde0',
    fontSize: 13,
  },
  level: {
    color: '#96e6a1',
    fontWeight: '700',
  },
  buyButton: {
    backgroundColor: '#ff8b3d',
    paddingVertical: 8,
    borderRadius: 9,
    alignItems: 'center',
  },
  buyDisabled: {
    opacity: 0.4,
  },
  buyText: {
    color: '#1c2232',
    fontWeight: '900',
  },
  backButton: {
    marginTop: 16,
    alignSelf: 'center',
    backgroundColor: '#4a5a7d',
    paddingHorizontal: 18,
    paddingVertical: 10,
    borderRadius: 10,
  },
  backText: {
    color: '#f4f6f8',
    fontWeight: '700',
  },
});
