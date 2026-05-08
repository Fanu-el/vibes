import type { Album } from "@/features/music-for-me/music-types";
import React from "react";
import { Image, Pressable, StyleSheet } from "react-native";
import { Text, useTheme } from "react-native-paper";

interface HorizontalAlbumCardProps {
  item: Album;
  onPress?: () => void;
}

export const HorizontalAlbumCard: React.FC<HorizontalAlbumCardProps> = ({
  item,
  onPress,
}) => {
  const theme = useTheme();

  return (
    <Pressable onPress={onPress} style={styles.container}>
      {item.coverUrl && (
        <Image source={{ uri: item.coverUrl }} style={styles.cover} />
      )}
      <Text
        style={[styles.title, { color: theme.colors.onSurface }]}
        numberOfLines={2}
      >
        {item.name}
      </Text>
      <Text
        style={[styles.artist, { color: theme.colors.onSurfaceVariant }]}
        numberOfLines={1}
      >
        {item.artist.name}
      </Text>
    </Pressable>
  );
};

const styles = StyleSheet.create({
  container: {
    width: 140,
    marginRight: 12,
  },
  cover: {
    width: 140,
    height: 140,
    borderRadius: 8,
    marginBottom: 8,
    backgroundColor: "#e0e0e0",
  },
  title: {
    fontSize: 14,
    fontWeight: "600",
    marginBottom: 4,
  },
  artist: {
    fontSize: 12,
  },
});
