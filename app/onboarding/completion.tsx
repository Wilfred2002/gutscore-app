import { StyleSheet, Text, View, TouchableOpacity } from 'react-native';
import { useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { ArrowLeft } from 'lucide-react-native';

export default function CompletionScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();

  const handleContinue = () => {
    router.push('/onboarding/signup');
  };

  const handleBack = () => {
    router.back();
  };

  return (
    <View style={[styles.container, { paddingTop: insets.top + 20 }]}>
      {/* Header with back button and progress */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton} onPress={handleBack}>
          <ArrowLeft size={24} color="#000000" />
        </TouchableOpacity>
        <View style={styles.progressContainer}>
          <View style={[styles.progressBar, { width: '100%' }]} />
        </View>
      </View>

      {/* Content */}
      <View style={styles.content}>
        <View style={styles.iconContainer}>
          <View style={styles.gradientCircle}>
            <Text style={styles.heartEmoji}>❤️</Text>
          </View>
        </View>

        <View style={styles.checkmark}>
          <View style={styles.checkmarkCircle}>
            <Text style={styles.checkmarkText}>✓</Text>
          </View>
          <Text style={styles.checkmarkLabel}>All done!</Text>
        </View>

        <Text style={styles.title}>Time to scan{'\n'}your first meal!</Text>
      </View>

      {/* Footer */}
      <View style={[styles.footer, { paddingBottom: insets.bottom + 20 }]}>
        <TouchableOpacity
          style={styles.continueButton}
          onPress={handleContinue}
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
    paddingHorizontal: 24,
    paddingTop: 60,
    alignItems: 'center',
  },
  iconContainer: {
    marginBottom: 60,
  },
  gradientCircle: {
    width: 200,
    height: 200,
    borderRadius: 100,
    backgroundColor: '#F5F5F5',
    justifyContent: 'center',
    alignItems: 'center',
  },
  heartEmoji: {
    fontSize: 80,
  },
  checkmark: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginBottom: 24,
  },
  checkmarkCircle: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#D4A574',
    justifyContent: 'center',
    alignItems: 'center',
  },
  checkmarkText: {
    fontSize: 18,
    fontWeight: '700' as const,
    color: '#FFFFFF',
  },
  checkmarkLabel: {
    fontSize: 18,
    fontWeight: '600' as const,
    color: '#000000',
  },
  title: {
    fontSize: 36,
    fontWeight: '700' as const,
    color: '#000000',
    textAlign: 'center',
    lineHeight: 42,
  },
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
  continueButtonText: {
    color: '#FFFFFF',
    fontSize: 17,
    fontWeight: '600' as const,
  },
});
