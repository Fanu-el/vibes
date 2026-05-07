const baseApiUrl =
  process.env.EXPO_PUBLIC_BASE_API_URL ?? process.env.BASE_API_URL ?? "";

const filePreviewUrl = process.env.EXPO_PUBLIC_API_FILE_PREVIEW_URL ?? "";

export const env = {
  baseApiUrl,
  hasBaseApiUrl: Boolean(baseApiUrl),
  filePreviewUrl,
};
