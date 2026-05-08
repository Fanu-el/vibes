import { IconSymbol } from "@/components/ui/icon-symbol";
import { Colors } from "@/constants/theme";
import {
    useAddLibraryItemMutation,
    useAddPlaylistTrackMutation,
    useDeleteLibraryItemMutation,
    useDeletePlaylistTrackMutation,
    useGetLibrariesQuery,
    useGetLibraryItemsQuery,
    useGetLikedAlbumsQuery,
    useGetLikedTracksQuery,
    useGetPlaylistsQuery,
    useGetPlaylistTracksQuery,
    useLikeAlbumMutation,
    useLikeTrackMutation,
    useUnlikeAlbumMutation,
    useUnlikeTrackMutation,
} from "@/features/music-me/music-me-api";
import { showErrorToast, showSuccessToast } from "@/shared/feedback/toast";
import React, { useEffect, useMemo, useState } from "react";
import { Modal, Pressable, ScrollView, StyleSheet, View } from "react-native";
import { ActivityIndicator, Text } from "react-native-paper";
import { useSafeAreaInsets } from "react-native-safe-area-context";

type ItemType = "TRACK" | "ALBUM";
type SheetView = "main" | "libraries" | "playlists";

interface ActionsSheetProps {
  visible: boolean;
  onClose: () => void;
  itemType: ItemType;
  providerId: string;
  title: string;
  initialView?: SheetView;
}

