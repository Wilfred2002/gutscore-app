import { StyleSheet, Text, View, TouchableOpacity } from 'react-native';
import { useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Colors from '@/constants/colors';

export default function WelcomeScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();

  const handleGetStarted = () => {
    router.push('/onboarding/questions');
  };

  const handleSignIn = () => {
    router.push('/onboarding/login');
  };

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      {/* Language Selector (optional - can remove if not needed) */}
      <View style={styles.topBar}>
        <Text style={styles.languageText}>🇺🇸 EN</Text>
      </View>

      {/* Hero Section */}
      <View style={styles.heroSection}>
        {/* Placeholder for app preview image - you can add an actual image here */}
        <View style={styles.previewContainer}>
          <Text style={styles.heroEmoji}>🥗</Text>
        </View>

        <Text style={styles.heroHeading}>Gut health radar{'\n'}made easy</Text>
      </View>

      {/* Buttons */}
      <View style={[styles.buttonSection, { paddingBottom: Math.max(insets.bottom, 20) + 20 }]}>
        <TouchableOpacity
          style={styles.primaryButton}
          onPress={handleGetStarted}
          activeOpacity={0.8}
        >
          <Text style={styles.primaryButtonText}>Get Started</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.signInLink}
          onPress={handleSignIn}
          activeOpacity={0.7}
        >
          <Text style={styles.signInText}>
            Already have an account? <Text style={styles.signInBold}>Sign In</Text>
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 24,
  },
  topBar: {
    alignItems: 'flex-end',
    paddingTop: 20,
    paddingBottom: 10,
  },
  languageText: {
    fontSize: 14,
    color: Colors.text,
  },
  heroSection: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingBottom: 60,
  },
  previewContainer: {
    marginBottom: 40,
  },
  heroEmoji: {
    fontSize: 80,
  },
  heroHeading: {
    fontSize: 36,
    fontWeight: '700' as const,
    color: '#000000',
    textAlign: 'center',
    lineHeight: 42,
  },
  buttonSection: {
    gap: 16,
  },
  primaryButton: {
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
  primaryButtonText: {
    color: '#FFFFFF',
    fontSize: 17,
    fontWeight: '600' as const,
  },
  signInLink: {
    alignItems: 'center',
    paddingVertical: 12,
  },
  signInText: {
    fontSize: 15,
    color: '#666666',
  },
  signInBold: {
    fontWeight: '600' as const,
    color: '#000000',
  },
});
