import { musicForMeStyles } from "@/features/music-for-me/music-for-me-styles";
import type { Artist } from "@/features/music-for-me/music-types";
import React from "react";
import { Image, View } from "react-native";
import { Card, Text } from "react-native-paper";

interface ArtistCardProps {
  item: Artist;
  onPress?: () => void;
}

export const ArtistCard: React.FC<ArtistCardProps> = ({ item, onPress }) => {
  return (
    <Card style={musicForMeStyles.card} onPress={onPress}>
      <View style={musicForMeStyles.cardContent}>
        <View style={musicForMeStyles.cardRow}>
          {item.imageUrl && (
            <Image
              source={{ uri: item.imageUrl }}
              style={musicForMeStyles.artistImage}
            />
          )}
          <View style={musicForMeStyles.cardInfo}>
            <Text style={musicForMeStyles.cardTitle} numberOfLines={1}>
              {item.name}
            </Text>
            {item.joinDate && (
              <Text style={musicForMeStyles.cardMeta}>
                Joined: {item.joinDate}
              </Text>
            )}
            {item.website && (
              <Text style={musicForMeStyles.cardMeta} numberOfLines={1}>
                {item.website}
              </Text>
            )}
          </View>
        </View>
      </View>
    </Card>
  );
};
