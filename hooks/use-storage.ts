import * as SecureStore from "expo-secure-store";
import { useMemo } from "react";

export const storageKeys = {
  accessToken: "auth.accessToken",
  refreshToken: "auth.refreshToken",
} as const;

// In-memory cache for sync access
let tokenCache: {
  accessToken: string | null;
  refreshToken: string | null;
} = {
  accessToken: null,
  refreshToken: null,
};

// Initialize cache on app start
(async () => {
  try {
    tokenCache.accessToken = await SecureStore.getItemAsync(
      storageKeys.accessToken,
    );
    tokenCache.refreshToken = await SecureStore.getItemAsync(
      storageKeys.refreshToken,
    );
  } catch (error) {
    console.error("Failed to initialize storage cache:", error);
  }
})();

export async function setItem(key: string, value: string) {
  try {
    await SecureStore.setItemAsync(key, value);
  } catch (error) {
    console.error("setItem failed for:", key, error);
  }
}

export async function getItem(key: string): Promise<string | null> {
  try {
    return await SecureStore.getItemAsync(key);
  } catch (error) {
    console.error("getItem failed for:", key, error);
    return null;
  }
}

export async function deleteItem(key: string) {
  try {
    await SecureStore.deleteItemAsync(key);
  } catch (error) {
    console.error("deleteItem failed for:", key, error);
  }
}

export async function setAuthTokens(tokens: {
  accessToken: string;
  refreshToken: string;
}) {
  console.log("setAuthTokens called");
  tokenCache.accessToken = tokens.accessToken;
  tokenCache.refreshToken = tokens.refreshToken;
  await setItem(storageKeys.accessToken, tokens.accessToken);
  await setItem(storageKeys.refreshToken, tokens.refreshToken);
  console.log("Tokens saved successfully");
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
