import { StyleSheet } from "react-native";

import { Colors, Fonts } from "@/constants/theme";

const palette = Colors.light;

export const authStyles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: palette.background,
  },
  content: {
    flexGrow: 1,
    justifyContent: "center",
    padding: 24,
    gap: 18,
  },
  header: {
    gap: 8,
    marginBottom: 8,
  },
  form: {
    gap: 14,
  },
  input: {
    backgroundColor: palette.surface,
    color: palette.text,
    fontFamily: Fonts.sans,
    fontSize: 16,
  },
  button: {
    backgroundColor: palette.tint,
    borderRadius: 8,
  },
  buttonContent: {
    minHeight: 52,
  },
  buttonDisabled: {
    opacity: 0.62,
  },
  buttonText: {
    color: "#fff",
    fontFamily: Fonts.sansBold,
    fontSize: 16,
  },
  secondaryButton: {
    alignItems: "center",
    minHeight: 44,
    justifyContent: "center",
  },
  secondaryButtonText: {
    color: palette.tint,
    fontFamily: Fonts.sansSemiBold,
    fontSize: 15,
  },
  message: {
    borderRadius: 8,
    padding: 12,
  },
  errorMessage: {
    backgroundColor: palette.dangerSurface,
  },
  successMessage: {
    backgroundColor: palette.successSurface,
  },
  codeInput: {
    letterSpacing: 10,
    textAlign: "center",
  },
});
