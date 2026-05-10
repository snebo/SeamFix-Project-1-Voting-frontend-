import { inject } from '@angular/core';
import { Router } from '@angular/router';
import { UserService } from '../../services/user.service';
import { map } from 'rxjs';

export const adminGuard = () => {
  const userService = inject(UserService);
  const router = inject(Router);
  const user = userService.currentUser();

  if (user && user.roles.includes('admin')) {
    return true;
  }

  // If user state is not yet loaded, we might need to wait or check profile
  // For simplicity here, we assume MainLayout has already triggered the fetch
  // but a more robust way would be checking profile if currentUser() is null
  if (!user) {
    return userService.getProfile().pipe(
      map((profile) => {
        if (profile && profile.roles.includes('admin')) {
          return true;
        }
        router.navigate(['/home']);
        return false;
      }),
    );
  }

  router.navigate(['/home']);
  return false;
};
