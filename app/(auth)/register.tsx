import { zodResolver } from "@hookform/resolvers/zod";
import * as Device from "expo-device";
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

import { ThemedText } from "@/components/themed-text";
import { useRegisterMutation } from "@/features/auth/auth-api";
import {
    RegisterFormValues,
    registerSchema,
} from "@/features/auth/auth-schemas";
import { authStyles } from "@/features/auth/auth-screen-styles";
import { getApiErrorMessage } from "@/services/api";
import { showErrorToast } from "@/shared/feedback/toast";

export default function RegisterScreen() {
  const [register, { isLoading }] = useRegisterMutation();
  const {
    control,
    handleSubmit,
    formState: { errors },
  } = useForm<RegisterFormValues>({
    defaultValues: {
      email: "",
      password: "",
      confirmPassword: "",
      firstName: "",
      lastName: "",
    },
    resolver: zodResolver(registerSchema),
  });

  async function handleRegister(values: RegisterFormValues) {
    try {
      const joinDevice = {
        deviceName: Device.deviceName,
        deviceType: Device.deviceType?.toString() || null,
        osName: Device.osName,
        osVersion: Device.osVersion,
        modelName: Device.modelName,
        brand: Device.brand,
      };

      const response = await register({ ...values, joinDevice }).unwrap();

      router.push({
        pathname: "/(auth)/verify-email",
        params: { email: values.email, message: response.message },
      });
    } catch (registerError) {
      showErrorToast(getApiErrorMessage(registerError));
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
            <ThemedText type="title">Create account</ThemedText>
            <ThemedText>
              Join Vibes and verify your email to start using your account.
            </ThemedText>
          </View>

          <View style={authStyles.form}>
            <Controller
              control={control}
              name="firstName"
              render={({ field: { onBlur, onChange, value } }) => (
                <View>
                  <TextInput
                    autoCapitalize="words"
                    autoComplete="given-name"
                    editable={!isLoading}
                    error={Boolean(errors.firstName)}
                    mode="outlined"
                    onBlur={onBlur}
                    onChangeText={onChange}
                    placeholder="First name"
                    style={authStyles.input}
                    value={value}
                  />
                  <HelperText type="error" visible={Boolean(errors.firstName)}>
                    {errors.firstName?.message}
                  </HelperText>
                </View>
              )}
            />

            <Controller
              control={control}
              name="lastName"
              render={({ field: { onBlur, onChange, value } }) => (
                <View>
                  <TextInput
                    autoCapitalize="words"
                    autoComplete="family-name"
                    editable={!isLoading}
                    error={Boolean(errors.lastName)}
                    mode="outlined"
                    onBlur={onBlur}
                    onChangeText={onChange}
                    placeholder="Last name"
                    style={authStyles.input}
                    value={value}
                  />
                  <HelperText type="error" visible={Boolean(errors.lastName)}>
                    {errors.lastName?.message}
                  </HelperText>
                </View>
              )}
            />

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

            <Controller
              control={control}
              name="password"
              render={({ field: { onBlur, onChange, value } }) => (
                <View>
                  <TextInput
                    autoCapitalize="none"
                    autoComplete="new-password"
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
              onPress={handleSubmit(handleRegister)}
              style={authStyles.button}
            >
              Create account
            </Button>
          </View>

          <Pressable
            onPress={handleGoToLogin}
            style={authStyles.secondaryButton}
          >
            <ThemedText style={authStyles.secondaryButtonText}>
              Already have an account? Log in
            </ThemedText>
          </Pressable>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}
