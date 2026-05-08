import { AlbumCard } from "@/components/music-for-me/album-card";
import { ArtistCard } from "@/components/music-for-me/artist-card";
import { TrackCard } from "@/components/music-for-me/track-card";
import { appConfig } from "@/config/app-config";
import { useSearchMusicQuery } from "@/features/music-for-me/music-for-me-api";
import type { Album, Artist, Track } from "@/features/music-for-me/music-types";
import { useSearchHistory } from "@/hooks/use-search-history";
import { useRouter } from "expo-router";
import React, { useEffect, useState } from "react";
import {
  FlatList,
  Keyboard,
  Modal,
  Pressable,
  StyleSheet,
  View,
} from "react-native";
import {
  ActivityIndicator,
  Chip,
  Divider,
  IconButton,
  Searchbar,
  Text,
  useTheme,
} from "react-native-paper";
import { SafeAreaView } from "react-native-safe-area-context";

type SearchTab = "tracks" | "albums" | "artists";

interface SearchModalProps {
  visible: boolean;
  onClose: () => void;
}

export function SearchModal({ visible, onClose }: SearchModalProps) {
  const theme = useTheme();
  const router = useRouter();

  const [query, setQuery] = useState("");
  const [debouncedQuery, setDebouncedQuery] = useState("");
  const [activeTab, setActiveTab] = useState<SearchTab>("tracks");

  const { history, addToHistory, removeFromHistory, clearHistory } =
    useSearchHistory();

  // Debounce
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedQuery(query.trim());
    }, appConfig.searchDebounceMs);
    return () => clearTimeout(timer);
  }, [query]);

  // Auto-focus when modal opens
  useEffect(() => {
    if (!visible) {
      // Reset state on close
      setQuery("");
      setDebouncedQuery("");
      setActiveTab("tracks");
    }
  }, [visible]);

  const { data, isLoading, isFetching } = useSearchMusicQuery(
    { q: debouncedQuery, limit: appConfig.searchLimit },
    { skip: debouncedQuery.length === 0 },
  );

  const tracks = data?.tracks ?? [];
  const albums = data?.albums ?? [];
  const artists = data?.artists ?? [];

  const tabCounts: Record<SearchTab, number> = {
    tracks: tracks.length,
    albums: albums.length,
    artists: artists.length,
  };

  const isSearching = isLoading || isFetching;
  const hasQuery = debouncedQuery.length > 0;
  const hasResults =
    tracks.length > 0 || albums.length > 0 || artists.length > 0;

  const handleClose = () => {
    Keyboard.dismiss();
    onClose();
  };

  const handleSelectHistory = (q: string) => {
    setQuery(q);
  };

  const handleSubmit = () => {
    if (query.trim()) {
      addToHistory(query.trim());
    }
  };

  const navigateToTrack = (item: Track) => {
    addToHistory(query.trim());
    handleClose();
    router.push({
      pathname: "/track/[id]",
      params: {
        id: item.id,
        title: item.title,
        artistId: item.artist.id,
        artistName: item.artist.name,
        albumId: item.album?.id ?? "",
        albumName: item.album?.name ?? "",
        coverUrl: item.coverUrl ?? "",
        duration: item.duration.toString(),
        releaseDate: item.releaseDate ?? "",
        license: item.license ?? "",
        streamUrl: item.streamUrl ?? "",
        genres: item.tags?.genres?.join(",") ?? "",
        instruments: item.tags?.instruments?.join(",") ?? "",
        mood: item.tags?.mood?.join(",") ?? "",
        speed: item.tags?.speed ?? "",
        vocalType: item.tags?.vocalType ?? "",
      },
    });
  };

  const navigateToAlbum = (item: Album) => {
    addToHistory(query.trim());
    handleClose();
    router.push({
      pathname: "/album/[id]",
      params: {
        id: item.id,
        name: item.name,
        artistName: item.artist.name,
        coverUrl: item.coverUrl ?? "",
        releaseDate: item.releaseDate ?? "",
      },
    });
  };

  const navigateToArtist = (item: Artist) => {
    addToHistory(query.trim());
    handleClose();
    router.push({
      pathname: "/artist/[id]",
      params: {
        id: item.id,
        name: item.name,
        imageUrl: item.imageUrl ?? "",
        website: item.website ?? "",
        joinDate: item.joinDate ?? "",
      },
    });
  };

  const renderHistory = () => {
    if (history.length === 0) return null;

    return (
      <View style={styles.historyContainer}>
        <View style={styles.historyHeader}>
          <Text
            style={[styles.historyTitle, { color: theme.colors.onSurface }]}
          >
            Recent searches
          </Text>
          <Pressable onPress={clearHistory}>
            <Text style={[styles.clearAll, { color: theme.colors.primary }]}>
              Clear all
            </Text>
          </Pressable>
        </View>
        {history.map((item) => (
          <View key={item.query} style={styles.historyItem}>
            <Pressable
              style={styles.historyItemContent}
              onPress={() => handleSelectHistory(item.query)}
            >
              <IconButton
                icon="history"
                size={18}
                iconColor={theme.colors.onSurfaceVariant}
                style={styles.historyIcon}
              />
              <Text
                style={[styles.historyText, { color: theme.colors.onSurface }]}
                numberOfLines={1}
              >
                {item.query}
              </Text>
            </Pressable>
            <IconButton
              icon="close"
              size={16}
              iconColor={theme.colors.onSurfaceVariant}
              onPress={() => removeFromHistory(item.query)}
            />
          </View>
        ))}
        <Divider style={styles.divider} />
      </View>
    );
  };

  const renderResults = () => {
    if (!hasQuery) {
      return renderHistory();
    }

    if (isSearching) {
      return (
        <View style={styles.centeredContainer}>
          <ActivityIndicator size="large" color={theme.colors.primary} />
        </View>
      );
    }

    if (!hasResults) {
      return (
        <View style={styles.centeredContainer}>
          <Text
            style={[
              styles.placeholderText,
              { color: theme.colors.onSurfaceVariant },
            ]}
          >
            No results for &quot;{debouncedQuery}&quot;
          </Text>
        </View>
      );
    }

    return (
      <>
        {/* Tabs */}
        <View style={styles.tabsContainer}>
          {(["tracks", "albums", "artists"] as SearchTab[]).map((tab) => (
            <Chip
              key={tab}
              selected={activeTab === tab}
              onPress={() => setActiveTab(tab)}
              style={styles.tabChip}
              showSelectedCheck={false}
            >
              {tab.charAt(0).toUpperCase() + tab.slice(1)}
              {tabCounts[tab] > 0 ? ` (${tabCounts[tab]})` : ""}
            </Chip>
          ))}
        </View>

        {activeTab === "tracks" && (
          <FlatList
            data={tracks}
            keyExtractor={(item) => item.id}
            renderItem={({ item }) => (
              <TrackCard item={item} onPress={() => navigateToTrack(item)} />
            )}
            contentContainerStyle={styles.listContent}
            keyboardShouldPersistTaps="handled"
          />
        )}
        {activeTab === "albums" && (
          <FlatList
            data={albums}
            keyExtractor={(item) => item.id}
            renderItem={({ item }) => (
              <AlbumCard item={item} onPress={() => navigateToAlbum(item)} />
            )}
            contentContainerStyle={styles.listContent}
            keyboardShouldPersistTaps="handled"
          />
        )}
        {activeTab === "artists" && (
          <FlatList
            data={artists}
            keyExtractor={(item) => item.id}
            renderItem={({ item }) => (
              <ArtistCard item={item} onPress={() => navigateToArtist(item)} />
            )}
            contentContainerStyle={styles.listContent}
            keyboardShouldPersistTaps="handled"
          />
        )}
      </>
    );
  };

  return (
    <Modal
      visible={visible}
      animationType="slide"
      presentationStyle="pageSheet"
      onRequestClose={handleClose}
    >
      <SafeAreaView
        style={[styles.container, { backgroundColor: theme.colors.background }]}
      >
        {/* Search bar row */}
        <View style={styles.searchRow}>
          <Searchbar
            placeholder="Tracks, albums, artists..."
            value={query}
            onChangeText={setQuery}
            onSubmitEditing={handleSubmit}
            style={[
              styles.searchBar,
              { backgroundColor: theme.colors.surfaceVariant },
            ]}
            inputStyle={{ color: theme.colors.onSurface }}
            iconColor={theme.colors.onSurfaceVariant}
            placeholderTextColor={theme.colors.onSurfaceVariant}
            autoCapitalize="none"
            autoCorrect={false}
            autoFocus
          />
          <Pressable onPress={handleClose} style={styles.cancelButton}>
            <Text style={[styles.cancelText, { color: theme.colors.primary }]}>
              Cancel
            </Text>
          </Pressable>
        </View>

        {/* Content */}
        <View style={styles.content}>{renderResults()}</View>
      </SafeAreaView>
    </Modal>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  searchRow: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingTop: 12,
    paddingBottom: 8,
    gap: 8,
  },
  searchBar: {
    flex: 1,
    elevation: 0,
    borderRadius: 12,
  },
  cancelButton: {
    paddingHorizontal: 4,
    paddingVertical: 8,
  },
  cancelText: {
    fontSize: 16,
  },
  content: {
    flex: 1,
  },
  historyContainer: {
    paddingTop: 8,
  },
  historyHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingVertical: 8,
  },
  historyTitle: {
    fontSize: 14,
    fontWeight: "600",
    opacity: 0.6,
  },
  clearAll: {
    fontSize: 14,
  },
  historyItem: {
    flexDirection: "row",
    alignItems: "center",
    paddingRight: 4,
  },
  historyItemContent: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
  },
  historyIcon: {
    margin: 0,
  },
  historyText: {
    flex: 1,
    fontSize: 15,
  },
  divider: {
    marginTop: 8,
  },
  tabsContainer: {
    flexDirection: "row",
    paddingHorizontal: 16,
    paddingVertical: 8,
    gap: 8,
  },
  tabChip: {
    borderRadius: 20,
  },
  listContent: {
    paddingHorizontal: 16,
    paddingBottom: 24,
  },
  centeredContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 32,
  },
  placeholderText: {
    fontSize: 16,
    textAlign: "center",
    opacity: 0.6,
  },
});
