import React, { useContext } from 'react';
import { StatusBar } from 'expo-status-bar';
import { NavigationContainer } from '@react-navigation/native';
import { ProgressProvider, ProgressContext } from './src/context/ProgressContext';
import { AudioProvider } from './src/context/AudioContext';
import AppNavigator from './src/navigation/AppNavigator';

function MainAppContent() {
  const { themeMode } = useContext(ProgressContext);

  return (
    <>
      <StatusBar style={themeMode === 'dark' ? 'light' : 'dark'} />
      <NavigationContainer>
        <AppNavigator />
      </NavigationContainer>
    </>
  );
}

export default function App() {
  return (
    <ProgressProvider>
      <AudioProvider>
        <MainAppContent />
      </AudioProvider>
    </ProgressProvider>
  );
}
