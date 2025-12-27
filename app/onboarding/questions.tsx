import { useState, useRef } from 'react';
import { StyleSheet, Text, View, TouchableOpacity, Animated, ScrollView } from 'react-native';
import { useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { ArrowLeft } from 'lucide-react-native';
import Colors from '@/constants/colors';
import { useApp } from '@/contexts/AppContext';

// Question types
type QuestionType = 'yesno' | 'single' | 'multi' | 'info';

interface Option {
  id: string;
  label: string;
  emoji?: string;
  icon?: React.ReactNode;
}

interface Question {
  id: string;
  type: QuestionType;
  title: string;
  subtitle?: string;
  options?: Option[];
}

const QUESTIONS: Question[] = [
  {
    id: 'main_concern',
    type: 'single',
    title: "What's your main gut concern?",
    subtitle: 'This will help us personalize your experience.',
    options: [
      { id: 'ibs', label: 'IBS symptoms', emoji: '😣' },
      { id: 'bloating', label: 'Bloating', emoji: '🎈' },
      { id: 'food_sensitivities', label: 'Food sensitivities', emoji: '🍽️' },
      { id: 'general', label: 'General gut health', emoji: '💚' },
    ],
  },
  {
    id: 'symptom_frequency',
    type: 'single',
    title: 'How often do you experience symptoms?',
    options: [
      { id: 'daily', label: 'Daily', emoji: '📅' },
      { id: 'several_week', label: 'Several times a week', emoji: '📆' },
      { id: 'weekly', label: 'About once a week', emoji: '🗓️' },
      { id: 'rarely', label: 'Rarely', emoji: '✨' },
    ],
  },
  {
    id: 'dietary',
    type: 'multi',
    title: 'Any dietary restrictions?',
    subtitle: 'Select all that apply',
    options: [
      { id: 'none', label: 'None', emoji: '✅' },
      { id: 'vegetarian', label: 'Vegetarian', emoji: '🥬' },
      { id: 'vegan', label: 'Vegan', emoji: '🌱' },
      { id: 'low_fodmap', label: 'Low FODMAP', emoji: '🧪' },
      { id: 'gluten_free', label: 'Gluten-free', emoji: '🌾' },
      { id: 'dairy_free', label: 'Dairy-free', emoji: '🥛' },
    ],
  },
  {
    id: 'tried_apps',
    type: 'yesno',
    title: 'Have you tried other gut health apps?',
  },
  {
    id: 'info_value',
    type: 'info',
    title: 'GutScore learns what works for you',
    subtitle: 'Our AI analyzes your meals and symptoms to find patterns unique to your gut—no generic advice, just what actually helps you feel better.',
  },
  {
    id: 'age_range',
    type: 'single',
    title: "What's your age range?",
    subtitle: 'This helps us calibrate your custom plan.',
    options: [
      { id: '18-24', label: '18-24' },
      { id: '25-34', label: '25-34' },
      { id: '35-44', label: '35-44' },
      { id: '45-54', label: '45-54' },
      { id: '55-64', label: '55-64' },
      { id: '65+', label: '65+' },
    ],
  },
  {
    id: 'has_coach',
    type: 'yesno',
    title: 'Do you currently work with a nutritionist or dietitian?',
  },
  {
    id: 'main_goal',
    type: 'single',
    title: 'What would you like to accomplish?',
    options: [
      { id: 'understand_body', label: 'Understand my body', emoji: '🎯' },
      { id: 'reduce_bloating', label: 'Reduce bloating', emoji: '🎈' },
      { id: 'identify_triggers', label: 'Identify food triggers', emoji: '🔍' },
      { id: 'eat_confidence', label: 'Eat with confidence', emoji: '💪' },
    ],
  },
  {
    id: 'barriers',
    type: 'single',
    title: "What's stopping you from reaching your goals?",
    options: [
      { id: 'confusing_labels', label: 'Confusing food labels', emoji: '🏷️' },
      { id: 'dont_know', label: "Don't know what to eat", emoji: '🤷' },
      { id: 'anxiety', label: 'Constant food anxiety', emoji: '😰' },
      { id: 'unpredictable', label: 'Unpredictable symptoms', emoji: '🎲' },
    ],
  },
];

export default function OnboardingQuestions() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { updateOnboarding } = useApp();

  const [currentStep, setCurrentStep] = useState(0);
  const [answers, setAnswers] = useState<Record<string, any>>({});
  const [selectedOptions, setSelectedOptions] = useState<string[]>([]);
  const [yesNoSelection, setYesNoSelection] = useState<boolean | null>(null);

  const progressAnim = useRef(new Animated.Value(0)).current;

  const totalSteps = QUESTIONS.length;
  const currentQuestion = QUESTIONS[currentStep];
  const progress = (currentStep + 1) / totalSteps;

  // Animate progress bar
  Animated.timing(progressAnim, {
    toValue: progress,
    duration: 300,
    useNativeDriver: false,
  }).start();

  const handleBack = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
      setSelectedOptions([]);
    } else {
      router.back();
    }
  };

  const handleYesNoSelect = (answer: boolean) => {
    setYesNoSelection(answer);
  };

  const handleOptionSelect = (optionId: string) => {
    if (currentQuestion.type === 'single') {
      setSelectedOptions([optionId]);
    } else {
      // Multi-select
      if (optionId === 'none') {
        setSelectedOptions(['none']);
      } else {
        const newSelection = selectedOptions.filter(id => id !== 'none');
        if (newSelection.includes(optionId)) {
          setSelectedOptions(newSelection.filter(id => id !== optionId));
        } else {
          setSelectedOptions([...newSelection, optionId]);
        }
      }
    }
  };

  const handleContinue = () => {
    if (currentQuestion.type === 'yesno' && yesNoSelection !== null) {
      setAnswers({ ...answers, [currentQuestion.id]: yesNoSelection });
    } else if (currentQuestion.type === 'single') {
      setAnswers({ ...answers, [currentQuestion.id]: selectedOptions[0] });
    } else if (currentQuestion.type === 'multi') {
      setAnswers({ ...answers, [currentQuestion.id]: selectedOptions });
    }
    goToNext();
  };

  const goToNext = () => {
    if (currentStep < totalSteps - 1) {
      setCurrentStep(currentStep + 1);
      setSelectedOptions([]);
      setYesNoSelection(null);
    } else {
      // Onboarding questions complete - save and continue to thank you screen
      saveAnswersAndContinue();
    }
  };

  const saveAnswersAndContinue = async () => {
    await updateOnboarding({
      quizAnswers: {
        gutConcern: answers.main_concern,
        symptomFrequency: answers.symptom_frequency,
        dietaryRestrictions: answers.dietary || [],
        ageRange: answers.age_range,
        hasCoach: answers.has_coach,
        mainGoal: answers.main_goal,
        barriers: answers.barriers,
        triedOtherApps: answers.tried_apps,
      },
    });
    router.push('/onboarding/thank-you');
  };

  const canContinue = () => {
    if (currentQuestion.type === 'info') return true;
    if (currentQuestion.type === 'yesno') return yesNoSelection !== null;
    if (currentQuestion.type === 'single' || currentQuestion.type === 'multi') {
      return selectedOptions.length > 0;
    }
    return false;
  };

  const renderYesNo = () => (
    <View style={styles.yesNoContainer}>
      <TouchableOpacity
        style={[styles.yesNoOption, yesNoSelection === true && styles.yesNoOptionSelected]}
        onPress={() => handleYesNoSelect(true)}
        activeOpacity={0.8}
      >
        <View style={[styles.yesNoIcon, yesNoSelection === true && styles.yesNoIconSelected]}>
          <Text style={styles.yesNoIconText}>✓</Text>
        </View>
        <Text style={[styles.yesNoLabel, yesNoSelection === true && styles.yesNoLabelSelected]}>Yes</Text>
      </TouchableOpacity>

      <TouchableOpacity
        style={[styles.yesNoOption, yesNoSelection === false && styles.yesNoOptionSelected]}
        onPress={() => handleYesNoSelect(false)}
        activeOpacity={0.8}
      >
        <View style={[styles.yesNoIcon, yesNoSelection === false && styles.yesNoIconSelected]}>
          <Text style={styles.yesNoIconText}>✕</Text>
        </View>
        <Text style={[styles.yesNoLabel, yesNoSelection === false && styles.yesNoLabelSelected]}>No</Text>
      </TouchableOpacity>
    </View>
  );

  const renderOptions = () => (
    <View style={styles.optionsContainer}>
      {currentQuestion.options?.map((option) => {
        const isSelected = selectedOptions.includes(option.id);
        return (
          <TouchableOpacity
            key={option.id}
            style={[styles.optionCard, isSelected && styles.optionCardSelected]}
            onPress={() => handleOptionSelect(option.id)}
            activeOpacity={0.8}
          >
            {option.emoji && <Text style={styles.optionEmoji}>{option.emoji}</Text>}
            <Text style={[styles.optionLabel, isSelected && styles.optionLabelSelected]}>
              {option.label}
            </Text>
          </TouchableOpacity>
        );
      })}
    </View>
  );

  const renderInfo = () => (
    <View style={styles.infoContainer}>
      <View style={styles.infoCircle}>
        <Text style={styles.infoEmoji}>✨</Text>
      </View>
      <Text style={styles.infoSubtitle}>{currentQuestion.subtitle}</Text>
    </View>
  );

  return (
    <View style={[styles.container, { paddingTop: insets.top + 20 }]}>
      {/* Header with back button and progress */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton} onPress={handleBack}>
          <ArrowLeft size={24} color="#000000" />
        </TouchableOpacity>
        <View style={styles.progressContainer}>
          <Animated.View
            style={[
              styles.progressBar,
              {
                width: progressAnim.interpolate({
                  inputRange: [0, 1],
                  outputRange: ['0%', '100%'],
                }),
              },
            ]}
          />
        </View>
      </View>

      {/* Question */}
      <ScrollView
        style={styles.content}
        contentContainerStyle={styles.contentContainer}
        showsVerticalScrollIndicator={false}
      >
        <Text style={styles.title}>{currentQuestion.title}</Text>
        {currentQuestion.subtitle && currentQuestion.type !== 'info' && (
          <Text style={styles.subtitle}>{currentQuestion.subtitle}</Text>
        )}

        {/* Render based on question type */}
        {currentQuestion.type === 'yesno' && renderYesNo()}
        {(currentQuestion.type === 'single' || currentQuestion.type === 'multi') && renderOptions()}
        {currentQuestion.type === 'info' && renderInfo()}
      </ScrollView>

      {/* Continue button for all question types */}
      <View style={[styles.footer, { paddingBottom: insets.bottom + 20 }]}>
        <TouchableOpacity
          style={[styles.continueButton, !canContinue() && styles.continueButtonDisabled]}
          onPress={handleContinue}
          disabled={!canContinue()}
          activeOpacity={0.8}
        >
          <Text style={styles.continueButtonText}>Continue</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 24,
    paddingBottom: 20,
    gap: 16,
  },
  backButton: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: '#F5F5F5',
    justifyContent: 'center',
    alignItems: 'center',
  },
  progressContainer: {
    flex: 1,
    height: 4,
    backgroundColor: '#E0E0E0',
    borderRadius: 2,
    overflow: 'hidden',
  },
  progressBar: {
    height: '100%',
    backgroundColor: '#000000',
    borderRadius: 2,
  },
  content: {
    flex: 1,
  },
  contentContainer: {
    paddingHorizontal: 24,
    paddingBottom: 20,
  },
  title: {
    fontSize: 32,
    fontWeight: '700' as const,
    color: '#000000',
    lineHeight: 38,
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: '#666666',
    marginBottom: 32,
    lineHeight: 22,
  },
  // Yes/No styles
  yesNoContainer: {
    gap: 12,
    marginTop: 20,
  },
  yesNoOption: {
    backgroundColor: '#F5F5F5',
    padding: 20,
    borderRadius: 16,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
  },
  yesNoOptionSelected: {
    backgroundColor: '#000000',
  },
  yesNoIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#FFFFFF',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#E0E0E0',
  },
  yesNoIconSelected: {
    backgroundColor: '#000000',
    borderColor: '#FFFFFF',
  },
  yesNoIconText: {
    fontSize: 18,
    fontWeight: '600' as const,
    color: '#000000',
  },
  yesNoLabel: {
    fontSize: 17,
    fontWeight: '500' as const,
    color: '#000000',
  },
  yesNoLabelSelected: {
    color: '#FFFFFF',
  },
  // Option card styles
  optionsContainer: {
    gap: 12,
    marginTop: 20,
  },
  optionCard: {
    backgroundColor: '#F5F5F5',
    padding: 20,
    borderRadius: 16,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  optionCardSelected: {
    backgroundColor: '#000000',
  },
  optionEmoji: {
    fontSize: 24,
  },
  optionLabel: {
    fontSize: 16,
    fontWeight: '500' as const,
    color: '#000000',
    flex: 1,
  },
  optionLabelSelected: {
    color: '#FFFFFF',
  },
  // Info styles
  infoContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 60,
    gap: 32,
  },
  infoCircle: {
    width: 200,
    height: 200,
    borderRadius: 100,
    backgroundColor: '#F5F5F5',
    justifyContent: 'center',
    alignItems: 'center',
  },
  infoEmoji: {
    fontSize: 80,
  },
  infoSubtitle: {
    fontSize: 16,
    color: '#666666',
    textAlign: 'center',
    lineHeight: 24,
    paddingHorizontal: 20,
  },
  // Footer
  footer: {
    paddingHorizontal: 24,
    paddingTop: 16,
  },
  continueButton: {
    backgroundColor: '#000000',
    height: 56,
    borderRadius: 28,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  continueButtonDisabled: {
    opacity: 0.4,
  },
  continueButtonText: {
    color: '#FFFFFF',
    fontSize: 17,
    fontWeight: '600' as const,
  },
});
