import { StyleSheet, Text, View, TouchableOpacity, ImageBackground } from 'react-native';
import { useRouter } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Colors from '@/constants/colors';

export default function WelcomeScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();

  return (
    <ImageBackground
      source={{ uri: 'https://images.unsplash.com/photo-1490645935967-10de6ba17061?w=800' }}
      style={styles.container}
    >
      <LinearGradient
        colors={['rgba(0,0,0,0.6)', 'rgba(0,0,0,0.3)', 'rgba(0,0,0,0.7)']}
        style={styles.gradient}
      >
        <View style={[styles.content, { paddingTop: insets.top + 60, paddingBottom: insets.bottom + 20 }]}>
          <View style={styles.heroSection}>
            <Text style={styles.heroHeading}>Know Your Food{'\n'}Triggers in 3 Seconds</Text>
            <Text style={styles.subheading}>AI-powered food scanner for gut health</Text>
          </View>

          <View style={styles.buttonSection}>
            <TouchableOpacity
              style={styles.primaryButton}
              onPress={() => router.push('/onboarding/signup')}
              activeOpacity={0.8}
            >
              <Text style={styles.primaryButtonText}>Get Started</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.secondaryButton}
              onPress={() => router.replace('/(tabs)')}
              activeOpacity={0.7}
            >
              <Text style={styles.secondaryButtonText}>Already have an account?</Text>
            </TouchableOpacity>
          </View>
        </View>
      </LinearGradient>
    </ImageBackground>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  gradient: {
    flex: 1,
  },
  content: {
    flex: 1,
    paddingHorizontal: 24,
    justifyContent: 'space-between',
  },
  heroSection: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  heroHeading: {
    fontSize: 32,
    fontWeight: '700' as const,
    color: Colors.white,
    textAlign: 'center',
    lineHeight: 40,
    marginBottom: 16,
  },
  subheading: {
    fontSize: 16,
    color: '#B0B0B0',
    textAlign: 'center',
  },
  buttonSection: {
    gap: 16,
  },
  primaryButton: {
    backgroundColor: Colors.primary,
    height: 52,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  primaryButtonText: {
    color: Colors.white,
    fontSize: 17,
    fontWeight: '600' as const,
  },
  secondaryButton: {
    height: 44,
    justifyContent: 'center',
    alignItems: 'center',
  },
  secondaryButtonText: {
    color: Colors.primary,
    fontSize: 14,
    fontWeight: '500' as const,
  },
});
