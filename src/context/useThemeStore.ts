// src/context/useThemeStore.ts
import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { colors } from '../theme/colors'; // lightColors/darkColors အစား colors ကိုပဲ ယူပါ

interface ThemeState {
  theme: 'light' | 'dark';
  toggleTheme: () => void;
  getColors: () => typeof colors.light; // lightColors type အတိုင်း ယူမယ်
}

export const useThemeStore = create<ThemeState>()(
  persist(
    (set, get) => ({
      theme: 'light',
      toggleTheme: () => set((state) => ({ theme: state.theme === 'light' ? 'dark' : 'light' })),
      getColors: () => {
        const currentTheme = get().theme;
        return colors[currentTheme]; // colors.light (သို့) colors.dark ကို return ပြန်မယ်
      },
    }),
    {
      name: 'theme-storage',
      storage: createJSONStorage(() => AsyncStorage),
    }
  )
);