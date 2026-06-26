import { View, Text, ScrollView, StyleSheet } from 'react-native';

const MOCK_HISTORY = [
  { id: 1, title: 'Upper Body Blast', duration: 10, date: 'Today', calories: 85 },
  { id: 2, title: 'Core & Abs', duration: 15, date: 'Yesterday', calories: 110 },
  { id: 3, title: 'Full Body HIIT', duration: 20, date: 'Jun 10', calories: 180 },
  { id: 4, title: 'Legs & Glutes', duration: 15, date: 'Jun 9', calories: 130 },
];

export default function HistoryScreen() {
  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <Text style={styles.heading}>Workout History</Text>
      <View style={styles.statsRow}>
        <View style={styles.statCard}><Text style={styles.statNum}>4</Text><Text style={styles.statLabel}>This Week</Text></View>
        <View style={styles.statCard}><Text style={styles.statNum}>60</Text><Text style={styles.statLabel}>Minutes</Text></View>
        <View style={styles.statCard}><Text style={styles.statNum}>505</Text><Text style={styles.statLabel}>Calories</Text></View>
      </View>
      {MOCK_HISTORY.map((item) => (
        <View key={item.id} style={styles.workoutCard}>
          <View>
            <Text style={styles.workoutTitle}>{item.title}</Text>
            <Text style={styles.workoutMeta}>{item.date} · {item.duration} min · {item.calories} cal</Text>
          </View>
          <Text style={styles.checkmark}>✅</Text>
        </View>
      ))}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#0f0f0f' },
  content: { padding: 24, paddingTop: 40 },
  heading: { fontSize: 26, fontWeight: '700', color: '#fff', marginBottom: 24 },
  statsRow: { flexDirection: 'row', gap: 12, marginBottom: 24 },
  statCard: { flex: 1, backgroundColor: '#1a1a1a', borderRadius: 14, padding: 16, alignItems: 'center', borderWidth: 1, borderColor: '#333' },
  statNum: { fontSize: 24, fontWeight: '700', color: '#00C896' },
  statLabel: { fontSize: 12, color: '#666', marginTop: 4 },
  workoutCard: { backgroundColor: '#1a1a1a', borderRadius: 14, padding: 18, marginBottom: 12, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', borderWidth: 1, borderColor: '#333' },
  workoutTitle: { fontSize: 16, fontWeight: '600', color: '#fff', marginBottom: 4 },
  workoutMeta: { fontSize: 13, color: '#666' },
  checkmark: { fontSize: 20 },
});
