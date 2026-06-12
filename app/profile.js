import { View, Text, ScrollView, StyleSheet, TouchableOpacity } from 'react-native';

export default function ProfileScreen() {
  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <Text style={styles.heading}>Profile</Text>
      <View style={styles.avatarRow}>
        <View style={styles.avatar}><Text style={styles.avatarText}>T</Text></View>
        <View>
          <Text style={styles.name}>Tarik</Text>
          <Text style={styles.sub}>Busy Professional 💼</Text>
        </View>
      </View>
      <Text style={styles.sectionLabel}>Fitness Level</Text>
      <View style={styles.optionRow}>
        {['Beginner', 'Intermediate', 'Advanced'].map((level) => (
          <TouchableOpacity key={level} style={[styles.optionBtn, level === 'Intermediate' && styles.optionActive]}>
            <Text style={[styles.optionText, level === 'Intermediate' && styles.optionTextActive]}>{level}</Text>
          </TouchableOpacity>
        ))}
      </View>
      <Text style={styles.sectionLabel}>Equipment</Text>
      <View style={styles.optionRow}>
        {['None', 'Dumbbells', 'Resistance Bands', 'Full Gym'].map((eq) => (
          <TouchableOpacity key={eq} style={[styles.optionBtn, eq === 'None' && styles.optionActive]}>
            <Text style={[styles.optionText, eq === 'None' && styles.optionTextActive]}>{eq}</Text>
          </TouchableOpacity>
        ))}
      </View>
      <Text style={styles.sectionLabel}>Goal</Text>
      <View style={styles.optionRow}>
        {['Lose Weight', 'Build Strength', 'Stay Active'].map((goal) => (
          <TouchableOpacity key={goal} style={[styles.optionBtn, goal === 'Stay Active' && styles.optionActive]}>
            <Text style={[styles.optionText, goal === 'Stay Active' && styles.optionTextActive]}>{goal}</Text>
          </TouchableOpacity>
        ))}
      </View>
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
});
