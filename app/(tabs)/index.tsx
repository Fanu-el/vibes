import { HorizontalAlbumCard } from "@/components/music-for-me/horizontal-album-card";
import { HorizontalArtistCard } from "@/components/music-for-me/horizontal-artist-card";
import { HorizontalTrackCard } from "@/components/music-for-me/horizontal-track-card";
import { SearchModal } from "@/components/search/search-modal";
import { IconSymbol } from "@/components/ui/icon-symbol";
import { useGetMeQuery } from "@/features/auth/auth-api";
import {
    useGetAlbumsQuery,
    useGetArtistsQuery,
    useGetTracksQuery,
} from "@/features/music-for-me/music-for-me-api";
import {
    useGetLikedArtistsQuery,
    useGetLikedTracksQuery,
} from "@/features/music-me/music-me-api";
import type { Album, Artist, Track } from "@/features/music-for-me/music-types";
import { MusicSectionSkeleton } from "@/shared/ui/components/skeletons";
import { useRouter } from "expo-router";
import React, { useCallback, useState } from "react";
import {
    FlatList,
    Pressable,
    RefreshControl,
    ScrollView,
    StyleSheet,
    View,
} from "react-native";
import { Button, Text, useTheme } from "react-native-paper";
import { SafeAreaView } from "react-native-safe-area-context";

const ITEMS_PER_PAGE = 10;

