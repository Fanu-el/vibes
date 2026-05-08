import { Colors } from "@/constants/theme";
import React, { useEffect, useState } from "react";
import { Modal, Pressable, StyleSheet, View } from "react-native";
import { Button, Switch, Text, TextInput } from "react-native-paper";

interface CreateFormModalProps {
  visible: boolean;
  title: string;
  onClose: () => void;
  onSubmit: (values: {
    name: string;
    description: string;
    isPublic: boolean;
  }) => void;
  loading?: boolean;
  initialValues?: {
    name: string;
    description: string;
    isPublic: boolean;
  };
  submitText?: string;
}

export function CreateFormModal({
  visible,
  title,
  onClose,
  onSubmit,
  loading = false,
  initialValues,
  submitText = "Create",
}: CreateFormModalProps) {
  const [name, setName] = useState(initialValues?.name ?? "");
  const [description, setDescription] = useState(initialValues?.description ?? "");
  const [isPublic, setIsPublic] = useState(initialValues?.isPublic ?? false);

  useEffect(() => {
    if (visible) {
      setName(initialValues?.name ?? "");
      setDescription(initialValues?.description ?? "");
      setIsPublic(initialValues?.isPublic ?? false);
    } else {
      setName("");
      setDescription("");
      setIsPublic(false);
    }
  }, [visible, initialValues]);

  const handleSubmit = () => {
    if (!name.trim()) return;
    onSubmit({ name: name.trim(), description: description.trim(), isPublic });
  };

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onClose}
    >
      <Pressable style={styles.overlay} onPress={onClose}>
        <View style={styles.modal} onStartShouldSetResponder={() => true}>
          <Text style={styles.title}>{title}</Text>

          <TextInput
            label="Name"
            value={name}
            onChangeText={setName}
            mode="outlined"
            style={styles.input}
            autoFocus
          />

          <TextInput
            label="Description (optional)"
            value={description}
            onChangeText={setDescription}
            mode="outlined"
            style={styles.input}
            multiline
            numberOfLines={2}
          />

          <View style={styles.switchRow}>
            <Text style={styles.switchLabel}>Make public</Text>
            <Switch value={isPublic} onValueChange={setIsPublic} />
          </View>

          <View style={styles.actions}>
            <Button mode="outlined" onPress={onClose} style={styles.btn}>
              Cancel
            </Button>
            <Button
              mode="contained"
              onPress={handleSubmit}
              loading={loading}
              disabled={!name.trim() || loading}
              style={styles.btn}
            >
              {submitText}
            </Button>
          </View>
        </View>
      </Pressable>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.6)",
    justifyContent: "center",
    alignItems: "center",
    padding: 24,
  },
  modal: {
    backgroundColor: Colors.light.surfaceElevated,
    borderRadius: 16,
    padding: 24,
    width: "100%",
    gap: 12,
  },
  title: {
    fontSize: 18,
    fontWeight: "700",
    color: Colors.light.text,
    marginBottom: 4,
  },
  input: {
    backgroundColor: Colors.light.surface,
  },
  switchRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingVertical: 4,
  },
  switchLabel: {
    fontSize: 15,
    color: Colors.light.text,
  },
  actions: {
    flexDirection: "row",
    gap: 12,
    marginTop: 8,
  },
  btn: {
    flex: 1,
  },
});
