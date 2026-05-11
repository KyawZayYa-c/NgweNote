import { create } from 'zustand';
import AsyncStorage from '@react-native-async-storage/async-storage';

// ၁။ ပစ္စည်းတစ်ခုချင်းစီရဲ့ ပုံစံ (Interface)
export interface ShoppingItem {
  id: string;
  itemName: string;
  unitPrice: number;
  count: number;
  isBought: boolean;
  createdAt: string;
}

// ၂။ Store ထဲမှာ သုံးမယ့် Function တွေရဲ့ ပုံစံ
interface ShoppingState {
  toBuyItems: ShoppingItem[];
  isLoading: boolean;
  fetchToBuyItems: () => Promise<void>;
  addToBuyItem: (item: { itemName: string; unitPrice: number; count: number }) => Promise<void>;
  updateToBuyItem: (id: string, updatedData: Partial<ShoppingItem>) => Promise<void>; // ✅ Update Function
  deleteToBuyItem: (id: string) => Promise<void>;
  toggleBoughtStatus: (id: string) => Promise<void>;
  clearShoppingData: () => Promise<void>;
}

const TO_BUY_KEY = '@to_buy_items';

export const useShoppingStore = create<ShoppingState>((set, get) => ({
  toBuyItems: [],
  isLoading: false,

  // ✅ ဒေတာများ ပြန်ခေါ်ခြင်း
  fetchToBuyItems: async () => {
    set({ isLoading: true });
    try {
      const data = await AsyncStorage.getItem(TO_BUY_KEY);
      const parsedData = data ? JSON.parse(data) : [];
      set({ toBuyItems: parsedData });
    } catch (error) {
      console.error("Shopping Fetch Error:", error);
    } finally {
      set({ isLoading: false });
    }
  },

  // ✅ ပစ္စည်းအသစ်ထည့်ခြင်း
  addToBuyItem: async (item) => {
    try {
      const newItem: ShoppingItem = {
        id: Date.now().toString(),
        itemName: item.itemName,
        unitPrice: item.unitPrice,
        count: item.count,
        isBought: false,
        createdAt: new Date().toISOString(),
      };
      const updated = [newItem, ...get().toBuyItems];
      set({ toBuyItems: updated });
      await AsyncStorage.setItem(TO_BUY_KEY, JSON.stringify(updated));
    } catch (error) {
      console.error("Add Error:", error);
    }
  },

  // ✅ ပစ္စည်းအချက်အလက် ပြင်ဆင်ခြင်း (Update)
  updateToBuyItem: async (id, updatedData) => {
    try {
      const updated = get().toBuyItems.map(item => 
        item.id === id ? { ...item, ...updatedData } : item
      );
      set({ toBuyItems: updated });
      await AsyncStorage.setItem(TO_BUY_KEY, JSON.stringify(updated));
    } catch (error) {
      console.error("Update Error:", error);
    }
  },

  // ✅ ဝယ်ပြီး/မပြီး အခြေအနေ ပြောင်းလဲခြင်း (Toggle)
  toggleBoughtStatus: async (id) => {
    try {
      const updated = get().toBuyItems.map(item => 
        item.id === id ? { ...item, isBought: !item.isBought } : item
      );
      set({ toBuyItems: updated });
      await AsyncStorage.setItem(TO_BUY_KEY, JSON.stringify(updated));
    } catch (error) {
      console.error("Toggle Error:", error);
    }
  },

  // ✅ ပစ္စည်းဖျက်ခြင်း
  deleteToBuyItem: async (id) => {
    try {
      const updated = get().toBuyItems.filter(item => item.id !== id);
      set({ toBuyItems: updated });
      await AsyncStorage.setItem(TO_BUY_KEY, JSON.stringify(updated));
    } catch (error) {
      console.error("Delete Error:", error);
    }
  },

  // ✅ ဒေတာအားလုံး ဖျက်ထုတ်ခြင်း
  clearShoppingData: async () => {
    try {
      await AsyncStorage.removeItem(TO_BUY_KEY);
      set({ toBuyItems: [] });
    } catch (error) {
      console.error("Clear Error:", error);
    }
  },
}));