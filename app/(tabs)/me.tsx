import { HorizontalAlbumCard } from "@/components/music-for-me/horizontal-album-card";
import { HorizontalArtistCard } from "@/components/music-for-me/horizontal-artist-card";
import { HorizontalTrackCard } from "@/components/music-for-me/horizontal-track-card";
import { LibraryCard } from "@/components/music-me/library-card";
import { PlaylistCard } from "@/components/music-me/playlist-card";
import { IconSymbol } from "@/components/ui/icon-symbol";
import {
    useCreateLibraryMutation,
    useCreatePlaylistMutation,
    useDeleteLibraryMutation,
    useDeletePlaylistMutation,
    useGetLibrariesQuery,
    useGetLikedAlbumsQuery,
    useGetLikedArtistsQuery,
    useGetLikedTracksQuery,
    useGetPlaylistsQuery,
    useGetRecentlyPlayedQuery,
} from "@/features/music-me/music-me-api";
import type { Library, Playlist } from "@/features/music-me/music-me-types";

import {
  HorizontalAlbumSkeleton,
  HorizontalArtistSkeleton,
  HorizontalTrackSkeleton,
} from "@/shared/ui/components/skeletons";
import { showErrorToast, showSuccessToast } from "@/shared/feedback/toast";
import { ConfirmModal } from "@/shared/ui/components/confirm-modal";
import { CreateFormModal } from "@/shared/ui/components/create-form-modal";
import { useRouter } from "expo-router";
import React, { useState } from "react";
import {
    FlatList,
    Pressable,
    RefreshControl,
    ScrollView,
    StyleSheet,
    View,
} from "react-native";
import {
    Divider,
    IconButton,
    Text,
    useTheme,
} from "react-native-paper";
import { SafeAreaView } from "react-native-safe-area-context";

// ─── Section Header ───────────────────────────────────────────────────────────

function SectionHeader({
  title,
  onAdd,
}: {
  title: string;
  onAdd?: () => void;
}) {
  const theme = useTheme();
  return (
    <View style={styles.sectionHeader}>
      <Text style={[styles.sectionTitle, { color: theme.colors.onSurface }]}>
        {title}
      </Text>
      {onAdd && (
        <IconButton
          icon="plus"
          size={22}
          iconColor={theme.colors.primary}
          onPress={onAdd}
          style={styles.addBtn}
        />
      )}
    </View>
  );
}

// ─── Me Screen ────────────────────────────────────────────────────────────────