export function ActionsSheet({
  visible,
  onClose,
  itemType,
  providerId,
  title,
  initialView = "main",
}: ActionsSheetProps) {
  const insets = useSafeAreaInsets();
  const [view, setView] = useState<SheetView>(initialView);
  const [addingToId, setAddingToId] = useState<string | null>(null);

  useEffect(() => {
    if (visible) setView(initialView);
    else setAddingToId(null);
  }, [visible, initialView]);

  const handleClose = () => {
    onClose();
  };

  // ── Likes ──────────────────────────────────────────────────────────────────
  const { data: likedTracks = [] } = useGetLikedTracksQuery(undefined, {
    skip: itemType !== "TRACK",
  });
  const { data: likedAlbums = [] } = useGetLikedAlbumsQuery(undefined, {
    skip: itemType !== "ALBUM",
  });
  const [likeTrack, { isLoading: likingTrack }] = useLikeTrackMutation();
  const [unlikeTrack, { isLoading: unlikingTrack }] = useUnlikeTrackMutation();
  const [likeAlbum, { isLoading: likingAlbum }] = useLikeAlbumMutation();
  const [unlikeAlbum, { isLoading: unlikingAlbum }] = useUnlikeAlbumMutation();

  const isLiked = useMemo(() => {
    if (itemType === "TRACK")
      return likedTracks.some((t) => t.providerId === providerId);
    return likedAlbums.some((a) => a.providerId === providerId);
  }, [itemType, providerId, likedTracks, likedAlbums]);

  const likingInProgress =
    itemType === "TRACK"
      ? likingTrack || unlikingTrack
      : likingAlbum || unlikingAlbum;

  const handleLike = async () => {
    try {
      if (itemType === "TRACK") {
        if (isLiked) {
          await unlikeTrack(providerId).unwrap();
        } else {
          await likeTrack(providerId).unwrap();
        }
      } else {
        if (isLiked) {
          await unlikeAlbum(providerId).unwrap();
        } else {
          await likeAlbum(providerId).unwrap();
        }
      }
      showSuccessToast(isLiked ? "Removed from likes." : "Added to likes!");
    } catch {
      showErrorToast("Failed to update likes.");
    }
  };

  // ── Libraries ──────────────────────────────────────────────────────────────
  const { data: libraries = [], isLoading: loadingLibraries } =
    useGetLibrariesQuery(undefined, { skip: view !== "libraries" });
  const [addToLibrary] = useAddLibraryItemMutation();
  const [deleteLibraryItem] = useDeleteLibraryItemMutation();

  const handleRemoveFromLibrary = async (libraryId: string, itemId: string) => {
    try {
      await deleteLibraryItem({ libraryId, itemId }).unwrap();
    } catch {
      showErrorToast("Failed to remove from library.");
      throw new Error();
    }
  };

  const handleAddToLibrary = async (libraryId: string) => {
    setAddingToId(libraryId);
    try {
      await addToLibrary({ libraryId, itemType, providerId }).unwrap();
    } catch {
      showErrorToast("Failed to add to library.");
    } finally {
      setAddingToId(null);
    }
  };

  // ── Playlists ──────────────────────────────────────────────────────────────
  const { data: playlists = [], isLoading: loadingPlaylists } =
    useGetPlaylistsQuery(undefined, {
      skip: view !== "playlists" || itemType !== "TRACK",
    });
  const [addToPlaylist] = useAddPlaylistTrackMutation();
  const [deletePlaylistTrack] = useDeletePlaylistTrackMutation();

  const handleRemoveFromPlaylist = async (playlistId: string, trackId: string) => {
    try {
      await deletePlaylistTrack({ playlistId, trackId }).unwrap();
    } catch {
      showErrorToast("Failed to remove from playlist.");
      throw new Error();
    }
  };

  const handleAddToPlaylist = async (playlistId: string) => {
    setAddingToId(playlistId);
    try {
      await addToPlaylist({ playlistId, providerId }).unwrap();
    } catch {
      showErrorToast("Failed to add to playlist.");
    } finally {
      setAddingToId(null);
    }
  };

  // ── Header label ───────────────────────────────────────────────────────────
  const headerLabel =
    view === "libraries"
      ? "Add to Library"
      : view === "playlists"
        ? "Add to Playlist"
        : title;

  return (
    <Modal
      visible={visible}
      transparent
      animationType="slide"
      onRequestClose={handleClose}
    >
      <Pressable style={styles.backdrop} onPress={handleClose} />

      <View style={[styles.sheet, { paddingBottom: insets.bottom + 20 }]}>
        {/* Drag handle */}
        <View style={styles.handle} />

        {/* Header */}
        <View style={styles.header}>
          {view !== "main" ? (
            <Pressable
              onPress={() => setView("main")}
              style={styles.headerSideBtn}
              hitSlop={12}
            >
              <IconSymbol
                name="chevron.left"
                size={20}
                color={Colors.light.tint}
              />
            </Pressable>
          ) : (
            <View style={styles.headerSideBtn} />
          )}

          <Text style={styles.headerTitle} numberOfLines={1}>
            {headerLabel}
          </Text>

          <Pressable
            onPress={handleClose}
            style={styles.headerSideBtn}
            hitSlop={12}
          >
            <IconSymbol name="xmark" size={18} color={Colors.light.mutedText} />
          </Pressable>
        </View>

        {/* ── Main view ──────────────────────────────────────────────────── */}
        {view === "main" && (
          <View style={styles.mainActions}>
            {/* Like */}
            <MainActionRow
              iconName={isLiked ? "heart.fill" : "heart"}
              iconBg={isLiked ? "#3b1219" : Colors.light.surfaceElevated}
              iconColor={isLiked ? "#ef4444" : Colors.light.text}
              label={isLiked ? "Unlike" : "Like"}
              sublabel={
                isLiked ? "Remove from your likes" : "Add to your likes"
              }
              loading={likingInProgress}
              onPress={handleLike}
            />

            {/* Add to Library */}
            <MainActionRow
              iconName="books.vertical.fill"
              iconBg={Colors.light.tintSurface}
              iconColor={Colors.light.tint}
              label="Add to Library"
              sublabel="Save to one of your libraries"
              onPress={() => setView("libraries")}
              hasChevron
            />

            {/* Add to Playlist — tracks only */}
            {itemType === "TRACK" && (
              <MainActionRow
                iconName="music.note.list.fill"
                iconBg="#2a1f3d"
                iconColor={Colors.light.accent}
                label="Add to Playlist"
                sublabel="Add to one of your playlists"
                onPress={() => setView("playlists")}
                hasChevron
              />
            )}
          </View>
        )}

        {/* ── Library picker ─────────────────────────────────────────────── */}
        {view === "libraries" && (
          <>
            <View style={styles.pickerDivider} />
            <ScrollView
              style={styles.pickerScroll}
              showsVerticalScrollIndicator={false}
              contentContainerStyle={styles.pickerContent}
            >
              {loadingLibraries ? (
                <View style={styles.loaderContainer}>
                  <ActivityIndicator color={Colors.light.tint} />
                </View>
              ) : libraries.length === 0 ? (
                <EmptyPicker message="No libraries yet. Create one in My Music." />
              ) : (
                libraries.map((lib) => (
                  <LibraryPickerRow
                    key={lib.id}
                    library={lib}
                    providerId={providerId}
                    addingToId={addingToId}
                    onAdd={handleAddToLibrary}
                    onRemove={handleRemoveFromLibrary}
                  />
                ))
              )}
            </ScrollView>
          </>
        )}

        {/* ── Playlist picker ────────────────────────────────────────────── */}
        {view === "playlists" && (
          <>
            <View style={styles.pickerDivider} />
            <ScrollView
              style={styles.pickerScroll}
              showsVerticalScrollIndicator={false}
              contentContainerStyle={styles.pickerContent}
            >
              {loadingPlaylists ? (
                <View style={styles.loaderContainer}>
                  <ActivityIndicator color={Colors.light.tint} />
                </View>
              ) : playlists.length === 0 ? (
                <EmptyPicker message="No playlists yet. Create one in My Music." />
              ) : (
                playlists.map((pl) => (
                  <PlaylistPickerRow
                    key={pl.id}
                    playlist={pl}
                    providerId={providerId}
                    addingToId={addingToId}
                    onAdd={handleAddToPlaylist}
                    onRemove={handleRemoveFromPlaylist}
                  />
                ))
              )}
            </ScrollView>
          </>
        )}
      </View>
    </Modal>
  );
}

