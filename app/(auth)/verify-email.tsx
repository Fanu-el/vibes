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
    useResendVerificationMutation,
    useVerifyEmailMutation,
} from "@/features/auth/auth-api";
import {
    VerifyEmailFormValues,
    verifyEmailSchema,
} from "@/features/auth/auth-schemas";
import { authStyles } from "@/features/auth/auth-screen-styles";
import { getApiErrorMessage } from "@/services/api";
import { showErrorToast, showSuccessToast } from "@/shared/feedback/toast";

export default function VerifyEmailScreen() {
  const params = useLocalSearchParams<{ email?: string; message?: string }>();
  const email = useMemo(() => String(params.email ?? ""), [params.email]);
  const initialMessage = useMemo(
    () =>
      String(params.message ?? "Enter the verification code sent to email."),
    [params.message],
  );
  const [verifyEmail, { isLoading }] = useVerifyEmailMutation();
  const [resendVerification, { isLoading: isResending }] =
    useResendVerificationMutation();
  const {
    control,
    handleSubmit,
    formState: { errors },
  } = useForm<VerifyEmailFormValues>({
    defaultValues: {
      code: "",
    },
    resolver: zodResolver(verifyEmailSchema),
  });

  async function handleVerifyEmail(values: VerifyEmailFormValues) {
    if (!email) {
      showErrorToast("Email is missing. Please register again.");
      return;
    }

    try {
      await verifyEmail({ email, code: values.code }).unwrap();
      router.replace({
        pathname: "/(auth)/login",
        params: { email, firstLogin: "true" },
      });
    } catch (verifyError) {
      showErrorToast(getApiErrorMessage(verifyError));
    }
  }

  async function handleResendCode() {
    if (!email) {
      showErrorToast("Email is missing. Please register again.");
      return;
    }

    try {
      const response = await resendVerification({ email }).unwrap();
      showSuccessToast(response.message);
    } catch (error) {
      showErrorToast(getApiErrorMessage(error));
    }
  }

  function handleGoBack() {
    Keyboard.dismiss();
    router.back();
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
            <ThemedText type="title">Verify email</ThemedText>
            <ThemedText>{initialMessage}</ThemedText>
          </View>

          <View style={authStyles.form}>
            <Controller
              control={control}
              name="code"
              render={({ field: { onBlur, onChange, value } }) => (
                <View>
                  <TextInput
                    editable={!isLoading}
                    error={Boolean(errors.code)}
                    keyboardType="number-pad"
                    maxLength={6}
                    mode="outlined"
                    onBlur={onBlur}
                    onChangeText={(nextValue) =>
                      onChange(nextValue.replace(/\D/g, ""))
                    }
                    placeholder="Verification code"
                    style={[authStyles.input, authStyles.codeInput]}
                    value={value}
                  />
                  <HelperText type="error" visible={Boolean(errors.code)}>
                    {errors.code?.message}
                  </HelperText>
                </View>
              )}
            />

            <Button
              contentStyle={authStyles.buttonContent}
              disabled={isLoading}
              loading={isLoading}
              mode="contained"
              onPress={handleSubmit(handleVerifyEmail)}
              style={authStyles.button}
            >
              Verify email
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

          <Pressable onPress={handleGoBack} style={authStyles.secondaryButton}>
            <ThemedText style={authStyles.secondaryButtonText}>
              ← Back to Register
            </ThemedText>
          </Pressable>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}
