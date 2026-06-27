import { View, Text, ScrollView, StyleSheet, TouchableOpacity, ActivityIndicator } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useState, useEffect, useRef } from 'react';
import { supabase } from '../../lib/supabase';

export default function WorkoutScreen() {
  const { minutes, fitnessLevel, equipment, goal } = useLocalSearchParams();
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [workout, setWorkout] = useState(null);
  const [error, setError] = useState(null);
  const [expandedExercise, setExpandedExercise] = useState(null);
  const [exerciseDetails, setExerciseDetails] = useState({});
  const [loadingDetail, setLoadingDetail] = useState(null);
  const [saving, setSaving] = useState(false);

  // Timer state
  const [timerActive, setTimerActive] = useState(false);
  const [currentExIndex, setCurrentExIndex] = useState(0);
  const [isResting, setIsResting] = useState(false);
  const [timeLeft, setTimeLeft] = useState(0);
  const [workoutComplete, setWorkoutComplete] = useState(false);
  const intervalRef = useRef(null);

  const parseDuration = (str) => {
    if (!str) return 30;
    const match = str.match(/(\d+)/);
    return match ? parseInt(match[1]) : 30;
  };

  useEffect(() => {
    if (timerActive && timeLeft > 0) {
      intervalRef.current = setInterval(() => {
        setTimeLeft(prev => prev - 1);
      }, 1000);
    } else if (timerActive && timeLeft === 0) {
      handleTimerEnd();
    }
    return () => clearInterval(intervalRef.current);
  }, [timerActive, timeLeft]);

  const handleTimerEnd = () => {
    clearInterval(intervalRef.current);
    if (!workout) return;
    if (isResting) {
      const nextIndex = currentExIndex + 1;
      if (nextIndex >= workout.exercises.length) {
        setTimerActive(false);
        setWorkoutComplete(true);
        saveWorkout();
      } else {
        setCurrentExIndex(nextIndex);
        setIsResting(false);
        const ex = workout.exercises[nextIndex];
        setTimeLeft(parseDuration(ex.duration || ex.reps));
      }
    } else {
      const ex = workout.exercises[currentExIndex];
      const restTime = parseDuration(ex.rest);
      setIsResting(true);
      setTimeLeft(restTime);
    }
  };

  const saveWorkout = async () => {
    if (!workout) return;
    setSaving(true);
    try {
      await supabase.from('workouts').insert({
        title: workout.title,
        theme: workout.theme || null,
        duration_minutes: parseInt(minutes) || 10,
        exercises: workout.exercises,
        tip: workout.tip || null,
        fitness_level: fitnessLevel || 'Intermediate',
        equipment: equipment || 'None',
        goal: goal || 'Stay Active',
      });
    } catch (e) {
      console.log('Failed to save workout:', e);
    } finally {
      setSaving(false);
    }
  };

  const startTimer = () => {
    if (!workout) return;
    setCurrentExIndex(0);
    setIsResting(false);
    setWorkoutComplete(false);
    const ex = workout.exercises[0];
    setTimeLeft(parseDuration(ex.duration || ex.reps));
    setTimerActive(true);
  };

  const skipCurrent = () => {
    clearInterval(intervalRef.current);
    handleTimerEnd();
  };

  const stopTimer = () => {
    clearInterval(intervalRef.current);
    setTimerActive(false);
    setIsResting(false);
    setCurrentExIndex(0);
    setWorkoutComplete(false);
  };

  const generateWorkout = async () => {
    setLoading(true);
    setError(null);
    setExerciseDetails({});
    setExpandedExercise(null);
    stopTimer();
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
    setLoadingDetail(ex.name);
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
      setLoadingDetail(null);
    }
  };

  const handleCompleteWorkout = async () => {
    await saveWorkout();
    router.push('/');
  };

  // Timer Screen
  if (timerActive || workoutComplete) {
    if (workoutComplete) {
      return (
        <View style={styles.timerScreen}>
          <Text style={styles.completeEmoji}>🎉</Text>
          <Text style={styles.completeTitle}>Workout Complete!</Text>
          <Text style={styles.completeSub}>You crushed it. Every minute counts.</Text>
          {saving && <ActivityIndicator size="small" color="#00C896" style={{ marginBottom: 16 }} />}
          <TouchableOpacity style={styles.timerBtn} onPress={() => router.push('/')}>
            <Text style={styles.timerBtnText}>Back to Home</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.timerBtnOutline} onPress={() => { setWorkoutComplete(false); generateWorkout(); }}>
            <Text style={styles.timerBtnOutlineText}>Generate Another</Text>
          </TouchableOpacity>
        </View>
      );
    }

    const currentEx = workout.exercises[currentExIndex];
    const progress = ((currentExIndex) / workout.exercises.length) * 100;

    return (
      <View style={styles.timerScreen}>
        <TouchableOpacity style={styles.stopBtn} onPress={stopTimer}>
          <Text style={styles.stopBtnText}>✕ Stop</Text>
        </TouchableOpacity>
        <View style={styles.progressBarContainer}>
          <View style={[styles.progressBar, { width: `${progress}%` }]} />
        </View>
        <Text style={styles.progressText}>{currentExIndex + 1} / {workout.exercises.length}</Text>
        <Text style={styles.timerPhase}>{isResting ? '😮‍💨 Rest' : '💪 Exercise'}</Text>
        <Text style={styles.timerExName}>{isResting ? 'Rest' : currentEx.name}</Text>
        {!isResting && <Text style={styles.timerExMeta}>{currentEx.duration || currentEx.reps}</Text>}
        <View style={styles.timerCircle}>
          <Text style={styles.timerNumber}>{timeLeft}</Text>
          <Text style={styles.timerSec}>sec</Text>
        </View>
        {!isResting && currentExIndex + 1 < workout.exercises.length && (
          <Text style={styles.nextUp}>Next: {workout.exercises[currentExIndex + 1].name}</Text>
        )}
        <TouchableOpacity style={styles.skipBtn} onPress={skipCurrent}>
          <Text style={styles.skipBtnText}>Skip →</Text>
        </TouchableOpacity>
      </View>
    );
  }

  // Main Workout Screen
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
          <TouchableOpacity style={styles.startTimerBtn} onPress={startTimer}>
            <Text style={styles.startTimerText}>▶ Start Workout Timer</Text>
          </TouchableOpacity>

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
                  {loadingDetail === ex.name ? (
                    <View style={styles.loadingBox}><ActivityIndicator size="small" color="#00C896" /></View>
                  ) : (
                    <View>
                      {exerciseDetails[ex.name]?.targetMuscle && (
                        <View style={styles.muscleRow}>
                          <View style={styles.muscleTag}><Text style={styles.muscleTagText}>🎯 {exerciseDetails[ex.name].targetMuscle}</Text></View>
                          {exerciseDetails[ex.name]?.bodyPart && <View style={styles.muscleTag}><Text style={styles.muscleTagText}>💪 {exerciseDetails[ex.name].bodyPart}</Text></View>}
                          {exerciseDetails[ex.name]?.difficulty && <View style={styles.muscleTag}><Text style={styles.muscleTagText}>⚡ {exerciseDetails[ex.name].difficulty}</Text></View>}
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
          <TouchableOpacity style={styles.completeBtn} onPress={handleCompleteWorkout}>
            <Text style={styles.completeBtnText}>{saving ? 'Saving...' : '✅ Complete Workout'}</Text>
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
  workoutTitle: { fontSize: 20, fontWeight: '700', color: '#fff', marginBottom: 16 },
  startTimerBtn: { backgroundColor: '#00C896', borderRadius: 16, padding: 18, alignItems: 'center', marginBottom: 24 },
  startTimerText: { color: '#000', fontWeight: '700', fontSize: 16 },
  exerciseCard: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#1a1a1a', borderRadius: 14, padding: 16, marginBottom: 2, borderWidth: 1, borderColor: '#333', gap: 16 },
  exerciseCardActive: { borderColor: '#00C896', borderBottomLeftRadius: 0, borderBottomRightRadius: 0 },
  exNum: { fontSize: 20, fontWeight: '700', color: '#00C896', width: 28 },
  exInfo: { flex: 1 },
  exName: { fontSize: 16, fontWeight: '600', color: '#fff', marginBottom: 4 },
  exMeta: { fontSize: 13, color: '#666' },
  arrow: { color: '#00C896', fontSize: 12 },
  detailBox: { backgroundColor: '#111', borderWidth: 1, borderTopWidth: 0, borderColor: '#00C896', borderBottomLeftRadius: 14, borderBottomRightRadius: 14, padding: 16, marginBottom: 12 },
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
  timerScreen: { flex: 1, backgroundColor: '#0f0f0f', alignItems: 'center', justifyContent: 'center', padding: 24 },
  stopBtn: { position: 'absolute', top: 60, left: 24 },
  stopBtnText: { color: '#666', fontSize: 16 },
  progressBarContainer: { width: '100%', height: 4, backgroundColor: '#222', borderRadius: 2, marginBottom: 8 },
  progressBar: { height: 4, backgroundColor: '#00C896', borderRadius: 2 },
  progressText: { color: '#666', fontSize: 13, marginBottom: 40 },
  timerPhase: { fontSize: 18, color: '#00C896', fontWeight: '600', marginBottom: 8 },
  timerExName: { fontSize: 28, fontWeight: '700', color: '#fff', textAlign: 'center', marginBottom: 8 },
  timerExMeta: { fontSize: 15, color: '#aaa', marginBottom: 40 },
  timerCircle: { width: 180, height: 180, borderRadius: 90, borderWidth: 4, borderColor: '#00C896', alignItems: 'center', justifyContent: 'center', marginBottom: 40 },
  timerNumber: { fontSize: 64, fontWeight: '700', color: '#fff' },
  timerSec: { fontSize: 16, color: '#666' },
  nextUp: { fontSize: 14, color: '#666', marginBottom: 32 },
  skipBtn: { backgroundColor: '#1a1a1a', borderRadius: 12, paddingHorizontal: 32, paddingVertical: 14, borderWidth: 1, borderColor: '#333' },
  skipBtnText: { color: '#aaa', fontWeight: '600', fontSize: 15 },
  completeEmoji: { fontSize: 64, marginBottom: 16 },
  completeTitle: { fontSize: 32, fontWeight: '700', color: '#fff', marginBottom: 8 },
  completeSub: { fontSize: 16, color: '#aaa', marginBottom: 48, textAlign: 'center' },
  timerBtn: { backgroundColor: '#00C896', borderRadius: 16, padding: 18, alignItems: 'center', width: '100%', marginBottom: 12 },
  timerBtnText: { color: '#000', fontWeight: '700', fontSize: 16 },
  timerBtnOutline: { backgroundColor: '#1a1a1a', borderRadius: 16, padding: 18, alignItems: 'center', width: '100%', borderWidth: 1, borderColor: '#00C896' },
  timerBtnOutlineText: { color: '#00C896', fontWeight: '700', fontSize: 16 },
});