import { Timestamp } from 'firebase/firestore';
export type Transaction = {
  id: string;
  userId: string;
  name: string;
  amount: number;
  type: 'Income' | 'Expense';
  categoryId: string;
  date: Timestamp;
  notes: string;
};
