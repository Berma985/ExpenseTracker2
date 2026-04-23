import { Routes } from '@angular/router';
import { Login } from './components/login/login';
import { Home } from './components/home/home';
import { Register } from './components/register/register';
import { Transactions } from './components/transactions/transactions';
import { AddTransaction } from './components/add-transaction/add-transaction';
import { Categories } from './components/categories/categories';
import { AddCategory } from './components/add-category/add-category';
import { EditTransaction } from './components/edit-transaction/edit-transaction';
import { Dashboard } from './components/dashboard/dashboard';
import { EditCategory } from './components/edit-category/edit-category';
import { authGuard } from './guards/auth-guard';

export const routes: Routes = [
  { path: 'login', component: Login, title: 'Login' },
  { path: '', component: Home, title: 'Home' },
  { path: 'register', component: Register, title: 'Register' },
  {
    path: 'transactions',
    component: Transactions,
    title: 'Transactions',
    canActivate: [authGuard],
  },
  {
    path: 'transactionsnew',
    component: AddTransaction,
    title: 'Add Transaction',
    canActivate: [authGuard],
  },
  { path: 'categories', component: Categories, title: 'Categories', canActivate: [authGuard] },
  {
    path: 'categoriesnew',
    component: AddCategory,
    title: 'Add Category',
    canActivate: [authGuard],
  },
  {
    path: 'transactionsedit/:id',
    component: EditTransaction,
    title: 'Edit Transaction',
    canActivate: [authGuard],
  },
  { path: 'dashboard', component: Dashboard, title: 'Dashboard', canActivate: [authGuard] },
  {
    path: 'categoriesedit/:id',
    component: EditCategory,
    title: 'Edit Category',
    canActivate: [authGuard],
  },
];
