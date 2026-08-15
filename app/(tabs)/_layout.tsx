import { Feather } from '@expo/vector-icons';
import { Tabs } from 'expo-router';
import { useTranslation } from 'react-i18next';

import { colors } from '@/theme/tokens';

export default function TabLayout() {
  const { t } = useTranslation();
  return (
    <Tabs screenOptions={{
      headerShown: false, tabBarActiveTintColor: colors.goldSoft, tabBarInactiveTintColor: colors.muted,
      tabBarStyle: { backgroundColor: '#0B1C17', borderTopColor: colors.border, height: 82, paddingTop: 9, paddingBottom: 13 },
      tabBarLabelStyle: { fontSize: 11, fontWeight: '600' }, sceneStyle: { backgroundColor: colors.canvas },
    }}>
      <Tabs.Screen name="index" options={{ title: t('tabs.journey'), tabBarIcon: ({ color, size }) => <Feather name="compass" color={color} size={size} /> }} />
      <Tabs.Screen name="explore" options={{ title: t('tabs.explore'), tabBarIcon: ({ color, size }) => <Feather name="map" color={color} size={size} /> }} />
      <Tabs.Screen name="quests" options={{ title: t('tabs.quests'), tabBarIcon: ({ color, size }) => <Feather name="flag" color={color} size={size} /> }} />
      <Tabs.Screen name="profile" options={{ title: t('tabs.profile'), tabBarIcon: ({ color, size }) => <Feather name="user" color={color} size={size} /> }} />
    </Tabs>
  );
}
