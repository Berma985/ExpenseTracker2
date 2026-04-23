import { Component, inject } from '@angular/core';
import { FormBuilder, Validators, ReactiveFormsModule } from '@angular/forms';

// Angular Material
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { UserService } from '../../services/user.service';

@Component({
  selector: 'app-register',
  imports: [
    ReactiveFormsModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatCardModule,
  ],
  templateUrl: './register.html',
  styleUrl: './register.css',
})
export class Register {
  userService = inject(UserService);
  private fb = inject(FormBuilder);

  registerForm = this.fb.nonNullable.group({
    name: ['', Validators.required],
    email: ['', [Validators.required, Validators.email]],
    password: ['', [Validators.required, Validators.minLength(6)]],
    budgetGoals: [''],
  });

  onSubmit() {
    if (this.registerForm.valid) {
      this.userService.signUp(
        this.registerForm.value.email!,
        this.registerForm.value.password!,
        this.registerForm.value.name!,
        this.registerForm.value.budgetGoals || '',
      );
      this.formClear();
    }
  }

  formClear() {
    this.registerForm.reset();
  }
}