export default function HomeScreen() {
  const theme = useTheme();
  const router = useRouter();

  const [searchVisible, setSearchVisible] = useState(false);
  const { data: user } = useGetMeQuery();

  // Liked data
  const { data: likedTracks = [] } = useGetLikedTracksQuery();
  const { data: likedArtists = [] } = useGetLikedArtistsQuery();
  const likedTrackIds = new Set(likedTracks.map((t) => t.providerId));
  const likedArtistIds = new Set(likedArtists.map((a) => a.providerId));

  // Pagination states
  const [tracksOffset, setTracksOffset] = useState(0);
  const [albumsOffset, setAlbumsOffset] = useState(0);
  const [artistsOffset, setArtistsOffset] = useState(0);

  // Accumulated data
  const [allTracks, setAllTracks] = useState<Track[]>([]);
  const [allAlbums, setAllAlbums] = useState<Album[]>([]);
  const [allArtists, setAllArtists] = useState<Artist[]>([]);

  // Has more flags
  const [hasMoreTracks, setHasMoreTracks] = useState(true);
  const [hasMoreAlbums, setHasMoreAlbums] = useState(true);
  const [hasMoreArtists, setHasMoreArtists] = useState(true);

  const {
    data: tracksData,
    isLoading: isLoadingTracks,
    error: tracksError,
    refetch: refetchTracks,
  } = useGetTracksQuery({ limit: ITEMS_PER_PAGE, offset: tracksOffset });

  const {
    data: albumsData,
    isLoading: isLoadingAlbums,
    error: albumsError,
    refetch: refetchAlbums,
  } = useGetAlbumsQuery({ limit: ITEMS_PER_PAGE, offset: albumsOffset });

  const {
    data: artistsData,
    isLoading: isLoadingArtists,
    error: artistsError,
    refetch: refetchArtists,
  } = useGetArtistsQuery({ limit: ITEMS_PER_PAGE, offset: artistsOffset });

  React.useEffect(() => {
    if (tracksData?.items) {
      const validTracks = tracksData.items.filter((item) => item?.id);
      if (tracksOffset === 0) {
        setAllTracks(validTracks);
      } else {
        setAllTracks((prev) => [...prev, ...validTracks]);
      }
      setHasMoreTracks(tracksData.items.length > 0);
    }
  }, [tracksData, tracksOffset]);

  React.useEffect(() => {
    if (albumsData?.items) {
      const validAlbums = albumsData.items.filter((item) => item?.id);
      if (albumsOffset === 0) {
        setAllAlbums(validAlbums);
      } else {
        setAllAlbums((prev) => [...prev, ...validAlbums]);
      }
      setHasMoreAlbums(albumsData.items.length > 0);
    }
  }, [albumsData, albumsOffset]);

  React.useEffect(() => {
    if (artistsData?.items) {
      const validArtists = artistsData.items.filter((item) => item?.id);
      if (artistsOffset === 0) {
        setAllArtists(validArtists);
      } else {
        setAllArtists((prev) => [...prev, ...validArtists]);
      }
      setHasMoreArtists(artistsData.items.length > 0);
    }
  }, [artistsData, artistsOffset]);

  const hasError = tracksError || albumsError || artistsError;

  const [refreshing, setRefreshing] = useState(false);

  const getGreeting = () => {
    const hour = new Date().getHours();
    const timeOfDay =
      hour < 12 ? "Morning" : hour < 18 ? "Afternoon" : "Evening";
    const firstName = user?.firstName || "";
    return `Good ${timeOfDay}${firstName ? `, ${firstName}` : ""}`;
  };

  const onRefresh = async () => {
    setRefreshing(true);
    setTracksOffset(0);
    setAlbumsOffset(0);
    setArtistsOffset(0);
    setHasMoreTracks(true);
    setHasMoreAlbums(true);
    setHasMoreArtists(true);
    await Promise.all([refetchTracks(), refetchAlbums(), refetchArtists()]);
    setRefreshing(false);
  };

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

  const loadMoreArtists = useCallback(() => {
    if (hasMoreArtists && !isLoadingArtists) {
      setArtistsOffset((prev) => prev + 1);
    }
  }, [hasMoreArtists, isLoadingArtists]);

  if (hasError) {
    return (
      <SafeAreaView
        style={[styles.container, { backgroundColor: theme.colors.background }]}
      >
        <View style={styles.errorContainer}>
          <Text style={styles.errorText}>Failed to load music</Text>
          <Button mode="contained" onPress={onRefresh}>
            Retry
          </Button>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView
      style={[styles.container, { backgroundColor: theme.colors.background }]}
    >
      <ScrollView
        style={styles.scrollView}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      >
        <View style={styles.header}>
          <Text style={[styles.greeting, { color: theme.colors.onSurface }]}>
            {getGreeting()}
          </Text>
          <Pressable
            onPress={() => setSearchVisible(true)}
            style={styles.searchIcon}
          >
            <IconSymbol
              name="magnifyingglass"
              size={24}
              color={theme.colors.primary}
            />
          </Pressable>
        </View>

        {/* Tracks Section */}
        {isLoadingTracks && allTracks.length === 0 ? (
          <MusicSectionSkeleton type="track" count={5} />
        ) : allTracks.length > 0 ? (
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <Text
                style={[styles.sectionTitle, { color: theme.colors.onSurface }]}
              >
                Recommended Tracks
              </Text>
              {tracksData && (
                <Text
                  style={[
                    styles.paginationText,
                    { color: theme.colors.onSurfaceVariant },
                  ]}
                >
                  {allTracks.length} of {tracksData.total}
                </Text>
              )}
            </View>
            <FlatList
              horizontal
              data={allTracks}
              keyExtractor={(item) => item.id}
              renderItem={({ item }) => (
                <HorizontalTrackCard
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
                        streamUrl: item.streamUrl || "",
                        genres: item.tags?.genres?.join(",") || "",
                        instruments: item.tags?.instruments?.join(",") || "",
                        mood: item.tags?.mood?.join(",") || "",
                        speed: item.tags?.speed || "",
                        vocalType: item.tags?.vocalType || "",
                      },
                    });
                  }}
                  isLiked={likedTrackIds.has(item.id)}
                />
              )}
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.horizontalList}
              onEndReached={loadMoreTracks}
              onEndReachedThreshold={0.5}
            />
          </View>
        ) : null}

        {/* Liked Tracks Section */}
        {likedTracks.length > 0 && (
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <Text style={[styles.sectionTitle, { color: theme.colors.onSurface }]}>
                Liked Tracks
              </Text>
            </View>
            <FlatList
              horizontal
              data={likedTracks}
              keyExtractor={(item) => item.id}
              renderItem={({ item }) => (
                <HorizontalTrackCard
                  item={item.track}
                  onPress={() => {
                    router.push({
                      pathname: "/track/[id]",
                      params: {
                        id: item.track.id,
                        title: item.track.title,
                        artistId: item.track.artist.id,
                        artistName: item.track.artist.name,
                        albumId: item.track.album?.id || "",
                        albumName: item.track.album?.name || "",
                        coverUrl: item.track.coverUrl || "",
                        duration: item.track.duration.toString(),
                        releaseDate: item.track.releaseDate || "",
                        streamUrl: item.track.streamUrl || "",
                        genres: item.track.tags?.genres?.join(",") || "",
                        instruments: item.track.tags?.instruments?.join(",") || "",
                        mood: item.track.tags?.mood?.join(",") || "",
                        speed: item.track.tags?.speed || "",
                        vocalType: item.track.tags?.vocalType || "",
                      },
                    });
                  }}
                  isLiked={true}
                />
              )}
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.horizontalList}
            />
          </View>
        )}

        {/* Albums Section */}
        {isLoadingAlbums && allAlbums.length === 0 ? (
          <MusicSectionSkeleton type="album" count={5} />
        ) : allAlbums.length > 0 ? (
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <Text
                style={[styles.sectionTitle, { color: theme.colors.onSurface }]}
              >
                Albums You Might Like
              </Text>
              {albumsData && (
                <Text
                  style={[
                    styles.paginationText,
                    { color: theme.colors.onSurfaceVariant },
                  ]}
                >
                  {allAlbums.length} of {albumsData.total}
                </Text>
              )}
            </View>
            <FlatList
              horizontal
              data={allAlbums}
              keyExtractor={(item) => item.id}
              renderItem={({ item }) => (
                <HorizontalAlbumCard
                  item={item}
                  onPress={() => {
                    router.push({
                      pathname: "/album/[id]",
                      params: {
                        id: item.id,
                        name: item.name,
                        artistName: item.artist.name,
                        coverUrl: item.coverUrl || "",
                        releaseDate: item.releaseDate || "",
                      },
                    });
                  }}
                />
              )}
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.horizontalList}
              onEndReached={loadMoreAlbums}
              onEndReachedThreshold={0.5}
            />
          </View>
        ) : null}

        {/* Artists Section */}
        {isLoadingArtists && allArtists.length === 0 ? (
          <MusicSectionSkeleton type="artist" count={5} />
        ) : allArtists.length > 0 ? (
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <Text
                style={[styles.sectionTitle, { color: theme.colors.onSurface }]}
              >
                Popular Artists
              </Text>
              {artistsData && (
                <Text
                  style={[
                    styles.paginationText,
                    { color: theme.colors.onSurfaceVariant },
                  ]}
                >
                  {allArtists.length} of {artistsData.total}
                </Text>
              )}
            </View>
            <FlatList
              horizontal
              data={allArtists}
              keyExtractor={(item) => item.id}
              renderItem={({ item }) => (
                <HorizontalArtistCard
                  item={item}
                  onPress={() => {
                    router.push({
                      pathname: "/artist/[id]",
                      params: {
                        id: item.id,
                        name: item.name,
                        imageUrl: item.imageUrl || "",
                        website: item.website || "",
                        joinDate: item.joinDate || "",
                      },
                    });
                  }}
                  isFavorited={likedArtistIds.has(item.id)}
                />
              )}
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.horizontalList}
              onEndReached={loadMoreArtists}
              onEndReachedThreshold={0.5}
            />
          </View>
        ) : null}

        {/* Liked Artists Section */}
        {likedArtists.length > 0 && (
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <Text style={[styles.sectionTitle, { color: theme.colors.onSurface }]}>
                Favorite Artists
              </Text>
            </View>
            <FlatList
              horizontal
              data={likedArtists}
              keyExtractor={(item) => item.id}
              renderItem={({ item }) => (
                <HorizontalArtistCard
                  item={item.artist}
                  onPress={() => {
                    router.push({
                      pathname: "/artist/[id]",
                      params: {
                        id: item.artist.id,
                        name: item.artist.name,
                        imageUrl: item.artist.imageUrl || "",
                        website: item.artist.website || "",
                        joinDate: item.artist.joinDate || "",
                      },
                    });
                  }}
                  isFavorited={true}
                />
              )}
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.horizontalList}
            />
          </View>
        )}

        {/* Empty state — all loaded, nothing returned */}
        {!isLoadingTracks &&
          !isLoadingAlbums &&
          !isLoadingArtists &&
          allTracks.length === 0 &&
          allAlbums.length === 0 &&
          allArtists.length === 0 && (
            <View style={styles.emptyContainer}>
              <IconSymbol
                name="music.note.list"
                size={80}
                color={theme.colors.onSurfaceVariant}
                style={styles.emptyIcon}
              />
              <Text
                style={[
                  styles.emptyText,
                  { color: theme.colors.onSurfaceVariant },
                ]}
              >
                Start listening to music to get personalized recommendations!
              </Text>
            </View>
          )}

        <View style={{ height: 24 }} />
      </ScrollView>

      <SearchModal
        visible={searchVisible}
        onClose={() => setSearchVisible(false)}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollView: {
    flex: 1,
  },
  errorContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
  },
  errorText: {
    textAlign: "center",
    marginBottom: 16,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 40,
    marginTop: 60,
  },
  emptyIcon: {
    marginBottom: 16,
    opacity: 0.4,
  },
  emptyText: {
    textAlign: "center",
    opacity: 0.6,
    fontSize: 16,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    paddingTop: 16,
    paddingBottom: 8,
  },
  greeting: {
    fontSize: 28,
    fontWeight: "bold",
    flex: 1,
  },
  searchIcon: {
    padding: 4,
  },
  section: {
    marginTop: 24,
  },
  sectionHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 16,
    marginBottom: 12,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: "bold",
  },
  paginationText: {
    fontSize: 12,
  },
  horizontalList: {
    paddingHorizontal: 16,
  },
});
