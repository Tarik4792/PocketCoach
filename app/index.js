import { View, Text, TouchableOpacity, StyleSheet, ScrollView } from 'react-native';
import { useRouter } from 'expo-router';

const TIME_OPTIONS = [5, 10, 15, 20, 30];

export default function HomeScreen() {
  const router = useRouter();
  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <Text style={styles.greeting}>Good morning 👋</Text>
      <Text style={styles.tagline}>How much time do you have?</Text>
      <View style={styles.timeGrid}>
        {TIME_OPTIONS.map((min) => (
          <TouchableOpacity key={min} style={styles.timeCard} onPress={() => router.push({ pathname: '/workout', params: { minutes: min } })}>
            <Text style={styles.timeNumber}>{min}</Text>
            <Text style={styles.timeLabel}>min</Text>
          </TouchableOpacity>
        ))}
      </View>
      <View style={styles.todayCard}>
        <Text style={styles.todayTitle}>Today's Suggestion</Text>
        <Text style={styles.todayWorkout}>💪 10-min Upper Body Blast</Text>
        <Text style={styles.todaySub}>No equipment · Perfect for a lunch break</Text>
        <TouchableOpacity style={styles.startBtn} onPress={() => router.push({ pathname: '/workout', params: { minutes: 10 } })}>
          <Text style={styles.startBtnText}>Start Now</Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#0f0f0f' },
  content: { padding: 24, paddingTop: 40 },
  greeting: { fontSize: 28, fontWeight: '700', color: '#fff', marginBottom: 8 },
  tagline: { fontSize: 16, color: '#aaa', marginBottom: 32 },
  timeGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 12, marginBottom: 32 },
  timeCard: { backgroundColor: '#1a1a1a', borderRadius: 16, width: '18%', aspectRatio: 1, alignItems: 'center', justifyContent: 'center', borderWidth: 1, borderColor: '#333' },
  timeNumber: { fontSize: 20, fontWeight: '700', color: '#00C896' },
  timeLabel: { fontSize: 11, color: '#666' },
  todayCard: { backgroundColor: '#1a1a1a', borderRadius: 20, padding: 24, borderWidth: 1, borderColor: '#333' },
  todayTitle: { fontSize: 13, color: '#666', marginBottom: 8, textTransform: 'uppercase', letterSpacing: 1 },
  todayWorkout: { fontSize: 20, fontWeight: '700', color: '#fff', marginBottom: 6 },
  todaySub: { fontSize: 14, color: '#aaa', marginBottom: 20 },
  startBtn: { backgroundColor: '#00C896', borderRadius: 12, padding: 14, alignItems: 'center' },
  startBtnText: { color: '#000', fontWeight: '700', fontSize: 15 },
});
