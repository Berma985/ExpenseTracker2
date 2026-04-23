import { Component, inject, signal, input } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { MatDialogRef, MatDialogContent, MatDialogActions } from '@angular/material/dialog';
import { MatFormField, MatFormFieldModule } from '@angular/material/form-field';
import { MatLabel } from '@angular/material/form-field';
import { TransactionService } from '../../services/transaction.service';
import { UserService } from '../../services/user.service';
import { Timestamp } from 'firebase/firestore';
import { Router } from '@angular/router';
import { MatCardModule } from '@angular/material/card';
import { MatOption } from '@angular/material/select';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatNativeDateModule } from '@angular/material/core';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatButtonModule } from '@angular/material/button';
import { firstValueFrom } from 'rxjs';
import { Category } from '../../models/category';
import { CategoryService } from '../../services/category.service';
import { Transaction } from '../../models/transaction';

@Component({
  selector: 'app-edit-transaction',
  imports: [
    ReactiveFormsModule,
    MatFormFieldModule,
    MatCardModule,
    MatOption,
    MatDatepickerModule,
    MatNativeDateModule,
    MatInputModule,
    MatSelectModule,
    MatButtonModule,
  ],
  templateUrl: './edit-transaction.html',
  styleUrl: './edit-transaction.css',
})
export class EditTransaction {
  id = input<string>();
  t = signal<any>(null);
  form = signal<FormGroup | null>(null);

  transactionService = inject(TransactionService);
  userService = inject(UserService);
  categoryService = inject(CategoryService);

  categories = signal<Category[]>([]);

  constructor(
    private fb: FormBuilder,
    private router: Router,
  ) {}

  ngOnInit(): void {
    this.userService.currentUser$.subscribe(async (user) => {
      if (!user) {
        this.categories.set([]);
      } else {
        try {
          console.log(this.id());
          this.categories.set(await this.categoryService.getCategoriesForUser(user.id));
        } finally {
        }
      }
    });
    this.loadTransaction(this.id()!);
  }

  async loadTransaction(id: string) {
    try {
      this.t.set(await this.transactionService.getTransactionById(this.id()!));
      console.log(this.t()?.id);
      this.form.set(
        this.fb.group({
          name: [this.t()!.name, [Validators.required]],
          amount: [this.t()!.amount, [Validators.required]],
          type: [this.t()!.type],
          categoryId: [this.t()!.categoryId],
          date: [this.t()!.date.toDate(), Validators.required],
          notes: [this.t()!.notes],
        }),
      );
    } finally {
    }
  }

  async submit() {
    console.log('FORM VALUE:', this.form()!.value);
    if (this.form()!.invalid) return;

    const user = await firstValueFrom(this.userService.currentUser$);

    if (!user?.id) {
      console.error('No logged-in user');
      return;
    }

    if (!this.id()) {
      console.error('No Transaction ID');
      return;
    }

    const value = this.form()!.value;
    await this.transactionService.updateTransaction(this.id()!, {
      userId: user.id,
      name: value.name,
      amount: value.amount,
      type: value.type,
      categoryId: value.categoryId,
      date: Timestamp.fromDate(value.date),
      notes: value.notes,
    });

    this.router.navigate(['/transactions']);
  }
}
