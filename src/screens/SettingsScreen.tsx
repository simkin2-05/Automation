import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import React from 'react';
import { Alert, Pressable, StyleSheet, Switch, Text, View } from 'react-native';

import { clearSavedGame, useGame } from '../context/GameContext';
import { RootStackParamList } from './types';

type Props = NativeStackScreenProps<RootStackParamList, 'Settings'>;

export const SettingsScreen = ({ navigation }: Props) => {
  const { state, dispatch } = useGame();

  const onClearData = () => {
    Alert.alert('Clear save data?', 'This will reset money, upgrades, and level progress.', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Clear',
        style: 'destructive',
        onPress: async () => {
          await clearSavedGame();
          dispatch({ type: 'RESET_SAVE' });
        },
      },
    ]);
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Settings</Text>

      <View style={styles.row}>
        <Text style={styles.label}>Mute Music</Text>
        <Switch
          value={state.settings.muteMusic}
          onValueChange={() => dispatch({ type: 'TOGGLE_SETTING', key: 'muteMusic' })}
        />
      </View>

      <View style={styles.row}>
        <Text style={styles.label}>Mute SFX</Text>
        <Switch
          value={state.settings.muteSfx}
          onValueChange={() => dispatch({ type: 'TOGGLE_SETTING', key: 'muteSfx' })}
        />
      </View>

      <Pressable style={styles.clearButton} onPress={onClearData}>
        <Text style={styles.clearText}>Clear Save Data</Text>
      </Pressable>

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
    paddingHorizontal: 20,
    paddingTop: 20,
    gap: 14,
  },
  title: {
    color: '#ffd447',
    fontSize: 28,
    fontWeight: '900',
    textAlign: 'center',
    marginBottom: 8,
  },
  row: {
    backgroundColor: '#2a3348',
    borderRadius: 10,
    borderColor: '#44506d',
    borderWidth: 1,
    paddingHorizontal: 14,
    paddingVertical: 12,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  label: {
    color: '#edf1fa',
    fontWeight: '700',
    fontSize: 16,
  },
  clearButton: {
    marginTop: 8,
    paddingVertical: 12,
    backgroundColor: '#9b2f3d',
    borderRadius: 10,
    alignItems: 'center',
  },
  clearText: {
    color: '#ffe4e8',
    fontWeight: '800',
  },
  backButton: {
    marginTop: 8,
    alignSelf: 'center',
    backgroundColor: '#4a5a7d',
    borderRadius: 10,
    paddingHorizontal: 18,
    paddingVertical: 10,
  },
  backText: {
    color: '#f4f6f8',
    fontWeight: '700',
  },
});
