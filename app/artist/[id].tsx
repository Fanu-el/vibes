import { AlbumCard } from "@/components/music-for-me/album-card";
import { TrackCard } from "@/components/music-for-me/track-card";
import { IconSymbol } from "@/components/ui/icon-symbol";
import {
  useGetArtistAlbumsQuery,
  useGetArtistTracksQuery,
} from "@/features/music-for-me/music-details-api";
import type { Album, Track } from "@/features/music-for-me/music-types";
import { useLocalSearchParams, useRouter } from "expo-router";
import React, { useCallback, useState } from "react";
import {
  ActivityIndicator,
  FlatList,
  Image,
  Pressable,
  StyleSheet,
  View,
} from "react-native";
import { Button, Divider, Text, useTheme } from "react-native-paper";
import { SafeAreaView } from "react-native-safe-area-context";

type TabType = "tracks" | "albums";
const ITEMS_PER_PAGE = 20;

export default function ArtistDetailScreen() {
  const theme = useTheme();
  const router = useRouter();
  const { id, name, imageUrl, website, joinDate } = useLocalSearchParams<{
    id: string;
    name: string;
    imageUrl?: string;
    website?: string;
    joinDate?: string;
  }>();

  const [activeTab, setActiveTab] = useState<TabType>("tracks");
  const [tracksOffset, setTracksOffset] = useState(0);
  const [albumsOffset, setAlbumsOffset] = useState(0);
  const [allTracks, setAllTracks] = useState<Track[]>([]);
  const [allAlbums, setAllAlbums] = useState<Album[]>([]);
  const [hasMoreTracks, setHasMoreTracks] = useState(true);
  const [hasMoreAlbums, setHasMoreAlbums] = useState(true);

  const {
    data: tracksData,
    isLoading: isLoadingTracks,
    error: tracksError,
  } = useGetArtistTracksQuery({
    artistId: id,
    limit: ITEMS_PER_PAGE,
    offset: tracksOffset,
  });

  const {
    data: albumsData,
    isLoading: isLoadingAlbums,
    error: albumsError,
  } = useGetArtistAlbumsQuery({
    artistId: id,
    limit: ITEMS_PER_PAGE,
    offset: albumsOffset,
  });

  React.useEffect(() => {
    if (tracksData?.items) {
      if (tracksOffset === 0) {
        setAllTracks(tracksData.items);
      } else {
        setAllTracks((prev) => [...prev, ...tracksData.items]);
      }
      setHasMoreTracks(tracksData.items.length > 0);
    }
  }, [tracksData, tracksOffset]);

  React.useEffect(() => {
    if (albumsData?.items) {
      if (albumsOffset === 0) {
        setAllAlbums(albumsData.items);
      } else {
        setAllAlbums((prev) => [...prev, ...albumsData.items]);
      }
      setHasMoreAlbums(albumsData.items.length > 0);
    }
  }, [albumsData, albumsOffset]);

  const loadMoreTracks = useCallback(() => {
    if (hasMoreTracks && !isLoadingTracks) {
      setTracksOffset((prev) => prev + 1);
    }
  }, [hasMoreTracks, isLoadingTracks]);

  const loadMoreAlbums = useCallback(() => {
    if (hasMoreAlbums && !isLoadingAlbums) {
      setAlbumsOffset((prev) => prev + 1);
    }
  }, [hasMoreAlbums, isLoadingAlbums]);

  const isLoading = activeTab === "tracks" ? isLoadingTracks : isLoadingAlbums;
  const hasError = activeTab === "tracks" ? tracksError : albumsError;

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
          Artist
        </Text>
        <View style={styles.backButton} />
      </View>

      <FlatList
        data={
          activeTab === "tracks" ? allTracks : (allAlbums as unknown as Track[])
        }
        keyExtractor={(item, index) => `${item.id}-${index}`}
        ListHeaderComponent={
          <>
            <View style={styles.header}>
              {imageUrl && (
                <Image source={{ uri: imageUrl }} style={styles.artistImage} />
              )}
              <Text
                style={[styles.artistName, { color: theme.colors.onSurface }]}
              >
                {name}
              </Text>
              {joinDate && (
                <Text
                  style={[
                    styles.metaText,
                    { color: theme.colors.onSurfaceVariant },
                  ]}
                >
                  Joined: {joinDate}
                </Text>
              )}
              {website && (
                <Text
                  style={[styles.metaText, { color: theme.colors.primary }]}
                  numberOfLines={1}
                >
                  {website}
                </Text>
              )}
              {activeTab === "tracks" && tracksData && (
                <Text
                  style={[
                    styles.paginationText,
                    { color: theme.colors.onSurfaceVariant },
                  ]}
                >
                  {allTracks.length} of {tracksData.total} tracks
                </Text>
              )}
              {activeTab === "albums" && albumsData && (
                <Text
                  style={[
                    styles.paginationText,
                    { color: theme.colors.onSurfaceVariant },
                  ]}
                >
                  {allAlbums.length} of {albumsData.total} albums
                </Text>
              )}
            </View>

            <Divider />

            <View style={styles.tabContainer}>
              <Button
                mode={activeTab === "tracks" ? "contained" : "outlined"}
                onPress={() => setActiveTab("tracks")}
                style={styles.tabButton}
              >
                Tracks
              </Button>
              <Button
                mode={activeTab === "albums" ? "contained" : "outlined"}
                onPress={() => setActiveTab("albums")}
                style={styles.tabButton}
              >
                Albums
              </Button>
            </View>
          </>
        }
        renderItem={({ item }) =>
          activeTab === "tracks" ? (
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
          ) : (
            <AlbumCard
              item={item as unknown as Album}
              onPress={() => {
                const album = item as unknown as Album;
                router.push({
                  pathname: "/album/[id]",
                  params: {
                    id: album.id,
                    name: album.name,
                    artistName: album.artist.name,
                    coverUrl: album.coverUrl || "",
                    releaseDate: album.releaseDate || "",
                  },
                });
              }}
            />
          )
        }
        ListEmptyComponent={
          !isLoading && !hasError ? (
            <View style={styles.emptyContainer}>
              <Text style={styles.emptyText}>No {activeTab} available</Text>
            </View>
          ) : null
        }
        ListFooterComponent={renderFooter}
        onEndReached={activeTab === "tracks" ? loadMoreTracks : loadMoreAlbums}
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
  artistImage: {
    width: 120,
    height: 120,
    borderRadius: 60,
    marginBottom: 16,
    backgroundColor: "#e0e0e0",
  },
  artistName: {
    fontSize: 24,
    fontWeight: "bold",
    marginBottom: 8,
    textAlign: "center",
  },
  metaText: {
    fontSize: 14,
    marginBottom: 4,
    textAlign: "center",
  },
  paginationText: {
    fontSize: 12,
    textAlign: "center",
    marginTop: 8,
  },
  tabContainer: {
    flexDirection: "row",
    padding: 16,
    gap: 12,
  },
  tabButton: {
    flex: 1,
  },
  content: {
    paddingHorizontal: 16,
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
