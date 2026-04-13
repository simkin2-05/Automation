import { NavigationContainer, DefaultTheme } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { StatusBar } from 'expo-status-bar';
import React from 'react';
import { ActivityIndicator, StyleSheet, Text, View } from 'react-native';
import { SafeAreaProvider } from 'react-native-safe-area-context';

import { GameProvider, useGame } from './src/context/GameContext';
import { GameScreen } from './src/screens/GameScreen';
import { HomeScreen } from './src/screens/HomeScreen';
import { LevelSelectScreen } from './src/screens/LevelSelectScreen';
import { ResultsScreen } from './src/screens/ResultsScreen';
import { SettingsScreen } from './src/screens/SettingsScreen';
import { ShopScreen } from './src/screens/ShopScreen';
import { RootStackParamList } from './src/screens/types';

const Stack = createNativeStackNavigator<RootStackParamList>();

const navTheme = {
  ...DefaultTheme,
  colors: {
    ...DefaultTheme.colors,
    background: '#1d2433',
  },
};

const AppNavigator = () => {
  const { hydrated } = useGame();

  if (!hydrated) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#ffd447" />
        <Text style={styles.loadingText}>Loading Taxi Rush...</Text>
      </View>
    );
  }

  return (
    <NavigationContainer theme={navTheme}>
      <StatusBar style="light" />
      <Stack.Navigator
        initialRouteName="Home"
        screenOptions={{
          headerStyle: { backgroundColor: '#121826' },
          headerTintColor: '#f3f6ff',
          headerTitleStyle: { fontWeight: '800' },
          contentStyle: { backgroundColor: '#1d2433' },
        }}
      >
        <Stack.Screen name="Home" component={HomeScreen} options={{ headerShown: false }} />
        <Stack.Screen name="LevelSelect" component={LevelSelectScreen} options={{ title: 'Level Select' }} />
        <Stack.Screen name="Game" component={GameScreen} options={{ title: 'Taxi Rush' }} />
        <Stack.Screen name="Results" component={ResultsScreen} options={{ title: 'Results', gestureEnabled: false }} />
        <Stack.Screen name="Shop" component={ShopScreen} options={{ title: 'Shop' }} />
        <Stack.Screen name="Settings" component={SettingsScreen} options={{ title: 'Settings' }} />
      </Stack.Navigator>
    </NavigationContainer>
  );
};

export default function App() {
  return (
    <SafeAreaProvider>
      <GameProvider>
        <AppNavigator />
      </GameProvider>
    </SafeAreaProvider>
  );
}

const styles = StyleSheet.create({
  loadingContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#1d2433',
    gap: 12,
  },
  loadingText: {
    color: '#f2f6ff',
    fontWeight: '700',
  },
});
