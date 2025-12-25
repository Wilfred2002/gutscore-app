import { Redirect } from 'expo-router';
import { useApp } from '@/contexts/AppContext';
import { View, ActivityIndicator } from 'react-native';
import Colors from '@/constants/colors';

export default function Index() {
  const { session, isLoading, onboarding } = useApp();

  // Show loading while checking auth
  if (isLoading) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: Colors.backgroundWhite }}>
        <ActivityIndicator size="large" color={Colors.primary} />
      </View>
    );
  }

  // If authenticated and onboarding complete, go to main app
  if (session?.user && onboarding.completed) {
    return <Redirect href="/(tabs)" />;
  }

  // Otherwise, go to onboarding
  return <Redirect href="/onboarding" />;
}
