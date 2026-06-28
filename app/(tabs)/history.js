import { View, Text, ScrollView, StyleSheet, ActivityIndicator } from 'react-native';
import { useState, useEffect } from 'react';
import { supabase } from '../../lib/supabase';

const estimateCalories = (minutes) => Math.round((minutes || 10) * 8.5);

const formatDate = (dateStr) => {
  const date = new Date(dateStr);
  const now = new Date();
  const diff = Math.floor((now - date) / (1000 * 60 * 60 * 24));
  if (diff === 0) return 'Today';
  if (diff === 1) return 'Yesterday';
  return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
};

const isThisWeek = (dateStr) => {
  const date = new Date(dateStr);
  const now = new Date();
  const diff = Math.floor((now - date) / (1000 * 60 * 60 * 24));
  return diff < 7;
};

export default function HistoryScreen() {
  const [workouts, setWorkouts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchHistory();
  }, []);

  const fetchHistory = async () => {
    try {
      const { data, error } = await supabase
        .from('workouts')
        .select('*')
        .order('created_at', { ascending: false });
      if (!error && data) setWorkouts(data);
    } catch (e) {
      console.log('Failed to fetch history:', e);
    } finally {
      setLoading(false);
    }
  };

  const thisWeekWorkouts = workouts.filter(w => isThisWeek(w.created_at));
  const totalMinutes = thisWeekWorkouts.reduce((sum, w) => sum + (w.duration_minutes || 0), 0);
  const totalCalories = thisWeekWorkouts.reduce((sum, w) => sum + estimateCalories(w.duration_minutes), 0);

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <Text style={styles.heading}>Workout History</Text>

      <View style={styles.statsRow}>
        <View style={styles.statCard}>
          <Text style={styles.statNum}>{thisWeekWorkouts.length}</Text>
          <Text style={styles.statLabel}>This Week</Text>
        </View>
        <View style={styles.statCard}>
          <Text style={styles.statNum}>{totalMinutes}</Text>
          <Text style={styles.statLabel}>Minutes</Text>
        </View>
        <View style={styles.statCard}>
          <Text style={styles.statNum}>{totalCalories}</Text>
          <Text style={styles.statLabel}>Calories</Text>
        </View>
      </View>

      {loading ? (
        <View style={styles.loadingBox}>
          <ActivityIndicator size="large" color="#00C896" />
          <Text style={styles.loadingText}>Loading history...</Text>
        </View>
      ) : workouts.length === 0 ? (
        <View style={styles.emptyBox}>
          <Text style={styles.emptyEmoji}>💪</Text>
          <Text style={styles.emptyTitle}>No workouts yet</Text>
          <Text style={styles.emptySub}>Complete your first workout to see it here!</Text>
        </View>
      ) : (
        workouts.map((item) => (
          <View key={item.id} style={styles.workoutCard}>
            <View style={styles.cardLeft}>
              <Text style={styles.workoutTitle}>{item.title}</Text>
              <Text style={styles.workoutMeta}>
                {formatDate(item.created_at)} · {item.duration_minutes} min · {estimateCalories(item.duration_minutes)} cal
              </Text>
              {item.theme && <Text style={styles.workoutTheme}>🎯 {item.theme}</Text>}
            </View>
            <Text style={styles.checkmark}>✅</Text>
          </View>
        ))
      )}
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
  loadingBox: { alignItems: 'center', marginTop: 40, gap: 12 },
  loadingText: { color: '#aaa', fontSize: 15 },
  emptyBox: { alignItems: 'center', marginTop: 60, gap: 12 },
  emptyEmoji: { fontSize: 48 },
  emptyTitle: { fontSize: 20, fontWeight: '700', color: '#fff' },
  emptySub: { fontSize: 14, color: '#666', textAlign: 'center' },
  workoutCard: { backgroundColor: '#1a1a1a', borderRadius: 14, padding: 18, marginBottom: 12, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', borderWidth: 1, borderColor: '#333' },
  cardLeft: { flex: 1 },
  workoutTitle: { fontSize: 16, fontWeight: '600', color: '#fff', marginBottom: 4 },
  workoutMeta: { fontSize: 13, color: '#666' },
  workoutTheme: { fontSize: 12, color: '#00C896', marginTop: 4, textTransform: 'capitalize' },
  checkmark: { fontSize: 20 },
});