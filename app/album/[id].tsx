import { TrackCard } from "@/components/music-for-me/track-card";
import { IconSymbol } from "@/components/ui/icon-symbol";
import { useGetAlbumTracksQuery } from "@/features/music-for-me/music-details-api";
import type { Track } from "@/features/music-for-me/music-types";
import { useLocalSearchParams, useRouter } from "expo-router";
import React, { useCallback, useState } from "react";
import { FlatList, Image, Pressable, StyleSheet, View } from "react-native";
import { ActivityIndicator, Divider, Text, useTheme } from "react-native-paper";
import { SafeAreaView } from "react-native-safe-area-context";

const ITEMS_PER_PAGE = 20;

export default function AlbumDetailScreen() {
  const theme = useTheme();
  const router = useRouter();
  const { id, name, artistName, coverUrl, releaseDate } = useLocalSearchParams<{
    id: string;
    name: string;
    artistName: string;
    coverUrl?: string;
    releaseDate?: string;
  }>();

  const [offset, setOffset] = useState(0);
  const [allTracks, setAllTracks] = useState<Track[]>([]);
  const [hasMore, setHasMore] = useState(true);

  const { data, isLoading, error } = useGetAlbumTracksQuery({
    albumId: id,
    limit: ITEMS_PER_PAGE,
    offset,
  });

  React.useEffect(() => {
    if (data?.items) {
      if (offset === 0) {
        setAllTracks(data.items);
      } else {
        setAllTracks((prev) => [...prev, ...data.items]);
      }
      setHasMore(data.items.length > 0);
    }
  }, [data, offset]);

  const loadMore = useCallback(() => {
    if (hasMore && !isLoading) {
      setOffset((prev) => prev + 1);
    }
  }, [hasMore, isLoading]);

  const renderFooter = () => {
    if (!isLoading) return null;
    return (
      <View style={styles.footer}>
        <ActivityIndicator size="small" />
      </View>
    );
  };

  return (
    <SafeAreaView
      style={[styles.container, { backgroundColor: theme.colors.background }]}
    >
      {/* Custom Header */}
      <View style={styles.customHeader}>
        <Pressable onPress={() => router.back()} style={styles.backButton}>
          <IconSymbol
            name="chevron.left"
            size={24}
            color={theme.colors.primary}
          />
        </Pressable>
        <Text
          style={[styles.headerTitle, { color: theme.colors.onSurface }]}
          numberOfLines={1}
        >
          Album
        </Text>
        <View style={styles.backButton} />
      </View>

      <FlatList
        data={allTracks}
        keyExtractor={(item, index) => `${item.id}-${index}`}
        ListHeaderComponent={
          <>
            <View style={styles.header}>
              {coverUrl && (
                <Image source={{ uri: coverUrl }} style={styles.albumCover} />
              )}
              <Text
                style={[styles.albumName, { color: theme.colors.onSurface }]}
              >
                {name}
              </Text>
              <Text
                style={[
                  styles.artistName,
                  { color: theme.colors.onSurfaceVariant },
                ]}
              >
                {artistName}
              </Text>
              {releaseDate && (
                <Text
                  style={[
                    styles.metaText,
                    { color: theme.colors.onSurfaceVariant },
                  ]}
                >
                  Released: {releaseDate}
                </Text>
              )}
              {data && (
                <Text
                  style={[
                    styles.paginationText,
                    { color: theme.colors.onSurfaceVariant },
                  ]}
                >
                  {allTracks.length} of {data.total} tracks
                </Text>
              )}
            </View>
            <Divider />
          </>
        }
        renderItem={({ item, index }) => (
          <View style={styles.trackRow}>
            <Text
              style={[
                styles.trackNumber,
                { color: theme.colors.onSurfaceVariant },
              ]}
            >
              {index + 1}
            </Text>
            <View style={{ flex: 1 }}>
              <TrackCard
                item={item}
                onPress={() => {
                  router.push({
                    pathname: "/track/[id]",
                    params: {
                      id: item.id,
                      title: item.title,
                      artistId: item.artist.id,
                      artistName: item.artist.name,
                      albumId: item.album?.id || "",
                      albumName: item.album?.name || "",
                      coverUrl: item.coverUrl || "",
                      duration: item.duration.toString(),
                      releaseDate: item.releaseDate || "",
                      license: item.license || "",
                      streamUrl: item.streamUrl || "",
                      genres: item.tags?.genres?.join(",") || "",
                      instruments: item.tags?.instruments?.join(",") || "",
                      mood: item.tags?.mood?.join(",") || "",
                      speed: item.tags?.speed || "",
                      vocalType: item.tags?.vocalType || "",
                    },
                  });
                }}
              />
            </View>
          </View>
        )}
        ListEmptyComponent={
          !isLoading && !error ? (
            <View style={styles.emptyContainer}>
              <Text style={styles.emptyText}>No tracks available</Text>
            </View>
          ) : null
        }
        ListFooterComponent={renderFooter}
        onEndReached={loadMore}
        onEndReachedThreshold={0.5}
        contentContainerStyle={styles.content}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  customHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  backButton: {
    width: 40,
    height: 40,
    justifyContent: "center",
    alignItems: "center",
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: "600",
    flex: 1,
    textAlign: "center",
  },
  header: {
    alignItems: "center",
    padding: 24,
  },
  albumCover: {
    width: 200,
    height: 200,
    borderRadius: 12,
    marginBottom: 16,
    backgroundColor: "#e0e0e0",
  },
  albumName: {
    fontSize: 24,
    fontWeight: "bold",
    marginBottom: 8,
    textAlign: "center",
  },
  artistName: {
    fontSize: 18,
    marginBottom: 4,
    textAlign: "center",
  },
  metaText: {
    fontSize: 14,
    textAlign: "center",
    marginBottom: 4,
  },
  paginationText: {
    fontSize: 12,
    textAlign: "center",
  },
  content: {
    paddingHorizontal: 16,
  },
  trackRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    marginVertical: 4,
  },
  trackNumber: {
    fontSize: 16,
    fontWeight: "600",
    width: 24,
    textAlign: "center",
  },
  emptyContainer: {
    padding: 40,
    alignItems: "center",
  },
  emptyText: {
    opacity: 0.6,
    textAlign: "center",
  },
  footer: {
    paddingVertical: 20,
    alignItems: "center",
  },
});
