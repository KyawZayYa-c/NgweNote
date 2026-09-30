import { create } from 'zustand';
import AsyncStorage from '@react-native-async-storage/async-storage';
import i18n from '../i18n'; 
import { db, firebaseAuth } from '../services/firebaseConfig';
import { useExpenseStore } from './useExpenseStore';
import * as Notifications from 'expo-notifications';
interface UserProfile {
  uid: string;
  email: string | null;
  displayName: string | null; 
  photoURL?: string | null;
  actionPassword?: string; 
  role?: string;           
}

interface AuthState {
  isGuest: boolean;
  isLoading: boolean;
  language: 'mm' | 'en'; 
  user: UserProfile | null;
  loginAsGuest: () => Promise<void>;
 loginWithGoogle: (user: any) => Promise<void>;
  setUser: (user: UserProfile | null) => void;
  logout: () => Promise<void>;
  setLanguage: (lang: 'mm' | 'en') => Promise<void>; 
  init: () => Promise<void>;
}

export const useAuthStore = create<AuthState>((set, get) => ({
  isGuest: false,
  user: null,
  isLoading: true,
  language: 'en',

loginAsGuest: async () => {
  try {
    await AsyncStorage.setItem('@auth_status', 'guest');
    set({ isGuest: true, user: null });
    
    console.log("Logged in as Guest and cleared old data.");
  } catch (error) {
    console.error("Guest login error:", error);
  }
},


  loginWithGoogle: async (user: any) => {
  try {
    const userDoc = await db.collection('users').doc(user.uid).get();
    const isNewUser = !userDoc.exists; 
    const userDataFromFirestore = userDoc.data();

    const { useExpenseStore } = require('./useExpenseStore');
    const expenseStore = useExpenseStore.getState();
    const localTransactions = [...expenseStore.transactions];

    if (localTransactions.length > 0) {
      for (const transaction of localTransactions) {
        await db.collection('transactions').doc(transaction.id).set({
          ...transaction,
          userId: user.uid 
        });
        useExpenseStore.setState({
          transactions: expenseStore.transactions.filter((t: any) => t.id !== transaction.id)
        });
      }
      const finalLocalData = useExpenseStore.getState().transactions;
      await AsyncStorage.setItem('@transactions_storage_key', JSON.stringify(finalLocalData));
    }

    // --- ၂။ Shopping Items \ ---
    const localShoppingItems = [...expenseStore.toBuyItems];
    if (localShoppingItems.length > 0) {
      for (const item of localShoppingItems) {
        await db.collection('shopping_items').doc(item.id).set({
          ...item,
          userId: user.uid 
        });
      }
      await AsyncStorage.removeItem('@to_buy_items'); 
      useExpenseStore.setState({ toBuyItems: [] }); 
    }
    
    await expenseStore.fetchTransactions();
    await expenseStore.fetchToBuyItems();


    if (isNewUser) {
      await Notifications.scheduleNotificationAsync({
        content: {
          title: "Welcome! ✨",
          body: "သင့်ရဲ့ အသုံးစရိတ်ဒေတာတွေကို Google မှာ လုံခြုံစွာ သိမ်းဆည်းပေးထားပါတယ်ဗျာ။",
        },
        trigger: null,
      });

      await db.collection('users').doc(user.uid).set({
        uid: user.uid,
        email: user.email,
        displayName: user.displayName,
        createdAt: new Date().toISOString(),
        role: 'user'
      });
    } else {
      await Notifications.scheduleNotificationAsync({
        content: {
          title: "Welcome Back! 👋",
          body: `ပျော်ရွှင်ဖွယ်နေ့လေးဖြစ်ပါစေ၊ ${user.displayName}`,
        },
        trigger: null,
      });
    }

    const userData: UserProfile = {
      uid: user.uid,
      email: user.email,
      displayName: user.displayName,
      photoURL: user.photoURL,
      role: userDataFromFirestore?.role || 'user',
      actionPassword: userDataFromFirestore?.actionPassword || '',
    };

    set({ user: userData, isGuest: false });
    await AsyncStorage.setItem('@auth_status', 'logged_in');

  } catch (error) {
    console.error("Login Error:", error);
  }
},

  setUser: (userData) => {
    set({ user: userData, isGuest: false });
  },
  

logout: async () => {
  try {
    const currentState = get(); 
    const isGuestUser = currentState.isGuest;

    if (!isGuestUser) {
      await firebaseAuth.signOut();
      set({ user: null, isGuest: false });
      const { useExpenseStore } = require('./useExpenseStore'); 
      await useExpenseStore.getState().clearAllData(); 
      await AsyncStorage.removeItem('@user_passcode');
    }

    await AsyncStorage.removeItem('@auth_status');
    
    set({ user: null, isGuest: false });

  } catch (error) {
    console.error("Logout failed:", error);
  }
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
      
      const currentLang = savedLang || 'en';
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