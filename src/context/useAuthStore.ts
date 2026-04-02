import { create } from 'zustand';
import AsyncStorage from '@react-native-async-storage/async-storage';
import i18n from '../i18n'; // i18n file ကို import လုပ်ပါ

interface AuthState {
  isGuest: boolean;
  isLoading: boolean;
  language: 'mm' | 'en'; // Language state ထည့်မယ်
  loginAsGuest: () => Promise<void>;
  logout: () => Promise<void>;
  setLanguage: (lang: 'mm' | 'en') => Promise<void>; // Language ပြောင်းတဲ့ function
  init: () => Promise<void>;
}

export const useAuthStore = create<AuthState>((set) => ({
  isGuest: false,
  isLoading: true,
  language: 'mm', // Default က မြန်မာ

  loginAsGuest: async () => {
    await AsyncStorage.setItem('@auth_status', 'guest');
    set({ isGuest: true });
  },
  
  logout: async () => {
    await AsyncStorage.removeItem('@auth_status');
    set({ isGuest: false });
  },

  setLanguage: async (lang) => {
    await AsyncStorage.setItem('@app_lang', lang);
    i18n.changeLanguage(lang); // i18next ကိုပါ တစ်ခါတည်း ပြောင်းခိုင်းမယ်
    set({ language: lang });
  },

  init: async () => {
    try {
      const guestFlag = await AsyncStorage.getItem('@auth_status');
      const savedLang = await AsyncStorage.getItem('@app_lang') as 'mm' | 'en' | null;
      
      const currentLang = savedLang || 'mm';
      i18n.changeLanguage(currentLang); // သိမ်းထားတဲ့ language အတိုင်း app ကို ဖွင့်မယ်

      set({ 
        isGuest: guestFlag === 'guest', 
        language: currentLang,
        isLoading: false 
      });
    } catch (error) {
      set({ isLoading: false });
    }
  }
}));