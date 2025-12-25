import { StyleSheet, Text, View, TouchableOpacity } from 'react-native';
import { useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Check, Camera, AlertCircle, Bell, Users, Crown } from 'lucide-react-native';
import Colors from '@/constants/colors';
import { useApp } from '@/contexts/AppContext';
import React from "react";

interface ChecklistItemType {
  id: string;
  label: string;
  key: 'scannedFirstMeal' | 'loggedSymptom' | 'setupNotifications' | 'invitedFriend' | 'upgradedToPro';
  icon: React.ReactNode;
}

const checklistItems: ChecklistItemType[] = [
  { id: '1', label: 'Scan your first meal', key: 'scannedFirstMeal', icon: <Camera size={20} color={Colors.primary} /> },
  { id: '2', label: 'Log a symptom', key: 'loggedSymptom', icon: <AlertCircle size={20} color={Colors.primary} /> },
  { id: '3', label: 'Set up notifications', key: 'setupNotifications', icon: <Bell size={20} color={Colors.primary} /> },
  { id: '4', label: 'Invite a friend', key: 'invitedFriend', icon: <Users size={20} color={Colors.primary} /> },
  { id: '5', label: 'Upgrade to Pro', key: 'upgradedToPro', icon: <Crown size={20} color={Colors.primary} /> },
];

export default function ChecklistScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { session, onboarding, completeOnboarding } = useApp();

  const completedCount = Object.values(onboarding.checklistItems).filter(Boolean).length;
  const progress = (completedCount / checklistItems.length) * 100;

  const handleStartScanning = async () => {
    // Check if user is authenticated
    if (!session?.user) {
      // Not authenticated, redirect to signup
      router.replace('/onboarding/signup');
      return;
    }

    // Complete onboarding and go to main app
    await completeOnboarding();
    router.replace('/(tabs)');
  };

  const isItemCompleted = (key: ChecklistItemType['key']) => {
    return onboarding.checklistItems[key];
  };

  return (
    <View style={[styles.container, { paddingTop: insets.top + 20, paddingBottom: insets.bottom + 20 }]}>
      <View style={styles.header}>
        <Text style={styles.title}>Let&apos;s Get Started</Text>
        <Text style={styles.progressText}>You&apos;re {completedCount}/{checklistItems.length} complete</Text>
        <View style={styles.progressBar}>
          <View style={[styles.progressFill, { width: `${progress}%` }]} />
        </View>
      </View>

      <View style={styles.checklist}>
        {checklistItems.map((item) => {
          const completed = isItemCompleted(item.key);
          return (
            <TouchableOpacity
              key={item.id}
              style={[styles.checklistItem, completed && styles.checklistItemCompleted]}
              activeOpacity={0.7}
            >
              <View style={[styles.checkIcon, completed && styles.checkIconCompleted]}>
                {completed ? (
                  <Check size={16} color={Colors.white} />
                ) : (
                  item.icon
                )}
              </View>
              <Text style={[styles.checklistText, completed && styles.checklistTextCompleted]}>
                {item.label}
              </Text>
            </TouchableOpacity>
          );
        })}
      </View>

      <View style={styles.footer}>
        <TouchableOpacity
          style={styles.primaryButton}
          onPress={handleStartScanning}
          activeOpacity={0.8}
        >
          <Camera size={20} color={Colors.white} style={styles.buttonIcon} />
          <Text style={styles.primaryButtonText}>Scan Your Breakfast</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
    paddingHorizontal: 24,
  },
  header: {
    marginBottom: 24,
  },
  title: {
    fontSize: 28,
    fontWeight: '700' as const,
    color: Colors.text,
    marginBottom: 8,
  },
  progressText: {
    fontSize: 12,
    color: Colors.textSecondary,
    marginBottom: 12,
  },
  progressBar: {
    height: 6,
    backgroundColor: Colors.border,
    borderRadius: 3,
  },
  progressFill: {
    height: '100%',
    backgroundColor: Colors.primary,
    borderRadius: 3,
  },
  checklist: {
    gap: 12,
  },
  checklistItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.backgroundWhite,
    padding: 16,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 1,
  },
  checklistItemCompleted: {
    opacity: 1,
  },
  checkIcon: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: Colors.background,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  checkIconCompleted: {
    backgroundColor: Colors.success,
  },
  checklistText: {
    fontSize: 16,
    color: Colors.text,
    flex: 1,
  },
  checklistTextCompleted: {
    color: Colors.success,
    fontWeight: '500' as const,
  },
  footer: {
    marginTop: 'auto',
    paddingTop: 24,
  },
  primaryButton: {
    backgroundColor: Colors.primary,
    height: 56,
    borderRadius: 12,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
  },
  buttonIcon: {
    marginRight: 8,
  },
  primaryButtonText: {
    color: Colors.white,
    fontSize: 17,
    fontWeight: '600' as const,
  },
});
