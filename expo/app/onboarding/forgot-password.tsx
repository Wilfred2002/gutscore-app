import { useState } from 'react';
import { StyleSheet, Text, View, TouchableOpacity, TextInput, KeyboardAvoidingView, Platform, ScrollView, Alert } from 'react-native';
import { useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { ArrowLeft, Mail } from 'lucide-react-native';
import Colors from '@/constants/colors';
import { useApp } from '@/contexts/AppContext';

export default function ForgotPasswordScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { resetPassword } = useApp();

  const [email, setEmail] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [emailSent, setEmailSent] = useState(false);
  const [errors, setErrors] = useState<{ email?: string; general?: string }>({});

  const validateForm = () => {
    const newErrors: { email?: string } = {};

    if (!email || !/\S+@\S+\.\S+/.test(email)) {
      newErrors.email = 'Please enter a valid email address';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleResetPassword = async () => {
    if (!validateForm()) return;

    setIsLoading(true);
    setErrors({});

    try {
      const { error } = await resetPassword(email);

      if (error) {
        setErrors({ general: error });
        setIsLoading(false);
        return;
      }

      setEmailSent(true);
      setIsLoading(false);
    } catch (error: any) {
      console.error('Reset password error:', error);
      setErrors({ general: error.message || 'Failed to send reset email' });
      setIsLoading(false);
    }
  };

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.keyboardView}
      >
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          <TouchableOpacity
            style={styles.backButton}
            onPress={() => router.back()}
          >
            <ArrowLeft size={24} color={Colors.text} />
          </TouchableOpacity>

          <View style={styles.header}>
            <View style={styles.iconContainer}>
              <Mail size={40} color={Colors.primary} />
            </View>
            <Text style={styles.title}>Forgot Password?</Text>
            <Text style={styles.subtitle}>
              {emailSent
                ? 'Check your email for a link to reset your password.'
                : 'Enter your email address and we\'ll send you a link to reset your password.'}
            </Text>
          </View>

          {!emailSent ? (
            <>
              <View style={styles.form}>
                <View style={styles.inputGroup}>
                  <Text style={styles.label}>Email</Text>
                  <TextInput
                    style={[styles.input, errors.email && styles.inputError]}
                    placeholder="your@email.com"
                    placeholderTextColor={Colors.textTertiary}
                    value={email}
                    onChangeText={setEmail}
                    keyboardType="email-address"
                    autoCapitalize="none"
                    autoCorrect={false}
                  />
                  {errors.email && <Text style={styles.errorText}>{errors.email}</Text>}
                </View>
              </View>

              <View style={styles.buttonSection}>
                {errors.general && (
                  <View style={styles.errorBox}>
                    <Text style={styles.errorBoxText}>{errors.general}</Text>
                  </View>
                )}

                <TouchableOpacity
                  style={[styles.primaryButton, isLoading && styles.primaryButtonDisabled]}
                  onPress={handleResetPassword}
                  activeOpacity={0.8}
                  disabled={isLoading}
                >
                  <Text style={styles.primaryButtonText}>
                    {isLoading ? 'Sending...' : 'Send Reset Link'}
                  </Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={styles.backToLoginButton}
                  onPress={() => router.back()}
                  activeOpacity={0.7}
                >
                  <Text style={styles.backToLoginText}>Back to Login</Text>
                </TouchableOpacity>
              </View>
            </>
          ) : (
            <View style={styles.successSection}>
              <View style={styles.successBox}>
                <Text style={styles.successTitle}>Email Sent!</Text>
                <Text style={styles.successText}>
                  If an account exists for {email}, you'll receive a password reset link shortly.
                </Text>
              </View>

              <TouchableOpacity
                style={styles.primaryButton}
                onPress={() => router.push('/onboarding/login')}
                activeOpacity={0.8}
              >
                <Text style={styles.primaryButtonText}>Back to Login</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.resendButton}
                onPress={() => {
                  setEmailSent(false);
                  setEmail('');
                }}
                activeOpacity={0.7}
              >
                <Text style={styles.resendText}>Didn't receive it? Try again</Text>
              </TouchableOpacity>
            </View>
          )}
        </ScrollView>
      </KeyboardAvoidingView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.backgroundWhite,
  },
  keyboardView: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    paddingHorizontal: 24,
    paddingBottom: 40,
  },
  backButton: {
    width: 44,
    height: 44,
    justifyContent: 'center',
    marginTop: 8,
  },
  header: {
    marginTop: 24,
    marginBottom: 32,
    alignItems: 'center',
  },
  iconContainer: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: `${Colors.primary}15`,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 24,
  },
  title: {
    fontSize: 28,
    fontWeight: '700' as const,
    color: Colors.text,
    marginBottom: 12,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 14,
    color: Colors.textSecondary,
    textAlign: 'center',
    lineHeight: 20,
    paddingHorizontal: 20,
  },
  form: {
    gap: 20,
    marginBottom: 32,
  },
  inputGroup: {
    gap: 8,
  },
  label: {
    fontSize: 12,
    fontWeight: '500' as const,
    color: Colors.text,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  input: {
    height: 52,
    borderWidth: 1,
    borderColor: Colors.border,
    borderRadius: 12,
    paddingHorizontal: 16,
    fontSize: 16,
    color: Colors.text,
    backgroundColor: Colors.backgroundWhite,
  },
  inputError: {
    borderColor: Colors.danger,
  },
  errorText: {
    fontSize: 12,
    color: Colors.danger,
    marginTop: 4,
  },
  buttonSection: {
    gap: 12,
    marginTop: 'auto',
  },
  errorBox: {
    backgroundColor: '#FEE2E2',
    borderRadius: 8,
    padding: 12,
    borderLeftWidth: 4,
    borderLeftColor: Colors.danger,
  },
  errorBoxText: {
    color: '#991B1B',
    fontSize: 14,
    lineHeight: 20,
  },
  primaryButton: {
    backgroundColor: Colors.primary,
    height: 52,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  primaryButtonDisabled: {
    opacity: 0.6,
  },
  primaryButtonText: {
    color: Colors.white,
    fontSize: 17,
    fontWeight: '600' as const,
  },
  backToLoginButton: {
    height: 44,
    justifyContent: 'center',
    alignItems: 'center',
  },
  backToLoginText: {
    fontSize: 14,
    color: Colors.textSecondary,
  },
  successSection: {
    flex: 1,
    gap: 20,
  },
  successBox: {
    backgroundColor: `${Colors.success}15`,
    borderRadius: 12,
    padding: 20,
    borderLeftWidth: 4,
    borderLeftColor: Colors.success,
    marginBottom: 12,
  },
  successTitle: {
    fontSize: 18,
    fontWeight: '600' as const,
    color: Colors.text,
    marginBottom: 8,
  },
  successText: {
    fontSize: 14,
    color: Colors.textSecondary,
    lineHeight: 20,
  },
  resendButton: {
    height: 44,
    justifyContent: 'center',
    alignItems: 'center',
  },
  resendText: {
    fontSize: 14,
    color: Colors.primary,
    fontWeight: '500' as const,
  },
});
