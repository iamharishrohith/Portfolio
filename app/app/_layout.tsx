import { DarkTheme, ThemeProvider } from '@react-navigation/native';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import '../global.css';
import 'react-native-reanimated';
import * as eva from '@eva-design/eva';
import { ApplicationProvider, IconRegistry } from '@ui-kitten/components';
import { EvaIconsPack } from '@ui-kitten/eva-icons';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { useEffect } from 'react';
import { validateEnv } from '@/lib/env-check';

import { AuthProvider } from '@/context/auth';
import { ToastProvider } from '@/context/ToastContext';

export const unstable_settings = {
  initialRouteName: 'pin', // Start at PIN screen for authentication
};

export default function RootLayout() {
  useEffect(() => {
    validateEnv();
  }, []);

  return (
    <SafeAreaProvider>
      <AuthProvider>
        <ToastProvider>
          <IconRegistry icons={EvaIconsPack} />
          <ApplicationProvider {...eva} theme={eva.dark}>
            <ThemeProvider value={DarkTheme}>
              <Stack>
                <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
                <Stack.Screen name="pin" options={{ headerShown: false }} />
                <Stack.Screen name="notepad" options={{ presentation: 'modal', headerShown: false }} />
              </Stack>
              <StatusBar style="light" />
            </ThemeProvider>
          </ApplicationProvider>
        </ToastProvider>
      </AuthProvider>
    </SafeAreaProvider>
  );
}

