import { Component, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Products } from '../products/products';
import { RoleLayoutComponent } from '../../shared/components/layout/role-layout.component';
import { MenuItem } from '../../shared/models/layout-config';

@Component({
  selector: 'app-manager-layout',
  imports: [CommonModule, RoleLayoutComponent, Products],
  templateUrl: './manager-layout.html',
  styleUrl: './manager-layout.scss',
})
export class ManagerLayout {
  currentSection = signal<string>('products');
  
  menuItems: MenuItem[] = [
    { key: 'products', label: 'Продукты' }
  ];
}
