import { Component, inject, input, signal } from '@angular/core';
import { FormBuilder, Validators, ReactiveFormsModule, FormGroup } from '@angular/forms';

import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { MatOptionModule } from '@angular/material/core';
import { MatLabel } from '@angular/material/form-field';
import { MatAutocompleteModule } from '@angular/material/autocomplete';
import { Categories } from '../categories/categories';
import { Category } from '../../models/category';
import { CategoryService } from '../../services/category.service';
import { UserService } from '../../services/user.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-edit-category',
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
  templateUrl: './edit-category.html',
  styleUrl: './edit-category.css',
})
export class EditCategory {
  id = input<string>();
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

  form = signal<FormGroup | null>(null);

  async ngOnInit() {
    const cat = await this.categoryService.getCategoryById(this.id()!);
    this.form.set(
      this.fb.group({
        name: [cat?.name, Validators.required],
        color: [cat?.color, Validators.required],
        iconType: [cat?.iconType, Validators.required],
        budget: [cat?.budget, [Validators.required, Validators.min(0)]],
      }),
    );
  }
  async submit() {
    if (this.form()!.invalid) return;

    this.loading = true;
    this.error = null;

    try {
      const user = await this.getCurrentUser();
      if (!user) throw new Error('Not authenticated');

      await this.categoryService.updateCategory(this.id()!, {
        ...this.form()!.value,
        userId: user.id,
      } as Partial<Category>);

      this.form()!.reset({
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
