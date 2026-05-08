import { IconSymbol } from "@/components/ui/icon-symbol";
import { Colors } from "@/constants/theme";
import { usePlayer } from "@/hooks/use-player";
import { useRouter } from "expo-router";
import { MotiView } from "moti";
import React, { useCallback, useState } from "react";
import {
  Dimensions,
  Image,
  Modal,
  Pressable,
  StyleSheet,
  View,
} from "react-native";
import { ActivityIndicator, Text } from "react-native-paper";
import { useSafeAreaInsets } from "react-native-safe-area-context";

const SCREEN_WIDTH = Dimensions.get("window").width;
const COVER_SIZE = SCREEN_WIDTH - 64;

// ─── Helpers ─────────────────────────────────────────────────────────────────

function formatSecs(secs: number): string {
  const m = Math.floor(secs / 60);
  const s = Math.floor(secs % 60);
  return `${m}:${s.toString().padStart(2, "0")}`;
}

// ─── Seek Bar ─────────────────────────────────────────────────────────────────

interface SeekBarProps {
  positionMs: number;
  durationMs: number;
  onSeek: (ms: number) => void;
}

function SeekBar({ positionMs, durationMs, onSeek }: SeekBarProps) {
  const [barWidth, setBarWidth] = useState(1);
  const progress = durationMs > 0 ? Math.min(positionMs / durationMs, 1) : 0;

  return (
    <View style={seekStyles.wrapper}>
      {/* Track */}
      <Pressable
        style={seekStyles.track}
        onLayout={(e) => setBarWidth(e.nativeEvent.layout.width)}
        onPress={(e) => {
          if (durationMs <= 0 || barWidth <= 1) return;
          const pct = Math.max(
            0,
            Math.min(e.nativeEvent.locationX / barWidth, 1),
          );
          onSeek(Math.floor(pct * durationMs));
        }}
      >
        {/* Background */}
        <View style={seekStyles.trackBg} />
        {/* Filled */}
        <MotiView
          style={[seekStyles.trackFill, { width: `${progress * 100}%` }]}
          animate={{ width: `${progress * 100}%` as any }}
          transition={{ type: "timing", duration: 800 }}
        />
        {/* Thumb */}
        <MotiView
          style={seekStyles.thumb}
          animate={{ left: `${progress * 100}%` as any }}
          transition={{ type: "timing", duration: 800 }}
        />
      </Pressable>

      {/* Times */}
      <View style={seekStyles.times}>
        <Text style={seekStyles.time}>{formatSecs(positionMs / 1000)}</Text>
        <Text style={seekStyles.time}>{formatSecs(durationMs / 1000)}</Text>
      </View>
    </View>
  );
}

const seekStyles = StyleSheet.create({
  wrapper: {
    width: "100%",
    paddingHorizontal: 24,
    marginBottom: 8,
  },
  track: {
    height: 36,
    justifyContent: "center",
    marginBottom: 4,
  },
  trackBg: {
    position: "absolute",
    left: 0,
    right: 0,
    height: 4,
    backgroundColor: Colors.light.border,
    borderRadius: 2,
  },
  trackFill: {
    position: "absolute",
    left: 0,
    height: 4,
    backgroundColor: Colors.light.tint,
    borderRadius: 2,
  },
  thumb: {
    position: "absolute",
    width: 14,
    height: 14,
    borderRadius: 7,
    backgroundColor: Colors.light.text,
    marginLeft: -7,
    top: "50%",
    marginTop: -7,
  },
  times: {
    flexDirection: "row",
    justifyContent: "space-between",
  },
  time: {
    fontSize: 12,
    color: Colors.light.mutedText,
  },
});

// ─── Full Screen Player ───────────────────────────────────────────────────────

interface FullPlayerProps {
  onCollapse: () => void;
}

