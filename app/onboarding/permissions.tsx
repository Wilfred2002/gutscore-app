import { StyleSheet, Text, View, TouchableOpacity, Platform } from 'react-native';
import { useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Camera, Check } from 'lucide-react-native';
import * as ImagePicker from 'expo-image-picker';
import Colors from '@/constants/colors';
import { useApp } from '@/contexts/AppContext';

export default function PermissionsScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { updateOnboarding } = useApp();

  const handleAllowCamera = async () => {
    if (Platform.OS === 'web') {
      await updateOnboarding({ 
        permissionsGranted: { camera: true, health: false },
        currentStep: 3 
      });
      router.push('/onboarding/checklist' as never);
      return;
    }

    const { status } = await ImagePicker.requestCameraPermissionsAsync();
    
    if (status === 'granted') {
      await updateOnboarding({ 
        permissionsGranted: { camera: true, health: false },
        currentStep: 3 
      });
    }
    router.push('/onboarding/checklist' as never);
  };

  const handleSkip = () => {
    router.push('/onboarding/checklist' as never);
  };

  return (
    <View style={[styles.container, { paddingTop: insets.top + 40, paddingBottom: insets.bottom + 20 }]}>
      <View style={styles.content}>
        <View style={styles.iconContainer}>
          <View style={styles.iconCircle}>
            <Camera size={40} color={Colors.white} />
            <View style={styles.checkBadge}>
              <Check size={12} color={Colors.white} />
            </View>
          </View>
        </View>

        <Text style={styles.headline}>We Need Access to{'\n'}Your Camera</Text>
        <Text style={styles.explanation}>
          To scan meals, we need camera permission.{'\n'}Your photos never leave your device.
        </Text>
      </View>

      <View style={styles.buttonSection}>
        <TouchableOpacity
          style={styles.primaryButton}
          onPress={handleAllowCamera}
          activeOpacity={0.8}
        >
          <Text style={styles.primaryButtonText}>Allow Camera Access</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.secondaryButton}
          onPress={handleSkip}
          activeOpacity={0.7}
        >
          <Text style={styles.secondaryButtonText}>I&apos;ll do this later</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.backgroundWhite,
    paddingHorizontal: 24,
  },
  content: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  iconContainer: {
    marginBottom: 32,
  },
  iconCircle: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: Colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
    position: 'relative',
  },
  checkBadge: {
    position: 'absolute',
    bottom: 4,
    right: 4,
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: Colors.success,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 3,
    borderColor: Colors.backgroundWhite,
  },
  headline: {
    fontSize: 24,
    fontWeight: '700' as const,
    color: Colors.text,
    textAlign: 'center',
    marginBottom: 16,
    lineHeight: 32,
  },
  explanation: {
    fontSize: 14,
    color: Colors.textSecondary,
    textAlign: 'center',
    lineHeight: 22,
  },
  buttonSection: {
    gap: 12,
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
    height: 52,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: Colors.border,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: Colors.backgroundWhite,
  },
  secondaryButtonText: {
    color: Colors.textSecondary,
    fontSize: 16,
    fontWeight: '500' as const,
  },
});
