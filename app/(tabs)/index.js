import { View, Text, TouchableOpacity, StyleSheet, ScrollView } from 'react-native';
import { useRouter } from 'expo-router';
import { getProfile } from '../../lib/userProfile';
import { supabase } from '../../lib/supabase';
import { calculateStreak, getStreakMessage } from '../../lib/streaks';
import { useState, useEffect } from 'react';

const TIME_OPTIONS = [5, 10, 15, 20, 30];

const getGreeting = () => {
  const hour = new Date().getHours();
  if (hour < 12) return 'Good morning 👋';
  if (hour < 17) return 'Good afternoon 👋';
  return 'Good evening 👋';
};

export default function HomeScreen() {
  const router = useRouter();
  const [profile, setProfile] = useState({ fitnessLevel: 'Intermediate', equipment: 'None', goal: 'Stay Active', name: '' });
  const [streak, setStreak] = useState(0);
  const [streakMessage, setStreakMessage] = useState('');

  useEffect(() => {
    getProfile().then(setProfile);
    fetchStreak();
  }, []);

  const fetchStreak = async () => {
    try {
      const { data } = await supabase
        .from('workouts')
        .select('created_at')
        .order('created_at', { ascending: false });
      if (data) {
        const s = calculateStreak(data);
        setStreak(s);
        setStreakMessage(getStreakMessage(s));
      }
    } catch (e) {
      console.log('Streak fetch failed:', e);
    }
  };

  const startWorkout = (minutes) => {
    router.push({
      pathname: '/workout',
      params: {
        minutes,
        fitnessLevel: profile.fitnessLevel,
        equipment: profile.equipment,
        goal: profile.goal,
      }
    });
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <Text style={styles.greeting}>{getGreeting()}{profile.name ? `, ${profile.name}` : ''}</Text>
      <Text style={styles.tagline}>How much time do you have?</Text>

      {streak > 0 && (
        <View style={styles.streakCard}>
          <Text style={styles.streakEmoji}>🔥</Text>
          <View>
            <Text style={styles.streakNum}>{streak} day streak</Text>
            <Text style={styles.streakMsg}>{streakMessage}</Text>
          </View>
        </View>
      )}

      <View style={styles.timeGrid}>
        {TIME_OPTIONS.map((min) => (
          <TouchableOpacity key={min} style={styles.timeCard} onPress={() => startWorkout(min)}>
            <Text style={styles.timeNumber}>{min}</Text>
            <Text style={styles.timeLabel}>min</Text>
          </TouchableOpacity>
        ))}
      </View>

      <View style={styles.profileBadge}>
        <Text style={styles.profileText}>
          🎯 {profile.fitnessLevel} · {profile.equipment} · {profile.goal}
        </Text>
      </View>

      <View style={styles.todayCard}>
        <Text style={styles.todayTitle}>Today's Suggestion</Text>
        <Text style={styles.todayWorkout}>💪 {parseInt(profile.goal === 'Build Strength' ? '15' : '10')}-min {profile.goal === 'Build Strength' ? 'Strength' : profile.goal === 'Lose Weight' ? 'Cardio' : 'Full Body'} Workout</Text>
        <Text style={styles.todaySub}>{profile.equipment === 'None' ? 'No equipment' : profile.equipment} · Tailored to your goal</Text>
        <TouchableOpacity style={styles.startBtn} onPress={() => startWorkout(profile.goal === 'Build Strength' ? 15 : 10)}>
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
  tagline: { fontSize: 16, color: '#aaa', marginBottom: 24 },
  streakCard: { flexDirection: 'row', alignItems: 'center', gap: 14, backgroundColor: '#1a1a1a', borderRadius: 16, padding: 16, marginBottom: 24, borderWidth: 1, borderColor: '#f97316' },
  streakEmoji: { fontSize: 32 },
  streakNum: { fontSize: 18, fontWeight: '700', color: '#f97316' },
  streakMsg: { fontSize: 13, color: '#aaa', marginTop: 2 },
  timeGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 12, marginBottom: 16 },
  timeCard: { backgroundColor: '#1a1a1a', borderRadius: 16, width: '18%', aspectRatio: 1, alignItems: 'center', justifyContent: 'center', borderWidth: 1, borderColor: '#333' },
  timeNumber: { fontSize: 20, fontWeight: '700', color: '#00C896' },
  timeLabel: { fontSize: 11, color: '#666' },
  profileBadge: { backgroundColor: '#1a1a1a', borderRadius: 10, padding: 10, marginBottom: 24, borderWidth: 1, borderColor: '#333' },
  profileText: { color: '#aaa', fontSize: 13, textAlign: 'center' },
  todayCard: { backgroundColor: '#1a1a1a', borderRadius: 20, padding: 24, borderWidth: 1, borderColor: '#333' },
  todayTitle: { fontSize: 13, color: '#666', marginBottom: 8, textTransform: 'uppercase', letterSpacing: 1 },
  todayWorkout: { fontSize: 20, fontWeight: '700', color: '#fff', marginBottom: 6 },
  todaySub: { fontSize: 14, color: '#aaa', marginBottom: 20 },
  startBtn: { backgroundColor: '#00C896', borderRadius: 12, padding: 14, alignItems: 'center' },
  startBtnText: { color: '#000', fontWeight: '700', fontSize: 15 },
});