import { Tabs, useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useEffect } from 'react';
import { isOnboardingComplete } from '../../lib/userProfile';

export default function TabsLayout() {
  const router = useRouter();

  useEffect(() => {
    async function check() {
      const done = await isOnboardingComplete();
      if (!done) {
        router.replace('/onboarding');
      }
    }
    check();
  }, []);

  return (
    <Tabs
      screenOptions={{
        tabBarStyle: { backgroundColor: '#0f0f0f', borderTopColor: '#222' },
        tabBarActiveTintColor: '#00C896',
        tabBarInactiveTintColor: '#666',
        headerStyle: { backgroundColor: '#0f0f0f' },
        headerTintColor: '#fff',
      }}
    >
      <Tabs.Screen name="index" options={{ title: 'Home', tabBarIcon: ({ color, size }) => <Ionicons name="home" size={size} color={color} /> }} />
      <Tabs.Screen name="workout" options={{ title: 'Workout', tabBarIcon: ({ color, size }) => <Ionicons name="barbell" size={size} color={color} /> }} />
      <Tabs.Screen name="history" options={{ title: 'History', tabBarIcon: ({ color, size }) => <Ionicons name="time" size={size} color={color} /> }} />
      <Tabs.Screen name="profile" options={{ title: 'Profile', tabBarIcon: ({ color, size }) => <Ionicons name="person" size={size} color={color} /> }} />
    </Tabs>
  );
}