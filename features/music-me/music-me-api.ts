import { api, ApiResponse, unwrapApiResponse } from "@/services/api";
import type {
    AddLibraryItemRequest,
    AddPlaylistTrackRequest,
    CreateLibraryRequest,
    CreatePlaylistRequest,
    Library,
    LibraryItem,
    LikedAlbum,
    LikedArtist,
    LikedTrack,
    LogPlayRequest,
    Playlist,
    PlaylistTrack,
    RecentlyPlayedItem,
    UpdateLibraryRequest,
    UpdatePlaylistRequest,
} from "./music-me-types";

const BASE = "/core/music-me";

export const musicMeApi = api.injectEndpoints({
  endpoints: (builder) => ({
    // ─── Libraries ──────────────────────────────────────────────────────────
    getLibraries: builder.query<Library[], void>({
      query: () => ({ url: `${BASE}/libraries`, method: "GET" }),
      transformResponse: (response: ApiResponse<{ libraries: Library[] }>) =>
        unwrapApiResponse(response).libraries,
      providesTags: ["Libraries"],
    }),
    getLibraryById: builder.query<Library, string>({
      query: (id) => ({ url: `${BASE}/libraries/${id}`, method: "GET" }),
      transformResponse: (response: ApiResponse<{ library: Library }>) =>
        unwrapApiResponse(response)?.library,
      providesTags: (_r, _e, id) => [{ type: "Libraries", id }],
    }),
    createLibrary: builder.mutation<Library, CreateLibraryRequest>({
      query: (body) => ({ url: `${BASE}/libraries`, method: "POST", body }),
      transformResponse: (response: ApiResponse<{ library: Library }>) =>
        unwrapApiResponse(response).library,
      invalidatesTags: ["Libraries"],
    }),
    updateLibrary: builder.mutation<Library, { id: string; body: UpdateLibraryRequest }>({
      query: ({ id, body }) => ({
        url: `${BASE}/libraries/${id}`,
        method: "PATCH",
        body,
      }),
      transformResponse: (response: ApiResponse<{ library: Library }>) =>
        unwrapApiResponse(response)?.library,
      invalidatesTags: (_r, _e, { id }) => [
        { type: "Libraries", id },
        "Libraries",
      ],
    }),
    deleteLibrary: builder.mutation<void, string>({
      query: (id) => ({ url: `${BASE}/libraries/${id}`, method: "DELETE" }),
      invalidatesTags: ["Libraries"],
    }),

    // ─── Library Items ───────────────────────────────────────────────────────
    getLibraryItems: builder.query<LibraryItem[], string>({
      query: (libraryId) => ({
        url: `${BASE}/libraries/${libraryId}/items`,
        method: "GET",
      }),
      transformResponse: (response: ApiResponse<{ items: LibraryItem[] }>) =>
        unwrapApiResponse(response).items,
      providesTags: (_r, _e, libraryId) => [
        { type: "LibraryItems", id: libraryId },
      ],
    }),
    addLibraryItem: builder.mutation<
      LibraryItem,
      { libraryId: string } & AddLibraryItemRequest
    >({
      query: ({ libraryId, ...body }) => ({
        url: `${BASE}/libraries/${libraryId}/items`,
        method: "POST",
        body,
      }),
      transformResponse: (response: ApiResponse<{ item: LibraryItem }>) =>
        unwrapApiResponse(response).item,
      invalidatesTags: (_r, _e, { libraryId }) => [
        { type: "LibraryItems", id: libraryId },
        { type: "Libraries", id: libraryId },
        "Libraries",
      ],
    }),
    deleteLibraryItem: builder.mutation<
      void,
      { libraryId: string; itemId: string }
    >({
      query: ({ libraryId, itemId }) => ({
        url: `${BASE}/libraries/${libraryId}/items/${itemId}`,
        method: "DELETE",
      }),
      invalidatesTags: (_r, _e, { libraryId }) => [
        { type: "LibraryItems", id: libraryId },
        { type: "Libraries", id: libraryId },
        "Libraries",
      ],
    }),

    // ─── Playlists ───────────────────────────────────────────────────────────
    getPlaylists: builder.query<Playlist[], void>({
      query: () => ({ url: `${BASE}/playlists`, method: "GET" }),
      transformResponse: (response: ApiResponse<{ playlists: Playlist[] }>) =>
        unwrapApiResponse(response).playlists,
      providesTags: ["Playlists"],
    }),
    getPlaylistById: builder.query<Playlist, string>({
      query: (id) => ({ url: `${BASE}/playlists/${id}`, method: "GET" }),
      transformResponse: (response: ApiResponse<{ playlist: Playlist }>) =>
        unwrapApiResponse(response)?.playlist,
      providesTags: (_r, _e, id) => [{ type: "Playlists", id }],
    }),
    createPlaylist: builder.mutation<Playlist, CreatePlaylistRequest>({
      query: (body) => ({ url: `${BASE}/playlists`, method: "POST", body }),
      transformResponse: (response: ApiResponse<{ playlist: Playlist }>) =>
        unwrapApiResponse(response).playlist,
      invalidatesTags: ["Playlists"],
    }),
    updatePlaylist: builder.mutation<Playlist, { id: string; body: UpdatePlaylistRequest }>({
      query: ({ id, body }) => ({
        url: `${BASE}/playlists/${id}`,
        method: "PATCH",
        body,
      }),
      transformResponse: (response: ApiResponse<{ playlist: Playlist }>) =>
        unwrapApiResponse(response)?.playlist,
      invalidatesTags: (_r, _e, { id }) => [
        { type: "Playlists", id },
        "Playlists",
      ],
    }),
    deletePlaylist: builder.mutation<void, string>({
      query: (id) => ({ url: `${BASE}/playlists/${id}`, method: "DELETE" }),
      invalidatesTags: ["Playlists"],
    }),

    // ─── Playlist Tracks ─────────────────────────────────────────────────────
    getPlaylistTracks: builder.query<PlaylistTrack[], string>({
      query: (playlistId) => ({
        url: `${BASE}/playlists/${playlistId}/tracks`,
        method: "GET",
      }),
      transformResponse: (response: ApiResponse<{ tracks: PlaylistTrack[] }>) =>
        unwrapApiResponse(response).tracks,
      providesTags: (_r, _e, playlistId) => [
        { type: "PlaylistTracks", id: playlistId },
      ],
    }),
    addPlaylistTrack: builder.mutation<
      PlaylistTrack,
      { playlistId: string } & AddPlaylistTrackRequest
    >({
      query: ({ playlistId, ...body }) => ({
        url: `${BASE}/playlists/${playlistId}/tracks`,
        method: "POST",
        body,
      }),
      transformResponse: (response: ApiResponse<{ track: PlaylistTrack }>) =>
        unwrapApiResponse(response).track,
      invalidatesTags: (_r, _e, { playlistId }) => [
        { type: "PlaylistTracks", id: playlistId },
        { type: "Playlists", id: playlistId },
        "Playlists",
      ],
    }),
    deletePlaylistTrack: builder.mutation<
      void,
      { playlistId: string; trackId: string }
    >({
      query: ({ playlistId, trackId }) => ({
        url: `${BASE}/playlists/${playlistId}/tracks/${trackId}`,
        method: "DELETE",
      }),
      invalidatesTags: (_r, _e, { playlistId }) => [
        { type: "PlaylistTracks", id: playlistId },
        { type: "Playlists", id: playlistId },
        "Playlists",
      ],
    }),

    // ─── Likes ───────────────────────────────────────────────────────────────
    getLikedTracks: builder.query<LikedTrack[], void>({
      query: () => ({ url: `${BASE}/likes/tracks`, method: "GET" }),
      transformResponse: (response: ApiResponse<{ tracks: LikedTrack[] }>) =>
        unwrapApiResponse(response).tracks,
      providesTags: ["LikedTracks"],
    }),
    likeTrack: builder.mutation<void, string>({
      query: (trackId) => ({
        url: `${BASE}/likes/tracks/${trackId}`,
        method: "PUT",
      }),
      invalidatesTags: ["LikedTracks"],
    }),
    unlikeTrack: builder.mutation<void, string>({
      query: (trackId) => ({
        url: `${BASE}/likes/tracks/${trackId}`,
        method: "DELETE",
      }),
      invalidatesTags: ["LikedTracks"],
    }),
    getLikedAlbums: builder.query<LikedAlbum[], void>({
      query: () => ({ url: `${BASE}/likes/albums`, method: "GET" }),
      transformResponse: (response: ApiResponse<{ albums: LikedAlbum[] }>) =>
        unwrapApiResponse(response).albums,
      providesTags: ["LikedAlbums"],
    }),
    likeAlbum: builder.mutation<void, string>({
      query: (albumId) => ({
        url: `${BASE}/likes/albums/${albumId}`,
        method: "PUT",
      }),
      invalidatesTags: ["LikedAlbums"],
    }),
    unlikeAlbum: builder.mutation<void, string>({
      query: (albumId) => ({
        url: `${BASE}/likes/albums/${albumId}`,
        method: "DELETE",
      }),
      invalidatesTags: ["LikedAlbums"],
    }),

    // ─── Liked Artists ───────────────────────────────────────────────────────
    getLikedArtists: builder.query<LikedArtist[], void>({
      query: () => ({ url: `${BASE}/likes/artists`, method: "GET" }),
      transformResponse: (response: ApiResponse<{ artists: LikedArtist[] }>) =>
        unwrapApiResponse(response).artists,
      providesTags: ["LikedArtists"],
    }),
    likeArtist: builder.mutation<void, string>({
      query: (artistId) => ({
        url: `${BASE}/likes/artists/${artistId}`,
        method: "PUT",
      }),
      invalidatesTags: ["LikedArtists"],
    }),
    unlikeArtist: builder.mutation<void, string>({
      query: (artistId) => ({
        url: `${BASE}/likes/artists/${artistId}`,
        method: "DELETE",
      }),
      invalidatesTags: ["LikedArtists"],
    }),

    // ─── Recently Played ─────────────────────────────────────────────────────
    getRecentlyPlayed: builder.query<RecentlyPlayedItem[], void>({
      query: () => ({ url: `${BASE}/recently-played`, method: "GET" }),
      transformResponse: (
        response: ApiResponse<{ tracks: RecentlyPlayedItem[] }>,
      ) => {

        return unwrapApiResponse(response).tracks;
      },
      providesTags: ["RecentlyPlayed"],
    }),
    logPlay: builder.mutation<void, LogPlayRequest>({
      query: (body) => ({
        url: `${BASE}/recently-played`,
        method: "POST",
        body,
      }),
      invalidatesTags: ["RecentlyPlayed"],
    }),
  }),
});

export const {
  useGetLibrariesQuery,
  useGetLibraryByIdQuery,
  useCreateLibraryMutation,
  useUpdateLibraryMutation,
  useDeleteLibraryMutation,
  useGetLibraryItemsQuery,
  useAddLibraryItemMutation,
  useDeleteLibraryItemMutation,
  useGetPlaylistsQuery,
  useGetPlaylistByIdQuery,
  useCreatePlaylistMutation,
  useUpdatePlaylistMutation,
  useDeletePlaylistMutation,
  useGetPlaylistTracksQuery,
  useAddPlaylistTrackMutation,
  useDeletePlaylistTrackMutation,
  useGetLikedTracksQuery,
  useLikeTrackMutation,
  useUnlikeTrackMutation,
  useGetLikedAlbumsQuery,
  useLikeAlbumMutation,
  useUnlikeAlbumMutation,
  useGetLikedArtistsQuery,
  useLikeArtistMutation,
  useUnlikeArtistMutation,
  useGetRecentlyPlayedQuery,
  useLogPlayMutation,
} = musicMeApi;
