import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export const useThemeStore = create(
  persist(
    (set, get) => ({
      isDarkMode: false,
      toggleTheme: () => {
        const newTheme = !get().isDarkMode;
        set({ isDarkMode: newTheme });
        applyTheme(newTheme);
      },
      // Keep for compatibility but it will be called automatically if needed
      initTheme: () => {
        applyTheme(get().isDarkMode);
      }
    }),
    {
      name: 'cleanflow-theme-state',
      onRehydrateStorage: () => (state) => {
        if (state) state.initTheme();
      }
    }
  )
);

function applyTheme(isDark) {
  if (typeof document === 'undefined') return;
  if (isDark) {
    document.documentElement.classList.add('dark');
  } else {
    document.documentElement.classList.remove('dark');
  }
}


