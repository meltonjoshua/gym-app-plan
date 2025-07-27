import React, { useEffect } from 'react';
import { StatusBar } from 'expo-status-bar';
import { Provider } from 'react-redux';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { store } from './src/store';
import AppNavigation from './src/navigation/AppNavigation';
import { initializeApp } from './src/utils/initialization';

export default function App() {
  useEffect(() => {
    initializeApp();
  }, []);

  return (
    <Provider store={store}>
      <GestureHandlerRootView style={{ flex: 1 }}>
        <SafeAreaProvider>
          <AppNavigation />
          <StatusBar style="auto" />
        </SafeAreaProvider>
      </GestureHandlerRootView>
    </Provider>
  );
}