function FullPlayer({ onCollapse }: FullPlayerProps) {
  const { track, status, positionMs, durationMs, togglePlayPause, seek, stop } =
    usePlayer();
  const insets = useSafeAreaInsets();
  const router = useRouter();

  const isLoading = status === "loading";
  const isPlaying = status === "playing";

  const handleStop = useCallback(() => {
    stop();
    onCollapse();
  }, [stop, onCollapse]);

  const seekBack = useCallback(() => {
    seek(Math.max(0, positionMs - 15000));
  }, [seek, positionMs]);

  const seekForward = useCallback(() => {
    seek(Math.min(durationMs, positionMs + 15000));
  }, [seek, positionMs, durationMs]);

  const goToTrack = useCallback(() => {
    if (!track) return;
    onCollapse();
    router.push({
      pathname: "/track/[id]",
      params: {
        id: track.id,
        title: track.title,
        artistId: track.artistId,
        artistName: track.artistName,
        albumId: track.albumId ?? "",
        albumName: track.albumName ?? "",
        coverUrl: track.coverUrl ?? "",
        duration: track.duration.toString(),
      },
    });
  }, [track, router, onCollapse]);

  const goToArtist = useCallback(() => {
    if (!track?.artistId) return;
    onCollapse();
    router.push({
      pathname: "/artist/[id]",
      params: {
        id: track.artistId,
        name: track.artistName,
      },
    });
  }, [track, router, onCollapse]);

  const goToAlbum = useCallback(() => {
    if (!track?.albumId) return;
    onCollapse();
    router.push({
      pathname: "/album/[id]",
      params: {
        id: track.albumId,
        name: track.albumName ?? "",
        artistName: track.artistName,
      },
    });
  }, [track, router, onCollapse]);

  if (!track) return null;

  return (
    <Modal
      visible
      animationType="slide"
      presentationStyle="fullScreen"
      statusBarTranslucent
      onRequestClose={onCollapse}
    >
      <View
        style={[
          fullStyles.container,
          { paddingTop: insets.top + 8, paddingBottom: insets.bottom + 16 },
        ]}
      >
        {/* Header row */}
        <View style={fullStyles.header}>
          <Pressable
            onPress={onCollapse}
            style={fullStyles.headerBtn}
            hitSlop={12}
          >
            <IconSymbol
              name="chevron.down"
              size={28}
              color={Colors.light.text}
            />
          </Pressable>
          <View style={fullStyles.headerCenter}>
            <Text style={fullStyles.headerLabel}>Now Playing</Text>
            {track.albumName ? (
              <Text style={fullStyles.headerSub} numberOfLines={1}>
                {track.albumName}
              </Text>
            ) : null}
          </View>
          <Pressable
            onPress={handleStop}
            style={fullStyles.headerBtn}
            hitSlop={12}
          >
            <IconSymbol name="xmark" size={20} color={Colors.light.mutedText} />
          </Pressable>
        </View>

        {/* Artwork — pulses when playing */}
        <View style={fullStyles.artworkContainer}>
          <MotiView
            animate={{
              scale: isPlaying ? 1 : 0.88,
              shadowOpacity: isPlaying ? 0.5 : 0.15,
            }}
            transition={{ type: "spring", damping: 18, stiffness: 120 }}
            style={fullStyles.artworkShadow}
          >
            {track.coverUrl ? (
              <Image
                source={{ uri: track.coverUrl }}
                style={fullStyles.artwork}
              />
            ) : (
              <View style={[fullStyles.artwork, fullStyles.artworkPlaceholder]}>
                <IconSymbol
                  name="music.note"
                  size={80}
                  color={Colors.light.mutedText}
                />
              </View>
            )}
          </MotiView>
        </View>

        {/* Track info */}
        <View style={fullStyles.info}>
          <Pressable onPress={goToTrack} hitSlop={4}>
            <Text style={fullStyles.title} numberOfLines={1}>
              {track.title}
            </Text>
          </Pressable>
          <Pressable onPress={goToArtist} hitSlop={4}>
            <Text style={fullStyles.artist} numberOfLines={1}>
              {track.artistName}
            </Text>
          </Pressable>
          {track.albumName ? (
            <Pressable onPress={goToAlbum} hitSlop={4}>
              <Text style={fullStyles.album} numberOfLines={1}>
                {track.albumName}
              </Text>
            </Pressable>
          ) : null}
        </View>

        {/* Seek bar */}
        <SeekBar
          positionMs={positionMs}
          durationMs={durationMs}
          onSeek={seek}
        />

        {/* Controls */}
        <View style={fullStyles.controls}>
          {/* Seek back 15s */}
          <Pressable onPress={seekBack} style={fullStyles.sideBtn} hitSlop={12}>
            <IconSymbol
              name="gobackward.15"
              size={32}
              color={Colors.light.text}
            />
          </Pressable>

          {/* Play / Pause */}
          <Pressable
            onPress={togglePlayPause}
            style={fullStyles.playBtn}
            disabled={isLoading}
          >
            {isLoading ? (
              <ActivityIndicator size="large" color={Colors.light.background} />
            ) : (
              <MotiView
                key={isPlaying ? "pause" : "play"}
                from={{ scale: 0.75, opacity: 0.5 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ type: "spring", damping: 14 }}
              >
                <IconSymbol
                  name={isPlaying ? "pause.fill" : "play.fill"}
                  size={38}
                  color={Colors.light.background}
                />
              </MotiView>
            )}
          </Pressable>

          {/* Seek forward 15s */}
          <Pressable
            onPress={seekForward}
            style={fullStyles.sideBtn}
            hitSlop={12}
          >
            <IconSymbol
              name="goforward.15"
              size={32}
              color={Colors.light.text}
            />
          </Pressable>
        </View>
      </View>
    </Modal>
  );
}

