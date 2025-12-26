import { useState, useRef, useEffect } from 'react';
import { StyleSheet, Text, View, TouchableOpacity, Platform, Animated, Alert } from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import * as ImagePicker from 'expo-image-picker';
import { CameraView, useCameraPermissions } from 'expo-camera';
import * as Haptics from 'expo-haptics';
import { X, Zap, Image as ImageIcon, Settings, Repeat } from 'lucide-react-native';
import { LinearGradient } from 'expo-linear-gradient';
import Colors from '@/constants/colors';
import { analyzeFoodImage } from '@/lib/openai';

export default function ScanScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const params = useLocalSearchParams();
  const isOnboarding = params.onboarding === 'true';
  const [permission, requestPermission] = useCameraPermissions();
  const [facing, setFacing] = useState<'back' | 'front'>('back');
  const [flash, setFlash] = useState<'off' | 'on'>('off');
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const cameraRef = useRef<CameraView>(null);

  const flashAnim = useRef(new Animated.Value(0)).current;
  const pulseAnim = useRef(new Animated.Value(1)).current;

  // Request permissions on mount
  useEffect(() => {
    if (permission && !permission.granted) {
      requestPermission();
    }
  }, [permission, requestPermission]);

  const animateCapture = () => {
    Animated.sequence([
      Animated.timing(flashAnim, {
        toValue: 1,
        duration: 100,
        useNativeDriver: true,
      }),
      Animated.timing(flashAnim, {
        toValue: 0,
        duration: 200,
        useNativeDriver: true,
      }),
    ]).start();
  };

  const startPulse = () => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnim, {
          toValue: 1.1,
          duration: 600,
          useNativeDriver: true,
        }),
        Animated.timing(pulseAnim, {
          toValue: 1,
          duration: 600,
          useNativeDriver: true,
        }),
      ])
    ).start();
  };

  const processImage = async (base64: string | undefined | null, uri: string) => {
    if (!base64) {
      Alert.alert('Error', 'Could not process image data');
      setIsAnalyzing(false);
      pulseAnim.setValue(1);
      return;
    }

    try {
      const result = await analyzeFoodImage(base64);

      router.push({
        pathname: '/scan-results',
        params: {
          imageUri: uri,
          foods: JSON.stringify(result.foods),
          gutScores: JSON.stringify(result.gutScores),
          overallScore: result.overallScore.toString(),
          analysis: JSON.stringify(result.analysis),
          triggers: JSON.stringify(result.triggers),
          swaps: JSON.stringify(result.swaps),
          onboarding: isOnboarding ? 'true' : undefined,
        }
      });
    } catch (error) {
      console.error(error);
      Alert.alert('Analysis Failed', 'Could not analyze the image. Please try again.');
    } finally {
      setIsAnalyzing(false);
      pulseAnim.setValue(1);
    }
  };

  const handleCapture = async () => {
    if (!cameraRef.current) return;
    if (isAnalyzing) return;

    if (Platform.OS !== 'web') {
      await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    }

    animateCapture();
    setIsAnalyzing(true);
    startPulse();

    try {
      const photo = await cameraRef.current.takePictureAsync({
        quality: 0.5,
        base64: true,
        skipProcessing: true,
      });

      if (photo) {
        await processImage(photo.base64, photo.uri);
      }
    } catch (error) {
      console.error('Camera capture failed:', error);
      setIsAnalyzing(false);
      pulseAnim.setValue(1);
      Alert.alert('Error', 'Failed to take photo');
    }
  };

  const handlePickImage = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.5,
      base64: true,
    });

    if (!result.canceled && result.assets[0]) {
      setIsAnalyzing(true);
      startPulse();
      await processImage(result.assets[0].base64, result.assets[0].uri);
    }
  };

  const toggleFlash = () => {
    setFlash(current => (current === 'off' ? 'on' : 'off'));
    if (Platform.OS !== 'web') {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }
  };

  const toggleCameraFacing = () => {
    setFacing(current => (current === 'back' ? 'front' : 'back'));
  };

  if (!permission) {
    // Camera permissions are still loading.
    return <View style={styles.container} />;
  }

  if (!permission.granted) {
    // Camera permissions are not granted yet.
    return (
      <View style={[styles.container, styles.permissionContainer]}>
        <Text style={styles.permissionText}>We need your permission to show the camera</Text>
        <TouchableOpacity style={styles.permissionButton} onPress={requestPermission}>
          <Text style={styles.permissionButtonText}>Grant Permission</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.closeButton} onPress={() => router.back()}>
          <Text style={styles.closeButtonText}>Close</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <CameraView
        style={styles.camera}
        facing={facing}
        flash={flash}
        ref={cameraRef}
      >
        <LinearGradient
          colors={['rgba(0,0,0,0.6)', 'transparent']}
          style={[styles.topOverlay, { paddingTop: insets.top }]}
        >
          <TouchableOpacity
            style={styles.topButton}
            onPress={() => router.back()}
          >
            <X size={24} color={Colors.white} />
          </TouchableOpacity>

          <Text style={styles.headerTitle}>{isOnboarding ? "Scan First Meal" : "GutScore"}</Text>

          <TouchableOpacity
            style={[styles.topButton, flash === 'on' && styles.flashEnabled]}
            onPress={toggleFlash}
          >
            <Zap size={24} color={flash === 'on' ? Colors.warning : Colors.white} />
          </TouchableOpacity>
        </LinearGradient>

        <View style={styles.frameContainer}>
          <View style={styles.frame}>
            <View style={[styles.corner, styles.cornerTL]} />
            <View style={[styles.corner, styles.cornerTR]} />
            <View style={[styles.corner, styles.cornerBL]} />
            <View style={[styles.corner, styles.cornerBR]} />
          </View>
          <Text style={styles.framePrompt}>Position your meal in the frame</Text>
        </View>

        <LinearGradient
          colors={['transparent', 'rgba(0,0,0,0.7)']}
          style={[styles.bottomOverlay, { paddingBottom: insets.bottom + 20 }]}
        >
          <View style={styles.bottomControls}>
            <TouchableOpacity
              style={styles.sideButton}
              onPress={handlePickImage}
            >
              <ImageIcon size={24} color={Colors.white} />
            </TouchableOpacity>

            <Animated.View style={{ transform: [{ scale: pulseAnim }] }}>
              <TouchableOpacity
                style={styles.captureButton}
                onPress={handleCapture}
                activeOpacity={0.8}
                disabled={isAnalyzing}
              >
                <View style={styles.captureInner} />
              </TouchableOpacity>
            </Animated.View>

            <TouchableOpacity
              style={styles.sideButton}
              onPress={toggleCameraFacing}
            >
              <Repeat size={24} color={Colors.white} />
            </TouchableOpacity>
          </View>
        </LinearGradient>

        {isAnalyzing && (
          <View style={styles.analyzingOverlay}>
            <View style={styles.analyzingContent}>
              <Animated.View style={[styles.spinner, { transform: [{ scale: pulseAnim }] }]} />
              <Text style={styles.analyzingText}>Analyzing your meal...</Text>
            </View>
          </View>
        )}

        <Animated.View
          style={[
            styles.flashOverlay,
            { opacity: flashAnim }
          ]}
          pointerEvents="none"
        />
      </CameraView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000',
  },
  permissionContainer: {
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  permissionText: {
    color: Colors.white,
    fontSize: 18,
    textAlign: 'center',
    marginBottom: 20,
  },
  permissionButton: {
    backgroundColor: Colors.primary,
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 8,
    marginBottom: 12,
  },
  permissionButtonText: {
    color: Colors.white,
    fontSize: 16,
    fontWeight: '600',
  },
  closeButton: {
    padding: 12,
  },
  closeButtonText: {
    color: Colors.textTertiary,
    fontSize: 16,
  },
  camera: {
    flex: 1,
  },
  topOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingBottom: 16,
    zIndex: 10,
  },
  topButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: 'rgba(0,0,0,0.3)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  flashEnabled: {
    backgroundColor: 'rgba(244, 162, 97, 0.6)',
  },
  headerTitle: {
    fontSize: 16,
    fontWeight: '600' as const,
    color: Colors.white,
    textShadowColor: 'rgba(0, 0, 0, 0.75)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 3,
  },
  frameContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  frame: {
    width: 280,
    height: 280,
    position: 'relative',
  },
  corner: {
    position: 'absolute',
    width: 30,
    height: 30,
    borderColor: Colors.white,
  },
  cornerTL: {
    top: 0,
    left: 0,
    borderTopWidth: 3,
    borderLeftWidth: 3,
    borderTopLeftRadius: 8,
  },
  cornerTR: {
    top: 0,
    right: 0,
    borderTopWidth: 3,
    borderRightWidth: 3,
    borderTopRightRadius: 8,
  },
  cornerBL: {
    bottom: 0,
    left: 0,
    borderBottomWidth: 3,
    borderLeftWidth: 3,
    borderBottomLeftRadius: 8,
  },
  cornerBR: {
    bottom: 0,
    right: 0,
    borderBottomWidth: 3,
    borderRightWidth: 3,
    borderBottomRightRadius: 8,
  },
  framePrompt: {
    color: Colors.white,
    fontSize: 14,
    marginTop: 24,
    textAlign: 'center',
    textShadowColor: 'rgba(0, 0, 0, 0.75)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 3,
  },
  bottomOverlay: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    paddingTop: 40,
    zIndex: 10,
  },
  bottomControls: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 40,
  },
  sideButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: 'rgba(0,0,0,0.3)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  captureButton: {
    width: 72,
    height: 72,
    borderRadius: 36,
    borderWidth: 4,
    borderColor: Colors.white,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'transparent',
  },
  captureInner: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: Colors.white,
  },
  flashOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: Colors.white,
    zIndex: 100,
  },
  analyzingOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0,0,0,0.8)',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 50,
  },
  analyzingContent: {
    alignItems: 'center',
  },
  spinner: {
    width: 60,
    height: 60,
    borderRadius: 30,
    borderWidth: 3,
    borderColor: Colors.primary,
    borderTopColor: 'transparent',
    marginBottom: 16,
  },
  analyzingText: {
    color: Colors.white,
    fontSize: 16,
    fontWeight: '500' as const,
  },
});
