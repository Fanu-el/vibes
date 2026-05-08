import * as SecureStore from "expo-secure-store";
import { useEffect, useMemo, useState } from "react";

export const storageKeys = {
  accessToken: "auth.accessToken",
  refreshToken: "auth.refreshToken",
  playbackPosition: "player.playbackPosition",
} as const;

// In-memory cache for sync access
let tokenCache: {
  accessToken: string | null;
  refreshToken: string | null;
} = {
  accessToken: null,
  refreshToken: null,
};

// ── Reactive listeners ────────────────────────────────────────────────────────
type AuthListener = (hasToken: boolean) => void;
const authListeners = new Set<AuthListener>();

function notifyAuthListeners() {
  const hasToken = Boolean(tokenCache.accessToken);
  authListeners.forEach((fn) => fn(hasToken));
}

export function subscribeToAuthState(listener: AuthListener) {
  authListeners.add(listener);
  return () => authListeners.delete(listener);
}

export function useAuthState(): boolean {
  const [hasToken, setHasToken] = useState(() =>
    Boolean(tokenCache.accessToken),
  );
  useEffect(() => {
    const unsubscribe = subscribeToAuthState(setHasToken);
    return () => { unsubscribe(); };
  }, []);
  return hasToken;
}

// Initialize cache on app start
(async () => {
  try {
    tokenCache.accessToken = await SecureStore.getItemAsync(
      storageKeys.accessToken,
    );
    tokenCache.refreshToken = await SecureStore.getItemAsync(
      storageKeys.refreshToken,
    );
    notifyAuthListeners();
  } catch (error) {
  }
})();

export async function setItem(key: string, value: string) {
  try {
    await SecureStore.setItemAsync(key, value);
  } catch (error) {
  }
}

export async function getItem(key: string): Promise<string | null> {
  try {
    return await SecureStore.getItemAsync(key);
  } catch (error) {
    return null;
  }
}

export async function deleteItem(key: string) {
  try {
    await SecureStore.deleteItemAsync(key);
  } catch (error) {
  }
}

// ── Playback Position ─────────────────────────────────────────────────────────

export async function savePlaybackPosition(trackId: string, positionMs: number) {
  try {
    const data = JSON.stringify({ trackId, positionMs });
    await setItem(storageKeys.playbackPosition, data);
  } catch (error) {
  }
}

export async function getPlaybackPosition(): Promise<{ trackId: string; positionMs: number } | null> {
  try {
    const data = await getItem(storageKeys.playbackPosition);
    if (!data) return null;
    return JSON.parse(data);
  } catch (error) {
    return null;
  }
}

export async function setAuthTokens(tokens: {
  accessToken: string;
  refreshToken: string;
}) {
  tokenCache.accessToken = tokens.accessToken;
  tokenCache.refreshToken = tokens.refreshToken;
  await setItem(storageKeys.accessToken, tokens.accessToken);
  await setItem(storageKeys.refreshToken, tokens.refreshToken);
  notifyAuthListeners();
}

export function getAccessToken() {
  return tokenCache.accessToken;
}

export function getRefreshToken() {
  return tokenCache.refreshToken;
}

export async function deleteAuthTokens() {
  tokenCache.accessToken = null;
  tokenCache.refreshToken = null;
  notifyAuthListeners();
  await deleteItem(storageKeys.accessToken);
  await deleteItem(storageKeys.refreshToken);
}

export function useStorage() {
  return useMemo(
    () => ({
      setItem,
      getItem,
      deleteItem,
    }),
    [],
  );
}
