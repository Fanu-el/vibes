import type { Album, Artist, Track } from "@/features/music-for-me/music-types";

// ─── Libraries ────────────────────────────────────────────────────────────────

export interface Library {
  id: string;
  name: string;
  description?: string;
  isPublic: boolean;
  itemCount: number;
}

export interface LibraryItem {
  id: string;
  itemType: "TRACK" | "ALBUM";
  providerId: string;
  providerName: string;
  addedAt: string;
  music: Track | Album;
}

export interface CreateLibraryRequest {
  name: string;
  description?: string;
  isPublic: boolean;
}

export interface UpdateLibraryRequest {
  name?: string;
  description?: string;
  isPublic?: boolean;
}

export interface AddLibraryItemRequest {
  itemType: "TRACK" | "ALBUM";
  providerId: string;
}

// ─── Playlists ────────────────────────────────────────────────────────────────

export interface Playlist {
  id: string;
  name: string;
  description?: string;
  isPublic: boolean;
  trackCount: number;
  createdAt: string;
  updatedAt: string;
}

export interface PlaylistTrack {
  id: string;
  position: number;
  providerId: string;
  providerName: string;
  addedAt: string;
  track: Track;
}

export interface CreatePlaylistRequest {
  name: string;
  description?: string;
  isPublic: boolean;
}

export interface UpdatePlaylistRequest {
  name?: string;
  description?: string;
  isPublic?: boolean;
}

export interface AddPlaylistTrackRequest {
  providerId: string;
}

// ─── Likes ────────────────────────────────────────────────────────────────────

export interface LikedTrack {
  id: string;
  providerId: string;
  providerName: string;
  likedAt: string;
  track: Track;
}

export interface LikedAlbum {
  id: string;
  providerId: string;
  providerName: string;
  likedAt: string;
  album: Album;
}

export interface LikedArtist {
  id: string;
  providerId: string;
  providerName: string;
  likedAt: string;
  artist: Artist;
}

// ─── Recently Played ─────────────────────────────────────────────────────────

export interface RecentlyPlayedItem {
  playedAt: string;
  track: Track;
}

export interface LogPlayRequest {
  providerId: string;
}