export default function MeScreen() {
  const theme = useTheme();
  const router = useRouter();


  // Modals
  const [showCreateLibrary, setShowCreateLibrary] = useState(false);
  const [showCreatePlaylist, setShowCreatePlaylist] = useState(false);
  const [deleteLibraryTarget, setDeleteLibraryTarget] =
    useState<Library | null>(null);
  const [deletePlaylistTarget, setDeletePlaylistTarget] =
    useState<Playlist | null>(null);

  // Queries
  const {
    data: libraries = [],
    isLoading: loadingLibraries,
    refetch: refetchLibraries,
  } = useGetLibrariesQuery();
  const {
    data: playlists = [],
    isLoading: loadingPlaylists,
    refetch: refetchPlaylists,
  } = useGetPlaylistsQuery();
  const {
    data: likedTracks = [],
    isLoading: loadingLikedTracks,
    refetch: refetchLikedTracks,
  } = useGetLikedTracksQuery();
  const {
    data: likedAlbums = [],
    isLoading: loadingLikedAlbums,
    refetch: refetchLikedAlbums,
  } = useGetLikedAlbumsQuery();
  const {
    data: likedArtists = [],
    isLoading: loadingLikedArtists,
    refetch: refetchLikedArtists,
  } = useGetLikedArtistsQuery();
  const {
    data: recentlyPlayed = [],
    isLoading: loadingRecent,
    refetch: refetchRecent,
  } = useGetRecentlyPlayedQuery();

  // Mutations
  const [createLibrary, { isLoading: creatingLibrary }] =
    useCreateLibraryMutation();
  const [createPlaylist, { isLoading: creatingPlaylist }] =
    useCreatePlaylistMutation();
  const [deleteLibrary] = useDeleteLibraryMutation();
  const [deletePlaylist] = useDeletePlaylistMutation();

  const [refreshing, setRefreshing] = useState(false);

  const onRefresh = async () => {
    setRefreshing(true);
    await Promise.all([
      refetchLibraries(),
      refetchPlaylists(),
      refetchLikedTracks(),
      refetchLikedAlbums(),
      refetchLikedArtists(),
      refetchRecent(),
    ]);
    setRefreshing(false);
  };

  const handleCreateLibrary = async (values: {
    name: string;
    description: string;
    isPublic: boolean;
  }) => {
    try {
      await createLibrary(values).unwrap();
      showSuccessToast("Library created!");
      setShowCreateLibrary(false);
    } catch {
      showErrorToast("Failed to create library.");
    }
  };

  const handleCreatePlaylist = async (values: {
    name: string;
    description: string;
    isPublic: boolean;
  }) => {
    try {
      await createPlaylist(values).unwrap();
      showSuccessToast("Playlist created!");
      setShowCreatePlaylist(false);
    } catch {
      showErrorToast("Failed to create playlist.");
    }
  };

  const handleDeleteLibrary = async () => {
    if (!deleteLibraryTarget) return;
    try {
      await deleteLibrary(deleteLibraryTarget.id).unwrap();
      showSuccessToast("Library deleted.");
    } catch {
      showErrorToast("Failed to delete library.");
    } finally {
      setDeleteLibraryTarget(null);
    }
  };

  const handleDeletePlaylist = async () => {
    if (!deletePlaylistTarget) return;
    try {
      await deletePlaylist(deletePlaylistTarget.id).unwrap();
      showSuccessToast("Playlist deleted.");
    } catch {
      showErrorToast("Failed to delete playlist.");
    } finally {
      setDeletePlaylistTarget(null);
    }
  };



  const navigateToTrack = (track: any) => {
    router.push({
      pathname: "/track/[id]",
      params: {
        id: track.id,
        title: track.title,
        artistId: track.artist.id,
        artistName: track.artist.name,
        albumId: track.album?.id ?? "",
        albumName: track.album?.name ?? "",
        coverUrl: track.coverUrl ?? "",
        duration: track.duration.toString(),
        streamUrl: track.streamUrl ?? "",
      },
    });
  };

  const navigateToAlbum = (album: any) => {
    router.push({
      pathname: "/album/[id]",
      params: {
        id: album.id,
        name: album.name,
        artistName: album.artist.name,
        coverUrl: album.coverUrl ?? "",
        releaseDate: album.releaseDate ?? "",
      },
    });
  };



  return (
    <SafeAreaView
      style={[styles.container, { backgroundColor: theme.colors.background }]}
    >
      {/* Header */}
      <View style={styles.header}>
        <Text style={[styles.headerTitle, { color: theme.colors.onSurface }]}>
          My Music
        </Text>
      </View>

      <ScrollView
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
        showsVerticalScrollIndicator={false}
      >
        {/* ── Recently Played ───────────────────────────────────────────── */}
        <SectionHeader title="Recently Played" />
        {loadingRecent ? (
          <FlatList
            horizontal
            data={[1, 2, 3, 4]}
            keyExtractor={(item) => `skel-lr-${item}`}
            renderItem={() => <HorizontalTrackSkeleton />}
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.horizontalList}
          />
        ) : recentlyPlayed.length === 0 ? (
          <Text
            style={[styles.emptyText, { color: theme.colors.onSurfaceVariant }]}
          >
            Nothing played yet.
          </Text>
        ) : (
          <FlatList
            horizontal
            data={recentlyPlayed}
            keyExtractor={(item, index) => `${item.track.id}-${item.playedAt || index}`}
            renderItem={({ item }) => (
              <HorizontalTrackCard
                item={item.track}
                onPress={() => navigateToTrack(item.track)}
              />
            )}
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.horizontalList}
          />
        )}

        <Divider style={styles.divider} />

        {/* ── Libraries ─────────────────────────────────────────────────── */}
        <SectionHeader
          title="Libraries"
          onAdd={() => setShowCreateLibrary(true)}
        />
        {loadingLibraries ? (
          <FlatList
            horizontal
            data={[1, 2, 3, 4]}
            keyExtractor={(item) => `skel-lib-${item}`}
            renderItem={() => <HorizontalAlbumSkeleton />}
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.horizontalList}
          />
        ) : libraries.length === 0 ? (
          <Text
            style={[styles.emptyText, { color: theme.colors.onSurfaceVariant }]}
          >
            No libraries yet. Create one!
          </Text>
        ) : (
          <FlatList
            horizontal
            data={libraries}
            keyExtractor={(item) => item.id}
            renderItem={({ item }) => (
              <LibraryCard
                item={item}
                onPress={() =>
                  router.push({
                    pathname: "/library/[id]",
                    params: { id: item.id, name: item.name },
                  })
                }
                onDelete={() => setDeleteLibraryTarget(item)}
              />
            )}
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.horizontalList}
          />
        )}

        <Divider style={styles.divider} />

        {/* ── Playlists ─────────────────────────────────────────────────── */}
        <SectionHeader
          title="Playlists"
          onAdd={() => setShowCreatePlaylist(true)}
        />
        {loadingPlaylists ? (
          <FlatList
            horizontal
            data={[1, 2, 3, 4]}
            keyExtractor={(item) => `skel-pl-${item}`}
            renderItem={() => <HorizontalAlbumSkeleton />}
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.horizontalList}
          />
        ) : playlists.length === 0 ? (
          <Text
            style={[styles.emptyText, { color: theme.colors.onSurfaceVariant }]}
          >
            No playlists yet. Create one!
          </Text>
        ) : (
          <FlatList
            horizontal
            data={playlists}
            keyExtractor={(item) => item.id}
            renderItem={({ item }) => (
              <PlaylistCard
                item={item}
                onPress={() =>
                  router.push({
                    pathname: "/playlist/[id]",
                    params: { id: item.id, name: item.name },
                  })
                }
                onDelete={() => setDeletePlaylistTarget(item)}
              />
            )}
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.horizontalList}
          />
        )}

        <Divider style={styles.divider} />

        {/* ── Liked Tracks ──────────────────────────────────────────────── */}
        <SectionHeader title="Liked Tracks" />
        {loadingLikedTracks ? (
          <FlatList
            horizontal
            data={[1, 2, 3, 4]}
            keyExtractor={(item) => `skel-lt-${item}`}
            renderItem={() => <HorizontalTrackSkeleton />}
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.horizontalList}
          />
        ) : likedTracks.length === 0 ? (
          <Text
            style={[styles.emptyText, { color: theme.colors.onSurfaceVariant }]}
          >
            No liked tracks yet.
          </Text>
        ) : (
          <FlatList
            horizontal
            data={likedTracks}
            keyExtractor={(item) => item.id}
            renderItem={({ item }) => (
              <HorizontalTrackCard
                item={item.track}
                onPress={() => navigateToTrack(item.track)}
              />
            )}
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.horizontalList}
            scrollEnabled
          />
        )}

        <Divider style={styles.divider} />

        {/* ── Liked Albums ──────────────────────────────────────────────── */}
        <SectionHeader title="Liked Albums" />
        {loadingLikedAlbums ? (
          <FlatList
            horizontal
            data={[1, 2, 3, 4]}
            keyExtractor={(item) => `skel-la-${item}`}
            renderItem={() => <HorizontalAlbumSkeleton />}
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.horizontalList}
          />
        ) : likedAlbums.length === 0 ? (
          <Text
            style={[styles.emptyText, { color: theme.colors.onSurfaceVariant }]}
          >
            No liked albums yet.
          </Text>
        ) : (
          <FlatList
            horizontal
            data={likedAlbums}
            keyExtractor={(item) => item.id}
            renderItem={({ item }) => (
              <HorizontalAlbumCard
                item={item.album}
                onPress={() => navigateToAlbum(item.album)}
              />
            )}
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.horizontalList}
            scrollEnabled
          />
        )}

        <Divider style={styles.divider} />

        {/* ── Liked Artists ─────────────────────────────────────────────── */}
        <SectionHeader title="Favorite Artists" />
        {loadingLikedArtists ? (
          <FlatList
            horizontal
            data={[1, 2, 3, 4]}
            keyExtractor={(item) => `skel-lar-${item}`}
            renderItem={() => <HorizontalArtistSkeleton />}
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.horizontalList}
          />
        ) : likedArtists.length === 0 ? (
          <Text
            style={[styles.emptyText, { color: theme.colors.onSurfaceVariant }]}
          >
            No favorite artists yet.
          </Text>
        ) : (
          <FlatList
            horizontal
            data={likedArtists}
            keyExtractor={(item) => item.id}
            renderItem={({ item }) => (
              <HorizontalArtistCard
                item={item.artist}
                onPress={() =>
                  router.push({
                    pathname: "/artist/[id]",
                    params: {
                      id: item.artist.id,
                      name: item.artist.name,
                      imageUrl: item.artist.imageUrl ?? "",
                      website: item.artist.website ?? "",
                      joinDate: item.artist.joinDate ?? "",
                    },
                  })
                }
              />
            )}
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.horizontalList}
            scrollEnabled
          />
        )}

        <View style={{ height: 100 }} />
      </ScrollView>

      {/* Modals */}
      <CreateFormModal
        visible={showCreateLibrary}
        title="New Library"
        onClose={() => setShowCreateLibrary(false)}
        onSubmit={handleCreateLibrary}
        loading={creatingLibrary}
      />
      <CreateFormModal
        visible={showCreatePlaylist}
        title="New Playlist"
        onClose={() => setShowCreatePlaylist(false)}
        onSubmit={handleCreatePlaylist}
        loading={creatingPlaylist}
      />
      <ConfirmModal
        visible={!!deleteLibraryTarget}
        title="Delete Library"
        message={`Delete "${deleteLibraryTarget?.name}"? This cannot be undone.`}
        confirmText="Delete"
        destructive
        onConfirm={handleDeleteLibrary}
        onCancel={() => setDeleteLibraryTarget(null)}
      />
      <ConfirmModal
        visible={!!deletePlaylistTarget}
        title="Delete Playlist"
        message={`Delete "${deletePlaylistTarget?.name}"? This cannot be undone.`}
        confirmText="Delete"
        destructive
        onConfirm={handleDeletePlaylist}
        onCancel={() => setDeletePlaylistTarget(null)}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: {
    paddingHorizontal: 20,
    paddingTop: 16,
    paddingBottom: 8,
  },
  headerTitle: { fontSize: 28, fontWeight: "bold" },
  sectionHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    paddingTop: 8,
    paddingBottom: 4,
  },
  sectionTitle: { fontSize: 20, fontWeight: "bold" },
  addBtn: { margin: 0 },
  emptyText: {
    paddingHorizontal: 20,
    paddingVertical: 12,
    fontSize: 14,
    opacity: 0.6,
  },

  divider: { marginVertical: 8 },
  horizontalList: { paddingHorizontal: 16, paddingVertical: 4 },
});
