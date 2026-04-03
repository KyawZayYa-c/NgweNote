import { create } from 'zustand';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useAuthStore } from './useAuthStore';

// ၁။ Transaction တစ်ခုချင်းစီမှာ ပါမယ့် Data Structure
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

// ၂။ Store တစ်ခုလုံးရဲ့ State (ဒေတာ) နဲ့ Action (လုပ်ဆောင်ချက်) များ
interface ExpenseState {
  transactions: Transaction[];
  isLoading: boolean;
  userPasscode: string; // Passcode သိမ်းရန်
  
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
  setPasscode: (code: string) => Promise<void>; // Passcode အသစ်သတ်မှတ်ရန်
}

const STORAGE_KEY = '@local_data';
const PASSCODE_KEY = '@user_passcode';

export const useExpenseStore = create<ExpenseState>((set, get) => ({
  transactions: [],
  isLoading: false,
  userPasscode: '1234', // Default အနေနဲ့ ၁၂၃၄ ထားပေးထားပါတယ်

  // စာရင်းများရော၊ Passcode ကိုပါ ဆွဲယူခြင်း
  fetchTransactions: async () => {
    set({ isLoading: true });
    try {
      const { isGuest } = useAuthStore.getState();
      
      // Passcode ကိုအရင်ဆွဲထုတ်မယ်
      const storedPass = await AsyncStorage.getItem(PASSCODE_KEY);
      if (storedPass) set({ userPasscode: storedPass });

      if (isGuest) {
        const data = await AsyncStorage.getItem(STORAGE_KEY);
        const parsedData = data ? JSON.parse(data) : [];
        set({ transactions: parsedData, isLoading: false });
      } else {
        set({ transactions: [], isLoading: false });
      }
    } catch (error) {
      console.error("Fetch error:", error);
      set({ transactions: [], isLoading: false });
    }
  },

  // စာရင်းအသစ်ထည့်ခြင်း
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

      const currentTransactions = get().transactions;
      const updated = [newTransaction, ...currentTransactions];
      
      if (isGuest) {
        await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
      }
      set({ transactions: updated });
    } catch (error) {
      console.error("Add error:", error);
    }
  },

  // စာရင်းပြန်ပြင်ခြင်း
  updateTransaction: async (id, updatedData) => {
    const current = get().transactions;
    const updated = current.map(t => 
      t.id === id ? { ...t, ...updatedData, updatedAt: new Date().toISOString() } : t
    );
    
    const { isGuest } = useAuthStore.getState();
    if (isGuest) {
      await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
    }
    set({ transactions: updated });
  },
  
  // စာရင်းဖျက်ခြင်း
  deleteTransaction: async (id: string) => {
    try {
      const currentTransactions = get().transactions;
      const updated = currentTransactions.filter(t => t.id !== id);
      
      const { isGuest } = useAuthStore.getState();
      if (isGuest) {
        await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
      }
      set({ transactions: updated });
    } catch (error) {
      console.error("Delete error:", error);
    }
  },

  // Passcode အသစ်သိမ်းခြင်း
  setPasscode: async (code: string) => {
    try {
      await AsyncStorage.setItem(PASSCODE_KEY, code);
      set({ userPasscode: code });
    } catch (error) {
      console.error("Set Passcode error:", error);
    }
  },
}));