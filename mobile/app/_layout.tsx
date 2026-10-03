import React from 'react';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { AuthProvider } from '../src/context/AuthContext';
import { TestProvider } from '../src/context/TestContext';

export default function RootLayout() {
  return (
    <SafeAreaProvider>
      <AuthProvider>
        <TestProvider>
          <StatusBar style="dark" />
          <Stack
            screenOptions={{
              headerShown: false,
              contentStyle: { backgroundColor: '#F8FAFC' },
            }}
          >
            <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
            <Stack.Screen
              name="(auth)/login"
              options={{
                presentation: 'modal',
                headerShown: false,
              }}
            />
            <Stack.Screen
              name="result"
              options={{
                title: 'Test Result',
                headerShown: false,
              }}
            />
            <Stack.Screen
              name="override"
              options={{
                title: 'Manual Pad Override',
                headerShown: false,
              }}
            />
          </Stack>
        </TestProvider>
      </AuthProvider>
    </SafeAreaProvider>
  );
}
