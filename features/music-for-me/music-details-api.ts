import { api, ApiResponse, unwrapApiResponse } from "@/services/api";
import type { Album, PaginationParams, Track } from "./music-types";

// Response types for detail endpoints
export interface ArtistTracksResponse {
  data: {
    items: Track[];
    total: number;
    page: number;
  };
}

export interface ArtistAlbumsResponse {
  data: {
    items: Album[];
    total: number;
    page: number;
  };
}

export interface AlbumTracksResponse {
  data: {
    items: Track[];
    total: number;
    page: number;
  };
}

export interface ArtistQueryParams extends PaginationParams {
  artistId: string;
}

export interface AlbumQueryParams extends PaginationParams {
  albumId: string;
}

export const musicDetailsApi = api.injectEndpoints({
  endpoints: (builder) => ({
    getArtistTracks: builder.query<
      ArtistTracksResponse["data"],
      ArtistQueryParams
    >({
      query: ({ artistId, limit, offset }) => ({
        url: `/core/music-for-me/artists/${artistId}/tracks`,
        method: "GET",
        params: { limit, offset },
      }),
      transformResponse: (
        response: ApiResponse<ArtistTracksResponse["data"]>,
      ) => unwrapApiResponse(response),
    }),
    getArtistAlbums: builder.query<
      ArtistAlbumsResponse["data"],
      ArtistQueryParams
    >({
      query: ({ artistId, limit, offset }) => ({
        url: `/core/music-for-me/artists/${artistId}/albums`,
        method: "GET",
        params: { limit, offset },
      }),
      transformResponse: (
        response: ApiResponse<ArtistAlbumsResponse["data"]>,
      ) => unwrapApiResponse(response),
    }),
    getAlbumTracks: builder.query<
      AlbumTracksResponse["data"],
      AlbumQueryParams
    >({
      query: ({ albumId, limit, offset }) => ({
        url: `/core/music-for-me/albums/${albumId}/tracks`,
        method: "GET",
        params: { limit, offset },
      }),
      transformResponse: (response: ApiResponse<AlbumTracksResponse["data"]>) =>
        unwrapApiResponse(response),
    }),
  }),
});

export const {
  useGetArtistTracksQuery,
  useGetArtistAlbumsQuery,
  useGetAlbumTracksQuery,
} = musicDetailsApi;
