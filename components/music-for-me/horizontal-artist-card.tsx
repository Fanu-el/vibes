import type { Artist } from "@/features/music-for-me/music-types";
import React from "react";
import { Image, Pressable, StyleSheet } from "react-native";
import { Text, useTheme } from "react-native-paper";

interface HorizontalArtistCardProps {
  item: Artist;
  onPress?: () => void;
}

export const HorizontalArtistCard: React.FC<HorizontalArtistCardProps> = ({
  item,
  onPress,
}) => {
  const theme = useTheme();

  return (
    <Pressable onPress={onPress} style={styles.container}>
      {item.imageUrl && (
        <Image source={{ uri: item.imageUrl }} style={styles.image} />
      )}
      <Text
        style={[styles.name, { color: theme.colors.onSurface }]}
        numberOfLines={2}
      >
        {item.name}
      </Text>
    </Pressable>
  );
};

const styles = StyleSheet.create({
  container: {
    width: 140,
    marginRight: 12,
    alignItems: "center",
  },
  image: {
    width: 140,
    height: 140,
    borderRadius: 70,
    marginBottom: 8,
    backgroundColor: "#e0e0e0",
  },
  name: {
    fontSize: 14,
    fontWeight: "600",
    textAlign: "center",
  },
});
