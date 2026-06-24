import { Component, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, ActivatedRoute } from '@angular/router';
import { Dishes } from '../dishes/dishes';
import { Orders } from '../../admin/orders/orders';
import { Products } from '../products/products';
import { RoleLayoutComponent } from '../../shared/components/layout/role-layout.component';
import { MenuItem } from '../../shared/models/layout-config';

@Component({
  selector: 'app-chef-layout',
  imports: [CommonModule, RoleLayoutComponent, Dishes, Orders, Products],
  templateUrl: './chef-layout.html',
  styleUrl: './chef-layout.scss',
})
export class ChefLayout implements OnInit {
  currentSection = signal<string>('orders');
  
  menuItems: MenuItem[] = [
    { key: 'orders', label: 'Заказы' },
    { key: 'dishes', label: 'Блюда' },
    { key: 'products', label: 'Продукты' }
  ];

  constructor(
    private router: Router,
    private route: ActivatedRoute
  ) {}

  ngOnInit() {
    // Read section from URL query params
    this.route.queryParams.subscribe(params => {
      const section = params['section'] || 'orders';
      console.log('🔵 [ChefLayout] Query params изменены, section:', section);
      if (this.menuItems.some(item => item.key === section)) {
        console.log('🟢 [ChefLayout] Установка секции:', section);
        this.currentSection.set(section);
      } else {
        console.log('🔴 [ChefLayout] Неизвестная секция:', section);
      }
    });
  }

  onSectionChange(section: string) {
    console.log('🔵 [ChefLayout] onSectionChange вызван, section:', section);
    this.currentSection.set(section);
    // Update URL with section state
    console.log('🔵 [ChefLayout] Обновление URL с section:', section);
    this.router.navigate([], {
      relativeTo: this.route,
      queryParams: { section },
      queryParamsHandling: 'merge',
      replaceUrl: true
    });
  }
}
