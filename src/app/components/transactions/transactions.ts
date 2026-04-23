import { Component, inject, signal, input, viewChild, effect, computed } from '@angular/core';
import { MatCardModule } from '@angular/material/card';
import { MatTableModule, MatTableDataSource } from '@angular/material/table';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatMenuModule } from '@angular/material/menu';
import { MatChipsModule } from '@angular/material/chips';
import { MatFormField } from '@angular/material/form-field';
import { MatLabel } from '@angular/material/form-field';
import { MatPaginatorModule } from '@angular/material/paginator';
import { MatPaginator } from '@angular/material/paginator';
import { MatProgressBar } from '@angular/material/progress-bar';
import { Transaction } from '../../models/transaction';
import { TransactionService } from '../../services/transaction.service';
import { UserService } from '../../services/user.service';
import { CategoryService } from '../../services/category.service';
import { Observable, switchMap, from, of, take, filter } from 'rxjs';
import { toSignal } from '@angular/core/rxjs-interop';
import { NgIf } from '@angular/common';
import { MatDialog } from '@angular/material/dialog';
import { AddTransaction } from '../add-transaction/add-transaction';
import { User } from '../../models/user';
import { RouterLink } from '@angular/router';
import { Timestamp } from 'firebase/firestore';
import { Category } from '../../models/category';
import { Router } from '@angular/router';
import { MatOptionModule } from '@angular/material/core';
import { MatSelectModule } from '@angular/material/select';
import { MatInputModule } from '@angular/material/input';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatNativeDateModule } from '@angular/material/core';
import { CurrencyPipe } from '@angular/common';

@Component({
  selector: 'app-transactions',
  imports: [
    MatCardModule,
    MatTableModule,
    MatIconModule,
    MatButtonModule,
    MatMenuModule,
    MatChipsModule,
    MatFormField,
    MatLabel,
    MatPaginatorModule,
    NgIf,
    MatProgressBar,
    RouterLink,
    MatOptionModule,
    MatSelectModule,
    MatInputModule,
    MatDatepickerModule,
    MatNativeDateModule,
    CurrencyPipe,
  ],
  templateUrl: './transactions.html',
  styleUrl: './transactions.css',
})
export class Transactions {
  displayedColumns: string[] = ['date', 'name', 'amount', 'category', 'type', 'actions'];
  dataSource = new MatTableDataSource<Transaction>([]);
  loading = false;
  categoryService = inject(CategoryService);
  categories = signal<Category[]>([]);

  searchTerm = signal<string>('');
  selectedCategoryId = signal<string | null>(null);
  fromDate = signal<Date | null>(null);
  toDate = signal<Date | null>(null);

  allTransactions = signal<Transaction[]>([]);

  constructor(
    private transactionService: TransactionService,
    private userService: UserService,
    private router: Router,
  ) {}

  ngOnInit(): void {
    this.loadTransactions();
  }

  async loadTransactions() {
    this.loading = true;

    this.userService.currentUser$.subscribe(async (user) => {
      if (!user?.id) {
        this.dataSource.data = [];
        this.loading = false;
        return;
      }
      this.categories.set(await this.categoryService.getCategoriesForUser(user.id));
      this.transactionService.getTransactionsForUser(user.id).then((transactions) => {
        const sorted = transactions.sort(
          (a, b) => new Date(b.date.toDate()).getTime() - new Date(a.date.toDate()).getTime(),
        );

        this.allTransactions.set(sorted);
        this.applyFilters();
        this.loading = false;
      });
    });
  }

  onFromDateChange(date: Date | null) {
    this.fromDate.set(date);
    this.applyFilters();
  }

  onToDateChange(date: Date | null) {
    this.toDate.set(date);
    this.applyFilters();
  }

  onSearchChange(value: string) {
    this.searchTerm.set(value);
    this.applyFilters();
  }

  onCategoryChange(categoryId: string | null) {
    this.selectedCategoryId.set(categoryId);
    this.applyFilters();
  }

  applyFilters() {
    const term = this.searchTerm().toLowerCase();
    const categoryId = this.selectedCategoryId();
    const from = this.fromDate();
    const to = this.toDate();

    let filtered = this.allTransactions();

    if (term) {
      filtered = filtered.filter((t) => t.name.toLowerCase().includes(term));
    }

    if (categoryId) {
      filtered = filtered.filter((t) => t.categoryId === categoryId);
    }

    if (from) {
      filtered = filtered.filter((t) => new Date(t.date.toDate()).getTime() >= from.getTime());
    }

    if (to) {
      filtered = filtered.filter((t) => new Date(t.date.toDate()).getTime() <= to.getTime());
    }

    this.dataSource.data = filtered;
  }

  async deleteTransaction(id: string) {
    await this.transactionService.deleteTransaction(id);
    this.dataSource.data = this.dataSource.data.filter((t) => t.id !== id);
  }

  editTransaction(transactionId: string) {
    this.router.navigate(['/transactionsedit', transactionId]);
  }

  toReadableDate(date: Timestamp) {
    return date.toDate().toLocaleDateString();
  }

  getCategory(categoryId: string) {
    for (const c of this.categories()) {
      if (categoryId === c.id) return c;
    }
    return null;
  }
}
