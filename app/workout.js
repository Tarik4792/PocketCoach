import { View, Text, ScrollView, StyleSheet, TouchableOpacity, ActivityIndicator } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useState } from 'react';

export default function WorkoutScreen() {
  const { minutes, fitnessLevel, equipment, goal } = useLocalSearchParams();
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [workout, setWorkout] = useState(null);
  const [error, setError] = useState(null);
  const [expandedExercise, setExpandedExercise] = useState(null);
  const [exerciseDetails, setExerciseDetails] = useState({});
  const [loadingGif, setLoadingGif] = useState(null);

  const generateWorkout = async () => {
    setLoading(true);
    setError(null);
    setExerciseDetails({});
    setExpandedExercise(null);
    try {
      const previousWorkout = workout ? workout.exercises.map(e => e.name).join(', ') : null;
      const response = await fetch('/api/generate-workout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ minutes: minutes || 10, fitnessLevel: fitnessLevel || 'Intermediate', equipment: equipment || 'None', goal: goal || 'Stay Active', previousWorkout }),
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

  const toggleExercise = async (ex) => {
    if (expandedExercise === ex.name) { setExpandedExercise(null); return; }
    setExpandedExercise(ex.name);
    if (exerciseDetails[ex.name]) return;
    setLoadingGif(ex.name);
    try {
      const response = await fetch('/api/get-exercise', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: ex.name }),
      });
      const data = await response.json();
      setExerciseDetails(prev => ({ ...prev, [ex.name]: data }));
    } catch (err) {
      setExerciseDetails(prev => ({ ...prev, [ex.name]: { found: false } }));
    } finally {
      setLoadingGif(null);
    }
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <Text style={styles.heading}>Your {minutes || 10}-Min Workout</Text>
      {workout?.theme && <Text style={styles.theme}>🎯 {workout.theme}</Text>}
      <Text style={styles.sub}>Tap any exercise to see how it is done</Text>

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
            <View key={i}>
              <TouchableOpacity
                style={[styles.exerciseCard, expandedExercise === ex.name && styles.exerciseCardActive]}
                onPress={() => toggleExercise(ex)}
              >
                <Text style={styles.exNum}>{i + 1}</Text>
                <View style={styles.exInfo}>
                  <Text style={styles.exName}>{ex.name}</Text>
                  <Text style={styles.exMeta}>{ex.duration || ex.reps} · Rest {ex.rest}</Text>
                </View>
                <Text style={styles.arrow}>{expandedExercise === ex.name ? '▲' : '▼'}</Text>
              </TouchableOpacity>

              {expandedExercise === ex.name && (
                <View style={styles.detailBox}>
                  {loadingGif === ex.name ? (
                    <View style={styles.loadingBox}>
                      <ActivityIndicator size="small" color="#00C896" />
                      <Text style={styles.gifLoadingText}>Loading details...</Text>
                    </View>
                  ) : (
                    <View>
                      {exerciseDetails[ex.name]?.targetMuscle && (
                        <View style={styles.muscleRow}>
                          <View style={styles.muscleTag}>
                            <Text style={styles.muscleTagText}>🎯 {exerciseDetails[ex.name].targetMuscle}</Text>
                          </View>
                          {exerciseDetails[ex.name]?.bodyPart && (
                            <View style={styles.muscleTag}>
                              <Text style={styles.muscleTagText}>💪 {exerciseDetails[ex.name].bodyPart}</Text>
                            </View>
                          )}
                          {exerciseDetails[ex.name]?.difficulty && (
                            <View style={styles.muscleTag}>
                              <Text style={styles.muscleTagText}>⚡ {exerciseDetails[ex.name].difficulty}</Text>
                            </View>
                          )}
                        </View>
                      )}
                      {exerciseDetails[ex.name]?.secondaryMuscles?.length > 0 && (
                        <Text style={styles.secondary}>Also works: {exerciseDetails[ex.name].secondaryMuscles.join(', ')}</Text>
                      )}
                      {exerciseDetails[ex.name]?.instructions?.length > 0 ? (
                        <View>
                          <Text style={styles.instructionsTitle}>How to do it:</Text>
                          {exerciseDetails[ex.name].instructions.map((step, j) => (
                            <Text key={j} style={styles.instructionStep}>{j + 1}. {step}</Text>
                          ))}
                        </View>
                      ) : (
                        <Text style={styles.noData}>No details found — search "{ex.name}" on YouTube for a demo.</Text>
                      )}
                    </View>
                  )}
                </View>
              )}
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
  heading: { fontSize: 26, fontWeight: '700', color: '#fff', marginBottom: 4 },
  theme: { fontSize: 13, color: '#00C896', marginBottom: 4, textTransform: 'capitalize' },
  sub: { fontSize: 13, color: '#666', marginBottom: 32 },
  generateBtn: { backgroundColor: '#00C896', borderRadius: 16, padding: 18, alignItems: 'center' },
  generateText: { color: '#000', fontWeight: '700', fontSize: 16 },
  loadingBox: { alignItems: 'center', marginTop: 20, gap: 8 },
  loadingText: { color: '#aaa', fontSize: 15 },
  errorBox: { alignItems: 'center', marginTop: 40, gap: 16 },
  errorText: { color: '#ff6b6b', fontSize: 15, textAlign: 'center' },
  retryBtn: { backgroundColor: '#1a1a1a', borderRadius: 12, padding: 14, borderWidth: 1, borderColor: '#333' },
  retryText: { color: '#aaa', fontWeight: '600' },
  workoutTitle: { fontSize: 20, fontWeight: '700', color: '#fff', marginBottom: 20 },
  exerciseCard: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#1a1a1a', borderRadius: 14, padding: 16, marginBottom: 2, borderWidth: 1, borderColor: '#333', gap: 16 },
  exerciseCardActive: { borderColor: '#00C896', borderBottomLeftRadius: 0, borderBottomRightRadius: 0 },
  exNum: { fontSize: 20, fontWeight: '700', color: '#00C896', width: 28 },
  exInfo: { flex: 1 },
  exName: { fontSize: 16, fontWeight: '600', color: '#fff', marginBottom: 4 },
  exMeta: { fontSize: 13, color: '#666' },
  arrow: { color: '#00C896', fontSize: 12 },
  detailBox: { backgroundColor: '#111', borderWidth: 1, borderTopWidth: 0, borderColor: '#00C896', borderBottomLeftRadius: 14, borderBottomRightRadius: 14, padding: 16, marginBottom: 12 },
  gifLoadingText: { color: '#aaa', fontSize: 13 },
  muscleRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginBottom: 12 },
  muscleTag: { backgroundColor: '#1a2e1a', borderRadius: 20, paddingHorizontal: 12, paddingVertical: 6, borderWidth: 1, borderColor: '#00C896' },
  muscleTagText: { color: '#00C896', fontSize: 12, fontWeight: '600', textTransform: 'capitalize' },
  secondary: { color: '#666', fontSize: 12, marginBottom: 12, textTransform: 'capitalize' },
  instructionsTitle: { fontSize: 15, fontWeight: '600', color: '#fff', marginBottom: 10 },
  instructionStep: { fontSize: 13, color: '#aaa', marginBottom: 8, lineHeight: 20 },
  noData: { color: '#555', fontSize: 13, fontStyle: 'italic' },
  tipBox: { backgroundColor: '#1a2e1a', borderRadius: 14, padding: 16, marginBottom: 16, marginTop: 8, borderWidth: 1, borderColor: '#00C896' },
  tipText: { color: '#00C896', fontSize: 14, lineHeight: 20 },
  completeBtn: { backgroundColor: '#1a1a1a', borderRadius: 16, padding: 18, alignItems: 'center', marginBottom: 12, borderWidth: 1, borderColor: '#00C896' },
  completeBtnText: { color: '#00C896', fontWeight: '700', fontSize: 16 },
  regenerateBtn: { backgroundColor: '#00C896', borderRadius: 16, padding: 18, alignItems: 'center' },
  regenerateText: { color: '#000', fontWeight: '700', fontSize: 16 },
});