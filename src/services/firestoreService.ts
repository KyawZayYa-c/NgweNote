import { 
  collection, 
  addDoc, 
  updateDoc, 
  deleteDoc, 
  doc, 
  query, 
  where, 
  getDocs, 
  serverTimestamp,
  orderBy,
  writeBatch
} from 'firebase/firestore';
import { db } from './firebaseConfig';

export interface Transaction {
  id?: string;
  userId: string;
  title: string;
  amount: number;
  category: string;
  type: 'income' | 'expense';
  transactionDate: Date;
  note?: string;
  createdAt?: any;
}

export const firestoreService = {
  async addTransaction(transaction: Omit<Transaction, 'id'>) {
    return await addDoc(collection(db, 'expenses'), {
      ...transaction,
      createdAt: serverTimestamp(),
    });
  },

  async updateTransaction(id: string, transaction: Partial<Transaction>) {
    const transactionRef = doc(db, 'expenses', id);
    return await updateDoc(transactionRef, transaction);
  },

  async deleteTransaction(id: string) {
    const transactionRef = doc(db, 'expenses', id);
    return await deleteDoc(transactionRef);
  },

  async getTransactions(userId: string) {
    const q = query(
      collection(db, 'expenses'),
      where('userId', '==', userId),
      orderBy('transactionDate', 'desc')
    );
    const querySnapshot = await getDocs(q);
    return querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data(),
      transactionDate: doc.data().transactionDate.toDate(),
    })) as Transaction[];
  },

  async batchUploadTransactions(userId: string, transactions: Omit<Transaction, 'userId' | 'id'>[]) {
    const batch = writeBatch(db);
    transactions.forEach(t => {
      const newDocRef = doc(collection(db, 'expenses'));
      batch.set(newDocRef, {
        ...t,
        userId,
        createdAt: serverTimestamp(),
      });
    });
    return await batch.commit();
  }
};
