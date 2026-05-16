import { create } from 'zustand';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { db, firebaseAuth } from '../services/firebaseConfig';
import { ref, set, push } from "firebase/database";
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

// ၃။ Store Interface (Syntax ပြင်ဆင်ပြီး)
interface ExpenseState {
  transactions: Transaction[];
  recoveryTrash: Transaction[];
  toBuyItems: ShoppingItem[]; // နေရာမှန်ရွှေ့ထားသည်
  isLoading: boolean;
  userPasscode: string;
  adminNoti: string | null;
  notiTitle: string | null;
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

// Firestore အတွက် ပြင်ဆင်ထားသော code
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
  setAdminNoti: (message) => set({ adminNoti: message }),
  setAdminTitle: (title) => set({ notiTitle: title }),

  

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

      // ၂။ ✅ Cloud (Firestore) ကနေ User ရဲ့ သတ်မှတ်ခဲ့ဖူးသော Passcode ကိုပါ တစ်ခါတည်း ဆွဲထုတ်ခြင်း
      const userDoc = await db.collection('users').doc(user.uid).get();
      if (userDoc.exists) {
        const userData = userDoc.data();
        const cloudPassword = userData?.actionPassword || "";
        
        // Local Sync လုပ်ပြီး Store ရဲ့ state ထဲ ထည့်သိမ်းထားလိုက်မယ်
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
// useExpenseStore.ts ထဲမှာ

addTransaction: async (t) => {
  // ✅ Function ထဲရောက်မှ useAuthStore ကို လှမ်းခေါ်ခြင်း
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
},

 
setPasscode: async (code: string) => {
  try {
    const { useAuthStore } = require('./useAuthStore');
    const { user, isGuest } = useAuthStore.getState(); // Auth store ဆီက လက်ရှိ user ကို ယူမယ်
    
    // ၁။ Local မှာ အရင်သိမ်းမယ်
    await AsyncStorage.setItem('@user_passcode', code);
    set({ userPasscode: code });

    // ၂။ Login ဝင်ထားတဲ့ user ဖြစ်ရင် Firebase (Firestore) မှာပါ သွားသိမ်းမယ်
    if (!isGuest && user?.uid) {
      await db.collection('users').doc(user.uid).set({ 
        actionPassword: code 
      }, { merge: true }); // merge: true က တခြား data တွေ (ဥပမာ role) မပျက်သွားအောင် ကာကွယ်ပေးပါတယ်
    }
  } catch (error) {
    console.error("Set Passcode error:", error);
  }
},
// Passcode ကို လုံးဝဖြုတ်ပစ်ဖို့ function
removePasscode: async () => {
  try {
    const { useAuthStore } = require('./useAuthStore');
    const { user, isGuest } = useAuthStore.getState();
    await AsyncStorage.removeItem(PASSCODE_KEY);
    set({ userPasscode: "" }); // Store ထဲမှာ blank ပြန်လုပ်လိုက်မယ်

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

  // အကယ်၍ userPasscode က မရှိဘူး (စာသားအလွတ် ဖြစ်နေရင်) Password တောင်းစရာမလိုလို့ true ပေးမယ်
  if (!userPasscode || userPasscode === "") {
    return true;
  }

  // ရှိရင်တော့ ရိုက်ထည့်လိုက်တဲ့ password နဲ့ ကိုက်ညီမှု ရှိမရှိ စစ်မယ်
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
    // ✅ Firebase မှာ သွားပြင်ခြင်း
    await db.collection('transactions').doc(id).update({
      ...updatedData,
      updatedAt: new Date().toISOString()
    });
  }
},
  
 deleteTransaction: async (id) => {
   try {
    const { useAuthStore } = require('./useAuthStore');
    const { isGuest, user } = useAuthStore.getState();
    const currentTransactions = get().transactions;
    const itemToDelete = currentTransactions.find(t => t.id === id);
    const updated = currentTransactions.filter(t => t.id !== id);

    // Trash/Recovery logic (Local မှာပဲ သိမ်းထားတာ ပိုကောင်းပါတယ်)
    if (itemToDelete) {
      const updatedTrash = [itemToDelete, ...get().recoveryTrash].slice(0, 20);
      await AsyncStorage.setItem(RECOVERY_KEY, JSON.stringify(updatedTrash));
      set({ recoveryTrash: updatedTrash });
    }

    set({ transactions: updated });

    if (isGuest) {
      await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
    } else if (user) {
      // ✅ Firebase ကနေ ဖျက်ခြင်း
      await db.collection('transactions').doc(id).delete();
    }
  } catch (error) {
    console.error("Delete error:", error);
  }
},
/*
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
*/
 
 // fetchToBuyItems: Cloud နဲ့ Local နှစ်မျိုးလုံးကနေ ဆွဲထုတ်မယ်
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

    // ၁။ Local သိမ်းမယ်
    const currentItems = get().toBuyItems || [];
    const updated = [newItem, ...currentItems];
    set({ toBuyItems: updated });
    await AsyncStorage.setItem('@to_buy_items', JSON.stringify(updated));

    // ၂။ Cloud (Firebase) သိမ်းမယ်
    if (!isGuest && user) {
      console.log("Saving to Firebase...");
      await db.collection('shopping_items').doc(newId).set(newItem);
      console.log("Firebase Save Success!");
    }
  } catch (error) {
    console.error("Add ToBuy Error:", error);
  }
},
// toggleBoughtStatus: ဝယ်ပြီး/မဝယ်ရသေး status ပြောင်းခြင်း
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

