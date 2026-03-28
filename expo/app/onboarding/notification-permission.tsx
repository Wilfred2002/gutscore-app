import { StyleSheet, Text, View, TouchableOpacity } from 'react-native';
import { useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { ArrowLeft } from 'lucide-react-native';
import * as Notifications from 'expo-notifications';

export default function NotificationPermissionScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();

  const handleAllow = async () => {
    // Request notification permissions
    const { status } = await Notifications.requestPermissionsAsync();
    console.log('Notification permission status:', status);

    // Continue to completion screen
    router.push('/onboarding/completion');
  };

  const handleDontAllow = () => {
    // Skip permissions and continue
    router.push('/onboarding/completion');
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
          <View style={[styles.progressBar, { width: '90%' }]} />
        </View>
      </View>

      {/* Content */}
      <View style={styles.content}>
        <Text style={styles.title}>Be reminded to log meals</Text>

        <View style={styles.permissionBox}>
          <Text style={styles.permissionTitle}>
            GutScore would like to send you Notifications
          </Text>

          <View style={styles.buttonContainer}>
            <TouchableOpacity
              style={styles.dontAllowButton}
              onPress={handleDontAllow}
              activeOpacity={0.8}
            >
              <Text style={styles.dontAllowText}>Don't Allow</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.allowButton}
              onPress={handleAllow}
              activeOpacity={0.8}
            >
              <Text style={styles.allowText}>Allow</Text>
            </TouchableOpacity>
          </View>
        </View>

        <Text style={styles.emojiPointer}>👇</Text>
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
  title: {
    fontSize: 32,
    fontWeight: '700' as const,
    color: '#000000',
    textAlign: 'center',
    lineHeight: 38,
    marginBottom: 60,
  },
  permissionBox: {
    backgroundColor: '#D3D3D3',
    borderRadius: 16,
    padding: 20,
    width: '100%',
    gap: 16,
  },
  permissionTitle: {
    fontSize: 15,
    fontWeight: '500' as const,
    color: '#000000',
    textAlign: 'center',
    paddingVertical: 12,
  },
  buttonContainer: {
    flexDirection: 'row',
    gap: 1,
    borderRadius: 12,
    overflow: 'hidden',
  },
  dontAllowButton: {
    flex: 1,
    backgroundColor: '#EBEBEB',
    paddingVertical: 14,
    alignItems: 'center',
  },
  allowButton: {
    flex: 1,
    backgroundColor: '#2C2C2E',
    paddingVertical: 14,
    alignItems: 'center',
  },
  dontAllowText: {
    fontSize: 16,
    fontWeight: '500' as const,
    color: '#000000',
  },
  allowText: {
    fontSize: 16,
    fontWeight: '600' as const,
    color: '#FFFFFF',
  },
  emojiPointer: {
    fontSize: 40,
    marginTop: 24,
  },
});
