import { Injectable } from '@angular/core';
import { BaseApiService } from './base-api.service';
import { AuthAdapter } from '../api/adapters/auth.adapter';
import { LoginRequest, LoginResponse } from '../models/auth.model';
import { LoginRequestDTO, LoginResponseDto } from '../api/generated/model/models';

@Injectable({
  providedIn: 'root'
})
export class AuthService extends BaseApiService {
  async login(request: LoginRequest): Promise<LoginResponse> {
    console.log('🔵 [AuthService] login вызван с:', { username: request.username, passwordLength: request.password.length });
    const dto = AuthAdapter.toLoginRequestDto(request);
    console.log('🔵 [AuthService] DTO создан:', dto);
    
    const url = '/users/login';
    const body = JSON.stringify(dto);
    console.log('🔵 [AuthService] Отправка запроса на:', url);
    console.log('🔵 [AuthService] Body:', body);
    
    // Login is a public endpoint, don't add auth token
    const response = await this.fetchRequestPublic<LoginResponseDto>(url, {
      method: 'POST',
      body: body
    });
    
    console.log('🟢 [AuthService] Получен ответ:', response);
    const loginResponse = AuthAdapter.toLoginResponse(response);
    console.log('🟢 [AuthService] Адаптированный ответ:', loginResponse);
    return loginResponse;
  }

  saveToken(token: string): void {
    localStorage.setItem('auth_token', token);
  }

  getToken(): string | null {
    return localStorage.getItem('auth_token');
  }

  removeToken(): void {
    localStorage.removeItem('auth_token');
    localStorage.removeItem('user_role');
  }

  saveUserRole(role: string): void {
    localStorage.setItem('user_role', role);
  }

  getUserRole(): string | null {
    return localStorage.getItem('user_role');
  }

  isAuthenticated(): boolean {
    return !!this.getToken();
  }
}

