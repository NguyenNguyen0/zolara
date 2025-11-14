import i18n from "@/src/config/i18n";
import { secureStorage } from "@/src/utils/secureStorage";
import { create } from "zustand";

export type Language = "en" | "vi";

interface LanguageState {
  language: Language;
  isInitialized: boolean;

  // Actions
  setLanguage: (language: Language) => Promise<void>;
  initialize: () => Promise<void>;
}

export const useLanguageStore = create<LanguageState>((set) => ({
  language: "en",
  isInitialized: false,

  setLanguage: async (language: Language) => {
    try {
      await secureStorage.setItem("app-language", language);
      await i18n.changeLanguage(language);
      set({ language });
    } catch (error) {
      console.error("Error saving language:", error);
    }
  },

  initialize: async () => {
    try {
      const savedLanguage = await secureStorage.getItem("app-language");

      const language =
        savedLanguage && ["en", "vi"].includes(savedLanguage)
          ? (savedLanguage as Language)
          : "en";

      await i18n.changeLanguage(language);
      set({ language, isInitialized: true });
    } catch (error) {
      console.error("Error loading language:", error);
      set({ language: "en", isInitialized: true });
    }
  },
}));
