import { Injectable, signal, computed } from '@angular/core';
import { DishService } from '../services/dish.service';
import { Dish, DishCreate, DishUpdate } from '../models/dish.model';

@Injectable({
  providedIn: 'root'
})
export class DishViewModel {
  private dishesSignal = signal<Dish[]>([]);
  private loadingSignal = signal<boolean>(false);
  private errorSignal = signal<string | null>(null);

  dishes = this.dishesSignal.asReadonly();
  loading = this.loadingSignal.asReadonly();
  error = this.errorSignal.asReadonly();

  constructor(private dishService: DishService) {}

  async loadDishes(name?: string): Promise<void> {
    this.loadingSignal.set(true);
    this.errorSignal.set(null);
    
    try {
      const dishes = await this.dishService.getAllDishes(name);
      this.dishesSignal.set(dishes);
    } catch (err: any) {
      this.errorSignal.set(err.message || 'Ошибка при загрузке блюд');
      this.dishesSignal.set([]);
    } finally {
      this.loadingSignal.set(false);
    }
  }

  async loadDish(id: string): Promise<Dish | null> {
    this.loadingSignal.set(true);
    this.errorSignal.set(null);
    
    try {
      const dish = await this.dishService.getDishById(id);
      // Update dish in list if exists
      const dishes = this.dishesSignal();
      const index = dishes.findIndex(d => d.id === id);
      if (index >= 0) {
        dishes[index] = dish;
        this.dishesSignal.set([...dishes]);
      }
      return dish;
    } catch (err: any) {
      this.errorSignal.set(err.message || 'Ошибка при загрузке блюда');
      return null;
    } finally {
      this.loadingSignal.set(false);
    }
  }

  async createDish(dish: DishCreate): Promise<boolean> {
    this.loadingSignal.set(true);
    this.errorSignal.set(null);
    
    try {
      const response = await this.dishService.createDish(dish);
      // Reload dishes to get the new one with full data
      await this.loadDishes();
      return true;
    } catch (err: any) {
      this.errorSignal.set(err.message || 'Ошибка при создании блюда');
      return false;
    } finally {
      this.loadingSignal.set(false);
    }
  }

  async updateDish(id: string, dish: DishUpdate): Promise<boolean> {
    this.loadingSignal.set(true);
    this.errorSignal.set(null);
    
    try {
      await this.dishService.updateDish(id, dish);
      // Reload dishes to get updated data
      await this.loadDishes();
      return true;
    } catch (err: any) {
      this.errorSignal.set(err.message || 'Ошибка при обновлении блюда');
      return false;
    } finally {
      this.loadingSignal.set(false);
    }
  }

  async deleteDish(id: string): Promise<boolean> {
    this.loadingSignal.set(true);
    this.errorSignal.set(null);
    
    try {
      await this.dishService.deleteDish(id);
      // Remove from local state
      const dishes = this.dishesSignal().filter(d => d.id !== id);
      this.dishesSignal.set(dishes);
      return true;
    } catch (err: any) {
      this.errorSignal.set(err.message || 'Ошибка при удалении блюда');
      return false;
    } finally {
      this.loadingSignal.set(false);
    }
  }

  clearError(): void {
    this.errorSignal.set(null);
  }
}

