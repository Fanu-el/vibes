import { StyleSheet, Text, type TextProps } from 'react-native';

import { Colors, Fonts } from '@/constants/theme';
import { useThemeColor } from '@/hooks/use-theme-color';

export type ThemedTextProps = TextProps & {
  lightColor?: string;
  darkColor?: string;
  type?: 'default' | 'title' | 'defaultSemiBold' | 'subtitle' | 'link';
};

export function ThemedText({
  style,
  lightColor,
  darkColor,
  type = 'default',
  ...rest
}: ThemedTextProps) {
  const color = useThemeColor({ light: lightColor, dark: darkColor }, 'text');

  return (
    <Text
      style={[
        { color },
        type === 'default' ? styles.default : undefined,
        type === 'title' ? styles.title : undefined,
        type === 'defaultSemiBold' ? styles.defaultSemiBold : undefined,
        type === 'subtitle' ? styles.subtitle : undefined,
        type === 'link' ? styles.link : undefined,
        style,
      ]}
      {...rest}
    />
  );
}

const styles = StyleSheet.create({
  default: {
    fontFamily: Fonts.sans,
    fontSize: 16,
    lineHeight: 24,
  },
  defaultSemiBold: {
    fontFamily: Fonts.sansSemiBold,
    fontSize: 16,
    lineHeight: 24,
  },
  title: {
    fontFamily: Fonts.sansBold,
    fontSize: 32,
    lineHeight: 32,
  },
  subtitle: {
    fontFamily: Fonts.sansBold,
    fontSize: 20,
  },
  link: {
    fontFamily: Fonts.sansSemiBold,
    lineHeight: 30,
    fontSize: 16,
    color: Colors.light.tint,
  },
});
