import AsyncStorage from '@react-native-async-storage/async-storage';

const STORAGE_KEY = '@transactions_data';

export const saveLocalTransaction = async (newTransaction: any) => {
  try {
    const existingData = await AsyncStorage.getItem(STORAGE_KEY);
    const transactions = existingData ? JSON.parse(existingData) : [];
    
    const updatedData = [newTransaction, ...transactions];
    await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(updatedData));
    return true;
  } catch (error) {
    console.error("Error saving local data:", error);
    return false;
  }
};