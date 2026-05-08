import { IconSymbol } from "@/components/ui/icon-symbol";
import type { Album, Track } from "@/features/music-for-me/music-types";
import {
    useDeleteLibraryItemMutation,
    useGetLibraryByIdQuery,
    useGetLibraryItemsQuery,
    useUpdateLibraryMutation,
} from "@/features/music-me/music-me-api";
import type { LibraryItem } from "@/features/music-me/music-me-types";
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

function isTrack(music: Track | Album): music is Track {
  return "title" in music;
}

function LibraryItemRow({
  item,
  onDelete,
  onPress,
}: {
  item: LibraryItem;
  onDelete: () => void;
  onPress: () => void;
}) {
  const theme = useTheme();
  const music = item.music;
  const title = isTrack(music) ? music.title : music.name;
  const subtitle = isTrack(music) ? music.artist.name : music.artist.name;
  const cover = isTrack(music) ? music.coverUrl : music.coverUrl;

  return (
    <Pressable style={styles.itemRow} onPress={onPress}>
      {cover ? (
        <Image source={{ uri: cover }} style={styles.itemCover} />
      ) : (
        <View style={[styles.itemCover, styles.itemCoverPlaceholder]}>
          <IconSymbol
            name="music.note"
            size={20}
            color={theme.colors.onSurfaceVariant}
          />
        </View>
      )}
      <View style={styles.itemInfo}>
        <Text
          style={[styles.itemTitle, { color: theme.colors.onSurface }]}
          numberOfLines={1}
        >
          {title}
        </Text>
        <Text
          style={[
            styles.itemSubtitle,
            { color: theme.colors.onSurfaceVariant },
          ]}
          numberOfLines={1}
        >
          {item.itemType} • {subtitle}
        </Text>
      </View>
      <IconButton
        icon="delete"
        size={20}
        iconColor={theme.colors.error}
        onPress={onDelete}
      />
    </Pressable>
  );
}

export default function LibraryDetailScreen() {
  const theme = useTheme();
  const router = useRouter();
  const { id, name } = useLocalSearchParams<{ id: string; name: string }>();

  const { data: library } = useGetLibraryByIdQuery(id);
  const { data: items = [], isLoading } = useGetLibraryItemsQuery(id);
  const [deleteItem] = useDeleteLibraryItemMutation();
  const [updateLibrary, { isLoading: isUpdating }] = useUpdateLibraryMutation();

  const [deleteTarget, setDeleteTarget] = useState<LibraryItem | null>(null);
  const [showEdit, setShowEdit] = useState(false);

  const handleUpdate = async (values: {
    name: string;
    description: string;
    isPublic: boolean;
  }) => {
    try {
      await updateLibrary({ id, body: values }).unwrap();
      showSuccessToast("Library updated!");
      setShowEdit(false);
    } catch {
      showErrorToast("Failed to update library.");
    }
  };

  const handleDelete = async () => {
    if (!deleteTarget) return;
    try {
      await deleteItem({ libraryId: id, itemId: deleteTarget.id }).unwrap();
      showSuccessToast("Item removed from library.");
    } catch {
      showErrorToast("Failed to remove item.");
    } finally {
      setDeleteTarget(null);
    }
  };

  const navigateToItem = (item: LibraryItem) => {
    const music = item.music;
    if (item.itemType === "TRACK" && isTrack(music)) {
      router.push({
        pathname: "/track/[id]",
        params: {
          id: music.id,
          title: music.title,
          artistId: music.artist.id,
          artistName: music.artist.name,
          albumId: music.album?.id ?? "",
          albumName: music.album?.name ?? "",
          coverUrl: music.coverUrl ?? "",
          duration: music.duration.toString(),
          streamUrl: music.streamUrl ?? "",
        },
      });
    } else if (item.itemType === "ALBUM" && !isTrack(music)) {
      router.push({
        pathname: "/album/[id]",
        params: {
          id: music.id,
          name: music.name,
          artistName: music.artist.name,
          coverUrl: music.coverUrl ?? "",
          releaseDate: music.releaseDate ?? "",
        },
      });
    }
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
          Library
        </Text>
        <Pressable onPress={() => setShowEdit(true)} style={styles.backBtn}>
          <IconSymbol
            name="pencil"
            size={24}
            color={theme.colors.primary}
          />
        </Pressable>
      </View>

      {/* Library info */}
      <View style={styles.info}>
        <Text style={[styles.libraryName, { color: theme.colors.onSurface }]}>
          {library?.name ?? name}
        </Text>
        {library?.description ? (
          <Text
            style={[
              styles.libraryDesc,
              { color: theme.colors.onSurfaceVariant },
            ]}
          >
            {library.description}
          </Text>
        ) : null}
        <Text
          style={[styles.libraryMeta, { color: theme.colors.onSurfaceVariant }]}
        >
          {library?.itemCount ?? items.length} items •{" "}
          {library?.isPublic ? "Public" : "Private"}
        </Text>
      </View>

      <Divider />

      {isLoading ? (
        <View style={styles.centered}>
          <ActivityIndicator color={theme.colors.primary} />
        </View>
      ) : items.length === 0 ? (
        <View style={styles.centered}>
          <IconSymbol
            name="music.note.list"
            size={48}
            color={theme.colors.onSurfaceVariant}
          />
          <Text
            style={[styles.emptyText, { color: theme.colors.onSurfaceVariant }]}
          >
            No items in this library yet
          </Text>
        </View>
      ) : (
        <FlatList
          data={items}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => (
            <LibraryItemRow
              item={item}
              onPress={() => navigateToItem(item)}
              onDelete={() => setDeleteTarget(item)}
            />
          )}
          contentContainerStyle={styles.list}
        />
      )}

      <ConfirmModal
        visible={!!deleteTarget}
        title="Remove item"
        message={`Remove this ${deleteTarget?.itemType.toLowerCase()} from the library?`}
        confirmText="Remove"
        destructive
        onConfirm={handleDelete}
        onCancel={() => setDeleteTarget(null)}
      />

      <CreateFormModal
        visible={showEdit}
        title="Edit Library"
        submitText="Save"
        initialValues={{
          name: library?.name ?? name,
          description: library?.description ?? "",
          isPublic: library?.isPublic ?? false,
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
  libraryName: { fontSize: 22, fontWeight: "bold", marginBottom: 4 },
  libraryDesc: { fontSize: 14, marginBottom: 6, opacity: 0.8 },
  libraryMeta: { fontSize: 13 },
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
    paddingVertical: 8,
    gap: 12,
  },
  itemCover: { width: 52, height: 52, borderRadius: 8 },
  itemCoverPlaceholder: {
    backgroundColor: "#202C44",
    justifyContent: "center",
    alignItems: "center",
  },
  itemInfo: { flex: 1 },
  itemTitle: { fontSize: 15, fontWeight: "600", marginBottom: 2 },
  itemSubtitle: { fontSize: 13 },
});
