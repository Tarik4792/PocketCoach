let profileData = {
  fitnessLevel: 'Intermediate',
  equipment: 'None',
  goal: 'Stay Active',
  name: 'Tarik',
};

export function getProfile() {
  return profileData;
}

export function updateProfile(updates) {
  profileData = { ...profileData, ...updates };
}
