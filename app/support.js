import { View, Text, ScrollView, StyleSheet, TouchableOpacity, Linking } from 'react-native';
import { useRouter } from 'expo-router';

export default function SupportScreen() {
  const router = useRouter();

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
        <Text style={styles.backText}>← Back</Text>
      </TouchableOpacity>

      <Text style={styles.heading}>Support</Text>
      <Text style={styles.subtitle}>We're here to help</Text>

      <View style={styles.card}>
        <Text style={styles.cardTitle}>📧 Contact Us</Text>
        <Text style={styles.cardBody}>
          Have a question or issue? Send us an email and we'll get back to you within 24 hours.
        </Text>
        <TouchableOpacity
          style={styles.btn}
          onPress={() => Linking.openURL('mailto:support@pocketcoach.app')}
        >
          <Text style={styles.btnText}>Email Support</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.card}>
        <Text style={styles.cardTitle}>❓ Frequently Asked Questions</Text>

        <Text style={styles.faqQ}>How are workouts generated?</Text>
        <Text style={styles.faqA}>
          PocketCoach uses AI (powered by Anthropic Claude) to generate personalized workouts based on your fitness level, available equipment, and goals.
        </Text>

        <Text style={styles.faqQ}>Can I use PocketCoach without equipment?</Text>
        <Text style={styles.faqA}>
          Absolutely! Select "None" for equipment during onboarding and PocketCoach will generate bodyweight-only workouts.
        </Text>

        <Text style={styles.faqQ}>How does streak tracking work?</Text>
        <Text style={styles.faqA}>
          Your streak counts consecutive days where you completed at least one workout. Complete a workout today to keep your streak alive!
        </Text>

        <Text style={styles.faqQ}>How do I change my fitness profile?</Text>
        <Text style={styles.faqA}>
          Go to the Profile tab to update your fitness level, equipment, and goals at any time.
        </Text>

        <Text style={styles.faqQ}>How do I delete my account?</Text>
        <Text style={styles.faqA}>
          You can delete your account and all associated data from the Profile screen. This action is permanent and cannot be undone.
        </Text>
      </View>

      <View style={styles.card}>
        <Text style={styles.cardTitle}>🔒 Privacy</Text>
        <Text style={styles.cardBody}>
          Read our privacy policy to understand how we handle your data.
        </Text>
        <TouchableOpacity style={styles.btnOutline} onPress={() => router.push('/privacy')}>
          <Text style={styles.btnOutlineText}>View Privacy Policy</Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#0f0f0f' },
  content: { padding: 24, paddingTop: 40, paddingBottom: 60 },
  backBtn: { marginBottom: 24 },
  backText: { color: '#00C896', fontSize: 16 },
  heading: { fontSize: 28, fontWeight: '700', color: '#fff', marginBottom: 8 },
  subtitle: { fontSize: 16, color: '#aaa', marginBottom: 32 },
  card: { backgroundColor: '#1a1a1a', borderRadius: 16, padding: 20, marginBottom: 16, borderWidth: 1, borderColor: '#333' },
  cardTitle: { fontSize: 17, fontWeight: '700', color: '#fff', marginBottom: 12 },
  cardBody: { fontSize: 14, color: '#aaa', lineHeight: 22, marginBottom: 16 },
  btn: { backgroundColor: '#00C896', borderRadius: 12, padding: 14, alignItems: 'center' },
  btnText: { color: '#000', fontWeight: '700', fontSize: 15 },
  btnOutline: { borderWidth: 1, borderColor: '#00C896', borderRadius: 12, padding: 14, alignItems: 'center' },
  btnOutlineText: { color: '#00C896', fontWeight: '700', fontSize: 15 },
  faqQ: { fontSize: 14, fontWeight: '700', color: '#fff', marginTop: 16, marginBottom: 6 },
  faqA: { fontSize: 14, color: '#aaa', lineHeight: 22 },
});