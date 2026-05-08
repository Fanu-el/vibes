// Music-for-me types based on API specification

export interface Artist {
  id: string;
  name: string;
  website?: string;
  joinDate?: string;
  imageUrl?: string;
  shareUrl?: string;
}

export interface Album {
  id: string;
  name: string;
  releaseDate?: string;
  coverUrl?: string;
  shareUrl?: string;
  artist: {
    id: string;
    name: string;
  };
}

export interface Track {
  id: string;
  title: string;
  duration: number; // seconds
  releaseDate?: string;
  streamUrl?: string;
  downloadUrl?: string | null;
  downloadAllowed?: boolean;
  coverUrl?: string;
  license?: string;
  shareUrl?: string;
  artist: {
    id: string;
    name: string;
  };
  album?: {
    id: string;
    name: string;
  } | null;
  tags?: {
    genres?: string[];
    instruments?: string[];
    mood?: string[];
    speed?: string;
    vocalType?: string;
  } | null;
}

// Scored items returned by music-for-me endpoint
export interface ScoredTrack {
  score: number;
  track: Track;
}

export interface ScoredAlbum {
  score: number;
  album: Album;
}

export interface ScoredArtist {
  score: number;
  artist: Artist;
}

// Search response
export interface SearchResponse {
  data: {
    tracks: Track[];
    albums: Album[];
    artists: Artist[];
  };
}

// Search params
export interface SearchParams {
  q: string;
  limit: number;
}

// Pagination parameters
export interface PaginationParams {
  limit: number;
  offset: number;
}

// Paginated response wrapper
export interface PaginatedData<T> {
  items: T[];
  total: number;
  page: number;
}

// API response types for music-for-me endpoints (items are direct objects, not wrapped)
export interface TracksResponse {
  data: {
    items: Track[];
    total: number;
    page: number;
  };
}

export interface AlbumsResponse {
  data: {
    items: Album[];
    total: number;
    page: number;
  };
}

export interface ArtistsResponse {
  data: {
    items: Artist[];
    total: number;
    page: number;
  };
}