const fullStyles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.light.background,
    alignItems: "center",
    paddingHorizontal: 0,
  },
  header: {
    width: "100%",
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 20,
    marginBottom: 24,
  },
  headerBtn: {
    width: 40,
    height: 40,
    justifyContent: "center",
    alignItems: "center",
  },
  headerCenter: {
    flex: 1,
    alignItems: "center",
  },
  headerLabel: {
    fontSize: 13,
    fontWeight: "600",
    color: Colors.light.mutedText,
    textTransform: "uppercase",
    letterSpacing: 1,
  },
  headerSub: {
    fontSize: 12,
    color: Colors.light.mutedText,
    opacity: 0.7,
    marginTop: 2,
  },
  artworkContainer: {
    width: COVER_SIZE,
    height: COVER_SIZE,
    marginBottom: 36,
  },
  artworkShadow: {
    width: COVER_SIZE,
    height: COVER_SIZE,
    borderRadius: 16,
    shadowColor: Colors.light.tint,
    shadowOffset: { width: 0, height: 12 },
    shadowRadius: 24,
    elevation: 12,
  },
  artwork: {
    width: COVER_SIZE,
    height: COVER_SIZE,
    borderRadius: 16,
  },
  artworkPlaceholder: {
    backgroundColor: Colors.light.surfaceElevated,
    justifyContent: "center",
    alignItems: "center",
  },
  info: {
    width: "100%",
    paddingHorizontal: 28,
    marginBottom: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    color: Colors.light.text,
    marginBottom: 6,
  },
  artist: {
    fontSize: 16,
    color: Colors.light.mutedText,
  },
  album: {
    fontSize: 14,
    color: Colors.light.mutedText,
    opacity: 0.7,
    marginTop: 2,
    textDecorationLine: "underline",
  },
  controls: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 32,
    marginTop: 16,
    paddingHorizontal: 24,
  },
  sideBtn: {
    width: 52,
    height: 52,
    justifyContent: "center",
    alignItems: "center",
  },
  playBtn: {
    width: 72,
    height: 72,
    borderRadius: 36,
    backgroundColor: Colors.light.tint,
    justifyContent: "center",
    alignItems: "center",
  },
});

// ─── Mini Bar ─────────────────────────────────────────────────────────────────

