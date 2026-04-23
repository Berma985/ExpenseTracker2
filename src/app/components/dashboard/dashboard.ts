import { Component, OnInit, inject, signal, computed } from '@angular/core';
import { Category } from '../../models/category';
import { TransactionService } from '../../services/transaction.service';
import { CategoryService } from '../../services/category.service';
import { UserService } from '../../services/user.service';
import { BaseChartDirective } from 'ng2-charts';
import { CurrencyPipe } from '@angular/common';

@Component({
  selector: 'app-dashboard',
  imports: [BaseChartDirective, CurrencyPipe],
  templateUrl: './dashboard.html',
  styleUrl: './dashboard.css',
})
export class Dashboard {
  private txService = inject(TransactionService);
  private catService = inject(CategoryService);
  private userService = inject(UserService);

  chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
  };

  async ngOnInit() {
    this.userService.currentUser$.subscribe(async (user) => {
      if (!user) return;

      this.transactions.set(await this.txService.getTransactionsForUser(user.id));
      const now = new Date();
      console.log(this.transactions());
      this.transactions.set(
        this.transactions().filter((t) => {
          const d = new Date(t.date.toDate());
          return d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear();
        }),
      );

      this.categories.set(await this.catService.getCategoriesForUser(user.id));
    });
  }

  transactions = signal<any[]>([]);
  categories = signal<Category[]>([]);

  categoryPieData = computed(() => {
    const spending = this.categorySpending();

    return {
      labels: spending.map((c) => c.name),
      datasets: [
        {
          data: spending.map((c) => c.value),

          backgroundColor: spending.map((c) => {
            const cat = this.categories().find((x) => x.id === c.id);
            return cat?.color ?? '#ccc';
          }),
        },
      ],
    };
  });

  // 🔥 Derived state
  totalIncome = computed(() =>
    this.transactions()
      .filter((t) => t.type === 'Income')
      .reduce((sum, t) => sum + t.amount, 0),
  );

  totalExpense = computed(() =>
    this.transactions()
      .filter((t) => t.type === 'Expense')
      .reduce((sum, t) => sum + t.amount, 0),
  );

  net = computed(() => this.totalIncome() - this.totalExpense());

  categorySpending = computed(() => {
    const map: { [key: string]: number } = {};

    this.transactions()
      .filter((t) => t.type === 'Expense')
      .forEach((t) => {
        map[t.categoryId] = (map[t.categoryId] || 0) + t.amount;
      });

    return Object.keys(map).map((catId) => {
      const cat = this.categories().find((c) => c.id === catId);
      return {
        name: cat?.name || 'Unknown',
        value: map[catId],
        id: cat?.id,
      };
    });
  });

  budgetComparison = computed(() => {
    const spentMap: { [key: string]: number } = {};

    this.transactions()
      .filter((t) => t.type === 'Expense')
      .forEach((t) => {
        spentMap[t.categoryId] = (spentMap[t.categoryId] || 0) + t.amount;
      });
    this.categories().forEach((c) => {
      console.log(spentMap[c.name]);
    });
    return this.categories().map((cat) => ({
      name: cat.name,
      budget: cat.budget,
      actual: spentMap[cat.id] || 0,
    }));
  });

  alertsClose = computed(() => {
    return this.budgetComparison().filter((c) => {
      if (c.budget == 0) {
        return false;
      } else {
        return 0 < (c.budget - c.actual) / c.budget && (c.budget - c.actual) / c.budget < 0.1;
      }
    });
  });

  alertsOver = computed<any[]>(() => {
    return this.budgetComparison().filter((c) => {
      return c.budget < c.actual;
    });
  });
}
