import {
  Nunito_400Regular,
  Nunito_500Medium,
  Nunito_600SemiBold,
  Nunito_700Bold,
  useFonts,
} from "@expo-google-fonts/nunito";
import {
  DarkTheme,
  DefaultTheme,
  ThemeProvider,
} from "@react-navigation/native";
import { Stack, router } from "expo-router";
import * as SplashScreen from "expo-splash-screen";
import { StatusBar } from "expo-status-bar";
import { useEffect } from "react";
import { PaperProvider } from "react-native-paper";
import "react-native-reanimated";
import { SafeAreaProvider } from "react-native-safe-area-context";
import Toast from "react-native-toast-message";
import { Provider } from "react-redux";
import "../global.css";

import { paperTheme } from "@/constants/paper-theme";
import { Colors, Fonts } from "@/constants/theme";
import { useColorScheme } from "@/hooks/use-color-scheme";
import { setRefreshTokenFailedCallback } from "@/services/api";
import { showErrorToast } from "@/shared/feedback/toast";
import { toastConfig } from "@/shared/feedback/toast-config";
import { store } from "@/store";

SplashScreen.preventAutoHideAsync();

export const unstable_settings = {
  anchor: "(tabs)",
};

const navigationFonts = {
  regular: {
    fontFamily: Fonts.sans,
    fontWeight: "400" as const,
  },
  medium: {
    fontFamily: Fonts.sansMedium,
    fontWeight: "500" as const,
  },
  bold: {
    fontFamily: Fonts.sansBold,
    fontWeight: "700" as const,
  },
  heavy: {
    fontFamily: Fonts.sansBold,
    fontWeight: "700" as const,
  },
};

export default function RootLayout() {
  const colorScheme = useColorScheme();
  const [fontsLoaded] = useFonts({
    Nunito_400Regular,
    Nunito_500Medium,
    Nunito_600SemiBold,
    Nunito_700Bold,
  });

  useEffect(() => {
    if (fontsLoaded) {
      SplashScreen.hideAsync();
    }
  }, [fontsLoaded]);

  useEffect(() => {
    // Set up callback for when refresh token fails
    setRefreshTokenFailedCallback(() => {
      showErrorToast("Your session has expired. Please log in again.");
      setTimeout(() => {
        router.replace("/(auth)/login");
      }, 100);
    });
  }, []);

  if (!fontsLoaded) {
    return null;
  }

  const baseTheme = colorScheme === "dark" ? DarkTheme : DefaultTheme;
  const theme = {
    ...baseTheme,
    colors: {
      ...baseTheme.colors,
      background: Colors.light.background,
      card: Colors.light.background,
      text: Colors.light.text,
      border: Colors.light.border,
      primary: Colors.light.tint,
    },
    fonts: navigationFonts,
  };

  return (
    <SafeAreaProvider>
      <Provider store={store}>
        <PaperProvider theme={paperTheme}>
          <ThemeProvider value={theme}>
            <Stack
              screenOptions={{
                contentStyle: {
                  backgroundColor: Colors.light.background,
                },
              }}
            >
              <Stack.Screen
                name="(auth)"
                options={{ animation: "fade", headerShown: false }}
              />
              <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
            </Stack>
            <StatusBar style="light" />
          </ThemeProvider>
        </PaperProvider>
        <Toast config={toastConfig} />
      </Provider>
    </SafeAreaProvider>
  );
}
