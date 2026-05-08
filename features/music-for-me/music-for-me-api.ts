import { api, ApiResponse, unwrapApiResponse } from "@/services/api";
import type {
    AlbumsResponse,
    ArtistsResponse,
    PaginationParams,
    SearchParams,
    SearchResponse,
    TracksResponse,
} from "./music-types";

export const musicForMeApi = api.injectEndpoints({
  endpoints: (builder) => ({
    getTracks: builder.query<TracksResponse["data"], PaginationParams>({
      query: ({ limit, offset }) => ({
        url: "/core/music-for-me/tracks",
        method: "GET",
        params: { limit, offset },
      }),
      transformResponse: (response: ApiResponse<TracksResponse["data"]>) =>
        unwrapApiResponse(response),
    }),
    getAlbums: builder.query<AlbumsResponse["data"], PaginationParams>({
      query: ({ limit, offset }) => ({
        url: "/core/music-for-me/albums",
        method: "GET",
        params: { limit, offset },
      }),
      transformResponse: (response: ApiResponse<AlbumsResponse["data"]>) =>
        unwrapApiResponse(response),
    }),
    getArtists: builder.query<ArtistsResponse["data"], PaginationParams>({
      query: ({ limit, offset }) => ({
        url: "/core/music-for-me/artists",
        method: "GET",
        params: { limit, offset },
      }),
      transformResponse: (response: ApiResponse<ArtistsResponse["data"]>) =>
        unwrapApiResponse(response),
    }),
    searchMusic: builder.query<SearchResponse["data"], SearchParams>({
      query: ({ q, limit }) => ({
        url: "/core/music-for-me/search",
        method: "GET",
        params: { q, limit },
      }),
      transformResponse: (response: ApiResponse<SearchResponse["data"]>) =>
        unwrapApiResponse(response),
    }),
  }),
});

export const {
  useGetTracksQuery,
  useGetAlbumsQuery,
  useGetArtistsQuery,
  useSearchMusicQuery,
} = musicForMeApi;
