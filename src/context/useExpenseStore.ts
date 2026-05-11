import { create } from 'zustand';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useAuthStore } from './useAuthStore';
import { db, auth } from '../services/firebaseConfig';
import { doc, getDoc, setDoc } from 'firebase/firestore';
// ၁။ Transaction Structure
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

// ၂။ Shopping Item Structure
export interface ShoppingItem {
  id: string;
  itemName: string;
  unitPrice: number;
  count: number;
  isBought: boolean;
  createdAt: string;
}

// ၃။ Store Interface (Syntax ပြင်ဆင်ပြီး)
interface ExpenseState {
  transactions: Transaction[];
  recoveryTrash: Transaction[];
  toBuyItems: ShoppingItem[]; // နေရာမှန်ရွှေ့ထားသည်
  isLoading: boolean;
  userPasscode: string;
  adminNoti: string | null;
  
  setAdminNoti: (message: string | null) => void;
  fetchTransactions: () => Promise<void>;
  
  addTransaction: (t: { 
    title: string; 
    amount: number; 
    category: string; 
    type: 'income' | 'expense'; 
    transactionDate: string;
  }) => Promise<void>;

  deleteTransaction: (id: string) => Promise<void>;
  updateTransaction: (id: string, updatedData: Partial<Transaction>) => Promise<void>;
  setPasscode: (code: string) => Promise<void>;
  clearAllData: () => Promise<void>;

  // Shopping Actions
  addToBuyItem: (item: { itemName: string; unitPrice: number; count: number }) => Promise<void>;
  deleteToBuyItem: (id: string) => Promise<void>;
  toggleBoughtStatus: (id: string) => Promise<void>;
  fetchToBuyItems: () => Promise<void>;
}

const STORAGE_KEY = '@local_data';
const PASSCODE_KEY = '@user_passcode';
const RECOVERY_KEY = '@recovery_data';
const TO_BUY_KEY = '@to_buy_items'; // ⚠️ ဒါထည့်ဖို့ ကျန်ခဲ့တာပါ

export const useExpenseStore = create<ExpenseState>((set, get) => ({
  transactions: [],
  recoveryTrash: [],
  toBuyItems: [],
  isLoading: false,
  userPasscode: '1234',
  adminNoti: null,

  setAdminNoti: (message) => set({ adminNoti: message }),

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
        set({ transactions: data ? JSON.parse(data) : [] });
      }
    } catch (error) {
      console.error("Fetch error:", error);
    } finally {
      set({ isLoading: false });
    }
  },

  /*
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
*/
  
  // useExpenseStore.ts ထဲက addTransaction ကို ဒီလို ပြောင်းရေးပါ
addTransaction: async (t) => {
  const { user, isGuest } = useAuthStore.getState();
  const newId = Date.now().toString();

  const newTransaction: Transaction = {
    id: newId,
    userId: isGuest ? 'guest' : user?.uid || 'unknown', // Login ဝင်ထားရင် UID ထည့်မယ်
    ...t,
    createdAt: new Date().toISOString()
  };

  // ၁။ Local မှာ အရင်ပြမယ်
  const updated = [newTransaction, ...get().transactions];
  set({ transactions: updated });

  // ၂။ အကယ်၍ Login ဝင်ထားရင် Cloud (Firestore) ပေါ် တင်မယ် ✅
  if (!isGuest && user) {
    await setDoc(doc(db, 'transactions', newId), newTransaction);
  } else {
    await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
  }
},
  
  
  // useExpenseStore.ts ထဲမှာ ထည့်ရန်
