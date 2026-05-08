import type { Track } from "@/features/music-for-me/music-types";
import React from "react";
import { Image, Pressable, StyleSheet, View } from "react-native";
import { Text, useTheme } from "react-native-paper";

interface HorizontalTrackCardProps {
  item: Track;
  onPress?: () => void;
  isLiked?: boolean;
}

export const HorizontalTrackCard: React.FC<HorizontalTrackCardProps> = ({
  item,
  onPress,
  isLiked,
}) => {
  const theme = useTheme();

  return (
    <Pressable onPress={onPress} style={styles.container}>
      {item.coverUrl && (
        <View>
          <Image source={{ uri: item.coverUrl }} style={styles.cover} />
          {isLiked && (
            <View style={styles.badge}>
              <Text style={styles.badgeIcon}>❤️</Text>
            </View>
          )}
        </View>
      )}
      <Text
        style={[styles.title, { color: theme.colors.onSurface }]}
        numberOfLines={2}
      >
        {item.title}
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
  badge: {
    position: "absolute",
    top: 8,
    right: 8,
    backgroundColor: "rgba(0,0,0,0.5)",
    borderRadius: 12,
    padding: 4,
  },
  badgeIcon: {
    fontSize: 12,
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
