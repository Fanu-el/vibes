import { MD3DarkTheme, configureFonts } from "react-native-paper";

import { Colors, Fonts } from "@/constants/theme";

const fontConfig = {
  fontFamily: Fonts.sans,
} as const;

export const paperTheme = {
  ...MD3DarkTheme,
  roundness: 2,
  colors: {
    ...MD3DarkTheme.colors,
    primary: Colors.light.tint,
    secondary: Colors.light.accent,
    background: Colors.light.background,
    surface: Colors.light.surface,
    surfaceVariant: Colors.light.surfaceElevated,
    onSurface: Colors.light.text,
    onSurfaceVariant: Colors.light.mutedText,
    outline: Colors.light.border,
    error: Colors.light.danger,
  },
  fonts: configureFonts({
    config: {
      displayLarge: fontConfig,
      displayMedium: fontConfig,
      displaySmall: fontConfig,
      headlineLarge: fontConfig,
      headlineMedium: fontConfig,
      headlineSmall: fontConfig,
      titleLarge: fontConfig,
      titleMedium: fontConfig,
      titleSmall: fontConfig,
      bodyLarge: fontConfig,
      bodyMedium: fontConfig,
      bodySmall: fontConfig,
      labelLarge: fontConfig,
      labelMedium: fontConfig,
      labelSmall: fontConfig,
    },
  }),
};
