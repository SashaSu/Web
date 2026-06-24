import { Injectable } from '@angular/core';

export interface ApiError {
  message: string;
  status?: number;
  statusText?: string;
}

import { API_CONFIG } from '../config/api.config';

@Injectable({
  providedIn: 'root'
})
export abstract class BaseApiService {
  protected baseUrl: string = API_CONFIG.baseUrl;

  protected async fetchRequest<T>(
    url: string,
    options: RequestInit = {}
  ): Promise<T> {
    return this.fetchRequestWithAuth<T>(url, options, true);
  }

  protected async fetchRequestPublic<T>(
    url: string,
    options: RequestInit = {}
  ): Promise<T> {
    return this.fetchRequestWithAuth<T>(url, options, false);
  }

  private async fetchRequestWithAuth<T>(
    url: string,
    options: RequestInit = {},
    requireAuth: boolean = true
  ): Promise<T> {
    const token = this.getAuthToken();
    const fullUrl = `${this.baseUrl}${url}`;
    
    console.log('🔵 [BaseApiService] fetchRequestWithAuth:', {
      url: fullUrl,
      method: options.method || 'GET',
      requireAuth,
      hasToken: !!token
    });
    
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
      ...(options.headers as Record<string, string> || {})
    };

    if (requireAuth && token) {
      headers['Authorization'] = `Bearer ${token}`;
      console.log('🔵 [BaseApiService] Добавлен Authorization header');
    } else {
      console.log('🔵 [BaseApiService] Публичный запрос, без Authorization');
    }

    console.log('🔵 [BaseApiService] Headers:', headers);
    console.log('🔵 [BaseApiService] Body:', options.body);

    const response = await fetch(fullUrl, {
      ...options,
      headers
    });
    
    console.log('🔵 [BaseApiService] Response status:', response.status, response.statusText);

    if (!response.ok) {
      console.error('🔴 [BaseApiService] HTTP error:', response.status, response.statusText);
      const error: ApiError = {
        message: `HTTP error! status: ${response.status}`,
        status: response.status,
        statusText: response.statusText
      };

      try {
        const errorData = await response.json();
        console.error('🔴 [BaseApiService] Error data:', errorData);
        error.message = errorData.message || errorData.error || error.message;
      } catch (e) {
        console.error('🔴 [BaseApiService] Не удалось распарсить error response:', e);
        // If response is not JSON, use default error message
      }

      throw error;
    }

    // Handle empty responses
    const contentType = response.headers.get('content-type');
    console.log('🔵 [BaseApiService] Content-Type:', contentType);
    
    if (!contentType || !contentType.includes('application/json')) {
      console.log('🔵 [BaseApiService] Пустой ответ или не JSON');
      return {} as T;
    }

    const jsonData = await response.json();
    console.log('🟢 [BaseApiService] JSON данные получены:', jsonData);
    return jsonData;
  }

  protected getAuthToken(): string | null {
    return localStorage.getItem('auth_token');
  }

  protected buildQueryString(params: Record<string, string | number | undefined>): string {
    const queryParams = new URLSearchParams();
    
    Object.entries(params).forEach(([key, value]) => {
      if (value !== undefined && value !== null) {
        queryParams.append(key, String(value));
      }
    });

    const queryString = queryParams.toString();
    return queryString ? `?${queryString}` : '';
  }
}

