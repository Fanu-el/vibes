import { File, Paths } from "expo-file-system";
import * as MediaLibrary from "expo-media-library";
import { useCallback, useState } from "react";
import { Platform } from "react-native";

export type DownloadStatus = "idle" | "downloading" | "error";

function resolveFilename(baseUri: string, filename: string): string {
  const dotIndex = filename.lastIndexOf(".");
  const base = dotIndex !== -1 ? filename.slice(0, dotIndex) : filename;
  const ext = dotIndex !== -1 ? filename.slice(dotIndex) : "";

  let candidate = filename;
  let counter = 1;

  while (new File(baseUri, candidate).exists) {
    candidate = `${base}(${counter})${ext}`;
    counter++;
  }

  return candidate;
}

export function useDownload() {
  const [downloadStatus, setDownloadStatus] = useState<DownloadStatus>("idle");

  const download = useCallback(async (url: string, filename: string) => {
    try {
      setDownloadStatus("downloading");

      // Always download to the app's persistent document directory first.
      // This works in both Expo Go and dev/production builds.
      const resolvedFilename = resolveFilename(Paths.document.uri, filename);
      const destFile = new File(Paths.document, resolvedFilename);
      const downloaded = await File.downloadFileAsync(url, destFile);

      // On Android, try to also save to the media library so the file
      // appears in the device's Files / Music apps. This requires a dev
      // build with the expo-media-library plugin configured in app.json.
      // In Expo Go it will silently skip this step.
      if (Platform.OS === "android") {
        try {
          const permission = await MediaLibrary.getPermissionsAsync();
          const granted =
            permission.granted ||
            (await MediaLibrary.requestPermissionsAsync()).granted;

          if (granted) {
            const asset = await MediaLibrary.createAssetAsync(downloaded.uri);
            await MediaLibrary.createAlbumAsync("Vibes", asset, false);
            // Remove the document dir copy — media library has it now
            downloaded.delete();
          }
          // If not granted, file stays in document dir — still accessible
        } catch {
          // Expo Go or missing manifest permission — file stays in document dir
        }
      }

      setDownloadStatus("idle");
      return { success: true, filename: resolvedFilename };
    } catch (e: any) {
      setDownloadStatus("error");
      return { success: false, error: e?.message ?? "Unknown error" };
    }
  }, []);

  const reset = useCallback(() => {
    setDownloadStatus("idle");
  }, []);

  return { downloadStatus, download, reset };
}
