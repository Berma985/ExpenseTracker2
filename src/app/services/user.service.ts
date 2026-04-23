import { Injectable, inject } from '@angular/core';
import { firestore } from '../firebase.config';
import { collection, query, where, getDocs, doc, getDoc, addDoc, setDoc } from 'firebase/firestore';
import {
  getAuth,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut as firebaseSignOut,
  onAuthStateChanged,
  User as FirebaseAuthUser,
  GoogleAuthProvider,
  signInWithPopup,
} from 'firebase/auth';
import { BehaviorSubject } from 'rxjs';
import { User } from '../models/user';
import { CategoryService } from './category.service';

@Injectable({ providedIn: 'root' })
export class UserService {
  categoryService = inject(CategoryService);

  private auth = getAuth();
  private currentUserSub = new BehaviorSubject<User | null>(null);
  public currentUser$ = this.currentUserSub.asObservable();

  constructor() {
    onAuthStateChanged(this.auth, async (fbUser) => {
      if (fbUser) {
        const profile = await this.getUserById(fbUser.uid);
        if (profile) this.currentUserSub.next(profile);
        else {
          const created = await this.createProfileFromAuth(fbUser);
          this.currentUserSub.next(created);
        }
      } else {
        this.currentUserSub.next(null);
      }
    });
  }

  async signUp(email: string, password: string, name: string, budgetGoals: string): Promise<User> {
    const cred = await createUserWithEmailAndPassword(this.auth, email, password);
    const uid = cred.user.uid;
    const profileData = {
      email,
      emailVerified: false,
      name,
      budgetGoals,
      providers: [{ provider: 'local', providerId: uid }],
    } as any;
    await setDoc(doc(firestore, 'users', uid), profileData);
    const defaultC = [
      {
        name: 'Work',
        color: '#d016ae',
        iconType: 'work',
        userId: uid,
        budget: 500,
      },
      {
        name: 'Grocery',
        color: '#f3206a',
        iconType: 'shopping_cart',
        userId: uid,
        budget: 1000,
      },
      {
        name: 'Transportation',
        color: '#2f8609',
        iconType: 'directions_car',
        userId: uid,
        budget: 300,
      },
    ];
    for (const c of defaultC) {
      const col = collection(firestore, 'categories');
      const ref = await addDoc(col, c as any);
    }

    const created = await this.getUserById(uid);
    return created as User;
  }

  async signInWithGoogle(): Promise<User> {
    const provider = new GoogleAuthProvider();

    const cred = await signInWithPopup(this.auth, provider);
    const fbUser = cred.user;
    const uid = fbUser.uid;

    let profile = await this.getUserById(uid);

    if (!profile) {
      profile = await this.createProfileFromAuth(fbUser);
    }

    this.currentUserSub.next(profile);
    return profile as User;
  }

  async signIn(email: string, password: string): Promise<User | null> {
    const cred = await signInWithEmailAndPassword(this.auth, email, password);
    const uid = cred.user.uid;
    const profile = await this.getUserById(uid);
    return profile;
  }

  async signOut(): Promise<void> {
    await firebaseSignOut(this.auth);
    this.currentUserSub.next(null);
  }

  /*private async createProfileFromAuth(fbUser: FirebaseAuthUser): Promise<User> {
    const uid = fbUser.uid;
    const data = {
      email: fbUser.email || '',
      emailVerified: fbUser.emailVerified || false,
      password: null,
      name: fbUser.displayName || '',
      providers: [{ provider: 'google', providerId: fbUser.providerId || '' }],
    } as any;
    await setDoc(doc(firestore, 'users', uid), data, { merge: true });
    return { id: uid, ...(data as any) } as User;
  }
  */
  private async createProfileFromAuth(fbUser: FirebaseAuthUser): Promise<User> {
    const uid = fbUser.uid;

    const providerData = fbUser.providerData.map((p) => ({
      provider: p.providerId, // e.g. 'google.com'
      providerId: p.uid,
    }));

    const data = {
      email: fbUser.email || '',
      emailVerified: fbUser.emailVerified || false,
      name: fbUser.displayName || '',
      providers: providerData,
    } as any;

    await setDoc(doc(firestore, 'users', uid), data, { merge: true });

    return { id: uid, ...(data as any) } as User;
  }

  async getUserByEmail(email: string): Promise<User | null> {
    const usersCol = collection(firestore, 'users');
    const q = query(usersCol, where('email', '==', email));
    const snapshot = await getDocs(q);
    if (snapshot.empty) return null;
    const docSnap = snapshot.docs[0];
    const data = docSnap.data();
    return { id: docSnap.id, ...(data as any) } as User;
  }

  async getUserById(id: string): Promise<User | null> {
    const ref = doc(firestore, 'users', id);
    const snap = await getDoc(ref);
    if (!snap.exists()) return null;
    return { id: snap.id, ...(snap.data() as any) } as User;
  }
}