// ─── Main Action Row ──────────────────────────────────────────────────────────

type IconName = React.ComponentProps<typeof IconSymbol>["name"];

function MainActionRow({
  iconName,
  iconBg,
  iconColor,
  label,
  sublabel,
  loading,
  onPress,
  hasChevron,
}: {
  iconName: IconName;
  iconBg: string;
  iconColor: string;
  label: string;
  sublabel: string;
  loading?: boolean;
  onPress: () => void;
  hasChevron?: boolean;
}) {
  return (
    <Pressable
      style={({ pressed }) => [styles.mainRow, pressed && styles.rowPressed]}
      onPress={onPress}
      disabled={loading}
    >
      <View style={[styles.mainRowIcon, { backgroundColor: iconBg }]}>
        {loading ? (
          <ActivityIndicator size={20} color={iconColor} />
        ) : (
          <IconSymbol name={iconName} size={22} color={iconColor} />
        )}
      </View>
      <View style={styles.mainRowText}>
        <Text style={styles.mainRowLabel}>{label}</Text>
        <Text style={styles.mainRowSublabel}>{sublabel}</Text>
      </View>
      {hasChevron && (
        <IconSymbol
          name="chevron.right"
          size={16}
          color={Colors.light.mutedText}
        />
      )}
    </Pressable>
  );
}

// ─── Picker Row ───────────────────────────────────────────────────────────────

function PickerRow({
  title,
  meta,
  loading,
  disabled,
  isAdded,
  wasRemoved,
  onPress,
  onRemove,
}: {
  title: string;
  meta: string;
  loading: boolean;
  disabled: boolean;
  isAdded?: boolean;
  wasRemoved?: boolean;
  onPress: () => void;
  onRemove?: () => void;
}) {
  // Row is tappable when not added (add) or when wasRemoved (re-add)
  const rowPressable = !isAdded;
  return (
    <Pressable
      style={({ pressed }) => [
        styles.pickerRowPressable,
        pressed && rowPressable && !disabled && styles.rowPressed,
        disabled && styles.rowDisabled,
      ]}
      onPress={rowPressable ? onPress : undefined}
      disabled={disabled || isAdded}
    >
      <View style={styles.pickerRow}>
        <View style={styles.pickerRowText}>
          <Text style={styles.pickerRowTitle} numberOfLines={1}>
            {title}
          </Text>
          <Text style={styles.pickerRowMeta}>{meta}</Text>
        </View>
        {isAdded ? (
          // Filled check — tap to remove
          <Pressable onPress={onRemove} hitSlop={12}>
            <IconSymbol name="checkmark.circle.fill" size={22} color={Colors.light.tint} />
          </Pressable>
        ) : wasRemoved ? (
          // Outline check — tap to re-add (same as tapping the row)
          <Pressable onPress={onPress} hitSlop={12}>
            <IconSymbol name="checkmark.circle" size={22} color={Colors.light.mutedText} />
          </Pressable>
        ) : loading ? (
          <ActivityIndicator size={20} color={Colors.light.tint} />
        ) : null}
      </View>
    </Pressable>
  );
}

// ─── Specific Picker Rows ─────────────────────────────────────────────────────

function LibraryPickerRow({
  library,
  providerId,
  addingToId,
  onAdd,
  onRemove,
}: {
  library: any;
  providerId: string;
  addingToId: string | null;
  onAdd: (id: string) => void;
  onRemove: (libraryId: string, itemId: string) => Promise<void>;
}) {
  const { data: items = [], isLoading } = useGetLibraryItemsQuery(library.id);
  const addedItem = items.find((item) => item.providerId === providerId);
  const [locallyRemoved, setLocallyRemoved] = useState(false);

  // wasRemoved: user removed it this session but it's not re-added yet
  const wasRemoved = locallyRemoved && !addedItem;

  const handleRemove = async () => {
    if (!addedItem) return;
    setLocallyRemoved(true);
    try {
      await onRemove(library.id, addedItem.id);
    } catch {
      setLocallyRemoved(false); // revert optimistic update on failure
    }
  };

  const handleAdd = () => {
    setLocallyRemoved(false);
    onAdd(library.id);
  };

  return (
    <PickerRow
      title={library.name}
      meta={`${library.itemCount} ${library.itemCount === 1 ? "item" : "items"}`}
      loading={addingToId === library.id || isLoading}
      disabled={addingToId !== null}
      isAdded={!!addedItem}
      wasRemoved={wasRemoved}
      onPress={handleAdd}
      onRemove={handleRemove}
    />
  );
}

