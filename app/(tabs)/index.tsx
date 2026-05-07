import { ThemedText } from "@/components/themed-text";
import { Colors } from "@/constants/theme";
import { View } from "react-native";

export default function HomeScreen() {
  return (
    <View className="flex-1 items-center justify-center bg-background px-6">
      <ThemedText type="title">Vibes</ThemedText>
      <ThemedText
        lightColor={Colors.light.mutedText}
        className="mt-3 text-center"
      >
        Auth is ready. Music features come next.
      </ThemedText>
    </View>
  );
}
