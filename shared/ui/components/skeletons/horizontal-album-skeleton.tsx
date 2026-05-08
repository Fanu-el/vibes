import { MotiView } from "moti";
import React from "react";
import { StyleSheet, View } from "react-native";
import { useTheme } from "react-native-paper";
import { Easing } from "react-native-reanimated";

export const HorizontalAlbumSkeleton: React.FC = () => {
  const theme = useTheme();
  const isDark = theme.dark;
  const backgroundColor = isDark ? "#2a2a2a" : "#e0e0e0";

  return (
    <View style={styles.container}>
      <MotiView
        from={{ opacity: 0.3 }}
        animate={{ opacity: 1 }}
        transition={{
          type: "timing",
          duration: 1000,
          easing: Easing.inOut(Easing.ease),
          loop: true,
        }}
        style={[styles.cover, { backgroundColor }]}
      />
      <MotiView
        from={{ opacity: 0.3 }}
        animate={{ opacity: 1 }}
        transition={{
          type: "timing",
          duration: 1000,
          easing: Easing.inOut(Easing.ease),
          loop: true,
          delay: 100,
        }}
        style={[styles.title, { backgroundColor }]}
      />
      <MotiView
        from={{ opacity: 0.3 }}
        animate={{ opacity: 1 }}
        transition={{
          type: "timing",
          duration: 1000,
          easing: Easing.inOut(Easing.ease),
          loop: true,
          delay: 200,
        }}
        style={[styles.artist, { backgroundColor }]}
      />
    </View>
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
  },
  title: {
    width: 120,
    height: 14,
    borderRadius: 4,
    marginBottom: 6,
  },
  artist: {
    width: 90,
    height: 12,
    borderRadius: 4,
  },
});
