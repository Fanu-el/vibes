import { zodResolver } from "@hookform/resolvers/zod";
import { router } from "expo-router";
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
import { z } from "zod";

import { ThemedText } from "@/components/themed-text";
import { useForgotPasswordMutation } from "@/features/auth/auth-api";
import { authStyles } from "@/features/auth/auth-screen-styles";
import { getApiErrorMessage } from "@/services/api";
import { showErrorToast, showSuccessToast } from "@/shared/feedback/toast";

const forgotPasswordSchema = z.object({
  email: z.string().trim().email("Enter a valid email address."),
});

type ForgotPasswordFormValues = z.infer<typeof forgotPasswordSchema>;

export default function ForgotPasswordScreen() {
  const [forgotPassword, { isLoading }] = useForgotPasswordMutation();

  const {
    control,
    handleSubmit,
    formState: { errors },
  } = useForm<ForgotPasswordFormValues>({
    defaultValues: {
      email: "",
    },
    resolver: zodResolver(forgotPasswordSchema),
  });

  async function handleForgotPassword(values: ForgotPasswordFormValues) {
    try {
      const response = await forgotPassword(values).unwrap();
      showSuccessToast(response.message);

      // Navigate to reset password screen after 1 second
      setTimeout(() => {
        router.push({
          pathname: "/(auth)/reset-password",
          params: { email: values.email },
        });
      }, 1000);
    } catch (error) {
      showErrorToast(getApiErrorMessage(error));
    }
  }

  function handleGoToLogin() {
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
            <ThemedText type="title">Forgot Password</ThemedText>
            <ThemedText>
              Enter your email and we&apos;ll send you a verification code to
              reset your password.
            </ThemedText>
          </View>

          <View style={authStyles.form}>
            <Controller
              control={control}
              name="email"
              render={({ field: { onBlur, onChange, value } }) => (
                <View>
                  <TextInput
                    autoCapitalize="none"
                    autoComplete="email"
                    editable={!isLoading}
                    error={Boolean(errors.email)}
                    keyboardType="email-address"
                    mode="outlined"
                    onBlur={onBlur}
                    onChangeText={onChange}
                    placeholder="Email"
                    style={authStyles.input}
                    value={value}
                  />
                  <HelperText type="error" visible={Boolean(errors.email)}>
                    {errors.email?.message}
                  </HelperText>
                </View>
              )}
            />

            <Button
              contentStyle={authStyles.buttonContent}
              disabled={isLoading}
              loading={isLoading}
              mode="contained"
              onPress={handleSubmit(handleForgotPassword)}
              style={authStyles.button}
            >
              Send Code
            </Button>
          </View>

          <Pressable
            onPress={handleGoToLogin}
            style={authStyles.secondaryButton}
          >
            <ThemedText style={authStyles.secondaryButtonText}>
              Back to Login
            </ThemedText>
          </Pressable>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}
