import { create } from 'zustand';
import AsyncStorage from '@react-native-async-storage/async-storage';
import i18n from '../i18n'; 
import { doc, getDoc, setDoc } from 'firebase/firestore';
import { db } from '../services/firebaseConfig';

interface UserProfile {
  uid: string;
  email: string | null;
  actionPassword?: string; 
  role?: string;           
}

interface AuthState {
  isGuest: boolean;
  isLoading: boolean;
  language: 'mm' | 'en'; 
  user: UserProfile | null;
  loginAsGuest: () => Promise<void>;
 loginWithGoogle: (idToken: string) => Promise<void>;
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
    set({ isGuest: true, user: null });
  },

  // ✅ Google Login Function
 loginWithGoogle: async (idToken: string) => { // idToken ကို လက်ခံမယ်
    try {
      // ဒီနေရာမှာ idToken ကိုသုံးပြီး Firebase နဲ့ Login ဝင်တဲ့ logic ရေးလို့ရပါတယ်
      console.log("Received Token:", idToken);
      
      // ဥပမာ- user data တစ်ခု သတ်မှတ်လိုက်မယ်
      const mockUser = { uid: '123', email: 'user@gmail.com' }; 
      set({ user: mockUser, isGuest: false });
    } catch (error) {
       console.error(error);
    }
  },

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