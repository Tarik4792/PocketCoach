import AsyncStorage from '@react-native-async-storage/async-storage';

const PROFILE_KEY = 'pocketcoach_profile';

const defaultProfile = {
  name: '',
  fitnessLevel: 'Intermediate',
  equipment: 'None',
  goal: 'Stay Active',
  onboardingComplete: false,
};

export async function getProfile() {
  try {
    const stored = await AsyncStorage.getItem(PROFILE_KEY);
    if (stored) return JSON.parse(stored);
    return defaultProfile;
  } catch (e) {
    return defaultProfile;
  }
}

export async function updateProfile(updates) {
  try {
    const current = await getProfile();
    const updated = { ...current, ...updates };
    await AsyncStorage.setItem(PROFILE_KEY, JSON.stringify(updated));
    return updated;
  } catch (e) {
    console.log('Profile save error:', e);
  }
}

export async function isOnboardingComplete() {
  const profile = await getProfile();
  return profile.onboardingComplete === true;
}