export function MusicPlayer() {
  const { track, status, positionMs, durationMs, togglePlayPause } =
    usePlayer();
  const insets = useSafeAreaInsets();
  const [expanded, setExpanded] = useState(false);

  if (!track) return null;

  const isLoading = status === "loading";
  const isPlaying = status === "playing";
  const progress = durationMs > 0 ? Math.min(positionMs / durationMs, 1) : 0;

  // Tab bar height: 49 (standard) + safe area bottom
  const TAB_BAR_HEIGHT = 49 + insets.bottom;

  return (
    <>
      <MotiView
        from={{ translateY: 100, opacity: 0 }}
        animate={{ translateY: 0, opacity: 1 }}
        exit={{ translateY: 100, opacity: 0 }}
        transition={{ type: "spring", damping: 22, stiffness: 180 }}
        style={[miniStyles.container, { bottom: TAB_BAR_HEIGHT + 8 }]}
      >
        {/* Progress strip */}
        <View style={miniStyles.progressBg}>
          <MotiView
            style={miniStyles.progressFill}
            animate={{ width: `${progress * 100}%` as any }}
            transition={{ type: "timing", duration: 800 }}
          />
        </View>

        <Pressable style={miniStyles.inner} onPress={() => setExpanded(true)}>
          {/* Cover */}
          {track.coverUrl ? (
            <Image source={{ uri: track.coverUrl }} style={miniStyles.cover} />
          ) : (
            <View style={[miniStyles.cover, miniStyles.coverPlaceholder]}>
              <IconSymbol
                name="music.note"
                size={18}
                color={Colors.light.mutedText}
              />
            </View>
          )}

          {/* Info */}
          <View style={miniStyles.info}>
            <Text style={miniStyles.title} numberOfLines={1}>
              {track.title}
            </Text>
            <Text style={miniStyles.artist} numberOfLines={1}>
              {track.artistName}
            </Text>
          </View>

          {/* Play/Pause button */}
          <Pressable
            onPress={(e) => {
              e.stopPropagation();
              togglePlayPause();
            }}
            style={miniStyles.actionBtn}
            hitSlop={8}
          >
            {isLoading ? (
              <ActivityIndicator size="small" color={Colors.light.tint} />
            ) : (
              <MotiView
                key={isPlaying ? "pause" : "play"}
                from={{ scale: 0.7 }}
                animate={{ scale: 1 }}
                transition={{ type: "spring", damping: 12 }}
              >
                <IconSymbol
                  name={isPlaying ? "pause.fill" : "play.fill"}
                  size={26}
                  color={Colors.light.tint}
                />
              </MotiView>
            )}
          </Pressable>
        </Pressable>
      </MotiView>

      {expanded && <FullPlayer onCollapse={() => setExpanded(false)} />}
    </>
  );
}

const miniStyles = StyleSheet.create({
  container: {
    position: "absolute",
    left: 12,
    right: 12,
    backgroundColor: Colors.light.surfaceElevated,
    borderRadius: 14,
    overflow: "hidden",
    elevation: 10,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.35,
    shadowRadius: 10,
  },
  progressBg: {
    height: 3,
    backgroundColor: Colors.light.border,
  },
  progressFill: {
    height: 3,
    backgroundColor: Colors.light.tint,
  },
  inner: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 12,
    paddingVertical: 10,
    gap: 12,
  },
  cover: {
    width: 46,
    height: 46,
    borderRadius: 8,
  },
  coverPlaceholder: {
    backgroundColor: Colors.light.surface,
    justifyContent: "center",
    alignItems: "center",
  },
  info: {
    flex: 1,
  },
  title: {
    fontSize: 14,
    fontWeight: "600",
    color: Colors.light.text,
    marginBottom: 2,
  },
  artist: {
    fontSize: 12,
    color: Colors.light.mutedText,
  },
  actionBtn: {
    width: 44,
    height: 44,
    justifyContent: "center",
    alignItems: "center",
  },
});
