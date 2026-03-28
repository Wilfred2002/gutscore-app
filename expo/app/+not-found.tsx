import { StyleSheet, Text, View, TouchableOpacity } from 'react-native';
import { useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Home, AlertCircle } from 'lucide-react-native';
import Colors from '@/constants/colors';

export default function NotFoundScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();

  return (
    <View style={[styles.container, { paddingTop: insets.top, paddingBottom: insets.bottom }]}>
      <View style={styles.content}>
        <View style={styles.iconContainer}>
          <AlertCircle size={64} color={Colors.textTertiary} />
        </View>
        <Text style={styles.title}>Page Not Found</Text>
        <Text style={styles.message}>The page you&apos;re looking for doesn&apos;t exist or has been moved.</Text>
        
        <TouchableOpacity
          style={styles.button}
          onPress={() => router.replace('/(tabs)')}
          activeOpacity={0.8}
        >
          <Home size={20} color={Colors.white} />
          <Text style={styles.buttonText}>Go Home</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },
  content: {
    alignItems: 'center',
  },
  iconContainer: {
    marginBottom: 24,
  },
  title: {
    fontSize: 24,
    fontWeight: '700' as const,
    color: Colors.text,
    marginBottom: 8,
  },
  message: {
    fontSize: 15,
    color: Colors.textSecondary,
    textAlign: 'center',
    marginBottom: 32,
    lineHeight: 22,
  },
  button: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: Colors.primary,
    paddingHorizontal: 24,
    paddingVertical: 14,
    borderRadius: 12,
  },
  buttonText: {
    fontSize: 16,
    fontWeight: '600' as const,
    color: Colors.white,
  },
});
