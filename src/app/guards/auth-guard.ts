import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { UserService } from '../services/user.service';
import { map, take } from 'rxjs/operators';

export const authGuard: CanActivateFn = (route, state) => {
  const userService = inject(UserService);
  const router = inject(Router);

  return userService.currentUser$.pipe(
    take(1),
    map((user) => {
      if (user) return true;

      router.navigate(['/login']); // redirect if not logged in
      return false;
    }),
  );
};
