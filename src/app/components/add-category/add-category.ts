import { Component, inject } from '@angular/core';
import { FormBuilder, Validators, ReactiveFormsModule } from '@angular/forms';

import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { MatOptionModule } from '@angular/material/core';
import { MatLabel } from '@angular/material/form-field';
import { MatAutocompleteModule } from '@angular/material/autocomplete';
import { Categories } from '../categories/categories';
import { CategoryService } from '../../services/category.service';
import { UserService } from '../../services/user.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-add-category',
  imports: [
    ReactiveFormsModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatCardModule,
    MatIconModule,
    MatOptionModule,
    MatLabel,
    MatAutocompleteModule,
  ],
  templateUrl: './add-category.html',
  styleUrl: './add-category.css',
})
export class AddCategory {
  userService = inject(UserService);
  categoryService = inject(CategoryService);

  private fb = inject(FormBuilder);

  constructor(private router: Router) {}

  loading = false;
  error: string | null = null;

  iconOptions = [
    'category',
    'shopping_cart',
    'restaurant',
    'directions_car',
    'home',
    'pets',
    'fitness_center',
    'movie',
    'school',
    'work',
    'savings',
    'flight',
  ];

  form = this.fb.group({
    name: ['', Validators.required],
    color: ['#2196f3', Validators.required],
    iconType: ['category', Validators.required],
    budget: [0, [Validators.required, Validators.min(0)]],
  });

  async submit() {
    if (this.form.invalid) return;

    this.loading = true;
    this.error = null;

    try {
      const user = await this.getCurrentUser();
      if (!user) throw new Error('Not authenticated');

      await this.categoryService.createCategory({
        ...this.form.value,
        userId: user.id,
      } as any);

      this.form.reset({
        name: '',
        color: '#2196f3',
        iconType: 'category',
        budget: 0,
      });
      this.router.navigate(['/categories']);
    } catch (err) {
      console.error(err);
      this.error = 'Failed to create category';
    } finally {
      this.loading = false;
    }
  }

  private getCurrentUser() {
    return new Promise<any>((resolve) => {
      const sub = this.userService.currentUser$.subscribe((user) => {
        if (user !== undefined) {
          resolve(user);
          sub.unsubscribe();
        }
      });
    });
  }
}
