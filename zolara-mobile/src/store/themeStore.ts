import { secureStorage } from "@/src/utils/secureStorage";
import { create } from "zustand";

export type Theme = "light" | "dark";

interface ThemeState {
  theme: Theme;
  isInitialized: boolean;

  // Computed
  isDark: boolean;

  // Actions
  setTheme: (theme: Theme) => Promise<void>;
  initialize: () => Promise<void>;
}

export const useThemeStore = create<ThemeState>((set) => ({
  theme: "light",
  isInitialized: false,
  isDark: false,

  setTheme: async (theme: Theme) => {
    try {
      await secureStorage.setItem("app-theme", theme);
      set({ theme, isDark: theme === "dark" });
    } catch (error) {
      console.error("Error saving theme:", error);
    }
  },

  initialize: async () => {
    try {
      const savedTheme = await secureStorage.getItem("app-theme");

      const theme =
        savedTheme && ["light", "dark"].includes(savedTheme)
          ? (savedTheme as Theme)
          : "light";

      set({ theme, isDark: theme === "dark", isInitialized: true });
    } catch (error) {
      console.error("Error loading theme:", error);
      set({ theme: "light", isDark: false, isInitialized: true });
    }
  },
}));
