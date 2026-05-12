/**
 * Below are the colors that are used in the app. The colors are defined in the light and dark mode.
 * There are many other ways to style your app. For example, [Nativewind](https://www.nativewind.dev/), [Tamagui](https://tamagui.dev/), [unistyles](https://reactnativeunistyles.vercel.app), etc.
 */

import { Platform } from 'react-native';
import { DefaultTheme, type Theme } from '@react-navigation/native';

export const AppPalette = {
  primary: '#1A3FBB',
  background: '#E8E6DF',
  card: '#FFFFFF',
  textDark: '#1A1A2E',
  textBody: '#2D4A8A',
  accent: '#1A3FBB',
  border: '#C9D1E8',
  muted: '#7B88A8',
  placeholder: '#D8D6CF',
  overlay: 'rgba(26, 26, 46, 0.35)',
  danger: '#C62828',
  dangerSoft: '#FDEBEC',
} as const;

export const Colors = {
  light: {
    text: AppPalette.textDark,
    background: AppPalette.background,
    tint: AppPalette.primary,
    icon: AppPalette.textBody,
    tabIconDefault: AppPalette.muted,
    tabIconSelected: AppPalette.primary,
  },
  dark: {
    text: AppPalette.textDark,
    background: AppPalette.background,
    tint: AppPalette.primary,
    icon: AppPalette.textBody,
    tabIconDefault: AppPalette.muted,
    tabIconSelected: AppPalette.primary,
  },
};

export const AppNavigationTheme: Theme = {
  ...DefaultTheme,
  colors: {
    ...DefaultTheme.colors,
    primary: AppPalette.primary,
    background: AppPalette.background,
    card: AppPalette.background,
    text: AppPalette.textDark,
    border: AppPalette.border,
    notification: AppPalette.accent,
  },
};

export const Fonts = Platform.select({
  ios: {
    /** iOS `UIFontDescriptorSystemDesignDefault` */
    sans: 'system-ui',
    /** iOS `UIFontDescriptorSystemDesignSerif` */
    serif: 'ui-serif',
    /** iOS `UIFontDescriptorSystemDesignRounded` */
    rounded: 'ui-rounded',
    /** iOS `UIFontDescriptorSystemDesignMonospaced` */
    mono: 'ui-monospace',
  },
  default: {
    sans: 'normal',
    serif: 'serif',
    rounded: 'normal',
    mono: 'monospace',
  },
  web: {
    sans: "system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif",
    serif: "Georgia, 'Times New Roman', serif",
    rounded: "'SF Pro Rounded', 'Hiragino Maru Gothic ProN', Meiryo, 'MS PGothic', sans-serif",
    mono: "SFMono-Regular, Menlo, Monaco, Consolas, 'Liberation Mono', 'Courier New', monospace",
  },
});
