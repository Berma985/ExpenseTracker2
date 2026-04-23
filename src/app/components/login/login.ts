import { Component, inject, signal } from '@angular/core';
import { FormBuilder, Validators, ReactiveFormsModule } from '@angular/forms';
import { RouterModule, Router } from '@angular/router';

// Angular Material imports
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { UserService } from '../../services/user.service';
import { User } from '../../models/user';

@Component({
  selector: 'app-login',
  imports: [
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatCardModule,
    ReactiveFormsModule,
    RouterModule,
  ],
  templateUrl: './login.html',
  styleUrl: './login.css',
})
export class Login {
  userService = inject(UserService);
  private fb = inject(FormBuilder);

  UserSub = this.userService.currentUser$.subscribe((value) => this.cUser.set(value));
  cUser = signal<User | null>(null);

  email = signal<string>('');
  password = signal<string>('');

  loginForm = this.fb.nonNullable.group({
    email: ['', [Validators.required, Validators.email]],
    password: ['', [Validators.required]],
  });

  ngOnInit() {
    this.UserSub = this.userService.currentUser$.subscribe((user) => this.cUser.set(user));
  }

  onSubmit() {
    if (this.loginForm.valid) {
      this.userService.signIn(this.email(), this.password());
    }
  }

  onLogout() {
    this.userService.signOut();
  }
}
