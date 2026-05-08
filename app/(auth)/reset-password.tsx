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
import {
    useForgotPasswordMutation,
    useResetPasswordMutation,
} from "@/features/auth/auth-api";
import {
    ResetPasswordFormValues,
    resetPasswordSchema,
} from "@/features/auth/auth-schemas";
import { authStyles } from "@/features/auth/auth-screen-styles";
import { getApiErrorMessage } from "@/services/api";
import { showErrorToast, showSuccessToast } from "@/shared/feedback/toast";

export default function ResetPasswordScreen() {
  const params = useLocalSearchParams<{ email?: string }>();
  const email = useMemo(() => String(params.email ?? ""), [params.email]);
  const [resetPassword, { isLoading }] = useResetPasswordMutation();
  const [forgotPassword, { isLoading: isResending }] =
    useForgotPasswordMutation();

  const {
    control,
    handleSubmit,
    formState: { errors },
  } = useForm<ResetPasswordFormValues>({
    defaultValues: {
      code: "",
      newPassword: "",
      confirmPassword: "",
    },
    resolver: zodResolver(resetPasswordSchema),
  });

  async function handleResetPassword(values: ResetPasswordFormValues) {
    try {
      await resetPassword({
        email,
        code: values.code,
        newPassword: values.newPassword,
      }).unwrap();

      showSuccessToast("Password reset successful! Redirecting to login...");

      setTimeout(() => {
        router.replace({
          pathname: "/(auth)/login",
          params: { email },
        });
      }, 2000);
    } catch (error) {
      showErrorToast(getApiErrorMessage(error));
    }
  }

  async function handleResendCode() {
    if (!email) {
      showErrorToast("Email is missing. Please try again.");
      return;
    }

    try {
      const response = await forgotPassword({ email }).unwrap();
      showSuccessToast(response.message);
    } catch (error) {
      showErrorToast(getApiErrorMessage(error));
    }
  }

  function handleGoToLogin() {
    Keyboard.dismiss();
    router.replace("/(auth)/login");
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
            <ThemedText type="title">Reset Password</ThemedText>
            <ThemedText>
              Enter the verification code sent to {email} and your new password.
            </ThemedText>
          </View>

          <View style={authStyles.form}>
            <Controller
              control={control}
              name="code"
              render={({ field: { onBlur, onChange, value } }) => (
                <View>
                  <TextInput
                    autoCapitalize="none"
                    editable={!isLoading}
                    error={Boolean(errors.code)}
                    keyboardType="number-pad"
                    maxLength={6}
                    mode="outlined"
                    onBlur={onBlur}
                    onChangeText={onChange}
                    placeholder="Verification Code"
                    style={[authStyles.input, authStyles.codeInput]}
                    value={value}
                  />
                  <HelperText type="error" visible={Boolean(errors.code)}>
                    {errors.code?.message}
                  </HelperText>
                </View>
              )}
            />

            <Controller
              control={control}
              name="newPassword"
              render={({ field: { onBlur, onChange, value } }) => (
                <View>
                  <TextInput
                    autoCapitalize="none"
                    autoComplete="new-password"
                    editable={!isLoading}
                    error={Boolean(errors.newPassword)}
                    mode="outlined"
                    onBlur={onBlur}
                    onChangeText={onChange}
                    placeholder="New Password"
                    secureTextEntry
                    style={authStyles.input}
                    value={value}
                  />
                  <HelperText
                    type="error"
                    visible={Boolean(errors.newPassword)}
                  >
                    {errors.newPassword?.message}
                  </HelperText>
                </View>
              )}
            />

            <Controller
              control={control}
              name="confirmPassword"
              render={({ field: { onBlur, onChange, value } }) => (
                <View>
                  <TextInput
                    autoCapitalize="none"
                    autoComplete="new-password"
                    editable={!isLoading}
                    error={Boolean(errors.confirmPassword)}
                    mode="outlined"
                    onBlur={onBlur}
                    onChangeText={onChange}
                    placeholder="Confirm Password"
                    secureTextEntry
                    style={authStyles.input}
                    value={value}
                  />
                  <HelperText
                    type="error"
                    visible={Boolean(errors.confirmPassword)}
                  >
                    {errors.confirmPassword?.message}
                  </HelperText>
                </View>
              )}
            />

            <Button
              contentStyle={authStyles.buttonContent}
              disabled={isLoading}
              loading={isLoading}
              mode="contained"
              onPress={handleSubmit(handleResetPassword)}
              style={authStyles.button}
            >
              Reset Password
            </Button>
          </View>

          <Pressable
            onPress={handleResendCode}
            disabled={isResending}
            style={authStyles.secondaryButton}
          >
            <ThemedText style={authStyles.secondaryButtonText}>
              {isResending ? "Sending..." : "Resend Code"}
            </ThemedText>
          </Pressable>

          <Pressable
            onPress={handleGoToLogin}
            style={authStyles.secondaryButton}
          >
            <ThemedText style={authStyles.secondaryButtonText}>
              ← Back to Login
            </ThemedText>
          </Pressable>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}
