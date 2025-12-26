import { useState } from 'react';
import { StyleSheet, Text, View, ScrollView, TouchableOpacity, TextInput, Platform, Alert } from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { X, Check } from 'lucide-react-native';
import * as Haptics from 'expo-haptics';
import Colors from '@/constants/colors';
import { useApp } from '@/contexts/AppContext';
import { symptomTypes } from '@/mocks/data';
import { Symptom } from '@/types';

export default function SymptomLoggerScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { addSymptom, meals } = useApp();
  const params = useLocalSearchParams();
  const paramMealId = params.mealId as string;

  const [selectedSymptoms, setSelectedSymptoms] = useState<string[]>([]);
  const [intensity, setIntensity] = useState(5);
  const [mealAssociation, setMealAssociation] = useState<'just_after' | '2_3_hours' | 'other'>('just_after');
  const [notes, setNotes] = useState('');

  const toggleSymptom = (symptom: string) => {
    if (Platform.OS !== 'web') {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }

    if (selectedSymptoms.includes(symptom)) {
      setSelectedSymptoms(selectedSymptoms.filter(s => s !== symptom));
    } else {
      setSelectedSymptoms([...selectedSymptoms, symptom]);
    }
  };

  const handleSave = async () => {
    if (selectedSymptoms.length === 0) return;

    try {
      const newSymptom: Symptom = {
        id: Date.now().toString(),
        timestamp: new Date(),
        types: selectedSymptoms,
        intensity,
        mealAssociation,
        associatedMealId: paramMealId || meals[0]?.id,
        notes,
      };

      await addSymptom(newSymptom);

      if (Platform.OS !== 'web') {
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      }

      Alert.alert(
        "Symptom Logged",
        "We've added this to your health log. We'll analyze it for patterns.",
        [{ text: "OK", onPress: () => router.back() }]
      );
    } catch (error) {
      console.error('Error saving symptom:', error);
      Alert.alert("Error", "Failed to save symptom. Please try again.");
    }
  };

  const getIntensityColor = () => {
    if (intensity <= 3) return Colors.success;
    if (intensity <= 6) return Colors.warning;
    return Colors.danger;
  };

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <View style={styles.header}>
        <View style={styles.dragHandle} />
        <View style={styles.headerRow}>
          <Text style={styles.headerTitle}>Log Symptoms</Text>
          <TouchableOpacity onPress={() => router.back()} style={styles.closeButton}>
            <X size={24} color={Colors.text} />
          </TouchableOpacity>
        </View>
        <Text style={styles.timeContext}>Just now</Text>
      </View>

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={[styles.scrollContent, { paddingBottom: insets.bottom + 120 }]}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>What are you experiencing?</Text>
          <View style={styles.symptomsList}>
            {symptomTypes.map((symptom) => {
              const isSelected = selectedSymptoms.includes(symptom);
              return (
                <TouchableOpacity
                  key={symptom}
                  style={[styles.symptomItem, isSelected && styles.symptomItemSelected]}
                  onPress={() => toggleSymptom(symptom)}
                  activeOpacity={0.7}
                >
                  <View style={[styles.checkbox, isSelected && styles.checkboxSelected]}>
                    {isSelected && <Check size={14} color={Colors.white} />}
                  </View>
                  <Text style={[styles.symptomText, isSelected && styles.symptomTextSelected]}>
                    {symptom}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>
            How intense? <Text style={styles.intensityValue}>{intensity}</Text>/10
          </Text>
          <View style={styles.sliderContainer}>
            <Text style={styles.sliderLabel}>Mild</Text>
            <View style={styles.sliderTrack}>
              {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((value) => (
                <TouchableOpacity
                  key={value}
                  style={[
                    styles.sliderDot,
                    value <= intensity && { backgroundColor: getIntensityColor() },
                  ]}
                  onPress={() => {
                    setIntensity(value);
                    if (Platform.OS !== 'web') {
                      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                    }
                  }}
                />
              ))}
            </View>
            <Text style={styles.sliderLabel}>Severe</Text>
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Associate with last meal?</Text>
          <View style={styles.associationOptions}>
            {[
              { id: 'just_after' as const, label: 'Just after meal' },
              { id: '2_3_hours' as const, label: '2-3 hours later' },
              { id: 'other' as const, label: 'Other time' },
            ].map((option) => (
              <TouchableOpacity
                key={option.id}
                style={[
                  styles.associationOption,
                  mealAssociation === option.id && styles.associationOptionSelected,
                ]}
                onPress={() => setMealAssociation(option.id)}
                activeOpacity={0.7}
              >
                <View style={[
                  styles.radio,
                  mealAssociation === option.id && styles.radioSelected,
                ]}>
                  {mealAssociation === option.id && <View style={styles.radioInner} />}
                </View>
                <Text style={[
                  styles.associationText,
                  mealAssociation === option.id && styles.associationTextSelected,
                ]}>
                  {option.label}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        <View style={styles.section}>
          <View style={styles.notesHeader}>
            <Text style={styles.sectionTitle}>Any additional notes?</Text>
            <Text style={styles.charCount}>{notes.length}/150</Text>
          </View>
          <TextInput
            style={styles.notesInput}
            placeholder="Optional notes about your symptoms..."
            placeholderTextColor={Colors.textTertiary}
            value={notes}
            onChangeText={(text) => setNotes(text.slice(0, 150))}
            multiline
            maxLength={150}
          />
        </View>
      </ScrollView>

      <View style={[styles.footer, { paddingBottom: insets.bottom + 20 }]}>
        <TouchableOpacity
          style={[
            styles.saveButton,
            selectedSymptoms.length === 0 && styles.saveButtonDisabled,
          ]}
          onPress={handleSave}
          activeOpacity={0.8}
          disabled={selectedSymptoms.length === 0}
        >
          <Text style={styles.saveButtonText}>Save Symptom Log</Text>
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
    fontSize: 20,
    fontWeight: '700' as const,
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
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 20,
    paddingTop: 20,
  },
  section: {
    marginBottom: 28,
  },
  sectionTitle: {
    fontSize: 15,
    fontWeight: '600' as const,
    color: Colors.text,
    marginBottom: 12,
  },
  intensityValue: {
    color: Colors.primary,
  },
  symptomsList: {
    gap: 8,
  },
  symptomItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 14,
    backgroundColor: Colors.background,
    borderRadius: 10,
    borderWidth: 2,
    borderColor: 'transparent',
  },
  symptomItemSelected: {
    backgroundColor: 'rgba(32, 141, 141, 0.08)',
    borderColor: Colors.primary,
  },
  checkbox: {
    width: 22,
    height: 22,
    borderRadius: 6,
    borderWidth: 2,
    borderColor: Colors.border,
    marginRight: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  checkboxSelected: {
    backgroundColor: Colors.primary,
    borderColor: Colors.primary,
  },
  symptomText: {
    fontSize: 15,
    color: Colors.text,
  },
  symptomTextSelected: {
    fontWeight: '500' as const,
  },
  sliderContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  sliderLabel: {
    fontSize: 12,
    color: Colors.textTertiary,
    width: 40,
  },
  sliderTrack: {
    flex: 1,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    height: 44,
  },
  sliderDot: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: Colors.border,
  },
  associationOptions: {
    gap: 8,
  },
  associationOption: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 14,
    backgroundColor: Colors.background,
    borderRadius: 10,
    borderWidth: 2,
    borderColor: 'transparent',
  },
  associationOptionSelected: {
    backgroundColor: 'rgba(32, 141, 141, 0.08)',
    borderColor: Colors.primary,
  },
  radio: {
    width: 22,
    height: 22,
    borderRadius: 11,
    borderWidth: 2,
    borderColor: Colors.border,
    marginRight: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  radioSelected: {
    borderColor: Colors.primary,
  },
  radioInner: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: Colors.primary,
  },
  associationText: {
    fontSize: 15,
    color: Colors.text,
  },
  associationTextSelected: {
    fontWeight: '500' as const,
  },
  notesHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  charCount: {
    fontSize: 12,
    color: Colors.textTertiary,
  },
  notesInput: {
    backgroundColor: Colors.background,
    borderRadius: 10,
    padding: 14,
    fontSize: 15,
    color: Colors.text,
    minHeight: 100,
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
  saveButtonDisabled: {
    opacity: 0.5,
  },
  saveButtonText: {
    fontSize: 17,
    fontWeight: '600' as const,
    color: Colors.white,
  },
  skipButton: {
    height: 48,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: Colors.border,
    justifyContent: 'center',
    alignItems: 'center',
  },
  skipButtonText: {
    fontSize: 15,
    color: Colors.textSecondary,
    fontWeight: '500' as const,
  },
});
