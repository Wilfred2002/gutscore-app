import { useState, useRef } from 'react';
import { StyleSheet, Text, View, TouchableOpacity, Platform, Animated } from 'react-native';
import { useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import * as ImagePicker from 'expo-image-picker';
import * as Haptics from 'expo-haptics';
import { X, Zap, Image as ImageIcon, Settings } from 'lucide-react-native';
import { LinearGradient } from 'expo-linear-gradient';
import Colors from '@/constants/colors';

export default function ScanScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const [flashEnabled, setFlashEnabled] = useState(false);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const flashAnim = useRef(new Animated.Value(0)).current;
  const pulseAnim = useRef(new Animated.Value(1)).current;

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

  const handleCapture = async () => {
    if (Platform.OS !== 'web') {
      await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    }
    
    animateCapture();
    setIsAnalyzing(true);
    startPulse();

    setTimeout(() => {
      setIsAnalyzing(false);
      pulseAnim.setValue(1);
      router.push('/scan-results');
    }, 2000);
  };

  const handlePickImage = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.8,
    });

    if (!result.canceled) {
      setIsAnalyzing(true);
      startPulse();
      
      setTimeout(() => {
        setIsAnalyzing(false);
        pulseAnim.setValue(1);
        router.push('/scan-results');
      }, 2000);
    }
  };

  const toggleFlash = () => {
    setFlashEnabled(!flashEnabled);
    if (Platform.OS !== 'web') {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.cameraPlaceholder}>
        <LinearGradient
          colors={['#1a1a1a', '#2d2d2d', '#1a1a1a']}
          style={StyleSheet.absoluteFill}
        />
        
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
          
          <Text style={styles.headerTitle}>GutScore</Text>
          
          <TouchableOpacity 
            style={[styles.topButton, flashEnabled && styles.flashEnabled]}
            onPress={toggleFlash}
          >
            <Zap size={24} color={flashEnabled ? Colors.warning : Colors.white} />
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
          <Text style={styles.frameSubtext}>Make sure lighting is good</Text>
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

            <TouchableOpacity style={styles.sideButton}>
              <Settings size={24} color={Colors.white} />
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
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000',
  },
  cameraPlaceholder: {
    flex: 1,
    position: 'relative',
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
    backgroundColor: 'rgba(255,255,255,0.1)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  flashEnabled: {
    backgroundColor: 'rgba(244, 162, 97, 0.3)',
  },
  headerTitle: {
    fontSize: 16,
    fontWeight: '600' as const,
    color: Colors.white,
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
  },
  frameSubtext: {
    color: 'rgba(255,255,255,0.6)',
    fontSize: 12,
    marginTop: 4,
    textAlign: 'center',
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
    backgroundColor: 'rgba(255,255,255,0.1)',
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
