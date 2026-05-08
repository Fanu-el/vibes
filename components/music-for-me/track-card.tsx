import { musicForMeStyles } from "@/features/music-for-me/music-for-me-styles";
import type { Track } from "@/features/music-for-me/music-types";
import React from "react";
import { Image, View } from "react-native";
import { Card, Text, useTheme } from "react-native-paper";

interface TrackCardProps {
  item: Track;
  onPress?: () => void;
}

export const TrackCard: React.FC<TrackCardProps> = ({ item, onPress }) => {
  const theme = useTheme();

  const formatDuration = (seconds: number): string => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, "0")}`;
  };

  return (
    <Card style={musicForMeStyles.card} onPress={onPress}>
      <View style={musicForMeStyles.cardContent}>
        <View style={musicForMeStyles.cardRow}>
          {item.coverUrl && (
            <Image
              source={{ uri: item.coverUrl }}
              style={musicForMeStyles.coverImage}
            />
          )}
          <View style={musicForMeStyles.cardInfo}>
            <Text style={musicForMeStyles.cardTitle} numberOfLines={1}>
              {item.title}
            </Text>
            <Text style={musicForMeStyles.cardSubtitle} numberOfLines={1}>
              {item.artist.name}
            </Text>
            {item.album && (
              <Text style={musicForMeStyles.cardMeta} numberOfLines={1}>
                {item.album.name}
              </Text>
            )}
            <Text style={musicForMeStyles.cardMeta}>
              {formatDuration(item.duration)}
              {item.releaseDate && ` • ${item.releaseDate}`}
            </Text>
          </View>
        </View>

        {item.tags && item.tags.genres && item.tags.genres.length > 0 && (
          <View style={musicForMeStyles.tagsContainer}>
            {item.tags.genres.slice(0, 3).map((genre, index) => (
              <View
                key={index}
                style={[
                  musicForMeStyles.tag,
                  { backgroundColor: theme.colors.surfaceVariant },
                ]}
              >
                <Text style={musicForMeStyles.tagText}>{genre}</Text>
              </View>
            ))}
          </View>
        )}
      </View>
    </Card>
  );
};
