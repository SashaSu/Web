import { Injectable } from '@angular/core';
import { BaseApiService } from './base-api.service';
import { DishAdapter } from '../api/adapters/dish.adapter';
import { Dish, DishCreate, DishUpdate, DishProduct, DishSuccessResponse } from '../models/dish.model';
import { DishDto, AddProductToDishDto, UpdateQuantityDto } from '../api/generated/model/models';

@Injectable({
  providedIn: 'root'
})
export class DishService extends BaseApiService {
  async getAllDishes(name?: string): Promise<Dish[]> {
    const queryString = this.buildQueryString({ name });
    const dtos = await this.fetchRequest<DishDto[]>(`/dishes${queryString}`);
    return dtos.map(dto => DishAdapter.toDish(dto));
  }

  async getDishById(id: string): Promise<Dish> {
    const dto = await this.fetchRequest<DishDto>(`/dishes/${id}`);
    return DishAdapter.toDish(dto);
  }

  async createDish(dish: DishCreate): Promise<DishSuccessResponse> {
    const dto = DishAdapter.toDishDto(dish);
    const response = await this.fetchRequest<{ message?: string; id?: string }>(`/dishes`, {
      method: 'POST',
      body: JSON.stringify(dto)
    });
    return DishAdapter.toDishSuccessResponse(response);
  }

  async updateDish(id: string, dish: DishUpdate): Promise<void> {
    console.log(dish);
    const dto = DishAdapter.toDishDto(dish);
    await this.fetchRequest<void>(`/dishes/${id}`, {
      method: 'PUT',
      body: JSON.stringify(dto)
    });
  }

  async deleteDish(id: string): Promise<void> {
    await this.fetchRequest<void>(`/dishes/${id}`, {
      method: 'DELETE'
    });
  }

  async getDishProducts(dishId: string): Promise<DishProduct[]> {
    const dtos = await this.fetchRequest<Array<{ productId?: string; productName?: string | null; quantity?: number }>>(`/dishes/${dishId}/products`);
    return dtos.map(dto => DishAdapter.toDishProduct(dto as any));
  }

  async addProductToDish(dishId: string, productId: string, quantity: number): Promise<void> {
    const dto = DishAdapter.toAddProductToDishDto(productId, quantity);
    await this.fetchRequest<void>(`/dishes/${dishId}/products`, {
      method: 'POST',
      body: JSON.stringify(dto)
    });
  }

  async updateProductQuantity(dishId: string, productId: string, quantity: number): Promise<void> {
    const dto = DishAdapter.toUpdateQuantityDto(quantity);
    await this.fetchRequest<void>(`/dishes/${dishId}/products/${productId}/quantity`, {
      method: 'PUT',
      body: JSON.stringify(dto)
    });
  }

  async removeProductFromDish(dishId: string, productId: string): Promise<void> {
    await this.fetchRequest<void>(`/dishes/${dishId}/products/${productId}`, {
      method: 'DELETE'
    });
  }

  async getDishesByProduct(productId: string): Promise<Dish[]> {
    const dtos = await this.fetchRequest<DishDto[]>(`/dishes/by-product/${productId}`);
    return dtos.map(dto => DishAdapter.toDish(dto));
  }
}

