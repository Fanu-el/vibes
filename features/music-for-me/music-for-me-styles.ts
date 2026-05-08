import { StyleSheet } from "react-native";

export const musicForMeStyles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollContent: {
    padding: 16,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  errorContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
  },
  errorText: {
    textAlign: "center",
    marginBottom: 16,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
  },
  emptyText: {
    textAlign: "center",
    opacity: 0.6,
  },
  sectionTitle: {
    fontSize: 24,
    fontWeight: "bold",
    marginBottom: 16,
  },
  card: {
    marginBottom: 12,
    borderRadius: 12,
    overflow: "hidden",
  },
  cardContent: {
    padding: 16,
  },
  cardRow: {
    flexDirection: "row",
    alignItems: "center",
  },
  coverImage: {
    width: 60,
    height: 60,
    borderRadius: 8,
    marginRight: 12,
  },
  cardInfo: {
    flex: 1,
  },
  cardTitle: {
    fontSize: 16,
    fontWeight: "600",
    marginBottom: 4,
  },
  cardSubtitle: {
    fontSize: 14,
    opacity: 0.7,
    marginBottom: 2,
  },
  cardMeta: {
    fontSize: 12,
    opacity: 0.5,
  },
  scoreContainer: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
    marginLeft: 8,
  },
  scoreText: {
    fontSize: 12,
    fontWeight: "600",
  },
  tagsContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
    marginTop: 8,
    gap: 6,
  },
  tag: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    backgroundColor: "rgba(0, 0, 0, 0.1)",
  },
  tagText: {
    fontSize: 11,
    opacity: 0.8,
  },
  artistImage: {
    width: 60,
    height: 60,
    borderRadius: 30,
    marginRight: 12,
  },
  tabBar: {
    backgroundColor: "transparent",
  },
  tabIndicator: {
    height: 3,
  },
  tabLabel: {
    fontWeight: "600",
    textTransform: "none",
  },
});
