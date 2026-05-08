import { IconSymbol } from "@/components/ui/icon-symbol";
import type { Playlist } from "@/features/music-me/music-me-types";
import React from "react";
import { Pressable, StyleSheet, View } from "react-native";
import { IconButton, Text, useTheme } from "react-native-paper";

interface PlaylistCardProps {
  item: Playlist;
  onPress: () => void;
  onDelete: () => void;
}

export function PlaylistCard({ item, onPress, onDelete }: PlaylistCardProps) {
  const theme = useTheme();
  return (
    <Pressable
      style={[styles.card, { backgroundColor: theme.colors.surfaceVariant }]}
      onPress={onPress}
    >
      <View style={styles.cardIconContainer}>
        <IconSymbol
          name="music.note.list.fill"
          size={28}
          color={theme.colors.secondary}
        />
      </View>
      <View style={styles.cardInfo}>
        <Text
          style={[styles.cardTitle, { color: theme.colors.onSurface }]}
          numberOfLines={1}
        >
          {item.name}
        </Text>
        <Text
          style={[styles.cardMeta, { color: theme.colors.onSurfaceVariant }]}
        >
          {item.trackCount} {item.trackCount === 1 ? "track" : "tracks"} • {item.isPublic ? "Public" : "Private"}
        </Text>
      </View>
      <View style={styles.actionContainer}>
        <IconButton
          icon="delete"
          size={18}
          iconColor={theme.colors.error}
          onPress={onDelete}
          style={styles.deleteBtn}
        />
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  card: {
    width: 140,
    marginRight: 12,
    borderRadius: 12,
    padding: 16,
    alignItems: "center",
  },
  cardIconContainer: {
    width: 64,
    height: 64,
    borderRadius: 16,
    backgroundColor: "rgba(20,184,166,0.12)",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 12,
  },
  cardInfo: { alignItems: "center" },
  cardTitle: { fontSize: 14, fontWeight: "600", marginBottom: 4, textAlign: "center" },
  cardMeta: { fontSize: 12, textAlign: "center" },
  actionContainer: {
    position: "absolute",
    top: 4,
    right: 4,
  },
  deleteBtn: {
    margin: 0,
  }
});
