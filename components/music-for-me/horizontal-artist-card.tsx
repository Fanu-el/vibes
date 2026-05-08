import type { Artist } from "@/features/music-for-me/music-types";
import React from "react";
import { Image, Pressable, StyleSheet, View } from "react-native";
import { Text, useTheme } from "react-native-paper";

interface HorizontalArtistCardProps {
  item: Artist;
  onPress?: () => void;
  isFavorited?: boolean;
}

export const HorizontalArtistCard: React.FC<HorizontalArtistCardProps> = ({
  item,
  onPress,
  isFavorited,
}) => {
  const theme = useTheme();

  return (
    <Pressable onPress={onPress} style={styles.container}>
      {item.imageUrl && (
        <View>
          <Image source={{ uri: item.imageUrl }} style={styles.image} />
          {isFavorited && (
            <View style={styles.badge}>
              <Text style={styles.badgeIcon}>❤️</Text>
            </View>
          )}
        </View>
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
  name: {
    fontSize: 14,
    fontWeight: "600",
    textAlign: "center",
  },
});
