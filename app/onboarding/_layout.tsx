import { Stack } from 'expo-router';

export default function OnboardingLayout() {
  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen name="index" />
      <Stack.Screen name="signup" />
      <Stack.Screen name="quiz" />
      <Stack.Screen name="permissions" />
      <Stack.Screen name="checklist" />
    </Stack>
  );
}
