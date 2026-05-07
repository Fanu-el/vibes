import { Redirect, Stack } from "expo-router";

import { Colors } from "@/constants/theme";
import { useAuth } from "@/hooks/use-auth";

export default function AuthLayout() {
  const { isAuthenticated } = useAuth();

  if (isAuthenticated) {
    return <Redirect href="/(tabs)" />;
  }

  return (
    <Stack
      screenOptions={{
        animation: "fade",
        animationDuration: 120,
        contentStyle: {
          backgroundColor: Colors.light.background,
        },
        headerShown: false,
      }}
    />
  );
}
