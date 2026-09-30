import { create } from 'zustand';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { db } from '../services/firebaseConfig';
import * as Notifications from 'expo-notifications';
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
  userId: string,
}

// ၃။ Store Interface
interface ExpenseState {
  transactions: Transaction[];
  recoveryTrash: Transaction[];
  toBuyItems: ShoppingItem[]; 
  isLoading: boolean;
  userPasscode: string;
  adminNoti: string | null;
  notiTitle: string | null;
  is75PercentNotiSent: boolean;
  verifyActionPassword: (inputPin: string) => Promise<boolean>;
  setAdminNoti: (message: string | null) => void;
  setAdminTitle: (title: string | null) => void;
  fetchTransactions: () => Promise<void>;
  addTransaction: (t: { 
    title: string;  
    amount: number; 
    category: string; 
    type: 'income' | 'expense'; 
    transactionDate: string;
  }) => Promise<void>;
  setTransactions: (transactions: any[]) => void;

  deleteTransaction: (id: string) => Promise<void>;
  updateTransaction: (id: string, updatedData: Partial<Transaction>) => Promise<void>;
  setPasscode: (code: string) => Promise<void>;
  clearAllData: () => Promise<void>;
  removePasscode: () => Promise<void>;
  checkBudgetThreshold: () => Promise<void>;
  // Shopping Actions
  addToBuyItem: (item: { itemName: string; unitPrice: number; count: number }) => Promise<void>;
  deleteToBuyItem: (id: string) => Promise<void>;
  toggleBoughtStatus: (id: string) => Promise<void>;
  fetchToBuyItems: () => Promise<void>;
  updateToBuyItem: (id: string, updatedData: any) => Promise<void>;
}

const STORAGE_KEY = '@local_data';
const PASSCODE_KEY = '@user_passcode';
const RECOVERY_KEY = '@recovery_data';
const TO_BUY_KEY = '@to_buy_items'; 

// Firestore 
export const sendGlobalNotification = async (title: string, message: string) => {
  try {
    await db.collection('notifications').add({
      title : title,
      message: message,
      timestamp: Date.now(), 
      sender: "Admin"
    });
    console.log("Notification sent successfully!");
  } catch (error) {
    console.error("Error sending noti:", error);
  }
};

