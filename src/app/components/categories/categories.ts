import { Component, inject, input, signal } from '@angular/core';
import { CategoryService } from '../../services/category.service';
import { Category } from '../../models/category';
import { User } from '../../models/user';
import { CurrencyPipe } from '@angular/common';
import { RouterLink, Router } from '@angular/router';
import { MatButtonModule } from '@angular/material/button';

import { MatCardModule } from '@angular/material/card';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatIconModule } from '@angular/material/icon';
import { UserService } from '../../services/user.service';

@Component({
  selector: 'app-categories',
  imports: [
    MatCardModule,
    MatProgressSpinnerModule,
    MatIconModule,
    CurrencyPipe,
    RouterLink,
    MatButtonModule,
  ],
  templateUrl: './categories.html',
  styleUrl: './categories.css',
})
export class Categories {
  categories = signal<Category[]>([]);
  loading = signal<boolean>(true);
  error: string | null = null;
  categoryService = inject(CategoryService);
  userService = inject(UserService);

  constructor(private router: Router) {}

  async ngOnInit() {
    this.userService.currentUser$.subscribe(async (user) => {
      if (!user) {
        this.categories.set([]);
        this.loading.set(false);
        return;
      }
      try {
        this.categories.set(await this.categoryService.getCategoriesForUser(user.id));
        console.log(this.categories());
      } finally {
        this.loading.set(false);
      }
    });
  }

  deleteCategory(catId: string) {
    this.categoryService.deleteCategory(catId);
    this.loading.set(true);
    console.log('delete');
    this.userService.currentUser$.subscribe(async (user) => {
      if (!user) {
        console.log('error User');
        this.categories.set([]);
        this.loading.set(false);
        return;
      }
      try {
        this.categories.set(await this.categoryService.getCategoriesForUser(user.id));
        console.log(this.categories());
      } finally {
        this.loading.set(false);
      }
    });
  }
  editCategory(categoryId: string) {
    this.router.navigate(['/categoriesedit', categoryId]);
  }
}
