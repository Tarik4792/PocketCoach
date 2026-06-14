import { View, Text, ScrollView, StyleSheet, TouchableOpacity } from 'react-native';
import { useState } from 'react';
import { getProfile, updateProfile } from '../lib/userProfile';

export default function ProfileScreen() {
  const profile = getProfile();
  const [fitnessLevel, setFitnessLevel] = useState(profile.fitnessLevel);
  const [equipment, setEquipment] = useState(profile.equipment);
  const [goal, setGoal] = useState(profile.goal);
  const [saved, setSaved] = useState(false);

  const handleSave = () => {
    updateProfile({ fitnessLevel, equipment, goal });
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  const Option = ({ label, value, selected, onPress }) => (
    <TouchableOpacity
      style={[styles.optionBtn, selected && styles.optionActive]}
      onPress={onPress}
    >
      <Text style={[styles.optionText, selected && styles.optionTextActive]}>{label}</Text>
    </TouchableOpacity>
  );

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <Text style={styles.heading}>Profile</Text>
      <View style={styles.avatarRow}>
        <View style={styles.avatar}><Text style={styles.avatarText}>T</Text></View>
        <View>
          <Text style={styles.name}>{profile.name}</Text>
          <Text style={styles.sub}>Busy Professional 💼</Text>
        </View>
      </View>

      <Text style={styles.sectionLabel}>Fitness Level</Text>
      <View style={styles.optionRow}>
        {['Beginner', 'Intermediate', 'Advanced'].map((level) => (
          <Option key={level} label={level} value={level} selected={fitnessLevel === level} onPress={() => setFitnessLevel(level)} />
        ))}
      </View>

      <Text style={styles.sectionLabel}>Equipment</Text>
      <View style={styles.optionRow}>
        {['None', 'Dumbbells', 'Resistance Bands', 'Full Gym'].map((eq) => (
          <Option key={eq} label={eq} value={eq} selected={equipment === eq} onPress={() => setEquipment(eq)} />
        ))}
      </View>

      <Text style={styles.sectionLabel}>Goal</Text>
      <View style={styles.optionRow}>
        {['Lose Weight', 'Build Strength', 'Stay Active'].map((g) => (
          <Option key={g} label={g} value={g} selected={goal === g} onPress={() => setGoal(g)} />
        ))}
      </View>

      <TouchableOpacity style={styles.saveBtn} onPress={handleSave}>
        <Text style={styles.saveBtnText}>{saved ? '✅ Saved!' : 'Save Preferences'}</Text>
      </TouchableOpacity>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#0f0f0f' },
  content: { padding: 24, paddingTop: 40 },
  heading: { fontSize: 26, fontWeight: '700', color: '#fff', marginBottom: 24 },
  avatarRow: { flexDirection: 'row', alignItems: 'center', gap: 16, marginBottom: 32 },
  avatar: { width: 60, height: 60, borderRadius: 30, backgroundColor: '#00C896', alignItems: 'center', justifyContent: 'center' },
  avatarText: { fontSize: 24, fontWeight: '700', color: '#000' },
  name: { fontSize: 20, fontWeight: '700', color: '#fff' },
  sub: { fontSize: 14, color: '#aaa' },
  sectionLabel: { fontSize: 13, color: '#666', textTransform: 'uppercase', letterSpacing: 1, marginBottom: 12, marginTop: 8 },
  optionRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 10, marginBottom: 24 },
  optionBtn: { paddingHorizontal: 16, paddingVertical: 10, borderRadius: 20, borderWidth: 1, borderColor: '#333', backgroundColor: '#1a1a1a' },
  optionActive: { backgroundColor: '#00C896', borderColor: '#00C896' },
  optionText: { color: '#aaa', fontSize: 14 },
  optionTextActive: { color: '#000', fontWeight: '600' },
  saveBtn: { backgroundColor: '#00C896', borderRadius: 16, padding: 18, alignItems: 'center', marginTop: 8 },
  saveBtnText: { color: '#000', fontWeight: '700', fontSize: 16 },
});
