import { MotiView } from "moti";
import React from "react";
import { StyleSheet, View } from "react-native";
import { useTheme } from "react-native-paper";
import { Easing } from "react-native-reanimated";

export const HorizontalArtistSkeleton: React.FC = () => {
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
        style={[styles.image, { backgroundColor }]}
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
        style={[styles.name, { backgroundColor }]}
      />
    </View>
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
  },
  name: {
    width: 100,
    height: 14,
    borderRadius: 4,
  },
});
