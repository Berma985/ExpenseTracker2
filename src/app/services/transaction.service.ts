import { Injectable } from '@angular/core';
import { firestore } from '../firebase.config';
import {
  collection,
  query,
  where,
  getDocs,
  addDoc,
  doc,
  getDoc,
  updateDoc,
  deleteDoc,
  onSnapshot,
} from 'firebase/firestore';
import { Transaction } from '../models/transaction';
import { Observable } from 'rxjs';
import { Timestamp } from 'firebase/firestore';

@Injectable({ providedIn: 'root' })
export class TransactionService {
  private colName = 'transactions';

  constructor() {}

  async getTransactionsForUser(userId: string): Promise<Transaction[]> {
    const col = collection(firestore, this.colName);
    const q = query(col, where('userId', '==', userId));
    const snap = await getDocs(q);
    return snap.docs.map(
      (d) => ({ id: d.id, date: d.get('date').toDate(), ...(d.data() as any) }) as Transaction,
    );
  }

  async getTransactionById(id: string): Promise<Transaction | null> {
    const ref = doc(firestore, this.colName, id);
    const snap = await getDoc(ref);
    if (!snap.exists()) return null;
    return { id: snap.id, ...(snap.data() as any) } as Transaction;
  }

  async addTransaction(tx: Omit<Transaction, 'id'>): Promise<Transaction> {
    const col = collection(firestore, this.colName);
    const payload = {
      ...tx,
      date: tx.date instanceof Date ? Timestamp.fromDate(tx.date) : tx.date,
    };
    const ref = await addDoc(col, payload as any);
    const created = await this.getTransactionById(ref.id);
    if (!created) throw new Error('Failed to create transaction');
    return created;
  }

  async updateTransaction(id: string, patch: Partial<Transaction>): Promise<void> {
    const ref = doc(firestore, this.colName, id);
    await updateDoc(ref, patch as any);
  }

  async deleteTransaction(id: string): Promise<void> {
    const ref = doc(firestore, this.colName, id);
    await deleteDoc(ref);
  }
}
