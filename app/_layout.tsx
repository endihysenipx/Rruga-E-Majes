import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { useEffect } from 'react';
import { I18nextProvider } from 'react-i18next';
import { SafeAreaProvider } from 'react-native-safe-area-context';

import i18n from '@/i18n';
import { useGameStore } from '@/store/useGameStore';
import { colors } from '@/theme/tokens';

function AppNavigator() {
  const bootstrap = useGameStore((state) => state.bootstrap);
  const language = useGameStore((state) => state.profile.language);

  useEffect(() => { void bootstrap(); }, [bootstrap]);
  useEffect(() => { void i18n.changeLanguage(language); }, [language]);

  return (
    <>
      <StatusBar style="light" />
      <Stack screenOptions={{ headerShown: false, contentStyle: { backgroundColor: colors.canvas }, animation: 'fade' }}>
        <Stack.Screen name="index" />
        <Stack.Screen name="onboarding" />
        <Stack.Screen name="(tabs)" />
        <Stack.Screen name="journey/[id]" options={{ animation: 'slide_from_right' }} />
        <Stack.Screen name="achievements" options={{ animation: 'slide_from_right' }} />
      </Stack>
    </>
  );
}

export default function RootLayout() {
  return <SafeAreaProvider><I18nextProvider i18n={i18n}><AppNavigator /></I18nextProvider></SafeAreaProvider>;
}
