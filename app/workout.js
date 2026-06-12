import { View, Text, ScrollView, StyleSheet, TouchableOpacity, ActivityIndicator } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useState } from 'react';

const API_URL = process.env.EXPO_PUBLIC_API_URL || 'http://localhost:3000';

export default function WorkoutScreen() {
  const { minutes, fitnessLevel, equipment, goal } = useLocalSearchParams();
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [workout, setWorkout] = useState(null);
  const [error, setError] = useState(null);

  const generateWorkout = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch(`${API_URL}/api/generate-workout`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          minutes: minutes || 10,
          fitnessLevel: fitnessLevel || 'Intermediate',
          equipment: equipment || 'None',
          goal: goal || 'Stay Active',
        }),
      });
      const data = await response.json();
      if (data.error) throw new Error(data.error);
      setWorkout(data);
    } catch (err) {
      setError('Failed to generate workout. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <Text style={styles.heading}>Your {minutes || 10}-Min Workout</Text>
      <Text style={styles.sub}>AI-generated · No equipment needed</Text>

      {!workout && !loading && (
        <TouchableOpacity style={styles.generateBtn} onPress={generateWorkout}>
          <Text style={styles.generateText}>⚡ Generate My Workout</Text>
        </TouchableOpacity>
      )}

      {error && (
        <View style={styles.errorBox}>
          <Text style={styles.errorText}>{error}</Text>
          <TouchableOpacity style={styles.retryBtn} onPress={generateWorkout}>
            <Text style={styles.retryText}>Try Again</Text>
          </TouchableOpacity>
        </View>
      )}

      {loading && (
        <View style={styles.loadingBox}>
          <ActivityIndicator size="large" color="#00C896" />
          <Text style={styles.loadingText}>Building your workout...</Text>
        </View>
      )}

      {workout && (
        <View>
          <Text style={styles.workoutTitle}>{workout.title}</Text>
          {workout.exercises.map((ex, i) => (
            <View key={i} style={styles.exerciseCard}>
              <Text style={styles.exNum}>{i + 1}</Text>
              <View style={styles.exInfo}>
                <Text style={styles.exName}>{ex.name}</Text>
                <Text style={styles.exMeta}>
                  {ex.duration || ex.reps} · Rest {ex.rest}
                </Text>
              </View>
            </View>
          ))}
          {workout.tip && (
            <View style={styles.tipBox}>
              <Text style={styles.tipText}>💡 {workout.tip}</Text>
            </View>
          )}
          <TouchableOpacity style={styles.completeBtn} onPress={() => router.push('/')}>
            <Text style={styles.completeBtnText}>✅ Complete Workout</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.regenerateBtn} onPress={generateWorkout}>
            <Text style={styles.regenerateText}>⚡ Generate Another</Text>
          </TouchableOpacity>
        </View>
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#0f0f0f' },
  content: { padding: 24, paddingTop: 40 },
  heading: { fontSize: 26, fontWeight: '700', color: '#fff', marginBottom: 6 },
  sub: { fontSize: 14, color: '#666', marginBottom: 32 },
  generateBtn: { backgroundColor: '#00C896', borderRadius: 16, padding: 18, alignItems: 'center' },
  generateText: { color: '#000', fontWeight: '700', fontSize: 16 },
  loadingBox: { alignItems: 'center', marginTop: 60, gap: 16 },
  loadingText: { color: '#aaa', fontSize: 15 },
  errorBox: { alignItems: 'center', marginTop: 40, gap: 16 },
  errorText: { color: '#ff6b6b', fontSize: 15, textAlign: 'center' },
  retryBtn: { backgroundColor: '#1a1a1a', borderRadius: 12, padding: 14, borderWidth: 1, borderColor: '#333' },
  retryText: { color: '#aaa', fontWeight: '600' },
  workoutTitle: { fontSize: 20, fontWeight: '700', color: '#fff', marginBottom: 20 },
  exerciseCard: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#1a1a1a', borderRadius: 14, padding: 16, marginBottom: 12, borderWidth: 1, borderColor: '#333', gap: 16 },
  exNum: { fontSize: 20, fontWeight: '700', color: '#00C896', width: 28 },
  exInfo: { flex: 1 },
  exName: { fontSize: 16, fontWeight: '600', color: '#fff', marginBottom: 4 },
  exMeta: { fontSize: 13, color: '#666' },
  tipBox: { backgroundColor: '#1a2e1a', borderRadius: 14, padding: 16, marginBottom: 16, borderWidth: 1, borderColor: '#00C896' },
  tipText: { color: '#00C896', fontSize: 14, lineHeight: 20 },
  completeBtn: { backgroundColor: '#1a1a1a', borderRadius: 16, padding: 18, alignItems: 'center', marginBottom: 12, borderWidth: 1, borderColor: '#00C896' },
  completeBtnText: { color: '#00C896', fontWeight: '700', fontSize: 16 },
  regenerateBtn: { backgroundColor: '#00C896', borderRadius: 16, padding: 18, alignItems: 'center' },
  regenerateText: { color: '#000', fontWeight: '700', fontSize: 16 },
});
