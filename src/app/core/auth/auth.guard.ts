import { inject } from '@angular/core';
import { CanActivateChildFn, CanActivateFn, Router } from '@angular/router';
import { AuthService } from './auth.service';

const requireAuth = () => {
  const auth = inject(AuthService);
  const router = inject(Router);

  if (auth.isAuthenticated()) {
    return true;
  }

  return router.createUrlTree(['/login'], {
    queryParams: { returnUrl: router.url === '/login' ? '/' : router.url }
  });
};

export const authGuard: CanActivateFn = () => requireAuth();
export const authChildGuard: CanActivateChildFn = () => requireAuth();