export const useExpenseStore = create<ExpenseState>((set, get) => ({
  transactions: [],
  recoveryTrash: [],
  toBuyItems: [],
  isLoading: false,
  userPasscode: '',
  adminNoti: null,
  notiTitle: null,
  is75PercentNotiSent: false,
  setAdminNoti: (message) => set({ adminNoti: message }),
  setAdminTitle: (title) => set({ notiTitle: title }),

  // 🔥 75% Budget Noti / Reset Auto Logic
checkBudgetThreshold: async () => {
  const { transactions, is75PercentNotiSent } = get();
  
  const now = new Date();
  const currentMonth = now.getMonth();
  const currentYear = now.getFullYear();

  const currentMonthTransactions = transactions.filter(tr => {
    const d = new Date(tr.transactionDate);
    return d.getMonth() === currentMonth && d.getFullYear() === currentYear;
  });

  const totalIncome = currentMonthTransactions
    .filter(t => t.type === 'income')
    .reduce((sum, t) => sum + t.amount, 0);

  const totalExpense = currentMonthTransactions
    .filter(t => t.type === 'expense')
    .reduce((sum, t) => sum + t.amount, 0);

  if (totalIncome === 0) return;

  const expensePercentage = (totalExpense / totalIncome) * 100;

  if (expensePercentage >= 75) {
    if (!is75PercentNotiSent) {
      await Notifications.scheduleNotificationAsync({
        content: {
          title: "သတိပေးချက် ⚠️",
          body: `ဒီလရဲ့ ဝင်ငွေထဲက 75% ကို သုံးစွဲပြီးသွားပါပြီဗျာ။ (လက်ရှိသုံးစွဲမှု: ${expensePercentage.toFixed(1)}%)`,
        },
        trigger: { seconds: 1 },
      });
      set({ is75PercentNotiSent: true });
    }
  } else if (expensePercentage < 75) {
    if (is75PercentNotiSent) {
      set({ is75PercentNotiSent: false });
    }
  }
},

fetchTransactions: async () => {
  set({ isLoading: true });
  try {
    const { useAuthStore } = require('./useAuthStore');
    const { isGuest, user } = useAuthStore.getState();
    
    if (isGuest) {
      // Guest User အတွက် Transactions ရော Passcode ပါ Local ကနေ ဆွဲထုတ်မယ်
      const data = await AsyncStorage.getItem(STORAGE_KEY);
      set({ transactions: data ? JSON.parse(data) : [] });

      const localPass = await AsyncStorage.getItem('@user_passcode') || "";
      set({ userPasscode: localPass });

    } else if (user) {
      // ၁။ ✅ Cloud (Firestore) ကနေ Transactions တွေ ဆွဲထုတ်ခြင်း
      const querySnapshot = await db.collection('transactions')
        .where('userId', '==', user.uid)
        .orderBy('createdAt', 'desc')
        .get();
      
      const cloudData = querySnapshot.docs.map(doc => ({
        ...doc.data(),
        id: doc.id 
      })) as Transaction[];
      
      set({ transactions: cloudData });

      const userDoc = await db.collection('users').doc(user.uid).get();
      if (userDoc.exists) {
        const userData = userDoc.data();
        const cloudPassword = userData?.actionPassword || "";
        
        await AsyncStorage.setItem('@user_passcode', cloudPassword);
        set({ userPasscode: cloudPassword });
      }
    }
  } catch (error) {
    console.error("Fetch error:", error);
  } finally {
    set({ isLoading: false });
  }
  },

  setTransactions: (transactions) => set({ transactions }),


addTransaction: async (t) => {
  const { useAuthStore } = require('./useAuthStore');
  const { user, isGuest } = useAuthStore.getState();
  
  const newId = Date.now().toString();
  const newTransaction: Transaction = {
    id: newId,
    userId: isGuest ? 'guest' : user?.uid || 'unknown',
    ...t,
    createdAt: new Date().toISOString()
  };

  const updated = [newTransaction, ...get().transactions];
  set({ transactions: updated });

  if (!isGuest && user) {
    await db.collection('transactions').doc(newId).set(newTransaction);
  } else {
    await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
  }
  await get().checkBudgetThreshold();
},

 
setPasscode: async (code: string) => {
  try {
    const { useAuthStore } = require('./useAuthStore');
    const { user, isGuest } = useAuthStore.getState(); 

    await AsyncStorage.setItem('@user_passcode', code);
    set({ userPasscode: code });

    if (!isGuest && user?.uid) {
      await db.collection('users').doc(user.uid).set({ 
        actionPassword: code 
      }, { merge: true }); 
    }
  } catch (error) {
    console.error("Set Passcode error:", error);
  }
},

removePasscode: async () => {
  try {
    const { useAuthStore } = require('./useAuthStore');
    const { user, isGuest } = useAuthStore.getState();
    await AsyncStorage.removeItem(PASSCODE_KEY);
    set({ userPasscode: "" }); 

    if (!isGuest && user) {
      await db.collection('users').doc(user.uid).set({ 
        actionPassword: "" 
      }, { merge: true });
      useAuthStore.getState().setUser({ ...user, actionPassword: "" });
    }
  } catch (error) {
    console.error("Remove Passcode error:", error);
  }
},
  

verifyActionPassword: async (inputPassword: string) => {
  const { userPasscode } = get();


  if (!userPasscode || userPasscode === "") {
    return true;
  }

  return inputPassword === userPasscode;
},

  updateTransaction: async (id, updatedData) => {
    const { useAuthStore } = require('./useAuthStore');
  const { isGuest, user } = useAuthStore.getState();
  const updated = get().transactions.map(t => 
    t.id === id ? { ...t, ...updatedData, updatedAt: new Date().toISOString() } : t
  );

  set({ transactions: updated });

  if (isGuest) {
    await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
  } else if (user) {
    await db.collection('transactions').doc(id).update({
      ...updatedData,
      updatedAt: new Date().toISOString()
    });
    }
    await get().checkBudgetThreshold();
},
  
 deleteTransaction: async (id) => {
   try {
    const { useAuthStore } = require('./useAuthStore');
    const { isGuest, user } = useAuthStore.getState();
    const currentTransactions = get().transactions;
    const itemToDelete = currentTransactions.find(t => t.id === id);
    const updated = currentTransactions.filter(t => t.id !== id);

    if (itemToDelete) {
      const updatedTrash = [itemToDelete, ...get().recoveryTrash].slice(0, 20);
      await AsyncStorage.setItem(RECOVERY_KEY, JSON.stringify(updatedTrash));
      set({ recoveryTrash: updatedTrash });
    }

    set({ transactions: updated });

    if (isGuest) {
      await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
    } else if (user) {
      await db.collection('transactions').doc(id).delete();
     }
     await get().checkBudgetThreshold();
  } catch (error) {
    console.error("Delete error:", error);
  }
},

fetchToBuyItems: async () => {
  set({ isLoading: true });
  try {
    const { useAuthStore } = require('./useAuthStore');
    const { isGuest, user } = useAuthStore.getState();

    if (isGuest) {
      const data = await AsyncStorage.getItem(TO_BUY_KEY);
      set({ toBuyItems: data ? JSON.parse(data) : [] });
    } else if (user) {
      // ✅ Firestore ကနေ Shopping Items တွေယူမယ်
      const querySnapshot = await db.collection('shopping_items')
        .where('userId', '==', user.uid)
        .orderBy('createdAt', 'desc')
        .get();

      const cloudItems = querySnapshot.docs.map(doc => ({
        ...doc.data(),
        id: doc.id
      })) as ShoppingItem[];

      set({ toBuyItems: cloudItems });
    }
  } catch (error) {
    console.error("Fetch ToBuy error:", error);
  } finally {
    set({ isLoading: false });
  }
},

  addToBuyItem: async (item) => {
  try {
    const { useAuthStore } = require('./useAuthStore');
    const { user, isGuest } = useAuthStore.getState();
    
    const newId = Date.now().toString();
    const newItem = {
      id: newId,
      userId: isGuest ? "guest" : (user?.uid || "unknown"),
      itemName: item.itemName,
      unitPrice: Number(item.unitPrice) || 0,
      count: Number(item.count) || 0,
      isBought: false,
      createdAt: new Date().toISOString(),
    };


    const currentItems = get().toBuyItems || [];
    const updated = [newItem, ...currentItems];
    set({ toBuyItems: updated });
    await AsyncStorage.setItem('@to_buy_items', JSON.stringify(updated));


    if (!isGuest && user) {
      console.log("Saving to Firebase...");
      await db.collection('shopping_items').doc(newId).set(newItem);
      console.log("Firebase Save Success!");
    }
  } catch (error) {
    console.error("Add ToBuy Error:", error);
  }
},
toggleBoughtStatus: async (id) => {
  const { useAuthStore } = require('./useAuthStore');
  const { user, isGuest } = useAuthStore.getState();

  const updated = get().toBuyItems.map(item => 
    item.id === id ? { ...item, isBought: !item.isBought } : item
  );
  set({ toBuyItems: updated });

  if (!isGuest && user) {
    const itemToUpdate = updated.find(i => i.id === id);
    await db.collection('shopping_items').doc(id).update({
      isBought: itemToUpdate?.isBought
    });
  } else {
    await AsyncStorage.setItem(TO_BUY_KEY, JSON.stringify(updated));
  }
},

deleteToBuyItem: async (id) => {
  const { useAuthStore } = require('./useAuthStore');
  const { user, isGuest } = useAuthStore.getState();

  const updated = get().toBuyItems.filter(item => item.id !== id);
  set({ toBuyItems: updated });

  if (!isGuest && user) {
    await db.collection('shopping_items').doc(id).delete();
  } else {
    await AsyncStorage.setItem(TO_BUY_KEY, JSON.stringify(updated));
  }
},

updateToBuyItem: async (id, updatedData) => {
  try {
    const { useAuthStore } = require('./useAuthStore');
    const { user, isGuest } = useAuthStore.getState();

    const updated = get().toBuyItems.map(item => 
      item.id === id ? { ...item, ...updatedData } : item
    );
    set({ toBuyItems: updated });

    if (!isGuest && user) {
      await db.collection('shopping_items').doc(id).update(updatedData);
    } else {
      await AsyncStorage.setItem(TO_BUY_KEY, JSON.stringify(updated));
    }
    console.log("Item updated successfully!");
  } catch (error) {
    console.error("Update Error:", error);
  }
  },

clearAllData: async () => {
  try {
    set({ isLoading: true });

    const { useAuthStore } = require('./useAuthStore');
    const { isGuest, user } = useAuthStore.getState();

    if (!isGuest && user?.uid) {
      const batch = db.batch();

      const txSnapshot = await db.collection('transactions')
        .where('userId', '==', user.uid)
        .get();
      txSnapshot.docs.forEach((doc) => {
        batch.delete(doc.ref);
      });

      const shoppingSnapshot = await db.collection('shopping_items')
        .where('userId', '==', user.uid) 
        .get();
      shoppingSnapshot.docs.forEach((doc) => {
        batch.delete(doc.ref);
      });

      const userRef = db.collection('users').doc(user.uid);
      batch.set(userRef, { actionPassword: "" }, { merge: true });

      await batch.commit();
      console.log("Firebase cloud data cleared successfully!");
    }

    await Promise.all([
      AsyncStorage.removeItem(STORAGE_KEY),
      AsyncStorage.removeItem(RECOVERY_KEY),
      AsyncStorage.removeItem(TO_BUY_KEY),
      AsyncStorage.removeItem('@user_passcode')
    ]);

    set({ 
      transactions: [], 
      recoveryTrash: [], 
      toBuyItems: [],
      userPasscode: '' 
    });

    console.log("All local and cloud data cleared successfully!");
  } catch (error) {
    console.error("Clear all data error:", error);
    throw error;
  } finally {
    set({ isLoading: false }); 
  }
},
}));