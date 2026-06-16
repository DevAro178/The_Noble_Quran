import { create } from "zustand";
import { persist } from "zustand/middleware";
import { DEFAULT_TRANSLATIONS } from "../config/constants";

export const useQuranStore = create(
  persist(
    (set, get) => ({
      // Theme state
      theme: "light", // 'light' | 'dark'
      setTheme: (theme) => {
        document.documentElement.setAttribute("data-theme", theme);
        set({ theme });
      },

      // Font size configuration
      arabicFontSize: 28,
      translationFontSize: 16,
      setArabicFontSize: (size) => {
        document.documentElement.style.setProperty(
          "--arabic-font-size",
          `${size}px`,
        );
        set({ arabicFontSize: size });
      },
      setTranslationFontSize: (size) => {
        document.documentElement.style.setProperty(
          "--translation-font-size",
          `${size}px`,
        );
        set({ translationFontSize: size });
      },

      // Translation visibility settings
      activeTranslations: DEFAULT_TRANSLATIONS,
      toggleTranslation: (key) =>
        set((state) => ({
          activeTranslations: {
            ...state.activeTranslations,
            [key]: !state.activeTranslations[key],
          },
        })),

      // Reading progress tracking
      lastRead: null, // { suraNo, suraName, ayatNo, timestamp }
      setLastRead: (suraNo, suraName, ayatNo) => {
        set({
          lastRead: {
            suraNo: parseInt(suraNo),
            suraName,
            ayatNo: parseInt(ayatNo),
            timestamp: Date.now(),
          },
        });
      },
      clearLastRead: () => set({ lastRead: null }),

      // Action to apply loaded variables to DOM on app startup
      initAppStyles: () => {
        const { theme, arabicFontSize, translationFontSize } = get();
        document.documentElement.setAttribute("data-theme", theme);
        document.documentElement.style.setProperty(
          "--arabic-font-size",
          `${arabicFontSize}px`,
        );
        document.documentElement.style.setProperty(
          "--translation-font-size",
          `${translationFontSize}px`,
        );
      },
    }),
    {
      name: "alquran-settings-store", // localStorage key
      partialize: (state) => ({
        theme: state.theme,
        arabicFontSize: state.arabicFontSize,
        translationFontSize: state.translationFontSize,
        activeTranslations: state.activeTranslations,
        lastRead: state.lastRead,
      }),
    },
  ),
);
