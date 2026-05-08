import { IconSymbol } from "@/components/ui/icon-symbol";
import {
  useDeletePlaylistTrackMutation,
  useGetPlaylistByIdQuery,
  useGetPlaylistTracksQuery,
  useUpdatePlaylistMutation,
} from "@/features/music-me/music-me-api";
import type { PlaylistTrack } from "@/features/music-me/music-me-types";
import { usePlayer } from "@/hooks/use-player";
import { showErrorToast, showSuccessToast } from "@/shared/feedback/toast";
import { ConfirmModal } from "@/shared/ui/components/confirm-modal";
import { CreateFormModal } from "@/shared/ui/components/create-form-modal";
import { useLocalSearchParams, useRouter } from "expo-router";
import React, { useState } from "react";
import { FlatList, Image, Pressable, StyleSheet, View } from "react-native";
import {
  ActivityIndicator,
  Divider,
  IconButton,
  Text,
  useTheme,
} from "react-native-paper";
import { SafeAreaView } from "react-native-safe-area-context";

function PlaylistTrackRow({
  item,
  onPlay,
  onDelete,
  onPress,
  isPlaying,
}: {
  item: PlaylistTrack;
  onPlay: () => void;
  onDelete: () => void;
  onPress: () => void;
  isPlaying: boolean;
}) {
  const theme = useTheme();
  const track = item.track;

  return (
    <Pressable style={styles.itemRow} onPress={onPress}>
      <Text style={[styles.position, { color: theme.colors.onSurfaceVariant }]}>
        {item.position}
      </Text>
      {track.coverUrl ? (
        <Image source={{ uri: track.coverUrl }} style={styles.cover} />
      ) : (
        <View style={[styles.cover, styles.coverPlaceholder]}>
          <IconSymbol
            name="music.note"
            size={18}
            color={theme.colors.onSurfaceVariant}
          />
        </View>
      )}
      <View style={styles.trackInfo}>
        <Text
          style={[
            styles.title,
            {
              color: isPlaying ? theme.colors.primary : theme.colors.onSurface,
            },
          ]}
          numberOfLines={1}
        >
          {track.title}
        </Text>
        <Text
          style={[styles.subtitle, { color: theme.colors.onSurfaceVariant }]}
          numberOfLines={1}
        >
          {track.artist.name}
        </Text>
      </View>
      <IconButton
        icon={isPlaying ? "pause" : "play-arrow"}
        size={20}
        iconColor={theme.colors.primary}
        onPress={(e) => {
          e.stopPropagation?.();
          onPlay();
        }}
      />
      <IconButton
        icon="delete"
        size={20}
        iconColor={theme.colors.error}
        onPress={onDelete}
      />
    </Pressable>
  );
}

