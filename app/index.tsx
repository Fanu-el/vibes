import { Redirect } from "expo-router";

import { getAccessToken } from "@/hooks/use-storage";

export default function Index() {
  const accessToken = getAccessToken();

  if (accessToken) {
    return <Redirect href="/(tabs)" />;
  }

  return <Redirect href="/(auth)/register" />;
}
