import {
  BaseQueryFn,
  FetchArgs,
  FetchBaseQueryError,
  createApi,
  fetchBaseQuery,
} from "@reduxjs/toolkit/query/react";

import { env } from "@/config/env";
import {
  deleteAuthTokens,
  getAccessToken,
  getRefreshToken,
  setAuthTokens,
} from "@/hooks/use-storage";

export interface SuccessResponse<T> {
  is_error: false;
  status_code: number;
  data: T;
}

export interface ErrorResponse {
  is_error: true;
  status_code: number;
  data: null;
  error: { message: string; [key: string]: unknown };
}

export type ApiResponse<T> = SuccessResponse<T> | ErrorResponse;

export type AuthTokens = {
  accessToken: string;
  refreshToken: string;
};

// Callback for when refresh token fails
let onRefreshTokenFailed: (() => void) | null = null;

export function setRefreshTokenFailedCallback(callback: () => void) {
  onRefreshTokenFailed = callback;
}

const rawBaseQuery = fetchBaseQuery({
  baseUrl: env.baseApiUrl,
  prepareHeaders: (headers) => {
    const accessToken = getAccessToken();

    if (accessToken) {
      headers.set("authorization", `Bearer ${accessToken}`);
    }

    return headers;
  },
});

const baseQueryWithReauth: BaseQueryFn<
  string | FetchArgs,
  unknown,
  FetchBaseQueryError
> = async (args, api, extraOptions) => {
  if (!env.hasBaseApiUrl) {
    return {
      error: {
        status: "CUSTOM_ERROR",
        error:
          "EXPO_PUBLIC_BASE_API_URL is missing. Add it to your .env file and restart Expo.",
      },
    };
  }

  const result = await rawBaseQuery(args, api, extraOptions);

  if (result.error?.status !== 401) {
    return result;
  }

  const refreshToken = getRefreshToken();

  if (!refreshToken) {
    await deleteAuthTokens();
    return result;
  }

  const refreshResult = await rawBaseQuery(
    {
      url: "auth/refresh",
      method: "POST",
      body: { refreshToken },
    },
    api,
    extraOptions,
  );

  const refreshData = refreshResult.data as ApiResponse<AuthTokens> | undefined;

  if (refreshData && !refreshData.is_error) {
    await setAuthTokens(refreshData.data);
    return rawBaseQuery(args, api, extraOptions);
  }

  // Refresh failed - clear tokens and trigger callback
  await deleteAuthTokens();

  if (onRefreshTokenFailed) {
    onRefreshTokenFailed();
  }

  return result;
};

export const api = createApi({
  reducerPath: "api",
  baseQuery: baseQueryWithReauth,
  tagTypes: [
    "Auth",
    "Libraries",
    "LibraryItems",
    "Playlists",
    "PlaylistTracks",
    "LikedTracks",
    "LikedAlbums",
    "LikedArtists",
    "RecentlyPlayed",
  ],
  endpoints: () => ({}),
});

export function unwrapApiResponse<T>(response: ApiResponse<T> | null | undefined) {
  if (!response) {
    return {} as T;
  }

  if (response.is_error) {
    throw new Error(response.error.message);
  }

  return response.data;
}

export function getApiErrorMessage(error: unknown) {
  let message = "";

  if (error instanceof Error) {
    message = error.message;
  } else if (
    typeof error === "object" &&
    error !== null &&
    "error" in error &&
    typeof error.error === "string"
  ) {
    message = error.error;
  } else if (
    typeof error === "object" &&
    error !== null &&
    "data" in error &&
    typeof error.data === "object" &&
    error.data !== null &&
    "is_error" in error.data &&
    error.data.is_error === true &&
    "error" in error.data &&
    typeof error.data.error === "object" &&
    error.data.error !== null &&
    "message" in error.data.error &&
    typeof error.data.error.message === "string"
  ) {
    message = error.data.error.message;
  } else {
    message = "Something went wrong. Please try again.";
  }

  // Map common API errors to user-friendly messages
  const errorMap: Record<string, string> = {
    "Invalid credentials": "Email or password is incorrect. Please try again.",
    "User not found": "No account found with this email.",
    "Email already exists": "An account with this email already exists.",
    "Invalid verification code":
      "The verification code is incorrect or has expired.",
    "Token expired": "Your session has expired. Please log in again.",
  };

  return errorMap[message] || message;
}
