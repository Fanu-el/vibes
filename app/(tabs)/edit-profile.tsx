import { zodResolver } from "@hookform/resolvers/zod";
import * as ImagePicker from "expo-image-picker";
import { router } from "expo-router";
import { Controller, useForm } from "react-hook-form";
import {
  ActivityIndicator,
  Image,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  View,
} from "react-native";
import { Button, HelperText, TextInput } from "react-native-paper";
import { SafeAreaView } from "react-native-safe-area-context";
import { z } from "zod";

import { ThemedText } from "@/components/themed-text";
import { env } from "@/config/env";
import { Colors } from "@/constants/theme";
import { useGetMeQuery } from "@/features/auth/auth-api";
import {
  useUpdateProfileMutation,
  useUpdateProfilePictureMutation,
} from "@/features/user/user-api";
import { getApiErrorMessage } from "@/services/api";
import { showErrorToast, showSuccessToast } from "@/shared/feedback/toast";

const updateProfileSchema = z.object({
  firstName: z.string().trim().min(1, "First name is required."),
  lastName: z.string().trim().min(1, "Last name is required."),
});

type UpdateProfileFormValues = z.infer<typeof updateProfileSchema>;

export default function EditProfileScreen() {
  const { data: user, isLoading: isLoadingUser } = useGetMeQuery();
  const [updateProfile, { isLoading: isUpdating }] = useUpdateProfileMutation();
  const [updateProfilePicture, { isLoading: isUploadingPicture }] =
    useUpdateProfilePictureMutation();

  const {
    control,
    handleSubmit,
    formState: { errors },
  } = useForm<UpdateProfileFormValues>({
    defaultValues: {
      firstName: user?.firstName || "",
      lastName: user?.lastName || "",
    },
    values: {
      firstName: user?.firstName || "",
      lastName: user?.lastName || "",
    },
    resolver: zodResolver(updateProfileSchema),
  });

  async function handleUpdateProfile(values: UpdateProfileFormValues) {
    try {
      await updateProfile(values).unwrap();
      showSuccessToast("Profile updated successfully!");
      router.push("/(tabs)/settings");
    } catch (error) {
      showErrorToast(getApiErrorMessage(error));
    }
  }

  async function handlePickImage() {
    const permissionResult =
      await ImagePicker.requestMediaLibraryPermissionsAsync();

    if (!permissionResult.granted) {
      showErrorToast("Permission to access photos is required!");
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: false,
      quality: 0.8,
    });

    if (!result.canceled && result.assets[0]) {
      await uploadProfilePicture(result.assets[0].uri);
    }
  }

  async function uploadProfilePicture(uri: string) {
    try {
      const formData = new FormData();
      const filename = uri.split("/").pop() || "profile.jpg";
      const match = /\.(\w+)$/.exec(filename);
      const type = match ? `image/${match[1]}` : "image/jpeg";

      formData.append("file", {
        uri,
        name: filename,
        type,
      } as any);

      await updateProfilePicture(formData).unwrap();
      showSuccessToast("Profile picture updated!");
    } catch (error) {
      showErrorToast(getApiErrorMessage(error));
    }
  }

  const profilePictureUrl = user?.profilePictureFile?.path
    ? `${env.filePreviewUrl}${user.profilePictureFile.path}`
    : null;

  if (isLoadingUser) {
    return (
      <SafeAreaView style={styles.container} edges={["top"]}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={Colors.light.tint} />
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container} edges={["top"]}>
      <KeyboardAvoidingView
        behavior={Platform.select({ ios: "padding", default: undefined })}
        style={styles.container}
      >
        <ScrollView
          contentContainerStyle={styles.content}
          keyboardShouldPersistTaps="handled"
        >
          <View style={styles.header}>
            <Pressable onPress={() => router.back()}>
              <ThemedText style={styles.backButton}>← Back</ThemedText>
            </Pressable>
            <ThemedText type="title">Edit Profile</ThemedText>
          </View>

          {/* Profile Picture */}
          <View style={styles.pictureSection}>
            <Pressable
              onPress={handlePickImage}
              disabled={isUploadingPicture}
              style={styles.pictureContainer}
            >
              {profilePictureUrl ? (
                <Image
                  source={{ uri: profilePictureUrl }}
                  style={styles.profilePicture}
                />
              ) : (
                <View style={styles.placeholderPicture}>
                  <ThemedText style={styles.placeholderText}>
                    {user?.firstName?.[0]}
                    {user?.lastName?.[0]}
                  </ThemedText>
                </View>
              )}
              {isUploadingPicture && (
                <View style={styles.uploadingOverlay}>
                  <ActivityIndicator size="small" color="#fff" />
                </View>
              )}
            </Pressable>
            <Pressable onPress={handlePickImage} disabled={isUploadingPicture}>
              <ThemedText style={styles.changePictureText}>
                Change Picture
              </ThemedText>
            </Pressable>
          </View>

          {/* Form */}
          <View style={styles.form}>
            <Controller
              control={control}
              name="firstName"
              render={({ field: { onBlur, onChange, value } }) => (
                <View>
                  <TextInput
                    editable={!isUpdating}
                    error={Boolean(errors.firstName)}
                    mode="outlined"
                    onBlur={onBlur}
                    onChangeText={onChange}
                    placeholder="First Name"
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
                    editable={!isUpdating}
                    error={Boolean(errors.lastName)}
                    mode="outlined"
                    onBlur={onBlur}
                    onChangeText={onChange}
                    placeholder="Last Name"
                    value={value}
                  />
                  <HelperText type="error" visible={Boolean(errors.lastName)}>
                    {errors.lastName?.message}
                  </HelperText>
                </View>
              )}
            />

            <Button
              disabled={isUpdating}
              loading={isUpdating}
              mode="contained"
              onPress={handleSubmit(handleUpdateProfile)}
              style={styles.button}
            >
              Save Changes
            </Button>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  content: {
    padding: 24,
    gap: 24,
  },
  header: {
    gap: 16,
  },
  backButton: {
    color: Colors.light.tint,
    fontSize: 16,
  },
  pictureSection: {
    alignItems: "center",
    gap: 12,
  },
  pictureContainer: {
    position: "relative",
  },
  profilePicture: {
    width: 120,
    height: 120,
    borderRadius: 60,
  },
  placeholderPicture: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: Colors.light.tint,
    justifyContent: "center",
    alignItems: "center",
  },
  placeholderText: {
    fontSize: 40,
    fontWeight: "bold",
    color: "#fff",
  },
  uploadingOverlay: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: "rgba(0,0,0,0.5)",
    borderRadius: 60,
    justifyContent: "center",
    alignItems: "center",
  },
  changePictureText: {
    color: Colors.light.tint,
    fontSize: 16,
    fontWeight: "600",
  },
  form: {
    gap: 14,
  },
  button: {
    marginTop: 8,
  },
  successMessage: {
    backgroundColor: Colors.light.successSurface,
    borderRadius: 8,
    padding: 12,
  },
});
