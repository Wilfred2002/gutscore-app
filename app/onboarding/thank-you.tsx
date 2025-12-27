import { StyleSheet, Text, View, TouchableOpacity } from 'react-native';
import { useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { ArrowLeft } from 'lucide-react-native';

export default function ThankYouScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();

  const handleContinue = () => {
    router.push('/onboarding/notification-permission');
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
          <View style={[styles.progressBar, { width: '75%' }]} />
        </View>
      </View>

      {/* Content */}
      <View style={styles.content}>
        <View style={styles.iconContainer}>
          <View style={styles.gradientCircle}>
            <Text style={styles.handEmoji}>👋</Text>
          </View>
        </View>

        <Text style={styles.title}>Thank you for{'\n'}trusting us</Text>
        <Text style={styles.subtitle}>Now let's personalize GutScore for you...</Text>

        <View style={styles.privacyCard}>
          <Text style={styles.lockEmoji}>🔒</Text>
          <Text style={styles.privacyTitle}>Your privacy and security matter to us.</Text>
          <Text style={styles.privacyText}>
            We promise to always keep your personal information private and secure.
          </Text>
        </View>
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
    paddingTop: 40,
    alignItems: 'center',
  },
  iconContainer: {
    marginBottom: 40,
  },
  gradientCircle: {
    width: 200,
    height: 200,
    borderRadius: 100,
    backgroundColor: '#F5F5F5',
    justifyContent: 'center',
    alignItems: 'center',
  },
  handEmoji: {
    fontSize: 80,
  },
  title: {
    fontSize: 36,
    fontWeight: '700' as const,
    color: '#000000',
    textAlign: 'center',
    lineHeight: 42,
    marginBottom: 12,
  },
  subtitle: {
    fontSize: 16,
    color: '#666666',
    textAlign: 'center',
    marginBottom: 40,
  },
  privacyCard: {
    backgroundColor: '#F5F5F5',
    borderRadius: 16,
    padding: 24,
    alignItems: 'center',
    gap: 12,
  },
  lockEmoji: {
    fontSize: 32,
    marginBottom: 8,
  },
  privacyTitle: {
    fontSize: 17,
    fontWeight: '600' as const,
    color: '#000000',
    textAlign: 'center',
  },
  privacyText: {
    fontSize: 14,
    color: '#666666',
    textAlign: 'center',
    lineHeight: 20,
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
