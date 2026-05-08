import { ActionsSheet } from "@/components/music-me/actions-sheet";
import { IconSymbol } from "@/components/ui/icon-symbol";
import {
    useGetLikedTracksQuery,
    useLikeTrackMutation,
    useUnlikeTrackMutation,
} from "@/features/music-me/music-me-api";
import { usePlayer } from "@/hooks/use-player";
import { showErrorToast, showSuccessToast } from "@/shared/feedback/toast";
import { useLocalSearchParams, useRouter } from "expo-router";
import React, { useMemo, useState } from "react";
import { Image, Pressable, ScrollView, StyleSheet, View } from "react-native";
import {
    ActivityIndicator,
    Button,
    Chip,
    Divider,
    Text,
    useTheme,
} from "react-native-paper";
import { SafeAreaView } from "react-native-safe-area-context";

export default function TrackDetailScreen() {
  const theme = useTheme();
  const router = useRouter();
  const {
    id,
    title,
    artistName,
    artistId,
    albumName,
    albumId,
    coverUrl,
    duration,
    releaseDate,
    streamUrl,
    genres,
    instruments,
    mood,
    speed,
    vocalType,
  } = useLocalSearchParams<{
    id: string;
    title: string;
    artistName: string;
    artistId: string;
    albumName?: string;
    albumId?: string;
    coverUrl?: string;
    duration: string;
    releaseDate?: string;
    streamUrl?: string;
    genres?: string;
    instruments?: string;
    mood?: string;
    speed?: string;
    vocalType?: string;
  }>();

  const { play, status, track: currentTrack, togglePlayPause } = usePlayer();

  // Like state
  const { data: likedTracks = [] } = useGetLikedTracksQuery();
  const [likeTrack, { isLoading: liking }] = useLikeTrackMutation();
  const [unlikeTrack, { isLoading: unliking }] = useUnlikeTrackMutation();
  const isLiked = useMemo(
    () => likedTracks.some((t) => t.providerId === id),
    [likedTracks, id],
  );

  // Add-to sheet (library / playlist picker)
  const [sheetOpen, setSheetOpen] = useState(false);
  const [sheetMode, setSheetMode] = useState<"libraries" | "playlists">(
    "libraries",
  );

  const isThisTrackPlaying =
    currentTrack?.id === id && (status === "playing" || status === "loading");

  const formatDuration = (seconds: string): string => {
    const secs = parseInt(seconds);
    const mins = Math.floor(secs / 60);
    const remainingSecs = secs % 60;
    return `${mins}:${remainingSecs.toString().padStart(2, "0")}`;
  };

  const handlePlay = () => {
    if (!streamUrl) {
      showErrorToast("Stream URL not available for this track.");
      return;
    }
    if (currentTrack?.id === id) {
      togglePlayPause();
      return;
    }
    play({
      id: id ?? "",
      title: title ?? "",
      artistId: artistId ?? "",
      artistName: artistName ?? "",
      albumId: albumId,
      albumName: albumName,
      coverUrl: coverUrl,
      streamUrl,
      duration: parseInt(duration ?? "0"),
    });
  };

  const handleLike = async () => {
    try {
      if (isLiked) {
        await unlikeTrack(id ?? "").unwrap();
        showSuccessToast("Removed from likes.");
      } else {
        await likeTrack(id ?? "").unwrap();
        showSuccessToast("Added to likes!");
      }
    } catch {
      showErrorToast("Failed to update likes.");
    }
  };

  const genresList = genres ? genres.split(",").filter(Boolean) : [];
  const instrumentsList = instruments
    ? instruments.split(",").filter(Boolean)
    : [];
  const moodList = mood ? mood.split(",").filter(Boolean) : [];

  return (
    <SafeAreaView
      style={[styles.container, { backgroundColor: theme.colors.background }]}
    >
      {/* Header */}
      <View style={styles.customHeader}>
        <Pressable onPress={() => router.back()} style={styles.iconBtn}>
          <IconSymbol
            name="chevron.left"
            size={24}
            color={theme.colors.primary}
          />
        </Pressable>

        <Text style={[styles.headerTitle, { color: theme.colors.onSurface }]}>
          Track
        </Text>

        {/* Action icons */}
        <View style={styles.headerActions}>
          {/* Like */}
          <Pressable
            onPress={handleLike}
            style={styles.iconBtn}
            disabled={liking || unliking}
            hitSlop={8}
          >
            {liking || unliking ? (
              <ActivityIndicator size={20} color={theme.colors.primary} />
            ) : (
              <IconSymbol
                name={isLiked ? "heart.fill" : "heart"}
                size={22}
                color={isLiked ? "#ef4444" : theme.colors.onSurfaceVariant}
              />
            )}
          </Pressable>

          {/* Add to Library */}
          <Pressable
            onPress={() => {
              setSheetMode("libraries");
              setSheetOpen(true);
            }}
            style={styles.iconBtn}
            hitSlop={8}
          >
            <IconSymbol
              name="books.vertical.fill"
              size={22}
              color={theme.colors.onSurfaceVariant}
            />
          </Pressable>

          {/* Add to Playlist */}
          <Pressable
            onPress={() => {
              setSheetMode("playlists");
              setSheetOpen(true);
            }}
            style={styles.iconBtn}
            hitSlop={8}
          >
            <IconSymbol
              name="music.note.list.fill"
              size={22}
              color={theme.colors.onSurfaceVariant}
            />
          </Pressable>
        </View>
      </View>

      <ScrollView style={styles.content}>
        {/* Cover + title */}
        <View style={styles.header}>
          {coverUrl ? (
            <Image source={{ uri: coverUrl }} style={styles.trackCover} />
          ) : null}
          <Text style={[styles.trackTitle, { color: theme.colors.onSurface }]}>
            {title}
          </Text>
          <Text
            style={[
              styles.artistName,
              { color: theme.colors.onSurfaceVariant },
            ]}
          >
            {artistName}
          </Text>
          {albumName ? (
            <Text
              style={[
                styles.albumName,
                { color: theme.colors.onSurfaceVariant },
              ]}
            >
              {albumName}
            </Text>
          ) : null}
        </View>

        <Divider style={styles.divider} />

        {/* Play button */}
        <View style={styles.controls}>
          <Button
            mode="contained"
            icon={isThisTrackPlaying ? "pause" : "play"}
            onPress={handlePlay}
            disabled={!streamUrl}
          >
            {status === "loading" && currentTrack?.id === id
              ? "Loading..."
              : isThisTrackPlaying
                ? "Pause"
                : "Play"}
          </Button>
        </View>

        <Divider style={styles.divider} />

        {/* Track info */}
        <View style={styles.infoSection}>
          <Text
            style={[styles.sectionTitle, { color: theme.colors.onSurface }]}
          >
            Track Information
          </Text>
          <View style={styles.infoRow}>
            <Text
              style={[
                styles.infoLabel,
                { color: theme.colors.onSurfaceVariant },
              ]}
            >
              Duration:
            </Text>
            <Text style={[styles.infoValue, { color: theme.colors.onSurface }]}>
              {formatDuration(duration)}
            </Text>
          </View>
          {releaseDate ? (
            <View style={styles.infoRow}>
              <Text
                style={[
                  styles.infoLabel,
                  { color: theme.colors.onSurfaceVariant },
                ]}
              >
                Released:
              </Text>
              <Text
                style={[styles.infoValue, { color: theme.colors.onSurface }]}
              >
                {releaseDate}
              </Text>
            </View>
          ) : null}
        </View>

        {/* Tags */}
        {(genresList.length > 0 ||
          instrumentsList.length > 0 ||
          moodList.length > 0 ||
          speed ||
          vocalType) && (
          <>
            <Divider style={styles.divider} />
            <View style={styles.tagsSection}>
              <Text
                style={[styles.sectionTitle, { color: theme.colors.onSurface }]}
              >
                Tags
              </Text>
              {genresList.length > 0 && (
                <View style={styles.tagGroup}>
                  <Text
                    style={[
                      styles.tagGroupTitle,
                      { color: theme.colors.onSurfaceVariant },
                    ]}
                  >
                    Genres
                  </Text>
                  <View style={styles.tagContainer}>
                    {genresList.map((genre, index) => (
                      <Chip key={index} style={styles.chip}>
                        {genre}
                      </Chip>
                    ))}
                  </View>
                </View>
              )}
              {instrumentsList.length > 0 && (
                <View style={styles.tagGroup}>
                  <Text
                    style={[
                      styles.tagGroupTitle,
                      { color: theme.colors.onSurfaceVariant },
                    ]}
                  >
                    Instruments
                  </Text>
                  <View style={styles.tagContainer}>
                    {instrumentsList.map((instrument, index) => (
                      <Chip key={index} style={styles.chip}>
                        {instrument}
                      </Chip>
                    ))}
                  </View>
                </View>
              )}
              {moodList.length > 0 && (
                <View style={styles.tagGroup}>
                  <Text
                    style={[
                      styles.tagGroupTitle,
                      { color: theme.colors.onSurfaceVariant },
                    ]}
                  >
                    Mood
                  </Text>
                  <View style={styles.tagContainer}>
                    {moodList.map((m, index) => (
                      <Chip key={index} style={styles.chip}>
                        {m}
                      </Chip>
                    ))}
                  </View>
                </View>
              )}
              {speed && (
                <View style={styles.tagGroup}>
                  <Text
                    style={[
                      styles.tagGroupTitle,
                      { color: theme.colors.onSurfaceVariant },
                    ]}
                  >
                    Speed
                  </Text>
                  <Chip style={styles.chip}>{speed}</Chip>
                </View>
              )}
              {vocalType && (
                <View style={styles.tagGroup}>
                  <Text
                    style={[
                      styles.tagGroupTitle,
                      { color: theme.colors.onSurfaceVariant },
                    ]}
                  >
                    Vocal Type
                  </Text>
                  <Chip style={styles.chip}>{vocalType}</Chip>
                </View>
              )}
            </View>
          </>
        )}
      </ScrollView>

      {/* Sheet opens directly to library or playlist view */}
      <ActionsSheet
        visible={sheetOpen}
        onClose={() => setSheetOpen(false)}
        itemType="TRACK"
        providerId={id ?? ""}
        title={title ?? "Track"}
        initialView={sheetMode}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  customHeader: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 8,
    paddingVertical: 8,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: "600",
    flex: 1,
    textAlign: "center",
  },
  headerActions: {
    flexDirection: "row",
    alignItems: "center",
  },
  iconBtn: {
    width: 40,
    height: 40,
    justifyContent: "center",
    alignItems: "center",
  },
  content: { flex: 1 },
  header: { alignItems: "center", padding: 24 },
  trackCover: {
    width: 200,
    height: 200,
    borderRadius: 12,
    marginBottom: 16,
    backgroundColor: "#e0e0e0",
  },
  trackTitle: {
    fontSize: 24,
    fontWeight: "bold",
    marginBottom: 8,
    textAlign: "center",
  },
  artistName: { fontSize: 18, marginBottom: 4, textAlign: "center" },
  albumName: { fontSize: 16, textAlign: "center" },
  divider: { marginVertical: 16 },
  controls: { paddingHorizontal: 24 },
  infoSection: { paddingHorizontal: 24 },
  sectionTitle: { fontSize: 18, fontWeight: "bold", marginBottom: 16 },
  infoRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 12,
  },
  infoLabel: { fontSize: 14 },
  infoValue: { fontSize: 14, fontWeight: "600" },
  tagsSection: { paddingHorizontal: 24, paddingBottom: 24 },
  tagGroup: { marginBottom: 16 },
  tagGroupTitle: { fontSize: 14, fontWeight: "600", marginBottom: 8 },
  tagContainer: { flexDirection: "row", flexWrap: "wrap", gap: 8 },
  chip: { marginRight: 0 },
});
