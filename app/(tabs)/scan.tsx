import { useState, useRef, useEffect } from 'react';
import { StyleSheet, Text, View, TouchableOpacity, Platform, Animated, Alert, Image, ActivityIndicator } from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import * as ImagePicker from 'expo-image-picker';
import { CameraView, useCameraPermissions } from 'expo-camera';
import * as Haptics from 'expo-haptics';
import { X, Zap, Image as ImageIcon, Repeat, Check, RefreshCw } from 'lucide-react-native';
import { LinearGradient } from 'expo-linear-gradient';
import Colors from '@/constants/colors';
import { analyzeFoodImage } from '@/lib/openai';

interface CapturedPhoto {
  uri: string;
  base64: string;
}

export default function ScanScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const params = useLocalSearchParams();
  const isOnboarding = params.onboarding === 'true';
  const [permission, requestPermission] = useCameraPermissions();
  const [facing, setFacing] = useState<'back' | 'front'>('back');
  const [flash, setFlash] = useState<'off' | 'on'>('off');
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [capturedPhoto, setCapturedPhoto] = useState<CapturedPhoto | null>(null);
  const cameraRef = useRef<CameraView>(null);

  const flashAnim = useRef(new Animated.Value(0)).current;
  const pulseAnim = useRef(new Animated.Value(1)).current;
  const spinAnim = useRef(new Animated.Value(0)).current;

  // Request permissions on mount
  useEffect(() => {
    if (permission && !permission.granted) {
      requestPermission();
    }
  }, [permission, requestPermission]);

  // Spin animation for loading
  useEffect(() => {
    if (isAnalyzing) {
      Animated.loop(
        Animated.timing(spinAnim, {
          toValue: 1,
          duration: 1000,
          useNativeDriver: true,
        })
      ).start();
    } else {
      spinAnim.setValue(0);
    }
  }, [isAnalyzing, spinAnim]);

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

  const processImage = async (base64: string, uri: string) => {
    setIsAnalyzing(true);

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
      setCapturedPhoto(null);
    }
  };

  const handleCapture = async () => {
    if (!cameraRef.current) return;

    if (Platform.OS !== 'web') {
      await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    }

    animateCapture();

    try {
      const photo = await cameraRef.current.takePictureAsync({
        quality: 0.5,
        base64: true,
        skipProcessing: true,
      });

      if (photo && photo.base64) {
        // Show preview instead of immediately analyzing
        setCapturedPhoto({
          uri: photo.uri,
          base64: photo.base64,
        });
      }
    } catch (error) {
      console.error('Camera capture failed:', error);
      Alert.alert('Error', 'Failed to take photo');
    }
  };

  const handleConfirmPhoto = () => {
    if (capturedPhoto) {
      if (Platform.OS !== 'web') {
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
      }
      processImage(capturedPhoto.base64, capturedPhoto.uri);
    }
  };

  const handleRetakePhoto = () => {
    if (Platform.OS !== 'web') {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }
    setCapturedPhoto(null);
  };

  const handlePickImage = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.5,
      base64: true,
    });

    if (!result.canceled && result.assets[0] && result.assets[0].base64) {
      // Show preview for picked images too
      setCapturedPhoto({
        uri: result.assets[0].uri,
        base64: result.assets[0].base64,
      });
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

  const spin = spinAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ['0deg', '360deg'],
  });

  if (!permission) {
    return <View style={styles.container} />;
  }

  if (!permission.granted) {
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

  // Photo Preview Screen
  if (capturedPhoto) {
    return (
      <View style={styles.container}>
        <Image source={{ uri: capturedPhoto.uri }} style={styles.previewImage} />

        {/* Top overlay with close button */}
        <LinearGradient
          colors={['rgba(0,0,0,0.6)', 'transparent']}
          style={[styles.topOverlay, { paddingTop: insets.top }]}
        >
          <TouchableOpacity
            style={styles.topButton}
            onPress={handleRetakePhoto}
            disabled={isAnalyzing}
          >
            <X size={24} color={Colors.white} />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Preview</Text>
          <View style={{ width: 44 }} />
        </LinearGradient>

        {/* Bottom overlay with confirm/retake buttons */}
        <LinearGradient
          colors={['transparent', 'rgba(0,0,0,0.8)']}
          style={[styles.previewBottomOverlay, { paddingBottom: insets.bottom + 20 }]}
        >
          {isAnalyzing ? (
            <View style={styles.analyzingContainer}>
              <Animated.View style={[styles.spinnerCircle, { transform: [{ rotate: spin }] }]} />
              <Text style={styles.analyzingText}>Analyzing your meal...</Text>
              <Text style={styles.analyzingSubtext}>This may take a few seconds</Text>
            </View>
          ) : (
            <>
              <Text style={styles.previewPrompt}>Does this look good?</Text>
              <View style={styles.previewButtons}>
                <TouchableOpacity
                  style={styles.retakeButton}
                  onPress={handleRetakePhoto}
                >
                  <RefreshCw size={24} color={Colors.white} />
                  <Text style={styles.retakeButtonText}>Retake</Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={styles.confirmButton}
                  onPress={handleConfirmPhoto}
                >
                  <Check size={24} color={Colors.white} />
                  <Text style={styles.confirmButtonText}>Analyze</Text>
                </TouchableOpacity>
              </View>
            </>
          )}
        </LinearGradient>
      </View>
    );
  }

  // Camera View
  return (
    <View style={styles.container}>
      <CameraView
        style={styles.camera}
        facing={facing}
        flash={flash}
        zoom={0}
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

            <TouchableOpacity
              style={styles.captureButton}
              onPress={handleCapture}
              activeOpacity={0.8}
            >
              <View style={styles.captureInner} />
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.sideButton}
              onPress={toggleCameraFacing}
            >
              <Repeat size={24} color={Colors.white} />
            </TouchableOpacity>
          </View>
        </LinearGradient>

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
  // Preview styles
  previewImage: {
    flex: 1,
    resizeMode: 'cover',
  },
  previewBottomOverlay: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    paddingTop: 30,
    paddingHorizontal: 20,
    zIndex: 10,
  },
  previewPrompt: {
    color: Colors.white,
    fontSize: 18,
    fontWeight: '600',
    textAlign: 'center',
    marginBottom: 20,
    textShadowColor: 'rgba(0, 0, 0, 0.75)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 3,
  },
  previewButtons: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 16,
  },
  retakeButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: 'rgba(255,255,255,0.2)',
    paddingVertical: 16,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.3)',
  },
  retakeButtonText: {
    color: Colors.white,
    fontSize: 16,
    fontWeight: '600',
  },
  confirmButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: Colors.primary,
    paddingVertical: 16,
    borderRadius: 12,
  },
  confirmButtonText: {
    color: Colors.white,
    fontSize: 16,
    fontWeight: '600',
  },
  analyzingContainer: {
    alignItems: 'center',
    paddingVertical: 20,
  },
  spinnerCircle: {
    width: 50,
    height: 50,
    borderRadius: 25,
    borderWidth: 3,
    borderColor: Colors.primary,
    borderTopColor: 'transparent',
    marginBottom: 16,
  },
  analyzingText: {
    color: Colors.white,
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 4,
  },
  analyzingSubtext: {
    color: 'rgba(255,255,255,0.7)',
    fontSize: 14,
  },
});
