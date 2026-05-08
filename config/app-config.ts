/**
 * Global application configuration.
 * Centralizes app-wide constants and feature settings.
 */
export const appConfig = {
  /**
   * Number of results returned per search query.
   */
  searchLimit: 20,

  /**
   * Number of items per page for paginated lists (home screen sections).
   */
  paginationLimit: 10,

  /**
   * Debounce delay in ms before firing a search request after the user stops typing.
   */
  searchDebounceMs: 400,
} as const;
