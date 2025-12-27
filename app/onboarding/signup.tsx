import { useState, useRef } from 'react';
import { StyleSheet, Text, View, TouchableOpacity, Animated } from 'react-native';
import { useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { ArrowLeft } from 'lucide-react-native';
import { useApp } from '@/contexts/AppContext';

export default function SignUpScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { completeOnboarding, signInWithGoogle } = useApp();

  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const progressAnim = useRef(new Animated.Value(1)).current; // Full progress

  const handleBack = () => {
    router.back();
  };

  const handleGoogleSignIn = async () => {
    setIsLoading(true);
    setError(null);

    try {
      const { data, error: signInError } = await signInWithGoogle();

      if (signInError) {
        setError(signInError);
        setIsLoading(false);
        return;
      }

      // Complete onboarding and go to main app
      await completeOnboarding();
      setIsLoading(false);
      router.replace('/(tabs)');
    } catch (err: any) {
      console.error('Google sign-in error:', err);
      setError(err.message || 'Failed to sign in with Google');
      setIsLoading(false);
    }
  };

  const handleSkip = async () => {
    // Allow using app without signin (limited features)
    await completeOnboarding();
    router.replace('/(tabs)');
  };

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

      {/* Title */}
      <View style={styles.content}>
        <Text style={styles.title}>Save your progress</Text>
      </View>

      {/* Auth buttons */}
      <View style={[styles.footer, { paddingBottom: insets.bottom + 20 }]}>
        {error && (
          <View style={styles.errorBox}>
            <Text style={styles.errorText}>{error}</Text>
          </View>
        )}

        {/* Apple Sign In - Black */}
        <TouchableOpacity
          style={[styles.appleButton, isLoading && styles.buttonDisabled]}
          onPress={() => { }} // TODO: Implement Apple Sign In
          activeOpacity={0.8}
          disabled={true} // Not implemented yet
        >
          <Text style={styles.appleIcon}>🍎</Text>
          <Text style={styles.appleButtonText}>Sign in with Apple</Text>
        </TouchableOpacity>

        {/* Google Sign In - White with border */}
        <TouchableOpacity
          style={[styles.googleButton, isLoading && styles.buttonDisabled]}
          onPress={handleGoogleSignIn}
          activeOpacity={0.8}
          disabled={isLoading}
        >
          <Text style={styles.googleIcon}>G</Text>
          <Text style={styles.googleButtonText}>
            {isLoading ? 'Signing in...' : 'Sign in with Google'}
          </Text>
        </TouchableOpacity>

        {/* Skip link */}
        <TouchableOpacity
          style={styles.skipLink}
          onPress={handleSkip}
          activeOpacity={0.7}
        >
          <Text style={styles.skipText}>Skip for now</Text>
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
  },
  title: {
    fontSize: 32,
    fontWeight: '700' as const,
    color: '#000000',
    marginBottom: 12,
  },
  footer: {
    paddingHorizontal: 24,
    gap: 12,
  },
  errorBox: {
    backgroundColor: '#FEE2E2',
    borderRadius: 12,
    padding: 12,
    marginBottom: 4,
  },
  errorText: {
    color: '#991B1B',
    fontSize: 14,
    textAlign: 'center',
  },
  appleButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#000000',
    height: 56,
    borderRadius: 28,
    gap: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  appleIcon: {
    fontSize: 22,
  },
  appleButtonText: {
    color: '#FFFFFF',
    fontSize: 17,
    fontWeight: '600' as const,
  },
  buttonDisabled: {
    opacity: 0.5,
  },
  googleButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#FFFFFF',
    height: 56,
    borderRadius: 28,
    borderWidth: 2,
    borderColor: '#E0E0E0',
    gap: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  googleIcon: {
    fontSize: 18,
    fontWeight: '700' as const,
    color: '#4285F4',
  },
  googleButtonText: {
    color: '#000000',
    fontSize: 17,
    fontWeight: '500' as const,
  },
  skipLink: {
    alignItems: 'center',
    paddingVertical: 16,
  },
  skipText: {
    fontSize: 15,
    color: '#999999',
  },
});
