import { create } from 'zustand';
import AsyncStorage from '@react-native-async-storage/async-storage';
import i18n from '../i18n'; 

interface UserProfile {
  uid: string;
  displayName: string | null;
  email: string | null;
  photoURL: string | null;
}

interface AuthState {
  isGuest: boolean;
  isLoading: boolean;
  language: 'mm' | 'en'; 
  user: UserProfile | null;
  loginAsGuest: () => Promise<void>;
  setUser: (user: UserProfile | null) => void;
  logout: () => Promise<void>;
  setLanguage: (lang: 'mm' | 'en') => Promise<void>; 
  init: () => Promise<void>;
}

export const useAuthStore = create<AuthState>((set) => ({
  isGuest: false,
  user: null,
  isLoading: true,
  language: 'mm',

  loginAsGuest: async () => {
    await AsyncStorage.setItem('@auth_status', 'guest');
    set({ isGuest: true, user: null }); // Guest ဆိုရင် user ကို null ထားမယ်
  },

  // ✅ ဒီ function လေး ကျန်ခဲ့လို့ Error တက်တာပါ
  setUser: (userData) => {
    set({ user: userData, isGuest: false });
  },
  
  logout: async () => {
    await AsyncStorage.removeItem('@auth_status');
    set({ isGuest: false, user: null });
  },

  setLanguage: async (lang) => {
    await AsyncStorage.setItem('@app_lang', lang);
    i18n.changeLanguage(lang);
    set({ language: lang });
  },

  init: async () => {
    try {
      const guestFlag = await AsyncStorage.getItem('@auth_status');
      const savedLang = await AsyncStorage.getItem('@app_lang') as 'mm' | 'en' | null;
      
      const currentLang = savedLang || 'mm';
      i18n.changeLanguage(currentLang);

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