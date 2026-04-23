import { Injectable } from '@angular/core';
import { firestore } from '../firebase.config';
import { collection, query, where, getDocs, addDoc, doc, getDoc, updateDoc, deleteDoc } from 'firebase/firestore';
import { Category } from '../models/category';

@Injectable({ providedIn: 'root' })
export class CategoryService {
  private colName = 'categories';

  constructor() {}

  async getCategoriesForUser(userId: string): Promise<Category[]> {
    const col = collection(firestore, this.colName);
    const q = query(col, where('userId', '==', userId));
    const snap = await getDocs(q);
    return snap.docs.map((d) => ({ id: d.id, ...(d.data() as any) } as Category));
  }

  async getCategoryById(id: string): Promise<Category | null> {
    const ref = doc(firestore, this.colName, id);
    const snap = await getDoc(ref);
    if (!snap.exists()) return null;
    return { id: snap.id, ...(snap.data() as any) } as Category;
  }

  async createCategory(cat: Omit<Category, 'id'>): Promise<Category> {
    const col = collection(firestore, this.colName);
    const ref = await addDoc(col, cat as any);
    const created = await this.getCategoryById(ref.id);
    if (!created) throw new Error('Failed to create category');
    return created;
  }

  async updateCategory(id: string, patch: Partial<Category>): Promise<void> {
    const ref = doc(firestore, this.colName, id);
    await updateDoc(ref, patch as any);
  }

  async deleteCategory(id: string): Promise<void> {
    const ref = doc(firestore, this.colName, id);
    await deleteDoc(ref);
  }
}
