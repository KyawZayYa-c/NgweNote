import { create } from 'zustand';
import { Transaction, firestoreService } from '../services/firestoreService';
import { useAuthStore } from './useAuthStore';

// Fallback in-memory storage for transactions
const inMemoryStorage: Record<string, string> = {};

const getAsyncStorage = () => {
  try {
    return require('@react-native-async-storage/async-storage').default;
  } catch (e) {
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
    } catch (e) {}
  },
  removeItem: async (key: string) => {
    try {
      delete inMemoryStorage[key];
      const AS = getAsyncStorage();
      if (AS) await AS.removeItem(key);
    } catch (e) {}
  }
};

interface ExpenseState {
  transactions: Transaction[];
  isLoading: boolean;
  addTransaction: (t: Omit<Transaction, 'userId' | 'id'>) => Promise<void>;
  updateTransaction: (id: string, t: Partial<Transaction>) => Promise<void>;
  deleteTransaction: (id: string) => Promise<void>;
  fetchTransactions: () => Promise<void>;
  migrateGuestData: (userId: string) => Promise<void>;
}

const LOCAL_STORAGE_KEY = '@ngwenote_local_transactions';

export const useExpenseStore = create<ExpenseState>((set, get) => ({
  transactions: [],
  isLoading: false,
  addTransaction: async (t) => {
    const { user, isGuest } = useAuthStore.getState();
    if (user) {
      const docRef = await firestoreService.addTransaction({ ...t, userId: user.uid });
      set({ transactions: [{ ...t, id: docRef.id, userId: user.uid }, ...get().transactions] });
    } else if (isGuest) {
      const localT = { ...t, id: Date.now().toString(), userId: 'guest' };
      const newTransactions = [localT as Transaction, ...get().transactions];
      await storage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(newTransactions));
      set({ transactions: newTransactions });
    }
  },
  updateTransaction: async (id, t) => {
    const { user, isGuest } = useAuthStore.getState();
    if (user) {
      await firestoreService.updateTransaction(id, t);
      set({
        transactions: get().transactions.map(item => item.id === id ? { ...item, ...t } : item)
      });
    } else if (isGuest) {
      const newTransactions = get().transactions.map(item => item.id === id ? { ...item, ...t } : item);
      await storage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(newTransactions));
      set({ transactions: newTransactions });
    }
  },
  deleteTransaction: async (id) => {
    const { user, isGuest } = useAuthStore.getState();
    if (user) {
      await firestoreService.deleteTransaction(id);
      set({ transactions: get().transactions.filter(item => item.id !== id) });
    } else if (isGuest) {
      const newTransactions = get().transactions.filter(item => item.id !== id);
      await storage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(newTransactions));
      set({ transactions: newTransactions });
    }
  },
  fetchTransactions: async () => {
    set({ isLoading: true });
    const { user, isGuest } = useAuthStore.getState();
    if (user) {
      try {
        const transactions = await firestoreService.getTransactions(user.uid);
        set({ transactions, isLoading: false });
      } catch (e) {
        set({ isLoading: false });
      }
    } else if (isGuest) {
      const localData = await storage.getItem(LOCAL_STORAGE_KEY);
      const transactions = localData ? JSON.parse(localData).map((t: any) => ({
        ...t,
        transactionDate: new Date(t.transactionDate)
      })) : [];
      set({ transactions, isLoading: false });
    } else {
      set({ transactions: [], isLoading: false });
    }
  },
  migrateGuestData: async (userId) => {
    const localData = await storage.getItem(LOCAL_STORAGE_KEY);
    if (localData) {
      const transactions = JSON.parse(localData).map((t: any) => ({
        ...t,
        transactionDate: new Date(t.transactionDate)
      }));
      if (transactions.length > 0) {
        await firestoreService.batchUploadTransactions(userId, transactions);
        await storage.removeItem(LOCAL_STORAGE_KEY);
        const cloudData = await firestoreService.getTransactions(userId);
        set({ transactions: cloudData });
      }
    }
  }
}));
