import { Component, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Dishes } from '../dishes/dishes';
import { Orders } from '../orders/orders';
import { Products } from '../products/products';
import { RoleLayoutComponent } from '../../shared/components/layout/role-layout.component';
import { MenuItem } from '../../shared/models/layout-config';

@Component({
  selector: 'app-waiter-layout',
  imports: [CommonModule, RoleLayoutComponent, Dishes, Orders, Products],
  templateUrl: './waiter-layout.html',
  styleUrl: './waiter-layout.scss',
})
export class WaiterLayout {
  currentSection = signal<string>('orders');
  
  menuItems: MenuItem[] = [
    { key: 'orders', label: 'Заказы' },
    { key: 'dishes', label: 'Блюда' },
    { key: 'products', label: 'Продукты' }
  ];
}
