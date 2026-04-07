import { create } from 'zustand';
import AsyncStorage from '@react-native-async-storage/async-storage';

export interface ShoppingItem {
  id: string;
  itemName: string;
  unitPrice: number;
  count: number;
  isBought: boolean;
  createdAt: string;
}

interface ShoppingState {
  toBuyItems: ShoppingItem[];
  isLoading: boolean;
  fetchToBuyItems: () => Promise<void>;
  addToBuyItem: (item: { itemName: string; unitPrice: number; count: number }) => Promise<void>;
  deleteToBuyItem: (id: string) => Promise<void>;
  toggleBoughtStatus: (id: string) => Promise<void>;
  clearShoppingData: () => Promise<void>;
}

const TO_BUY_KEY = '@to_buy_items';

export const useShoppingStore = create<ShoppingState>((set, get) => ({
  toBuyItems: [],
  isLoading: false,

  fetchToBuyItems: async () => {
    set({ isLoading: true });
    try {
      const data = await AsyncStorage.getItem(TO_BUY_KEY);
      // Data ရှိရင် Parse လုပ်မယ်၊ မရှိရင် Array အလွတ်ထားမယ်
      const parsedData = data ? JSON.parse(data) : [];
      set({ toBuyItems: parsedData });
    } catch (error) {
      console.error("Shopping Fetch Error:", error);
    } finally {
      set({ isLoading: false });
    }
  },

  addToBuyItem: async (item) => {
    const newItem: ShoppingItem = {
      id: Date.now().toString(),
      itemName: item.itemName,
      unitPrice: item.unitPrice,
      count: item.count,
      isBought: false,
      createdAt: new Date().toISOString(), // ISO String format အမှန်
    };
    const updated = [newItem, ...get().toBuyItems];
    set({ toBuyItems: updated });
    await AsyncStorage.setItem(TO_BUY_KEY, JSON.stringify(updated));
  },

  toggleBoughtStatus: async (id) => {
    // ⚠️ ဒီနေရာမှာ error တက်နိုင်တဲ့ logic တွေကို try-catch နဲ့ အုပ်ထားပါတယ်
    try {
      const updated = get().toBuyItems.map(item => 
        item.id === id ? { ...item, isBought: !item.isBought } : item
      );
      set({ toBuyItems: updated });
      await AsyncStorage.setItem(TO_BUY_KEY, JSON.stringify(updated));
    } catch (error) {
      console.error("Toggle error:", error);
    }
  },

  deleteToBuyItem: async (id) => {
    const updated = get().toBuyItems.filter(item => item.id !== id);
    set({ toBuyItems: updated });
    await AsyncStorage.setItem(TO_BUY_KEY, JSON.stringify(updated));
  },

  clearShoppingData: async () => {
    await AsyncStorage.removeItem(TO_BUY_KEY);
    set({ toBuyItems: [] });
  },
}));