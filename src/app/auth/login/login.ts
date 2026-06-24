import { Component, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, ActivatedRoute } from '@angular/router';
import { AuthService } from '../../core/services/auth.service';

@Component({
  selector: 'app-login',
  imports: [CommonModule, FormsModule],
  templateUrl: './login.html',
  styleUrl: './login.scss',
})
export class Login {
  username = signal<string>('');
  password = signal<string>('');
  error = signal<string | null>(null);
  loading = signal<boolean>(false);

  constructor(
    private authService: AuthService,
    private router: Router,
    private route: ActivatedRoute
  ) {}

  async onLogin() {
    console.log('🔵 [Login] onLogin вызван');
    const username = this.username().trim();
    const password = this.password().trim();

    console.log('🔵 [Login] Username:', username, 'Password length:', password.length);

    if (!username || !password) {
      console.log('🔴 [Login] Пустые поля');
      this.error.set('Введите логин и пароль');
      return;
    }

    this.loading.set(true);
    this.error.set(null);

    try {
      console.log('🔵 [Login] Вызываю authService.login...');
      const response = await this.authService.login({ username, password });
      console.log('🟢 [Login] Получен ответ от сервера:', response);
      
      if (response.token) {
        console.log('🟢 [Login] Токен получен, длина:', response.token.length);
        this.authService.saveToken(response.token);
        console.log('🟢 [Login] Токен сохранен в localStorage');
        
        // Try to extract role from token (JWT) or use default
        const role = this.extractRoleFromToken(response.token);
        console.log('🔵 [Login] Извлеченная роль из токена:', role);
        if (role) {
          this.authService.saveUserRole(role);
          console.log('🟢 [Login] Роль сохранена:', role);
        }

        // Get return URL or default to role-based route
        const returnUrl = this.route.snapshot.queryParams['returnUrl'];
        console.log('🔵 [Login] ReturnUrl:', returnUrl);
        
        if (returnUrl) {
          console.log('🟢 [Login] Перенаправление на returnUrl:', returnUrl);
          this.router.navigateByUrl(returnUrl);
        } else {
          // Navigate based on role or default
          const userRole = this.authService.getUserRole();
          console.log('🔵 [Login] UserRole из localStorage:', userRole);
          const route = userRole ? `/${userRole}` : '/login';
          console.log('🟢 [Login] Перенаправление на route:', route);
          this.router.navigate([route]);
        }
      } else {
        console.log('🔴 [Login] Токен не получен в ответе');
        this.error.set('Неверный логин или пароль');
      }
    } catch (err: any) {
      console.error('🔴 [Login] Ошибка:', err);
      console.error('🔴 [Login] Ошибка details:', {
        message: err.message,
        status: err.status,
        statusText: err.statusText
      });
      this.error.set(err.message || 'Ошибка при входе в систему');
    } finally {
      this.loading.set(false);
      console.log('🔵 [Login] Загрузка завершена');
    }
  }

  private extractRoleFromToken(token: string): string | null {
    try {
      console.log('🔵 [Login] Попытка извлечь роль из токена, длина:', token.length);
      // Try to decode JWT token (base64 encoded payload)
      const parts = token.split('.');
      console.log('🔵 [Login] Частей в токене:', parts.length);
      if (parts.length === 3) {
        const payload = JSON.parse(atob(parts[1]));
        console.log('🔵 [Login] Декодированный payload:', payload);
        // Common JWT claims for role
        const role = 
        payload.role || 
        payload.Role || 
        payload['http://schemas.microsoft.com/ws/2008/06/identity/claims/role'] ||
        payload['http://schemas.xmlsoap.org/ws/2005/05/identity/claims/role'] ||
        payload.authorities?.[0] || 
        payload.Authorities?.[0] ||
        payload.userRole || 
        payload.UserRole ||
        payload.scope ||
        payload.Scope ||
        null;

        console.log('🔵 [Login] Найденная роль:', role);
         // ПРЕОБРАЗОВАНИЕ РОЛИ
      let normalizedRole = role;
      if (role) {
        // Приводим к нижнему регистру
        normalizedRole = role.toLowerCase();
        
        // Заменяем Administrator на admin
        if (normalizedRole.includes('administrator') || normalizedRole.includes('администратор')) {
          normalizedRole = 'admin';
        } else if (normalizedRole.includes('manager') || normalizedRole.includes('менеджер')) {
          normalizedRole = 'manager';
        } else if (normalizedRole.includes('waiter') || normalizedRole.includes('официант')) {
          normalizedRole = 'waiter';
        } else if (normalizedRole.includes('cook') || normalizedRole.includes('chef') || normalizedRole.includes('повар')) {
          normalizedRole = 'chef';
        }
        
        console.log('🟢 [Login] Нормализованная роль:', normalizedRole);
        this.authService.saveUserRole(normalizedRole);
        console.log('🟢 [Login] Роль сохранена:', normalizedRole);
      }
        return normalizedRole;
      } else {
        console.log('🔴 [Login] Токен не в формате JWT (не 3 части)');
      }
    } catch (err) {
      console.error('🔴 [Login] Ошибка при декодировании токена:', err);
    }
    return null;
  }

  onUsernameChange(value: string) {
    this.username.set(value);
    this.error.set(null);
  }

  onPasswordChange(value: string) {
    this.password.set(value);
    this.error.set(null);
  }
}
