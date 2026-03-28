import { useState, useEffect, useRef } from 'react';
import { StyleSheet, Text, View, Animated } from 'react-native';
import { useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';

const CHECKLIST_ITEMS = [
  'FODMAP sensitivity',
  'Trigger foods',
  'Gut health score',
  'Meal recommendations',
  'Personalized insights',
];

export default function PersonalizingScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();

  const [percentage, setPercentage] = useState(0);
  const [statusText, setStatusText] = useState('Analyzing your profile...');
  const [completedItems, setCompletedItems] = useState<number>(0);

  const progressAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    // Animate from 0 to 100% over 6 seconds
    const duration = 6000;
    const steps = 100;
    const stepDuration = duration / steps;

    const interval = setInterval(() => {
      setPercentage((prev) => {
        if (prev >= 100) {
          clearInterval(interval);
          // Navigate to next screen after a brief delay
          setTimeout(() => {
            router.replace('/onboarding/completion');
          }, 500);
          return 100;
        }
        return prev + 1;
      });
    }, stepDuration);

    // Animate progress bar
    Animated.timing(progressAnim, {
      toValue: 1,
      duration: duration,
      useNativeDriver: false,
    }).start();

    return () => clearInterval(interval);
  }, []);

  // Update status text based on percentage
  useEffect(() => {
    if (percentage < 25) {
      setStatusText('Analyzing your profile...');
    } else if (percentage < 50) {
      setStatusText('Identifying trigger patterns...');
    } else if (percentage < 75) {
      setStatusText('Personalizing recommendations...');
    } else if (percentage < 100) {
      setStatusText('Finalizing your gut health plan...');
    } else {
      setStatusText('All done!');
    }

    // Check off items as we progress
    const itemsToComplete = Math.floor((percentage / 100) * CHECKLIST_ITEMS.length);
    setCompletedItems(itemsToComplete);
  }, [percentage]);

  return (
    <View style={[styles.container, { paddingTop: insets.top + 60 }]}>
      {/* Percentage */}
      <Text style={styles.percentage}>{percentage}%</Text>

      {/* Main message */}
      <Text style={styles.mainMessage}>
        We're setting{'\n'}everything up for you
      </Text>

      {/* Progress bar with gradient */}
      <View style={styles.progressBarContainer}>
        <View style={styles.progressBarBackground}>
          <Animated.View
            style={[
              styles.progressBarFill,
              {
                width: progressAnim.interpolate({
                  inputRange: [0, 1],
                  outputRange: ['0%', '100%'],
                }),
              },
            ]}
          >
            <LinearGradient
              colors={['#EF4444', '#8B5CF6', '#3B82F6']}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
              style={styles.gradient}
            />
          </Animated.View>
        </View>
      </View>

      {/* Status text */}
      <Text style={styles.statusText}>{statusText}</Text>

      {/* Checklist */}
      <View style={styles.checklistContainer}>
        <Text style={styles.checklistTitle}>Personalizing for you</Text>
        {CHECKLIST_ITEMS.map((item, index) => (
          <View key={item} style={styles.checklistItem}>
            <View style={[styles.checkbox, index < completedItems && styles.checkboxCompleted]}>
              {index < completedItems && <Text style={styles.checkmark}>✓</Text>}
            </View>
            <Text style={styles.checklistItemText}>{item}</Text>
          </View>
        ))}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 24,
    alignItems: 'center',
  },
  percentage: {
    fontSize: 72,
    fontWeight: '700' as const,
    color: '#000000',
    marginBottom: 24,
  },
  mainMessage: {
    fontSize: 28,
    fontWeight: '600' as const,
    color: '#000000',
    textAlign: 'center',
    lineHeight: 34,
    marginBottom: 40,
  },
  progressBarContainer: {
    width: '100%',
    marginBottom: 24,
  },
  progressBarBackground: {
    height: 8,
    backgroundColor: '#E5E7EB',
    borderRadius: 4,
    overflow: 'hidden',
  },
  progressBarFill: {
    height: '100%',
    borderRadius: 4,
  },
  gradient: {
    flex: 1,
    borderRadius: 4,
  },
  statusText: {
    fontSize: 16,
    color: '#6B7280',
    marginBottom: 48,
  },
  checklistContainer: {
    width: '100%',
    alignItems: 'flex-start',
  },
  checklistTitle: {
    fontSize: 18,
    fontWeight: '600' as const,
    color: '#000000',
    marginBottom: 16,
  },
  checklistItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  checkbox: {
    width: 24,
    height: 24,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: '#D1D5DB',
    marginRight: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  checkboxCompleted: {
    backgroundColor: '#000000',
    borderColor: '#000000',
  },
  checkmark: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '700' as const,
  },
  checklistItemText: {
    fontSize: 15,
    color: '#374151',
  },
});
