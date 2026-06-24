import { Injectable, signal } from '@angular/core';
import { ROLE_THEMES, RoleTheme } from '../models/theme-colors';
import { UserRole } from '../models/user-role';

@Injectable({ providedIn: 'root' })
export class ThemeService {
  private readonly currentRole = signal<UserRole>('admin');

  setRole(role: UserRole) {
    this.currentRole.set(role);
  }

  getRole(): UserRole {
    return this.currentRole();
  }

  getTheme(role?: UserRole): RoleTheme {
    const resolved = role ?? this.currentRole();
    return ROLE_THEMES[resolved] ?? ROLE_THEMES.admin;
  }
}

