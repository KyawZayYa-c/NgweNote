import { create } from 'zustand';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useAuthStore } from './useAuthStore';

// Error မတက်အောင် Interface ကို ဒီထဲမှာတင် အသေကြေညာလိုက်ပါမယ်
export interface Transaction {
  id: string;
  userId: string;
  title: string;
  amount: number;
  category: string;
  type: 'income' | 'expense';
  transactionDate: string;
  createdAt: string;
}

interface ExpenseState {
  transactions: Transaction[];
  isLoading: boolean;
  fetchTransactions: () => Promise<void>;
  addTransaction: (t: { 
    title: string; 
    amount: number; 
    category: string; 
    type: 'income' | 'expense'; 
    transactionDate: string 
  }) => Promise<void>;
}

export const useExpenseStore = create<ExpenseState>((set, get) => ({
  transactions: [],
  isLoading: false,

  fetchTransactions: async () => {
    // isLoading ကို true ပေးမယ်
    set({ isLoading: true });
    
    try {
      const { isGuest } = useAuthStore.getState();
      
      if (isGuest) {
        const data = await AsyncStorage.getItem('@local_data');
        const parsedData = data ? JSON.parse(data) : [];
        set({ transactions: parsedData, isLoading: false });
      } else {
        // လောလောဆယ် Guest မဟုတ်ရင် data အလွတ်ပဲ ပြထားမယ်
        set({ transactions: [], isLoading: false });
      }
    } catch (error) {
      console.error("Fetch error:", error);
      set({ transactions: [], isLoading: false });
    }
  },

  addTransaction: async (t) => {
    try {
      const { isGuest } = useAuthStore.getState();
      
      // Transaction အသစ်ကို တည်ဆောက်မယ်
      const newTransaction: Transaction = {
        ...t,
        id: Date.now().toString(),
        userId: isGuest ? 'guest' : 'user',
        createdAt: new Date().toISOString()
      };

      if (isGuest) {
        // လက်ရှိရှိတဲ့ transactions တွေထဲကို အသစ်တစ်ခု ထည့်မယ်
        const currentTransactions = get().transactions;
        const updated = [newTransaction, ...currentTransactions];
        
        // AsyncStorage မှာ သိမ်းမယ်
        await AsyncStorage.setItem('@local_data', JSON.stringify(updated));
        
        // State ကို update လုပ်မယ်
        set({ transactions: updated });
      }
    } catch (error) {
      console.error("Add error:", error);
    }
  }
}));