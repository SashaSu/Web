import { Injectable } from '@angular/core';
import { BaseApiService } from './base-api.service';
import { OrderAdapter } from '../api/adapters/order.adapter';
import { Order, OrderCreate, OrderUpdate, OrderSuccessResponse } from '../models/order.model';
import { OrderDto, OrderUpdateDto, OrderSuccessResponse as ApiOrderSuccessResponse } from '../api/generated/model/models';

@Injectable({
  providedIn: 'root'
})
export class OrderService extends BaseApiService {
  async getAllOrders(id?: string): Promise<Order[]> {
    const queryString = id ? `?id=${id}` : '';
    const dto = await this.fetchRequest<OrderDto>(`/orders${queryString}`);
    
    const dtos = await this.fetchRequest<OrderDto[]>(`/orders${queryString}`);
    return dtos.map(dto => OrderAdapter.toOrder(dto));
  }

  async getOrderById(id: string): Promise<Order> {
    const dto = await this.fetchRequest<OrderDto>(`/orders?id=${id}`);
    return OrderAdapter.toOrder(dto);
  }

  async createOrder(order: OrderCreate): Promise<OrderSuccessResponse> {
    const dto = OrderAdapter.toOrderDto(order);
    const response = await this.fetchRequest<{ message?: string; id?: string }>(`/orders`, {
      method: 'POST',
      body: JSON.stringify(dto)
    });
    return OrderAdapter.toOrderSuccessResponse(response);
  }

  async updateOrder(id: string, order: OrderUpdate): Promise<void> {
    const dto = OrderAdapter.toOrderUpdateDto(order);
    await this.fetchRequest<void>(`/orders/${id}`, {
      method: 'PUT',
      body: JSON.stringify(dto)
    });
  }

  async deleteOrder(id: string): Promise<void> {
    await this.fetchRequest<void>(`/orders/${id}`, {
      method: 'DELETE'
    });
  }
}

