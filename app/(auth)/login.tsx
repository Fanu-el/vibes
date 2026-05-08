import { zodResolver } from "@hookform/resolvers/zod";
import { router, useLocalSearchParams } from "expo-router";
import { useMemo } from "react";
import { Controller, useForm } from "react-hook-form";
import {
    Keyboard,
    KeyboardAvoidingView,
    Platform,
    Pressable,
    ScrollView,
    View,
} from "react-native";
import { Button, HelperText, TextInput } from "react-native-paper";
import { SafeAreaView } from "react-native-safe-area-context";

import { ThemedText } from "@/components/themed-text";
import { useLoginMutation } from "@/features/auth/auth-api";
import { LoginFormValues, loginSchema } from "@/features/auth/auth-schemas";
import { authStyles } from "@/features/auth/auth-screen-styles";
import { setAuthTokens } from "@/hooks/use-storage";
import { getApiErrorMessage } from "@/services/api";
import { showErrorToast } from "@/shared/feedback/toast";

export default function LoginScreen() {
  const params = useLocalSearchParams<{
    email?: string;
    firstLogin?: string;
  }>();
  const initialIdentifier = useMemo(
    () => String(params.email ?? ""),
    [params.email],
  );
  const isFirstLogin = params.firstLogin === "true";
  const [login, { isLoading }] = useLoginMutation();
  const {
    control,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginFormValues>({
    defaultValues: {
      identifier: initialIdentifier,
      password: "",
    },
    resolver: zodResolver(loginSchema),
  });

  async function handleLogin(values: LoginFormValues) {
    try {
      const tokens = await login(values).unwrap();
      await setAuthTokens(tokens);
      router.replace("/(tabs)");
    } catch (loginError) {
      showErrorToast(getApiErrorMessage(loginError));
    }
  }

  function handleGoToRegister() {
    Keyboard.dismiss();
    router.replace("/(auth)/register");
  }

  function handleGoToForgotPassword() {
    Keyboard.dismiss();
    router.push("/(auth)/forgot-password");
  }

  return (
    <SafeAreaView style={authStyles.screen} edges={["top", "bottom"]}>
      <KeyboardAvoidingView
        behavior={Platform.select({ ios: "padding", default: undefined })}
        className="flex-1"
        style={authStyles.screen}
      >
        <ScrollView
          contentContainerStyle={authStyles.content}
          keyboardShouldPersistTaps="handled"
        >
          <View style={authStyles.header}>
            <ThemedText type="title">Log in</ThemedText>
            <ThemedText>
              {isFirstLogin
                ? "Your email is verified. Log in once to finish setup."
                : "Use your email or Vibe ID to continue."}
            </ThemedText>
          </View>

          <View style={authStyles.form}>
            <Controller
              control={control}
              name="identifier"
              render={({ field: { onBlur, onChange, value } }) => (
                <View>
                  <TextInput
                    autoCapitalize="none"
                    autoComplete="email"
                    editable={!isLoading}
                    error={Boolean(errors.identifier)}
                    mode="outlined"
                    onBlur={onBlur}
                    onChangeText={onChange}
                    placeholder="Email or Vibe ID"
                    style={authStyles.input}
                    value={value}
                  />
                  <HelperText type="error" visible={Boolean(errors.identifier)}>
                    {errors.identifier?.message}
                  </HelperText>
                </View>
              )}
            />

            <Controller
              control={control}
              name="password"
              render={({ field: { onBlur, onChange, value } }) => (
                <View>
                  <TextInput
                    autoCapitalize="none"
                    autoComplete="current-password"
                    editable={!isLoading}
                    error={Boolean(errors.password)}
                    mode="outlined"
                    onBlur={onBlur}
                    onChangeText={onChange}
                    placeholder="Password"
                    secureTextEntry
                    style={authStyles.input}
                    value={value}
                  />
                  <HelperText type="error" visible={Boolean(errors.password)}>
                    {errors.password?.message}
                  </HelperText>
                </View>
              )}
            />

            <Button
              contentStyle={authStyles.buttonContent}
              disabled={isLoading}
              loading={isLoading}
              mode="contained"
              onPress={handleSubmit(handleLogin)}
              style={authStyles.button}
            >
              Log in
            </Button>
          </View>

          <Pressable
            onPress={handleGoToForgotPassword}
            style={authStyles.secondaryButton}
          >
            <ThemedText style={authStyles.secondaryButtonText}>
              Forgot Password?
            </ThemedText>
          </Pressable>

          <Pressable
            onPress={handleGoToRegister}
            style={authStyles.secondaryButton}
          >
            <ThemedText style={authStyles.secondaryButtonText}>
              Need an account? Register
            </ThemedText>
          </Pressable>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}
