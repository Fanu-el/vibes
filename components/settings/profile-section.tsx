import * as Clipboard from "expo-clipboard";
import { useRouter } from "expo-router";
import {
    ActivityIndicator,
    Image,
    Pressable,
    StyleSheet,
    View,
} from "react-native";

import { ThemedText } from "@/components/themed-text";
import { env } from "@/config/env";
import { Colors } from "@/constants/theme";
import { User } from "@/features/auth/auth-api";
import { showSuccessToast } from "@/shared/feedback/toast";

type ProfileSectionProps = {
  user: User | undefined;
  isLoading: boolean;
  error: unknown;
};

export function ProfileSection({
  user,
  isLoading,
  error,
}: ProfileSectionProps) {
  const router = useRouter();

  const profilePictureUrl = user?.profilePictureFile?.path
    ? `${env.filePreviewUrl}${user.profilePictureFile.path}`
    : null;

  const hasError = Boolean(error);

  async function handleCopyVibeId() {
    if (user?.vibeId) {
      await Clipboard.setStringAsync(user.vibeId);
      showSuccessToast("Vibe ID copied to clipboard!");
    }
  }

  return (
    <View style={styles.section}>
      <ThemedText type="subtitle" style={styles.sectionTitle}>
        Profile
      </ThemedText>

      {isLoading && (
        <ActivityIndicator size="small" color={Colors.light.tint} />
      )}

      {hasError && (
        <ThemedText style={styles.errorText}>Failed to load profile</ThemedText>
      )}

      {user && (
        <View style={styles.profileInfo}>
          {/* Profile Picture */}
          <View style={styles.pictureRow}>
            {profilePictureUrl ? (
              <Image
                source={{ uri: profilePictureUrl }}
                style={styles.profilePicture}
              />
            ) : (
              <View style={styles.placeholderPicture}>
                <ThemedText style={styles.placeholderText}>
                  {user.firstName?.[0]}
                  {user.lastName?.[0]}
                </ThemedText>
              </View>
            )}
            <Pressable
              style={styles.editButton}
              onPress={() => router.push("/(tabs)/edit-profile")}
            >
              <ThemedText style={styles.editButtonText}>
                Edit Profile
              </ThemedText>
            </Pressable>
          </View>

          <View style={styles.infoRow}>
            <ThemedText style={styles.label}>Name</ThemedText>
            <ThemedText style={styles.value}>
              {user.firstName} {user.lastName}
            </ThemedText>
          </View>

          <View style={styles.infoRow}>
            <ThemedText style={styles.label}>Email</ThemedText>
            <ThemedText style={styles.value}>{user.email}</ThemedText>
          </View>

          <View style={styles.infoRow}>
            <ThemedText style={styles.label}>Vibe ID</ThemedText>
            <View style={styles.vibeIdRow}>
              <ThemedText style={styles.value}>{user.vibeId}</ThemedText>
              <Pressable onPress={handleCopyVibeId} style={styles.copyButton}>
                <ThemedText style={styles.copyIcon}>📋</ThemedText>
              </Pressable>
            </View>
          </View>

          {user.joinDetails?.joinedAt && (
            <View style={styles.infoRow}>
              <ThemedText style={styles.label}>Joined</ThemedText>
              <ThemedText style={styles.value}>
                {new Date(user.joinDetails.joinedAt).toLocaleDateString(
                  "en-US",
                  {
                    year: "numeric",
                    month: "long",
                    day: "numeric",
                  },
                )}
              </ThemedText>
            </View>
          )}
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    marginBottom: 16,
    fontSize: 18,
  },
  profileInfo: {
    gap: 16,
  },
  pictureRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 16,
    paddingBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: Colors.light.border,
  },
  profilePicture: {
    width: 80,
    height: 80,
    borderRadius: 40,
  },
  placeholderPicture: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: Colors.light.tint,
    justifyContent: "center",
    alignItems: "center",
  },
  placeholderText: {
    fontSize: 28,
    fontWeight: "bold",
    color: "#fff",
  },
  editButton: {
    flex: 1,
    backgroundColor: Colors.light.tint,
    padding: 12,
    borderRadius: 8,
    alignItems: "center",
  },
  editButtonText: {
    color: "#fff",
    fontSize: 15,
    fontWeight: "600",
  },
  infoRow: {
    gap: 4,
  },
  vibeIdRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  copyButton: {
    padding: 4,
  },
  copyIcon: {
    fontSize: 18,
  },
  label: {
    fontSize: 13,
    opacity: 0.6,
    textTransform: "uppercase",
    letterSpacing: 0.5,
  },
  value: {
    fontSize: 16,
  },
  errorText: {
    color: "#dc2626",
    fontSize: 14,
  },
});
