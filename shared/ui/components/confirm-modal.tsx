import { ThemedText } from "@/components/themed-text";
import { Colors } from "@/constants/theme";
import { Modal, Pressable, StyleSheet, View } from "react-native";

type ConfirmModalProps = {
  visible: boolean;
  title: string;
  message: string;
  confirmText?: string;
  cancelText?: string;
  onConfirm: () => void;
  onCancel: () => void;
  destructive?: boolean;
};

export function ConfirmModal({
  visible,
  title,
  message,
  confirmText = "Confirm",
  cancelText = "Cancel",
  onConfirm,
  onCancel,
  destructive = false,
}: ConfirmModalProps) {
  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onCancel}
    >
      <Pressable style={styles.overlay} onPress={onCancel}>
        <View style={styles.modal} onStartShouldSetResponder={() => true}>
          <ThemedText type="subtitle" style={styles.title}>
            {title}
          </ThemedText>
          <ThemedText style={styles.message}>{message}</ThemedText>

          <View style={styles.actions}>
            <Pressable style={styles.cancelButton} onPress={onCancel}>
              <ThemedText style={styles.cancelText}>{cancelText}</ThemedText>
            </Pressable>

            <Pressable
              style={[
                styles.confirmButton,
                destructive && styles.destructiveButton,
              ]}
              onPress={onConfirm}
            >
              <ThemedText
                style={[
                  styles.confirmText,
                  destructive && styles.destructiveText,
                ]}
              >
                {confirmText}
              </ThemedText>
            </Pressable>
          </View>
        </View>
      </Pressable>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    justifyContent: "center",
    alignItems: "center",
    padding: 24,
  },
  modal: {
    backgroundColor: Colors.light.background,
    borderRadius: 12,
    padding: 24,
    width: "100%",
    maxWidth: 400,
    gap: 16,
  },
  title: {
    fontSize: 18,
  },
  message: {
    fontSize: 15,
    lineHeight: 22,
    opacity: 0.8,
  },
  actions: {
    flexDirection: "row",
    gap: 12,
    marginTop: 8,
  },
  cancelButton: {
    flex: 1,
    padding: 14,
    borderRadius: 8,
    alignItems: "center",
    backgroundColor: Colors.light.surface,
  },
  cancelText: {
    fontSize: 16,
    fontWeight: "600",
  },
  confirmButton: {
    flex: 1,
    padding: 14,
    borderRadius: 8,
    alignItems: "center",
    backgroundColor: Colors.light.tint,
  },
  confirmText: {
    fontSize: 16,
    fontWeight: "600",
    color: "#fff",
  },
  destructiveButton: {
    backgroundColor: "#dc2626",
  },
  destructiveText: {
    color: "#fff",
  },
});
