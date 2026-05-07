import { getAccessToken } from "./use-storage";

export function useAuth() {
  const isAuthenticated = Boolean(getAccessToken());
  return { isAuthenticated };
}
