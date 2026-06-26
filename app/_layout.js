import { Slot } from 'expo-router';
import { useEffect, useState } from 'react';
import { isOnboardingComplete } from '../lib/userProfile';
import { View } from 'react-native';

export default function RootLayout() {
  const [checking, setChecking] = useState(true);
  const [needsOnboarding, setNeedsOnboarding] = useState(false);

  useEffect(() => {
    async function check() {
      const done = await isOnboardingComplete();
      setNeedsOnboarding(!done);
      setChecking(false);
    }
    check();
  }, []);

  if (checking) return <View style={{ flex: 1, backgroundColor: '#0f0f0f' }} />;

  return <Slot />;
}