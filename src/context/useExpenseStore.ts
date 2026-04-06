import { create } from 'zustand';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useAuthStore } from './useAuthStore';

// ၁။ Transaction Structure (အစ်ကို့အတိုင်းပဲ ထားပါတယ်)
export interface Transaction {
  id: string;
  userId: string;
  title: string;
  amount: number;
  category: string;
  type: 'income' | 'expense';
  transactionDate: string;
  createdAt: string;
  updatedAt?: string;
}

// ၂။ Store Interface (Recovery နဲ့ ClearData function တွေ ထပ်တိုးလိုက်ပါတယ်)
interface ExpenseState {
  transactions: Transaction[];
  recoveryTrash: Transaction[]; // ဖျက်လိုက်တာတွေ ခေတ္တသိမ်းရန်
  isLoading: boolean;
  userPasscode: string;
  adminNoti: string | null; // ထပ်တိုးရန်
  setAdminNoti: (message: string | null) => void; // ထပ်တိုးရန်
  fetchTransactions: () => Promise<void>;
  addTransaction: (t: { 
    title: string; 
    amount: number; 
    category: string; 
    type: 'income' | 'expense'; 
    transactionDate: string 
  }) => Promise<void>;
  deleteTransaction: (id: string) => Promise<void>;
  updateTransaction: (id: string, updatedData: Partial<Transaction>) => Promise<void>;
  setPasscode: (code: string) => Promise<void>;
  clearAllData: () => Promise<void>; // Data အကုန်ဖျက်ရန်
}

const STORAGE_KEY = '@local_data';
const PASSCODE_KEY = '@user_passcode';
const RECOVERY_KEY = '@recovery_data'; // Trash အတွက် Key

export const useExpenseStore = create<ExpenseState>((set, get) => ({
  
  transactions: [],
  recoveryTrash: [],
  isLoading: false,
  userPasscode: '1234',
  adminNoti: null,
  setAdminNoti: (message: string | null) => set({ adminNoti: message }),

  fetchTransactions: async () => {
    set({ isLoading: true });
    try {
      const { isGuest } = useAuthStore.getState();
      
      const storedPass = await AsyncStorage.getItem(PASSCODE_KEY);
      const storedTrash = await AsyncStorage.getItem(RECOVERY_KEY);
      
      if (storedPass) set({ userPasscode: storedPass });
      if (storedTrash) set({ recoveryTrash: JSON.parse(storedTrash) });

      if (isGuest) {
        const data = await AsyncStorage.getItem(STORAGE_KEY);
        const parsedData = data ? JSON.parse(data) : [];
        set({ transactions: parsedData });
      }
    } catch (error) {
      console.error("Fetch error:", error);
    } finally {
      set({ isLoading: false });
    }
  },

  addTransaction: async (t) => {
    try {
      const { isGuest } = useAuthStore.getState();
      const newTransaction: Transaction = {
        id: Date.now().toString(),
        userId: isGuest ? 'guest' : 'user',
        title: t.title,
        amount: t.amount,
        category: t.category,
        type: t.type,
        transactionDate: t.transactionDate,
        createdAt: new Date().toISOString()
      };

      const updated = [newTransaction, ...get().transactions];
      if (isGuest) await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
      set({ transactions: updated });
    } catch (error) {
      console.error("Add error:", error);
    }
  },

  updateTransaction: async (id, updatedData) => {
    const updated = get().transactions.map(t => 
      t.id === id ? { ...t, ...updatedData, updatedAt: new Date().toISOString() } : t
    );
    const { isGuest } = useAuthStore.getState();
    if (isGuest) await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
    set({ transactions: updated });
  },
  
  // ✅ စာရင်းဖျက်တဲ့အခါ Recovery Trash ထဲ ထည့်တဲ့ Logic ပေါင်းထည့်ထားပါတယ်
  deleteTransaction: async (id: string) => {
    try {
      const currentTransactions = get().transactions;
      const itemToDelete = currentTransactions.find(t => t.id === id);
      const updated = currentTransactions.filter(t => t.id !== id);
      
      if (itemToDelete) {
        // Trash ထဲကို အခုဖျက်လိုက်တာ ထည့်မယ် (နောက်ဆုံး ၂၀ ခုပဲ သိမ်းမယ်)
        const updatedTrash = [itemToDelete, ...get().recoveryTrash].slice(0, 20);
        await AsyncStorage.setItem(RECOVERY_KEY, JSON.stringify(updatedTrash));
        set({ recoveryTrash: updatedTrash });
      }

      const { isGuest } = useAuthStore.getState();
      if (isGuest) await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
      set({ transactions: updated });
    } catch (error) {
      console.error("Delete error:", error);
    }
  },

  // ✅ Data အားလုံးကို အမှန်တကယ် ပျက်သွားအောင် လုပ်ပေးမယ့် function
  clearAllData: async () => {
    try {
      const { isGuest } = useAuthStore.getState();
      if (isGuest) {
        await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify([]));
        await AsyncStorage.setItem(RECOVERY_KEY, JSON.stringify([]));
      }
      set({ transactions: [], recoveryTrash: [] });
    } catch (error) {
      console.error("Clear error:", error);
    }
  },

  setPasscode: async (code: string) => {
    try {
      await AsyncStorage.setItem(PASSCODE_KEY, code);
      set({ userPasscode: code });
    } catch (error) {
      console.error("Set Passcode error:", error);
    }
  },
}));