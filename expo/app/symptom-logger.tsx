import { useState } from 'react';
import { StyleSheet, Text, View, TouchableOpacity, TextInput, Platform, Alert } from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { X, ChevronDown, ChevronUp } from 'lucide-react-native';
import * as Haptics from 'expo-haptics';
import Colors from '@/constants/colors';
import { useApp } from '@/contexts/AppContext';
import { Symptom } from '@/types';

const SLIDER_LABELS = {
  bloat: ['None', 'Mild', 'Moderate', 'Uncomfortable', 'Severe', 'Extreme'],
  energy: ['Exhausted', 'Very Low', 'Low', 'Okay', 'Good', 'Great'],
  pain: ['None', 'Mild', 'Moderate', 'Uncomfortable', 'Severe', 'Extreme'],
};

export default function SymptomLoggerScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { addSymptom, meals } = useApp();
  const params = useLocalSearchParams();
  const paramMealId = params.mealId as string;

  const [bloat, setBloat] = useState(0);
  const [energy, setEnergy] = useState(5); // Default to "Great" (inverted - high is good)
  const [pain, setPain] = useState(0);
  const [notes, setNotes] = useState('');
  const [showNotes, setShowNotes] = useState(false);

  const handleSave = async () => {
    try {
      const newSymptom: Symptom = {
        id: Date.now().toString(),
        timestamp: new Date(),
        bloat,
        energy,
        pain,
        associatedMealId: paramMealId || meals[0]?.id,
        notes: notes.trim() || undefined,
      };

      await addSymptom(newSymptom);

      if (Platform.OS !== 'web') {
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      }

      router.back();
    } catch (error) {
      console.error('Error saving symptom:', error);
      Alert.alert("Error", "Failed to save symptom. Please try again.");
    }
  };

  const handleSliderPress = (
    value: number,
    setter: (v: number) => void
  ) => {
    setter(value);
    if (Platform.OS !== 'web') {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }
  };

  const getSliderColor = (value: number, isEnergy: boolean = false) => {
    if (isEnergy) {
      // For energy: higher is better (green), lower is worse (red)
      if (value >= 4) return Colors.success;
      if (value >= 2) return Colors.warning;
      return Colors.danger;
    }
    // For bloat/pain: lower is better (green), higher is worse (red)
    if (value <= 1) return Colors.success;
    if (value <= 3) return Colors.warning;
    return Colors.danger;
  };

  const renderSlider = (
    label: string,
    emoji: string,
    value: number,
    setter: (v: number) => void,
    labels: string[],
    isEnergy: boolean = false
  ) => {
    const color = getSliderColor(value, isEnergy);

    return (
      <View style={styles.sliderSection}>
        <View style={styles.sliderHeader}>
          <Text style={styles.sliderEmoji}>{emoji}</Text>
          <Text style={styles.sliderLabel}>{label}</Text>
          <Text style={[styles.sliderValue, { color }]}>{labels[value]}</Text>
        </View>
        <View style={styles.sliderTrack}>
          {[0, 1, 2, 3, 4, 5].map((v) => (
            <TouchableOpacity
              key={v}
              style={[
                styles.sliderDot,
                v <= value && { backgroundColor: color },
                v === value && styles.sliderDotActive,
              ]}
              onPress={() => handleSliderPress(v, setter)}
            />
          ))}
        </View>
      </View>
    );
  };

  // Check if any symptoms are logged (not all defaults)
  const hasSymptoms = bloat > 0 || pain > 0 || energy < 5;

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <View style={styles.header}>
        <View style={styles.dragHandle} />
        <View style={styles.headerRow}>
          <Text style={styles.headerTitle}>How are you feeling?</Text>
          <TouchableOpacity onPress={() => router.back()} style={styles.closeButton}>
            <X size={24} color={Colors.text} />
          </TouchableOpacity>
        </View>
        <Text style={styles.timeContext}>Just now • Quick log</Text>
      </View>

      <View style={styles.content}>
        {renderSlider('Bloating', '😤', bloat, setBloat, SLIDER_LABELS.bloat)}
        {renderSlider('Energy', '⚡', energy, setEnergy, SLIDER_LABELS.energy, true)}
        {renderSlider('Pain', '😣', pain, setPain, SLIDER_LABELS.pain)}

        <TouchableOpacity
          style={styles.notesToggle}
          onPress={() => setShowNotes(!showNotes)}
          activeOpacity={0.7}
        >
          <Text style={styles.notesToggleText}>Add notes (optional)</Text>
          {showNotes ? (
            <ChevronUp size={20} color={Colors.textSecondary} />
          ) : (
            <ChevronDown size={20} color={Colors.textSecondary} />
          )}
        </TouchableOpacity>

        {showNotes && (
          <TextInput
            style={styles.notesInput}
            placeholder="Any additional notes..."
            placeholderTextColor={Colors.textTertiary}
            value={notes}
            onChangeText={(text) => setNotes(text.slice(0, 150))}
            multiline
            maxLength={150}
          />
        )}
      </View>

      <View style={[styles.footer, { paddingBottom: insets.bottom + 20 }]}>
        <TouchableOpacity
          style={styles.saveButton}
          onPress={handleSave}
          activeOpacity={0.8}
        >
          <Text style={styles.saveButtonText}>
            {hasSymptoms ? 'Save Symptom Log' : 'Feeling Great! 👍'}
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.skipButton}
          onPress={() => router.back()}
          activeOpacity={0.7}
        >
          <Text style={styles.skipButtonText}>Skip</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.backgroundWhite,
  },
  header: {
    paddingHorizontal: 20,
    paddingBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: Colors.borderLight,
  },
  dragHandle: {
    width: 40,
    height: 4,
    backgroundColor: Colors.border,
    borderRadius: 2,
    alignSelf: 'center',
    marginVertical: 12,
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 22,
    fontWeight: '700',
    color: Colors.text,
  },
  closeButton: {
    padding: 4,
  },
  timeContext: {
    fontSize: 13,
    color: Colors.textTertiary,
    marginTop: 4,
  },
  content: {
    flex: 1,
    paddingHorizontal: 20,
    paddingTop: 24,
  },
  sliderSection: {
    marginBottom: 28,
  },
  sliderHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  sliderEmoji: {
    fontSize: 24,
    marginRight: 10,
  },
  sliderLabel: {
    fontSize: 17,
    fontWeight: '600',
    color: Colors.text,
    flex: 1,
  },
  sliderValue: {
    fontSize: 15,
    fontWeight: '500',
  },
  sliderTrack: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    height: 44,
    backgroundColor: Colors.background,
    borderRadius: 22,
    paddingHorizontal: 8,
  },
  sliderDot: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: Colors.border,
  },
  sliderDotActive: {
    transform: [{ scale: 1.15 }],
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 4,
    elevation: 3,
  },
  notesToggle: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    gap: 6,
  },
  notesToggleText: {
    fontSize: 14,
    color: Colors.textSecondary,
  },
  notesInput: {
    backgroundColor: Colors.background,
    borderRadius: 12,
    padding: 14,
    fontSize: 15,
    color: Colors.text,
    minHeight: 80,
    textAlignVertical: 'top',
  },
  footer: {
    paddingHorizontal: 20,
    paddingTop: 16,
    backgroundColor: Colors.backgroundWhite,
    borderTopWidth: 1,
    borderTopColor: Colors.borderLight,
    gap: 10,
  },
  saveButton: {
    backgroundColor: Colors.primary,
    height: 52,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  saveButtonText: {
    fontSize: 17,
    fontWeight: '600',
    color: Colors.white,
  },
  skipButton: {
    height: 44,
    justifyContent: 'center',
    alignItems: 'center',
  },
  skipButtonText: {
    fontSize: 15,
    color: Colors.textSecondary,
    fontWeight: '500',
  },
});
