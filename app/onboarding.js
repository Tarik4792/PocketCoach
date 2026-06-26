import { View, Text, TextInput, TouchableOpacity, StyleSheet, SafeAreaView } from 'react-native';
import { useState } from 'react';
import { useRouter } from 'expo-router';
import { updateProfile } from '../lib/userProfile';

const STEPS = [
  { id: 'name', title: "What's your name?", subtitle: 'We\'ll personalize your experience' },
  { id: 'fitnessLevel', title: 'Your fitness level?', subtitle: 'Be honest — we\'ll match the intensity' },
  { id: 'equipment', title: 'What equipment do you have?', subtitle: 'We\'ll work with what you\'ve got' },
  { id: 'goal', title: 'What\'s your main goal?', subtitle: 'We\'ll focus your workouts around this' },
];

const OPTIONS = {
  fitnessLevel: ['Beginner', 'Intermediate', 'Advanced'],
  equipment: ['None', 'Dumbbells', 'Resistance Bands', 'Full Gym'],
  goal: ['Lose Weight', 'Build Strength', 'Stay Active'],
};

export default function OnboardingScreen() {
  const router = useRouter();
  const [step, setStep] = useState(0);
  const [name, setName] = useState('');
  const [fitnessLevel, setFitnessLevel] = useState('Intermediate');
  const [equipment, setEquipment] = useState('None');
  const [goal, setGoal] = useState('Stay Active');

  const currentStep = STEPS[step];
  const isLast = step === STEPS.length - 1;

  const getSelected = () => {
    if (currentStep.id === 'fitnessLevel') return fitnessLevel;
    if (currentStep.id === 'equipment') return equipment;
    if (currentStep.id === 'goal') return goal;
    return null;
  };

  const setSelected = (val) => {
    if (currentStep.id === 'fitnessLevel') setFitnessLevel(val);
    if (currentStep.id === 'equipment') setEquipment(val);
    if (currentStep.id === 'goal') setGoal(val);
  };

  const handleNext = async () => {
    if (currentStep.id === 'name' && !name.trim()) return;
    if (isLast) {
      await updateProfile({ name, fitnessLevel, equipment, goal, onboardingComplete: true });
      router.replace('/');
    } else {
      setStep(step + 1);
    }
  };

  const canAdvance = currentStep.id === 'name' ? name.trim().length > 0 : true;

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.progressRow}>
        {STEPS.map((_, i) => (
          <View key={i} style={[styles.progressDot, i <= step && styles.progressDotActive]} />
        ))}
      </View>

      <View style={styles.content}>
        <Text style={styles.title}>{currentStep.title}</Text>
        <Text style={styles.subtitle}>{currentStep.subtitle}</Text>

        {currentStep.id === 'name' ? (
          <TextInput
            style={styles.input}
            placeholder="Your first name"
            placeholderTextColor="#555"
            value={name}
            onChangeText={setName}
            autoFocus
            returnKeyType="next"
            onSubmitEditing={handleNext}
          />
        ) : (
          <View style={styles.optionsContainer}>
            {OPTIONS[currentStep.id].map((option) => (
              <TouchableOpacity
                key={option}
                style={[styles.optionBtn, getSelected() === option && styles.optionActive]}
                onPress={() => setSelected(option)}
              >
                <Text style={[styles.optionText, getSelected() === option && styles.optionTextActive]}>
                  {option}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        )}
      </View>

      <View style={styles.footer}>
        {step > 0 && (
          <TouchableOpacity style={styles.backBtn} onPress={() => setStep(step - 1)}>
            <Text style={styles.backBtnText}>Back</Text>
          </TouchableOpacity>
        )}
        <TouchableOpacity
          style={[styles.nextBtn, !canAdvance && styles.nextBtnDisabled]}
          onPress={handleNext}
          disabled={!canAdvance}
        >
          <Text style={styles.nextBtnText}>{isLast ? 'Get Started 🚀' : 'Next'}</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#0f0f0f' },
  progressRow: { flexDirection: 'row', gap: 8, padding: 24, paddingTop: 16 },
  progressDot: { flex: 1, height: 4, borderRadius: 2, backgroundColor: '#333' },
  progressDotActive: { backgroundColor: '#00C896' },
  content: { flex: 1, padding: 24, paddingTop: 40 },
  title: { fontSize: 28, fontWeight: '700', color: '#fff', marginBottom: 8 },
  subtitle: { fontSize: 16, color: '#aaa', marginBottom: 40 },
  input: { backgroundColor: '#1a1a1a', borderRadius: 16, padding: 18, fontSize: 18, color: '#fff', borderWidth: 1, borderColor: '#333' },
  optionsContainer: { gap: 12 },
  optionBtn: { backgroundColor: '#1a1a1a', borderRadius: 16, padding: 20, borderWidth: 1, borderColor: '#333' },
  optionActive: { backgroundColor: '#00C896', borderColor: '#00C896' },
  optionText: { color: '#aaa', fontSize: 16, fontWeight: '600' },
  optionTextActive: { color: '#000' },
  footer: { flexDirection: 'row', gap: 12, padding: 24 },
  backBtn: { flex: 1, backgroundColor: '#1a1a1a', borderRadius: 16, padding: 18, alignItems: 'center', borderWidth: 1, borderColor: '#333' },
  backBtnText: { color: '#aaa', fontWeight: '700', fontSize: 16 },
  nextBtn: { flex: 2, backgroundColor: '#00C896', borderRadius: 16, padding: 18, alignItems: 'center' },
  nextBtnDisabled: { backgroundColor: '#1a1a1a', borderWidth: 1, borderColor: '#333' },
  nextBtnText: { color: '#000', fontWeight: '700', fontSize: 16 },
});