export default function PlaylistDetailScreen() {
  const theme = useTheme();
  const router = useRouter();
  const { id, name } = useLocalSearchParams<{ id: string; name: string }>();

  const { data: playlist } = useGetPlaylistByIdQuery(id);
  const { data: tracks = [], isLoading } = useGetPlaylistTracksQuery(id);
  const [deleteTrack] = useDeletePlaylistTrackMutation();
  const [updatePlaylist, { isLoading: isUpdating }] = useUpdatePlaylistMutation();
  const { play, status, track: currentTrack, togglePlayPause } = usePlayer();

  const [deleteTarget, setDeleteTarget] = useState<PlaylistTrack | null>(null);
  const [showEdit, setShowEdit] = useState(false);

  const handleUpdate = async (values: {
    name: string;
    description: string;
    isPublic: boolean;
  }) => {
    try {
      await updatePlaylist({ id, body: values }).unwrap();
      showSuccessToast("Playlist updated!");
      setShowEdit(false);
    } catch {
      showErrorToast("Failed to update playlist.");
    }
  };

  const handleDelete = async () => {
    if (!deleteTarget) return;
    try {
      await deleteTrack({ playlistId: id, trackId: deleteTarget.id }).unwrap();
      showSuccessToast("Track removed from playlist.");
    } catch {
      showErrorToast("Failed to remove track.");
    } finally {
      setDeleteTarget(null);
    }
  };

  const handlePlay = (item: PlaylistTrack) => {
    const track = item.track;
    if (!track.streamUrl) {
      showErrorToast("Stream URL not available.");
      return;
    }
    if (currentTrack?.id === track.id) {
      togglePlayPause();
      return;
    }
    play({
      id: track.id,
      title: track.title,
      artistId: track.artist.id,
      artistName: track.artist.name,
      albumId: track.album?.id,
      albumName: track.album?.name,
      coverUrl: track.coverUrl,
      streamUrl: track.streamUrl,
      duration: track.duration,
    });
  };

  return (
    <SafeAreaView
      style={[styles.container, { backgroundColor: theme.colors.background }]}
    >
      {/* Header */}
      <View style={styles.header}>
        <Pressable onPress={() => router.back()} style={styles.backBtn}>
          <IconSymbol
            name="chevron.left"
            size={24}
            color={theme.colors.primary}
          />
        </Pressable>
        <Text style={[styles.headerTitle, { color: theme.colors.onSurface }]}>
          Playlist
        </Text>
        <Pressable onPress={() => setShowEdit(true)} style={styles.backBtn}>
          <IconSymbol
            name="pencil"
            size={24}
            color={theme.colors.primary}
          />
        </Pressable>
      </View>

      {/* Playlist info */}
      <View style={styles.info}>
        <Text style={[styles.playlistName, { color: theme.colors.onSurface }]}>
          {playlist?.name ?? name}
        </Text>
        {playlist?.description ? (
          <Text
            style={[
              styles.playlistDesc,
              { color: theme.colors.onSurfaceVariant },
            ]}
          >
            {playlist.description}
          </Text>
        ) : null}
        <Text
          style={[
            styles.playlistMeta,
            { color: theme.colors.onSurfaceVariant },
          ]}
        >
          {playlist?.trackCount ?? tracks.length} tracks •{" "}
          {playlist?.isPublic ? "Public" : "Private"}
        </Text>
      </View>

      <Divider />

      {isLoading ? (
        <View style={styles.centered}>
          <ActivityIndicator color={theme.colors.primary} />
        </View>
      ) : tracks.length === 0 ? (
        <View style={styles.centered}>
          <IconSymbol
            name="music.note.list"
            size={48}
            color={theme.colors.onSurfaceVariant}
          />
          <Text
            style={[styles.emptyText, { color: theme.colors.onSurfaceVariant }]}
          >
            No tracks in this playlist yet
          </Text>
        </View>
      ) : (
        <FlatList
          data={tracks}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => (
            <PlaylistTrackRow
              item={item}
              isPlaying={
                currentTrack?.id === item.track.id && status === "playing"
              }
              onPlay={() => handlePlay(item)}
              onPress={() =>
                router.push({
                  pathname: "/track/[id]",
                  params: {
                    id: item.track.id,
                    title: item.track.title,
                    artistId: item.track.artist.id,
                    artistName: item.track.artist.name,
                    albumId: item.track.album?.id ?? "",
                    albumName: item.track.album?.name ?? "",
                    coverUrl: item.track.coverUrl ?? "",
                    duration: item.track.duration.toString(),
                    streamUrl: item.track.streamUrl ?? "",
                  },
                })
              }
              onDelete={() => setDeleteTarget(item)}
            />
          )}
          contentContainerStyle={styles.list}
        />
      )}

      <ConfirmModal
        visible={!!deleteTarget}
        title="Remove track"
        message={`Remove "${deleteTarget?.track.title}" from this playlist?`}
        confirmText="Remove"
        destructive
        onConfirm={handleDelete}
        onCancel={() => setDeleteTarget(null)}
      />

      <CreateFormModal
        visible={showEdit}
        title="Edit Playlist"
        submitText="Save"
        initialValues={{
          name: playlist?.name ?? name,
          description: playlist?.description ?? "",
          isPublic: playlist?.isPublic ?? false,
        }}
        onClose={() => setShowEdit(false)}
        onSubmit={handleUpdate}
        loading={isUpdating}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  backBtn: {
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
  info: { paddingHorizontal: 20, paddingVertical: 16 },
  playlistName: { fontSize: 22, fontWeight: "bold", marginBottom: 4 },
  playlistDesc: { fontSize: 14, marginBottom: 6, opacity: 0.8 },
  playlistMeta: { fontSize: 13 },
  centered: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    gap: 12,
  },
  emptyText: { fontSize: 15, opacity: 0.6 },
  list: { paddingHorizontal: 16, paddingVertical: 8 },
  itemRow: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 6,
    gap: 8,
  },
  position: { width: 24, textAlign: "center", fontSize: 13 },
  cover: { width: 48, height: 48, borderRadius: 6 },
  coverPlaceholder: {
    backgroundColor: "#202C44",
    justifyContent: "center",
    alignItems: "center",
  },
  trackInfo: { flex: 1 },
  title: { fontSize: 14, fontWeight: "600", marginBottom: 2 },
  subtitle: { fontSize: 12 },
});