function PlaylistPickerRow({
  playlist,
  providerId,
  addingToId,
  onAdd,
  onRemove,
}: {
  playlist: any;
  providerId: string;
  addingToId: string | null;
  onAdd: (id: string) => void;
  onRemove: (playlistId: string, trackId: string) => Promise<void>;
}) {
  const { data: tracks = [], isLoading } = useGetPlaylistTracksQuery(playlist.id);
  const addedTrack = tracks.find((track) => track.providerId === providerId);
  const [locallyRemoved, setLocallyRemoved] = useState(false);

  const wasRemoved = locallyRemoved && !addedTrack;

  const handleRemove = async () => {
    if (!addedTrack) return;
    setLocallyRemoved(true);
    try {
      await onRemove(playlist.id, addedTrack.id);
    } catch {
      setLocallyRemoved(false);
    }
  };

  const handleAdd = () => {
    setLocallyRemoved(false);
    onAdd(playlist.id);
  };

  return (
    <PickerRow
      title={playlist.name}
      meta={`${playlist.trackCount} ${playlist.trackCount === 1 ? "track" : "tracks"}`}
      loading={addingToId === playlist.id || isLoading}
      disabled={addingToId !== null}
      isAdded={!!addedTrack}
      wasRemoved={wasRemoved}
      onPress={handleAdd}
      onRemove={handleRemove}
    />
  );
}

// ─── Empty Picker ─────────────────────────────────────────────────────────────

function EmptyPicker({ message }: { message: string }) {
  return (
    <View style={styles.emptyContainer}>
      <IconSymbol
        name="music.note.list"
        size={36}
        color={Colors.light.mutedText}
      />
      <Text style={styles.emptyText}>{message}</Text>
    </View>
  );
}

// ─── Styles ───────────────────────────────────────────────────────────────────

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.55)",
  },
  sheet: {
    backgroundColor: Colors.light.surface,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    paddingTop: 10,
    paddingHorizontal: 0,
    maxHeight: "70%",
  },
  handle: {
    width: 36,
    height: 4,
    borderRadius: 2,
    backgroundColor: Colors.light.border,
    alignSelf: "center",
    marginBottom: 16,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 16,
    marginBottom: 16,
  },
  headerSideBtn: {
    width: 32,
    height: 32,
    justifyContent: "center",
    alignItems: "center",
  },
  headerTitle: {
    flex: 1,
    fontSize: 16,
    fontWeight: "700",
    color: Colors.light.text,
    textAlign: "center",
  },
  // Main actions
  mainActions: {
    paddingHorizontal: 12,
    gap: 4,
    paddingBottom: 8,
  },
  mainRow: {
    flexDirection: "row",
    alignItems: "center",
    padding: 12,
    borderRadius: 14,
    gap: 14,
  },
  rowPressed: {
    backgroundColor: Colors.light.surfaceElevated,
  },
  rowDisabled: {
    opacity: 0.5,
  },
  mainRowIcon: {
    width: 48,
    height: 48,
    borderRadius: 12,
    justifyContent: "center",
    alignItems: "center",
  },
  mainRowText: { flex: 1 },
  mainRowLabel: {
    fontSize: 15,
    fontWeight: "600",
    color: Colors.light.text,
    marginBottom: 2,
  },
  mainRowSublabel: {
    fontSize: 12,
    color: Colors.light.mutedText,
  },
  // Picker
  pickerContent: {
    paddingBottom: 32,
  },
  pickerDivider: {
    height: 1,
    backgroundColor: Colors.light.border,
    marginHorizontal: 16,
    marginBottom: 12,
  },
  pickerScroll: {
    maxHeight: 320,
    paddingHorizontal: 12,
    paddingTop: 16,
  },
  pickerRowPressable: {
    borderRadius: 14,
    marginBottom: 4,
  },
  pickerRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    padding: 12,
  },
  pickerRowIcon: {
    width: 40,
    height: 40,
    borderRadius: 10,
    justifyContent: "center",
    alignItems: "center",
  },
  pickerRowText: { flex: 1, marginRight: 12 },
  pickerRowTitle: {
    fontSize: 15,
    fontWeight: "600",
    color: Colors.light.text,
    marginBottom: 2,
  },
  pickerRowMeta: {
    fontSize: 12,
    color: Colors.light.mutedText,
  },
  pickerRowAction: {
    alignSelf: "center",
    flexShrink: 0,
  },
  loaderContainer: {
    paddingVertical: 32,
    alignItems: "center",
  },
  emptyContainer: {
    paddingVertical: 32,
    alignItems: "center",
    gap: 12,
  },
  emptyText: {
    color: Colors.light.mutedText,
    textAlign: "center",
    fontSize: 14,
    paddingHorizontal: 24,
  },
});
