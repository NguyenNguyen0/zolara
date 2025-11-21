/**
 * Below are the colors that are used in the app. The colors are defined in the light and dark mode.
 * There are many other ways to style your app. For example, [Nativewind](https://www.nativewind.dev/), [Tamagui](https://tamagui.dev/), [unistyles](https://reactnativeunistyles.vercel.app), etc.
 */

const tintColorLight = "#8B5CF6";
const tintColorDark = "#8B5CF6";
const PRIMARY = "#8B5CF6";

// Gradient colors based on PRIMARY
const GRADIENT_START = "#7C3AED"; // Darker purple
const GRADIENT_MID = "#8B5CF6"; // PRIMARY
const GRADIENT_END = "#A78BFA"; // Lighter purple

// Message bubble colors based on PRIMARY
const MESSAGE_BUBBLE_BG = "#EDE9FE"; // bg-purple-100 equivalent
const MESSAGE_BUBBLE_TEXT = "#7C3AED"; // text-purple-500 equivalent
const MESSAGE_BUBBLE_REACTION = "#F3F4F6"; // bg-purple-50 equivalent
const BUTTON_PRIMARY = "#8B5CF6"; // PRIMARY for buttons

// Color variants based on PRIMARY (replacing blue colors)
const PRIMARY_50 = "#F5F3FF"; // bg-purple-50 equivalent (replaces bg-blue-50)
const PRIMARY_100 = "#EDE9FE"; // bg-purple-100 equivalent (replaces bg-blue-100)
const PRIMARY_400 = "#C4B5FD"; // text-purple-400 equivalent (replaces text-blue-400)
const PRIMARY_500 = "#8B5CF6"; // PRIMARY (replaces bg-blue-500, text-blue-500, border-blue-500)
const PRIMARY_600 = "#7C3AED"; // darker purple (replaces bg-blue-600)
const PRIMARY_700 = "#6D28D9"; // darker purple (replaces text-blue-700)
const PRIMARY_300 = "#DDD6FE"; // lighter purple (replaces text-blue-300)

export const Colors = {
  light: {
    text: "#11181C",
    background: "#fff",
    tint: tintColorLight,
    icon: "#687076",
    tabIconDefault: "#687076",
    tabIconSelected: tintColorLight,
    PRIMARY: PRIMARY,
    GRADIENT: [GRADIENT_START, GRADIENT_MID, GRADIENT_END],
    MESSAGE_BUBBLE_BG: MESSAGE_BUBBLE_BG,
    MESSAGE_BUBBLE_TEXT: MESSAGE_BUBBLE_TEXT,
    MESSAGE_BUBBLE_REACTION: MESSAGE_BUBBLE_REACTION,
    BUTTON_PRIMARY: BUTTON_PRIMARY,
    PRIMARY_50: PRIMARY_50,
    PRIMARY_100: PRIMARY_100,
    PRIMARY_300: PRIMARY_300,
    PRIMARY_400: PRIMARY_400,
    PRIMARY_500: PRIMARY_500,
    PRIMARY_600: PRIMARY_600,
    PRIMARY_700: PRIMARY_700,
  },
  dark: {
    text: "#ECEDEE",
    background: "#151718",
    tint: tintColorDark,
    icon: "#9BA1A6",
    tabIconDefault: "#9BA1A6",
    tabIconSelected: tintColorDark,
    primaryBlue: PRIMARY,
    GRADIENT: [GRADIENT_START, GRADIENT_MID, GRADIENT_END],
    MESSAGE_BUBBLE_BG: MESSAGE_BUBBLE_BG,
    MESSAGE_BUBBLE_TEXT: MESSAGE_BUBBLE_TEXT,
    MESSAGE_BUBBLE_REACTION: MESSAGE_BUBBLE_REACTION,
    BUTTON_PRIMARY: BUTTON_PRIMARY,
    PRIMARY_50: PRIMARY_50,
    PRIMARY_100: PRIMARY_100,
    PRIMARY_300: PRIMARY_300,
    PRIMARY_400: PRIMARY_400,
    PRIMARY_500: PRIMARY_500,
    PRIMARY_600: PRIMARY_600,
    PRIMARY_700: PRIMARY_700,
  },
};