// deleteToBuyItem: ပစ္စည်းဖျက်ခြင်း
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

// updateToBuyItem: စာရင်းပြင်ဆင်ခြင်း (Firestore ပါ အလုပ်လုပ်အောင် ပြင်ထားသည်)
updateToBuyItem: async (id, updatedData) => {
  try {
    const { useAuthStore } = require('./useAuthStore');
    const { user, isGuest } = useAuthStore.getState();

    const updated = get().toBuyItems.map(item => 
      item.id === id ? { ...item, ...updatedData } : item
    );
    set({ toBuyItems: updated });

    if (!isGuest && user) {
      // ✅ Cloud (Firebase) မှာပါ သွားပြင်မယ်
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
    set({ isLoading: true }); // Loading စပြမယ်

    const { useAuthStore } = require('./useAuthStore');
    const { isGuest, user } = useAuthStore.getState();

    // ==========================================
    // ၁။ ✅ FIREBASE (CLOUD) DATA များ ရှင်းလင်းခြင်း
    // ==========================================
    if (!isGuest && user?.uid) {
      const batch = db.batch();

      // (က) User ရဲ့ Transactions များကို Firestore ထဲကနေ ရှာပြီး ဖျက်ရန်
      const txSnapshot = await db.collection('transactions')
        .where('userId', '==', user.uid)
        .get();
      txSnapshot.docs.forEach((doc) => {
        batch.delete(doc.ref);
      });

      // (ခ) User ရဲ့ Shopping Items (ဝယ်ယူရန်စာရင်း) များကို Firestore ထဲကနေ ရှာပြီး ဖျက်ရန်
      const shoppingSnapshot = await db.collection('shopping_items')
        .where('userId', '==', user.uid) // သို့မဟုတ် မင်းပေးထားတဲ့ field နာမည်အလိုက် စစ်ပါ
        .get();
      shoppingSnapshot.docs.forEach((doc) => {
        batch.delete(doc.ref);
      });

      // (ဂ) User Profile ထဲက သတ်မှတ်ထားတဲ့ actionPassword (Passcode) ကို အလွတ်ပြန်လုပ်ရန်
      const userRef = db.collection('users').doc(user.uid);
      batch.set(userRef, { actionPassword: "" }, { merge: true });

      // အားလုံးကို Cloud ပေါ်မှာ တစ်ပြိုင်နက် သွားဖျက်ခိုင်းလိုက်မယ်
      await batch.commit();
      console.log("Firebase cloud data cleared successfully!");
    }

    // ==========================================
    // ၂။ ✅ LOCAL (ASYNCSTORAGE) DATA များ ရှင်းလင်းခြင်း
    // ==========================================
    await Promise.all([
      AsyncStorage.removeItem(STORAGE_KEY),
      AsyncStorage.removeItem(RECOVERY_KEY),
      AsyncStorage.removeItem(TO_BUY_KEY),
      AsyncStorage.removeItem('@user_passcode')
    ]);

    // ==========================================
    // ၃။ ✅ ZUSTAND STATE များကို RESET လုပ်ခြင်း
    // ==========================================
    set({ 
      transactions: [], 
      recoveryTrash: [], 
      toBuyItems: [],
      userPasscode: '' 
    });

    console.log("All local and cloud data cleared successfully!");
  } catch (error) {
    console.error("Clear all data error:", error);
    throw error; // UI ဘက်က error သိအောင် ပြန်ပစ်ပေးမယ်
  } finally {
    set({ isLoading: false }); // Loading ပိတ်မယ်
  }
},
}));