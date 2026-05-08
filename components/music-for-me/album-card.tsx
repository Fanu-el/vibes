import { musicForMeStyles } from "@/features/music-for-me/music-for-me-styles";
import type { Album } from "@/features/music-for-me/music-types";
import React from "react";
import { Image, View } from "react-native";
import { Card, Text } from "react-native-paper";

interface AlbumCardProps {
  item: Album;
  onPress?: () => void;
}

export const AlbumCard: React.FC<AlbumCardProps> = ({ item, onPress }) => {
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
              {item.name}
            </Text>
            <Text style={musicForMeStyles.cardSubtitle} numberOfLines={1}>
              {item.artist.name}
            </Text>
            {item.releaseDate && (
              <Text style={musicForMeStyles.cardMeta}>
                Released: {item.releaseDate}
              </Text>
            )}
          </View>
        </View>
      </View>
    </Card>
  );
};
