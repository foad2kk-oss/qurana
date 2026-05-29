import React, { useContext } from 'react';
import { StatusBar } from 'expo-status-bar';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { ProgressProvider, ProgressContext } from './src/context/ProgressContext';
import { AudioProvider } from './src/context/AudioContext';
import AppNavigator from './src/navigation/AppNavigator';
import TafsirScreen from './src/screens/TafsirScreen';

const Stack = createNativeStackNavigator();

function MainAppContent() {
  const { themeMode } = useContext(ProgressContext);

  return (
    <>
      <StatusBar style={themeMode === 'dark' ? 'light' : 'dark'} />
      <NavigationContainer>
        <Stack.Navigator screenOptions={{ headerShown: false }}>
          <Stack.Screen name="Tabs" component={AppNavigator} />
          <Stack.Screen
            name="Tafsir"
            component={TafsirScreen}
            options={{ animation: 'slide_from_bottom' }}
          />
        </Stack.Navigator>
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
