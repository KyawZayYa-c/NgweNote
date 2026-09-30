import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { colors } from '../theme/colors'; 

interface ThemeState {
  theme: 'light' | 'dark';
  toggleTheme: () => void;
  getColors: () => typeof colors.light; 
}

export const useThemeStore = create<ThemeState>()(
  persist(
    (set, get) => ({
      theme: 'light',
      toggleTheme: () => set((state) => ({ theme: state.theme === 'light' ? 'dark' : 'light' })),
      getColors: () => {
        const currentTheme = get().theme;
        return colors[currentTheme]; 
      },
    }),
    {
      name: 'theme-storage',
      storage: createJSONStorage(() => AsyncStorage),
    }
  )
);