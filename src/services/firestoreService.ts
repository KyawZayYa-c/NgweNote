// src/services/firestoreService.ts (အပေါ်ဆုံးမှာ ထည့်ပါ)
export interface Transaction {
  id: string;
  userId: string;
  title: string;
  amount: number;
  category: string;
  type: 'income' | 'expense';
  transactionDate: string; // "2026-03-31" format
  createdAt: string;
}