verifyActionPassword: async (inputPin: string) => {
  const { user } = useAuthStore.getState();
  if (!user) return false;

  // Firestore ထဲက PIN နဲ့ တိုက်စစ်မယ်
  const userRef = doc(db, 'users', user.uid);
  const userSnap = await getDoc(userRef);
  
  if (userSnap.exists()) {
    const correctPin = userSnap.data().actionPassword;
    return inputPin === correctPin;
  }
  return false;
},

  updateTransaction: async (id, updatedData) => {
    const updated = get().transactions.map(t => 
      t.id === id ? { ...t, ...updatedData, updatedAt: new Date().toISOString() } : t
    );
    const { isGuest } = useAuthStore.getState();
    if (isGuest) await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
    set({ transactions: updated });
  },
  
  deleteTransaction: async (id) => {
    try {
      const currentTransactions = get().transactions;
      const itemToDelete = currentTransactions.find(t => t.id === id);
      const updated = currentTransactions.filter(t => t.id !== id);
      
      if (itemToDelete) {
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
/*
  setPasscode: async (code) => {
    try {
      await AsyncStorage.setItem(PASSCODE_KEY, code);
      set({ userPasscode: code });
    } catch (error) {
      console.error("Set Passcode error:", error);
    }
  },
*/
  // useExpenseStore.ts ထဲမှာ ဒီအတိုင်း ပြင်လိုက်ပါ

setPasscode: async (code: string) => {
  try {
    const { user, isGuest } = useAuthStore.getState();

    // ၁။ ဖုန်းထဲမှာ Password ကို အရင်မှတ်မယ်
    await AsyncStorage.setItem(PASSCODE_KEY, code);
    set({ userPasscode: code });

    // ၂။ အကယ်၍ Login ဝင်ထားရင် Cloud (Firestore) ပေါ်မှာပါ လှမ်းပြင်မယ် ✅
    if (!isGuest && user) {
      const userRef = doc(db, 'users', user.uid);
      await setDoc(userRef, { actionPassword: code }, { merge: true });
      
      // AuthStore ထဲက user object ကိုပါ password အသစ်နဲ့ update ဖြစ်သွားအောင် လုပ်ပေးမယ်
      useAuthStore.getState().setUser({ ...user, actionPassword: code });
    }

    console.log("Password updated both locally and on Cloud!");
  } catch (error) {
    console.error("Set Passcode error:", error);
  }
},
  // Shopping Logic
  fetchToBuyItems: async () => {
    try {
      const data = await AsyncStorage.getItem(TO_BUY_KEY);
      if (data) set({ toBuyItems: JSON.parse(data) });
    } catch (error) {
      console.error("Fetch ToBuy error:", error);
    }
  },

  addToBuyItem: async (item) => {
    const newItem: ShoppingItem = {
      id: Date.now().toString(),
      itemName: item.itemName,
      unitPrice: item.unitPrice,
      count: item.count,
      isBought: false,
      createdAt: new Date().toISOString(),
    };
    const updated = [newItem, ...get().toBuyItems];
    await AsyncStorage.setItem(TO_BUY_KEY, JSON.stringify(updated));
    set({ toBuyItems: updated });
  },

  toggleBoughtStatus: async (id) => {
    const updated = get().toBuyItems.map(item => 
      item.id === id ? { ...item, isBought: !item.isBought } : item
    );
    await AsyncStorage.setItem(TO_BUY_KEY, JSON.stringify(updated));
    set({ toBuyItems: updated });
  },

  deleteToBuyItem: async (id) => {
    const updated = get().toBuyItems.filter(item => item.id !== id);
    await AsyncStorage.setItem(TO_BUY_KEY, JSON.stringify(updated));
    set({ toBuyItems: updated });
  },

  clearAllData: async () => {
    try {
      const { isGuest } = useAuthStore.getState();
      if (isGuest) {
        await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify([]));
        await AsyncStorage.setItem(RECOVERY_KEY, JSON.stringify([]));
        await AsyncStorage.setItem(TO_BUY_KEY, JSON.stringify([]));
      }
      set({ transactions: [], recoveryTrash: [], toBuyItems: [] });
    } catch (error) {
      console.error("Clear error:", error);
    }
  },
}));