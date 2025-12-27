import { Stack } from 'expo-router';

export default function OnboardingLayout() {
  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen name="index" />
      <Stack.Screen name="questions" />
      <Stack.Screen name="thank-you" />
      <Stack.Screen name="notification-permission" />
      <Stack.Screen name="completion" />
      <Stack.Screen name="signup" />
      <Stack.Screen name="login" />
      <Stack.Screen name="forgot-password" />
      <Stack.Screen name="quiz" />
      <Stack.Screen name="permissions" />
      <Stack.Screen name="checklist" />
    </Stack>
  );
}
