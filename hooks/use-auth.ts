import { useAuthState } from "./use-storage";

export function useAuth() {
  const isAuthenticated = useAuthState();
  return { isAuthenticated };
}
