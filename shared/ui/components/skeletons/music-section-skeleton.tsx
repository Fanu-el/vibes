import { MotiView } from "moti";
import React from "react";
import { FlatList, StyleSheet, View } from "react-native";
import { useTheme } from "react-native-paper";
import { Easing } from "react-native-reanimated";
import { HorizontalAlbumSkeleton } from "./horizontal-album-skeleton";
import { HorizontalArtistSkeleton } from "./horizontal-artist-skeleton";
import { HorizontalTrackSkeleton } from "./horizontal-track-skeleton";

interface MusicSectionSkeletonProps {
  type: "track" | "album" | "artist";
  count?: number;
}

export const MusicSectionSkeleton: React.FC<MusicSectionSkeletonProps> = ({
  type,
  count = 5,
}) => {
  const theme = useTheme();
  const isDark = theme.dark;
  const backgroundColor = isDark ? "#2a2a2a" : "#e0e0e0";

  const renderSkeleton = () => {
    switch (type) {
      case "track":
        return <HorizontalTrackSkeleton />;
      case "album":
        return <HorizontalAlbumSkeleton />;
      case "artist":
        return <HorizontalArtistSkeleton />;
    }
  };

  return (
    <View style={styles.section}>
      <View style={styles.titleContainer}>
        <MotiView
          from={{ opacity: 0.3 }}
          animate={{ opacity: 1 }}
          transition={{
            type: "timing",
            duration: 1000,
            easing: Easing.inOut(Easing.ease),
            loop: true,
          }}
          style={[styles.sectionTitle, { backgroundColor }]}
        />
      </View>
      <FlatList
        horizontal
        data={Array(count).fill(0)}
        keyExtractor={(_, index) => `skeleton-${type}-${index}`}
        renderItem={() => renderSkeleton()}
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.horizontalList}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  section: {
    marginTop: 24,
  },
  titleContainer: {
    paddingHorizontal: 16,
    marginBottom: 12,
  },
  sectionTitle: {
    width: 180,
    height: 20,
    borderRadius: 4,
  },
  horizontalList: {
    paddingHorizontal: 16,
  },
});
