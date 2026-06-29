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
      <Text style={styles.updated}>Last updated: June 2026</Text>

      <Text style={styles.sectionTitle}>Overview</Text>
      <Text style={styles.body}>
        PocketCoach is committed to protecting your privacy. This policy explains what information we collect, how we use it, and your rights regarding your data.
      </Text>

      <Text style={styles.sectionTitle}>Information We Collect</Text>
      <Text style={styles.body}>
        We collect information you provide during onboarding including your name, fitness level, equipment availability, and fitness goals. We also store your workout history including workout titles, duration, and completion dates.
      </Text>

      <Text style={styles.sectionTitle}>How We Use Your Information</Text>
      <Text style={styles.body}>
        Your information is used solely to personalize your workout experience. We use your fitness level, equipment, and goals to generate AI-powered workouts tailored to you. Your workout history is used to track your progress and calculate streaks.
      </Text>

      <Text style={styles.sectionTitle}>Data Storage</Text>
      <Text style={styles.body}>
        Your profile preferences are stored locally on your device using secure storage. Your workout history is stored in a secure cloud database (Supabase) to enable history and streak tracking across sessions.
      </Text>

      <Text style={styles.sectionTitle}>Third-Party Services</Text>
      <Text style={styles.body}>
        PocketCoach uses the following third-party services:{'\n\n'}
        • Anthropic Claude API — for AI workout generation{'\n'}
        • Supabase — for secure cloud data storage{'\n'}
        • ExerciseDB — for exercise details and instructions
      </Text>

      <Text style={styles.sectionTitle}>Data Sharing</Text>
      <Text style={styles.body}>
        We do not sell, trade, or share your personal information with third parties for marketing purposes. Your data is only used to provide and improve the PocketCoach service.
      </Text>

      <Text style={styles.sectionTitle}>Data Deletion</Text>
      <Text style={styles.body}>
        You can delete your account and all associated data at any time through the Profile screen. Upon deletion, all your workout history and profile data will be permanently removed from our servers.
      </Text>

      <Text style={styles.sectionTitle}>Contact</Text>
      <Text style={styles.body}>
        If you have any questions about this privacy policy, please contact us at support@pocketcoach.app
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