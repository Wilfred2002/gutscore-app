import { useState } from 'react';
import { StyleSheet, Text, View, TouchableOpacity, ScrollView } from 'react-native';
import { useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { ArrowLeft } from 'lucide-react-native';
import Colors from '@/constants/colors';
import { useApp } from '@/contexts/AppContext';
import { gutConcerns, dietaryOptions, ageRanges, symptomFrequencies } from '@/mocks/data';

interface QuizStep {
  question: string;
  type: 'single' | 'multiple';
  options: { id: string; label: string; emoji?: string }[];
  key: 'gutConcern' | 'dietaryRestrictions' | 'ageRange' | 'symptomFrequency';
}

const quizSteps: QuizStep[] = [
  {
    question: "What's your primary gut concern?",
    type: 'single',
    options: gutConcerns,
    key: 'gutConcern',
  },
  {
    question: "Do you have dietary restrictions?",
    type: 'multiple',
    options: dietaryOptions.map(d => ({ id: d, label: d })),
    key: 'dietaryRestrictions',
  },
  {
    question: "What's your age range?",
    type: 'single',
    options: ageRanges,
    key: 'ageRange',
  },
  {
    question: "How often do you experience symptoms?",
    type: 'single',
    options: symptomFrequencies,
    key: 'symptomFrequency',
  },
];

export default function QuizScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { onboarding, updateOnboarding } = useApp();
  
  const [currentStep, setCurrentStep] = useState(0);
  const [answers, setAnswers] = useState<Record<string, string | string[]>>(
    onboarding.quizAnswers || {}
  );

  const step = quizSteps[currentStep];
  const totalSteps = quizSteps.length;
  const progress = ((currentStep + 1) / totalSteps) * 100;

  const handleSelect = (optionId: string) => {
    if (step.type === 'single') {
      setAnswers({ ...answers, [step.key]: optionId });
    } else {
      const current = (answers[step.key] as string[]) || [];
      if (current.includes(optionId)) {
        setAnswers({ ...answers, [step.key]: current.filter(id => id !== optionId) });
      } else {
        setAnswers({ ...answers, [step.key]: [...current, optionId] });
      }
    }
  };

  const isSelected = (optionId: string) => {
    if (step.type === 'single') {
      return answers[step.key] === optionId;
    }
    return ((answers[step.key] as string[]) || []).includes(optionId);
  };

  const handleNext = async () => {
    if (currentStep < totalSteps - 1) {
      setCurrentStep(currentStep + 1);
    } else {
      await updateOnboarding({ 
        quizAnswers: answers as typeof onboarding.quizAnswers,
        currentStep: 2 
      });
      router.push('/onboarding/permissions');
    }
  };

  const handleBack = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    } else {
      router.back();
    }
  };

  const handleSkip = () => {
    router.push('/onboarding/permissions');
  };

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton} onPress={handleBack}>
          <ArrowLeft size={24} color={Colors.text} />
        </TouchableOpacity>
        <TouchableOpacity onPress={handleSkip}>
          <Text style={styles.skipText}>Skip</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.progressContainer}>
        <View style={styles.progressBar}>
          <View style={[styles.progressFill, { width: `${progress}%` }]} />
        </View>
        <Text style={styles.progressText}>{currentStep + 1} of {totalSteps}</Text>
      </View>

      <ScrollView 
        style={styles.content}
        contentContainerStyle={styles.contentContainer}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.questionCard}>
          <Text style={styles.question}>{step.question}</Text>
          
          <View style={styles.optionsContainer}>
            {step.options.map((option) => (
              <TouchableOpacity
                key={option.id}
                style={[
                  styles.option,
                  isSelected(option.id) && styles.optionSelected,
                ]}
                onPress={() => handleSelect(option.id)}
                activeOpacity={0.7}
              >
                <View style={[
                  styles.radioOuter,
                  step.type === 'multiple' && styles.checkboxOuter,
                  isSelected(option.id) && styles.radioSelected,
                ]}>
                  {isSelected(option.id) && (
                    <View style={[
                      styles.radioInner,
                      step.type === 'multiple' && styles.checkboxInner,
                    ]}>
                      {step.type === 'multiple' && (
                        <Text style={styles.checkmark}>✓</Text>
                      )}
                    </View>
                  )}
                </View>
                <Text style={[
                  styles.optionText,
                  isSelected(option.id) && styles.optionTextSelected,
                ]}>
                  {option.emoji ? `${option.emoji} ` : '🔹 '}{option.label}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>
      </ScrollView>

      <View style={[styles.footer, { paddingBottom: insets.bottom + 20 }]}>
        <TouchableOpacity
          style={styles.backButtonFooter}
          onPress={handleBack}
          activeOpacity={0.7}
        >
          <Text style={styles.backButtonText}>Back</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.nextButton}
          onPress={handleNext}
          activeOpacity={0.8}
        >
          <Text style={styles.nextButtonText}>
            {currentStep === totalSteps - 1 ? 'Continue' : 'Next'}
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  backButton: {
    width: 44,
    height: 44,
    justifyContent: 'center',
  },
  skipText: {
    fontSize: 14,
    color: Colors.textSecondary,
  },
  progressContainer: {
    paddingHorizontal: 24,
    marginBottom: 24,
  },
  progressBar: {
    height: 4,
    backgroundColor: Colors.border,
    borderRadius: 2,
    marginBottom: 8,
  },
  progressFill: {
    height: '100%',
    backgroundColor: Colors.primary,
    borderRadius: 2,
  },
  progressText: {
    fontSize: 12,
    color: Colors.textTertiary,
    textAlign: 'right',
  },
  content: {
    flex: 1,
  },
  contentContainer: {
    paddingHorizontal: 24,
    paddingBottom: 24,
  },
  questionCard: {
    backgroundColor: Colors.backgroundWhite,
    borderRadius: 16,
    padding: 24,
  },
  question: {
    fontSize: 20,
    fontWeight: '600' as const,
    color: Colors.text,
    textAlign: 'center',
    marginBottom: 24,
  },
  optionsContainer: {
    gap: 12,
  },
  option: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    backgroundColor: Colors.background,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: 'transparent',
  },
  optionSelected: {
    backgroundColor: 'rgba(32, 141, 141, 0.08)',
    borderColor: Colors.primary,
  },
  radioOuter: {
    width: 24,
    height: 24,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: Colors.border,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  checkboxOuter: {
    borderRadius: 6,
  },
  radioSelected: {
    borderColor: Colors.primary,
  },
  radioInner: {
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: Colors.primary,
  },
  checkboxInner: {
    width: 20,
    height: 20,
    borderRadius: 4,
    backgroundColor: Colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
  },
  checkmark: {
    color: Colors.white,
    fontSize: 12,
    fontWeight: '700' as const,
  },
  optionText: {
    flex: 1,
    fontSize: 14,
    color: Colors.text,
    lineHeight: 20,
  },
  optionTextSelected: {
    fontWeight: '500' as const,
  },
  footer: {
    flexDirection: 'row',
    paddingHorizontal: 24,
    gap: 12,
  },
  backButtonFooter: {
    flex: 1,
    height: 52,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: Colors.border,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: Colors.backgroundWhite,
  },
  backButtonText: {
    fontSize: 16,
    color: Colors.textSecondary,
    fontWeight: '500' as const,
  },
  nextButton: {
    flex: 2,
    height: 52,
    borderRadius: 12,
    backgroundColor: Colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
  },
  nextButtonText: {
    fontSize: 17,
    color: Colors.white,
    fontWeight: '600' as const,
  },
});
