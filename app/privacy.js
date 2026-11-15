import { View, Text, ScrollView, StyleSheet, TouchableOpacity } from 'react-native';
import { useRouter } from 'expo-router';

export default function PrivacyScreen() {
  const router = useRouter();
  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
        <Text style={styles.backText}>← Back</Text>
      </TouchableOpacity>

      <Text style={styles.heading}>Privacy Policy</Text>
      <Text style={styles.updated}>Last updated: November 2026</Text>

      <Text style={styles.sectionTitle}>Overview</Text>
      <Text style={styles.body}>
        PocketCoach is committed to protecting your privacy. This policy explains what information we collect, how we use it, and your rights regarding your data.
      </Text>

      <Text style={styles.sectionTitle}>Your Anonymous Account</Text>
      <Text style={styles.body}>
        PocketCoach creates an anonymous account automatically so your workouts are saved privately to you. You do not need to provide an email address or password. The account is identified only by a random ID.
      </Text>

      <Text style={styles.sectionTitle}>Information We Collect</Text>
      <Text style={styles.body}>
        We collect information you provide during onboarding including your name, fitness level, equipment availability, and fitness goals. We also store your workout history including workout titles, exercises, duration, and completion dates.
      </Text>

      <Text style={styles.sectionTitle}>How We Use Your Information</Text>
      <Text style={styles.body}>
        Your information is used solely to personalize your workout experience. We use your fitness level, equipment, and goals to generate AI-powered workouts tailored to you. Your workout history is used to track your progress and calculate streaks.
      </Text>

      <Text style={styles.sectionTitle}>Data Storage</Text>
      <Text style={styles.body}>
        Your name and profile preferences are stored locally on your device. Your workout history is stored in a secure cloud database (Supabase) and is only accessible to your own anonymous account.
      </Text>

      <Text style={styles.sectionTitle}>Third-Party Services</Text>
      <Text style={styles.body}>
        PocketCoach uses the following third-party services:{'\n\n'}
        • Anthropic Claude API — for AI workout generation. We send your fitness level, equipment, goal, workout length, and the names of your previous exercises. We do not send your name.{'\n'}
        • Supabase — for secure cloud data storage{'\n'}
        • ExerciseDB — for exercise details and instructions. We send only the exercise name.{'\n'}
        • Vercel — for hosting our servers
      </Text>

      <Text style={styles.sectionTitle}>Data Sharing</Text>
      <Text style={styles.body}>
        We do not sell, trade, or share your personal information with third parties for marketing purposes. We do not use advertising or tracking. Your data is only used to provide and improve the PocketCoach service.
      </Text>

      <Text style={styles.sectionTitle}>Data Deletion</Text>
      <Text style={styles.body}>
        You can delete all of your data at any time from Profile → Delete my data. This permanently removes your workout history from our servers and your profile from your device, and it signs you out of your anonymous account.
      </Text>

      <Text style={styles.sectionTitle}>Health Disclaimer</Text>
      <Text style={styles.body}>
        PocketCoach gives general fitness suggestions, not medical advice. Check with your doctor before starting a new exercise program, and stop if you feel pain or dizziness.
      </Text>

      <Text style={styles.sectionTitle}>Contact</Text>
      <Text style={styles.body}>
        If you have any questions about this privacy policy, please contact us at tarikkellmanapps@gmail.com
      </Text>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#0f0f0f' },
  content: { padding: 24, paddingTop: 40, paddingBottom: 60 },
  backBtn: { marginBottom: 24 },
  backText: { color: '#00C896', fontSize: 16 },
  heading: { fontSize: 28, fontWeight: '700', color: '#fff', marginBottom: 8 },
  updated: { fontSize: 13, color: '#666', marginBottom: 32 },
  sectionTitle: { fontSize: 16, fontWeight: '700', color: '#fff', marginBottom: 8, marginTop: 24 },
  body: { fontSize: 14, color: '#aaa', lineHeight: 22 },
});