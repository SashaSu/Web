import { Component, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Employees } from '../employees/employees';
import { Orders } from '../orders/orders';
import { Audits } from '../audits/audits';
import { RoleLayoutComponent } from '../../shared/components/layout/role-layout.component';
import { MenuItem } from '../../shared/models/layout-config';

@Component({
  selector: 'app-admin-layout',
  imports: [CommonModule, RoleLayoutComponent, Employees, Orders, Audits],
  templateUrl: './admin-layout.html',
  styleUrl: './admin-layout.scss',
})
export class AdminLayout {
  currentSection = signal<string>('employees');
  
  menuItems: MenuItem[] = [
    { key: 'employees', label: 'Сотрудники' },
    { key: 'orders', label: 'Заказы' },
    { key: 'audit', label: 'Аудит' }
  ];
}
