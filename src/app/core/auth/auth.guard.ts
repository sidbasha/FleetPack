import { inject } from '@angular/core';
import { CanActivateChildFn, CanActivateFn, Router } from '@angular/router';
import { APP_ROUTES } from '../constants/app.constants';
import { AuthService } from './auth.service';

const requireAuth = () => {
  const auth = inject(AuthService);
  const router = inject(Router);

  if (auth.isAuthenticated()) {
    return true;
  }

  return router.createUrlTree([APP_ROUTES.login], {
    queryParams: { returnUrl: router.url === APP_ROUTES.login ? APP_ROUTES.home : router.url }
  });
};

export const authGuard: CanActivateFn = () => requireAuth();
export const authChildGuard: CanActivateChildFn = () => requireAuth();
