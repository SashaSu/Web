import { Injectable, signal, computed } from '@angular/core';
import { OrderService } from '../services/order.service';
import { Order, OrderCreate, OrderUpdate } from '../models/order.model';

@Injectable({
  providedIn: 'root'
})
export class OrderViewModel {
  private ordersSignal = signal<Order[]>([]);
  private loadingSignal = signal<boolean>(false);
  private errorSignal = signal<string | null>(null);

  orders = this.ordersSignal.asReadonly();
  loading = this.loadingSignal.asReadonly();
  error = this.errorSignal.asReadonly();

  constructor(private orderService: OrderService) {}

  async loadOrders(id?: string): Promise<void> {
    this.loadingSignal.set(true);
    this.errorSignal.set(null);
    
    try {
      const orders = await this.orderService.getAllOrders(id);
      this.ordersSignal.set(orders);
    } catch (err: any) {
      this.errorSignal.set(err.message || 'Ошибка при загрузке заказов');
      this.ordersSignal.set([]);
    } finally {
      this.loadingSignal.set(false);
    }
  }

  async loadOrder(id: string): Promise<Order | null> {
    this.loadingSignal.set(true);
    this.errorSignal.set(null);
    
    try {
      const order = await this.orderService.getOrderById(id);
      // Update order in list if exists
      const orders = this.ordersSignal();
      const index = orders.findIndex(o => o.id === id);
      if (index >= 0) {
        orders[index] = order;
        this.ordersSignal.set([...orders]);
      }
      return order;
    } catch (err: any) {
      this.errorSignal.set(err.message || 'Ошибка при загрузке заказа');
      return null;
    } finally {
      this.loadingSignal.set(false);
    }
  }

  async createOrder(order: OrderCreate): Promise<boolean> {
    this.loadingSignal.set(true);
    this.errorSignal.set(null);
    
    try {
      const response = await this.orderService.createOrder(order);
      // Reload orders to get the new one with full data
      await this.loadOrders();
      return true;
    } catch (err: any) {
      this.errorSignal.set(err.message || 'Ошибка при создании заказа');
      return false;
    } finally {
      this.loadingSignal.set(false);
    }
  }

  async updateOrder(id: string, order: OrderUpdate): Promise<boolean> {
    this.loadingSignal.set(true);
    this.errorSignal.set(null);
    
    try {
      await this.orderService.updateOrder(id, order);
      // Reload orders to get updated data
      await this.loadOrders();
      return true;
    } catch (err: any) {
      this.errorSignal.set(err.message || 'Ошибка при обновлении заказа');
      return false;
    } finally {
      this.loadingSignal.set(false);
    }
  }

  async deleteOrder(id: string): Promise<boolean> {
    this.loadingSignal.set(true);
    this.errorSignal.set(null);
    
    try {
      await this.orderService.deleteOrder(id);
      // Remove from local state
      const orders = this.ordersSignal().filter(o => o.id !== id);
      this.ordersSignal.set(orders);
      return true;
    } catch (err: any) {
      this.errorSignal.set(err.message || 'Ошибка при удалении заказа');
      return false;
    } finally {
      this.loadingSignal.set(false);
    }
  }

  clearError(): void {
    this.errorSignal.set(null);
  }
}

