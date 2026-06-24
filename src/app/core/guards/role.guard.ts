import { inject } from '@angular/core';
import { Router, CanActivateFn, ActivatedRouteSnapshot } from '@angular/router';
import { UserRole } from '../../shared/models/user-role';

export const roleGuard: CanActivateFn = (route: ActivatedRouteSnapshot) => {
  const router = inject(Router);
  const requiredRole = route.data['role'] as UserRole;
  
  if (!requiredRole) {
    return true; // No role requirement
  }
  
  const userRole = localStorage.getItem('user_role') as UserRole;
  
  if (userRole !== requiredRole) {
    router.navigate(['/login']);
    return false;
  }
  
  return true;
};

