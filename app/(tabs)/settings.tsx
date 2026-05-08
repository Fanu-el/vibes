import { ProfileSection } from "@/components/settings/profile-section";
import { ThemedText } from "@/components/themed-text";
import { useGetMeQuery, useLogoutMutation } from "@/features/auth/auth-api";
import { deleteAuthTokens } from "@/hooks/use-storage";
import { ConfirmModal } from "@/shared/ui/components/confirm-modal";
import { useRouter } from "expo-router";
import { useState } from "react";
import { Pressable, StyleSheet, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

export default function SettingsScreen() {
  const router = useRouter();
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);

  const { data: user, isLoading, error } = useGetMeQuery();
  const [logout] = useLogoutMutation();

  const handleLogout = async () => {
    try {
      await logout().unwrap();
    } catch (logoutError) {
      // Ignore API errors on logout
    } finally {
      await deleteAuthTokens();
      setShowLogoutConfirm(false);
      router.replace("/(auth)/login");
    }
  };

  return (
    <SafeAreaView style={styles.container} edges={["top"]}>
      <View style={styles.content}>
        <ThemedText type="title" style={styles.title}>
          Settings
        </ThemedText>

        <ProfileSection user={user} isLoading={isLoading} error={error} />

        <View style={styles.spacer} />

        <Pressable
          style={styles.logoutButton}
          onPress={() => setShowLogoutConfirm(true)}
        >
          <ThemedText style={styles.logoutText}>Log Out</ThemedText>
        </Pressable>
      </View>

      <ConfirmModal
        visible={showLogoutConfirm}
        title="Log Out"
        message="Are you sure you want to log out?"
        confirmText="Log Out"
        cancelText="Cancel"
        destructive
        onConfirm={handleLogout}
        onCancel={() => setShowLogoutConfirm(false)}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    flex: 1,
    padding: 24,
  },
  title: {
    marginBottom: 32,
  },
  spacer: {
    flex: 1,
  },
  logoutButton: {
    backgroundColor: "#dc2626",
    padding: 16,
    borderRadius: 8,
    alignItems: "center",
  },
  logoutText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "600",
  },
});
