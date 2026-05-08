import { MusicPlayer } from "@/components/player/music-player";
import { PlayerProvider } from "@/context/player-context";
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
import { Stack, router, usePathname } from "expo-router";
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

// Routes where the mini player should not appear
const PLAYER_HIDDEN_ROUTES = ["/settings", "/edit-profile"];

function ConditionalMusicPlayer() {
  const pathname = usePathname();
  const isHidden = PLAYER_HIDDEN_ROUTES.some((route) =>
    pathname.startsWith(route),
  );
  if (isHidden) return null;
  return <MusicPlayer />;
}

function RootNavigator() {
  const colorScheme = useColorScheme();

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
    <ThemeProvider value={theme}>
      <Stack
        screenOptions={{
          contentStyle: {
            backgroundColor: Colors.light.background,
          },
          headerShown: false,
        }}
      >
        <Stack.Screen
          name="(auth)"
          options={{ animation: "fade", headerShown: false }}
        />
        <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
      </Stack>
      <ConditionalMusicPlayer />
      <StatusBar style="light" />
    </ThemeProvider>
  );
}

export default function RootLayout() {
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

  return (
    <SafeAreaProvider>
      <Provider store={store}>
        <PaperProvider theme={paperTheme}>
          <PlayerProvider>
            <RootNavigator />
          </PlayerProvider>
        </PaperProvider>
        <Toast config={toastConfig} />
      </Provider>
    </SafeAreaProvider>
  );
}
