import MaterialIcons from "@expo/vector-icons/MaterialIcons";
import { OpaqueColorValue, type StyleProp, type TextStyle } from "react-native";

const MAPPING = {
  "house.fill": "home",
  "chevron.right": "chevron-right",
  "chevron.left": "chevron-left",
  "music.note": "music-note",
  "music.note.list": "queue-music",
  magnifyingglass: "search",
  "pause.fill": "pause",
  "play.fill": "play-arrow",
  "stop.fill": "stop",
  xmark: "close",
  "arrow.down.circle": "download",
  "gobackward.15": "replay-10",
  "goforward.15": "forward-10",
  "chevron.down": "keyboard-arrow-down",
  "person.fill": "person",
  "heart.fill": "favorite",
  heart: "favorite-border",
  "clock.fill": "history",
  "books.vertical.fill": "library-books",
  "music.note.list.fill": "queue-music",
  plus: "add",
  trash: "delete",
  "checkmark.circle.fill": "check-circle",
  "checkmark.circle": "check-circle-outline",
  pencil: "edit",
} as const;

type IconSymbolName = keyof typeof MAPPING;

export function IconSymbol({
  name,
  size = 24,
  color,
  style,
}: {
  name: IconSymbolName;
  size?: number;
  color: string | OpaqueColorValue;
  style?: StyleProp<TextStyle>;
}) {
  return (
    <MaterialIcons
      color={color}
      size={size}
      name={MAPPING[name]}
      style={style}
    />
  );
}
