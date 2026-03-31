import { create } from 'zustand';
import { onAuthStateChanged, User, signOut } from 'firebase/auth';
import { auth } from '../services/firebaseConfig';

// Fallback in-memory storage if AsyncStorage is null or failing
const inMemoryStorage: Record<string, string> = {};

const getAsyncStorage = () => {
  try {
    return require('@react-native-async-storage/async-storage').default;
  } catch (e) {
    console.warn('AsyncStorage native module not found, using memory fallback');
    return null;
  }
};

const storage = {
  getItem: async (key: string) => {
    try {
      const AS = getAsyncStorage();
      if (AS) return await AS.getItem(key);
      return inMemoryStorage[key] || null;
    } catch (e) {
      return inMemoryStorage[key] || null;
    }
  },
  setItem: async (key: string, value: string) => {
    try {
      inMemoryStorage[key] = value;
      const AS = getAsyncStorage();
      if (AS) await AS.setItem(key, value);
    } catch (e) {
      console.warn('Storage set failed:', e);
    }
  },
  removeItem: async (key: string) => {
    try {
      delete inMemoryStorage[key];
      const AS = getAsyncStorage();
      if (AS) await AS.removeItem(key);
    } catch (e) {
      console.warn('Storage remove failed:', e);
    }
  }
};

interface AuthState {
  user: User | null;
  isGuest: boolean;
  isLoading: boolean;
  setUser: (user: User | null) => void;
  setGuest: (isGuest: boolean) => void;
  setLoading: (loading: boolean) => void;
  init: () => () => void;
  loginAsGuest: () => Promise<void>;
  logout: () => Promise<void>;
}

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  isGuest: false,
  isLoading: true,
  setUser: (user) => set({ user }),
  setGuest: (isGuest) => set({ isGuest }),
  setLoading: (isLoading) => set({ isLoading }),
  init: () => {
    let hasInitialized = false;
    let unsubscribe = () => {};

    if (auth) {
      unsubscribe = onAuthStateChanged(auth, async (user) => {
        try {
          const guestFlag = await storage.getItem('isGuest');
          set({ 
            user, 
            isGuest: guestFlag === 'true' && !user,
            isLoading: false 
          });
          hasInitialized = true;
        } catch (error) {
          set({ isLoading: false });
        }
      }, (error) => {
        console.warn('Firebase Auth error:', error);
        set({ isLoading: false });
      });
    } else {
      storage.getItem('isGuest').then(guestFlag => {
        set({ isGuest: guestFlag === 'true', isLoading: false });
        hasInitialized = true;
      });
    }

    setTimeout(async () => {
      if (!hasInitialized) {
        const guestFlag = await storage.getItem('isGuest');
        set({ isGuest: guestFlag === 'true', isLoading: false });
      }
    }, 2000);

    return unsubscribe;
  },
  loginAsGuest: async () => {
    try {
      await storage.setItem('isGuest', 'true');
      set({ isGuest: true, user: null, isLoading: false });
    } catch (error) {
      console.error('loginAsGuest error', error);
      set({ isGuest: true, user: null, isLoading: false }); // Force enter
    }
  },
  logout: async () => {
    await storage.removeItem('isGuest');
    if (auth) await signOut(auth);
    set({ user: null, isGuest: false });
  },
}));
