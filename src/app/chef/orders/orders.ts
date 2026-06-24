import { Component, OnInit, OnDestroy, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, ActivatedRoute } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { TableComponent } from '../../shared/components/table/table.component';
import { TableData } from '../../shared/models/table-config';
import { ORDER_COLUMNS } from '../../shared/models/table-presets';
import { OrderViewModel } from '../../core/view-models/order.viewmodel';
import { Order, OrderStatus } from '../../core/models/order.model';
import { GuidGenerator } from '../../core/utils/guid-generator';

@Component({
  selector: 'app-orders',
  imports: [CommonModule, FormsModule, TableComponent],
  templateUrl: './orders.html',
  styleUrl: './orders.scss',
})
export class Orders implements OnInit, OnDestroy {
  columns = ORDER_COLUMNS;
  
  orders = computed(() => this.viewModel.orders());
  loading = computed(() => this.viewModel.loading());
  error = computed(() => this.viewModel.error());

  private searchParams = signal<{ id?: string }>({});
  
  // Для отслеживания изменений
  private originalOrders = signal<Order[]>([]);
  private lastEmittedData = signal<Order[]>([]);

  constructor(
    private viewModel: OrderViewModel,
    private router: Router,
    private route: ActivatedRoute
  ) {}

  async ngOnInit() {
    // Read state from URL
    this.route.queryParams.subscribe(async params => {
      const id = params['id'] || undefined;
      this.searchParams.set({ id });
      await this.loadOrders();
    });
  }

  ngOnDestroy() {
    console.log('🔵 [Orders] ngOnDestroy вызван');
    if (this.saveTimeout) {
      clearTimeout(this.saveTimeout);
      console.log('🔵 [Orders] Таймер очищен');
    }
    if (this.pendingUpdates.size > 0) {
      console.log('🔵 [Orders] Сохранение незавершенных изменений перед уничтожением');
      this.savePendingUpdates();
    }
  }

  async loadOrders() {
    console.log('🔵 [Orders] Загрузка заказов');
    const params = this.searchParams();
    await this.viewModel.loadOrders(params.id);
    
    // Сохраняем оригинальные данные для сравнения
    const currentOrders = this.orders();
    this.originalOrders.set([...currentOrders]);
    this.lastEmittedData.set([]);
    console.log('🟢 [Orders] Оригинальные данные сохранены:', currentOrders.length, 'заказов');
  }

  private saveTimeout: any = null;
  private pendingUpdates = new Map<string, Partial<Order>>();

  async addOrder() {
    console.log('🔵 [Orders] addOrder вызван');
    const newOrder = {
      id: GuidGenerator.generate(),
      time: new Date(),
      status: 'new' as OrderStatus
    };
    
    console.log('🔵 [Orders] Создание нового заказа:', newOrder);
    const success = await this.viewModel.createOrder(newOrder);
    console.log('🟢 [Orders] Результат создания:', success);
    
    if (success) {
      // Обновляем оригинальные данные
      const updatedOrders = this.orders();
      this.originalOrders.set([...updatedOrders]);
      this.lastEmittedData.set([]);
      this.updateUrl();
    }
  }

  async onRowDelete(row: TableData) {
    const id = String(row.id);
    console.log('🗑️ [Orders] Удаление заказа:', id);
    const success = await this.viewModel.deleteOrder(id);
    if (success) {
      await this.loadOrders();
    }
  }

  onDataChange(data: TableData[]) {
    console.log('🔵 [Orders] onDataChange вызван, количество заказов:', data.length);
    const changedOrders = data as Order[];
    
    // Сравниваем с оригинальными данными
    const originalOrders = this.originalOrders();
    
    console.log('🔵 [Orders] Оригинальных заказов:', originalOrders.length);
    console.log('🔵 [Orders] Измененных заказов:', changedOrders.length);
    
    // Clear previous timeout
    if (this.saveTimeout) {
      clearTimeout(this.saveTimeout);
      console.log('🔵 [Orders] Предыдущий таймер очищен');
    }

    // Collect all changes
    changedOrders.forEach(order => {
      const original = originalOrders.find(o => o.id === order.id);
      
      if (original) {
        // Детальное сравнение
        const timeChanged = this.datesEqual(original.time, order.time);
        const statusChanged = String(original.status || '') !== String(order.status || '');
        
        const hasChanges = timeChanged || statusChanged;
        
        if (hasChanges) {
          console.log('✅ [Orders] Обнаружены изменения для заказа:', order.id);
          const update: Partial<Order> = {};
          
          if (timeChanged) {
            update.time = order.time instanceof Date ? order.time : new Date(order.time);
            console.log(`  📝 time: ${original.time} -> ${order.time}`);
          }
          if (statusChanged) {
            update.status = order.status as OrderStatus;
            console.log(`  📝 status: ${original.status} -> ${order.status}`);
          }
          
          if (Object.keys(update).length > 0) {
            console.log('💾 [Orders] Добавлено в pendingUpdates:', order.id, update);
            this.pendingUpdates.set(order.id, update);
          }
        } else {
          console.log('🔵 [Orders] Нет изменений для заказа:', order.id);
        }
      } else {
        console.log('🟡 [Orders] Заказ не найден в оригиналах:', order.id, 'может быть новый заказ?');
      }
    });

    console.log('🔵 [Orders] Всего изменений найдено:', this.pendingUpdates.size);
    
    // Сохраняем последние эмитированные данные
    this.lastEmittedData.set([...changedOrders]);

    // Schedule save after 2 seconds of inactivity
    if (this.pendingUpdates.size > 0) {
      this.saveTimeout = setTimeout(() => {
        this.savePendingUpdates();
      }, 2000);
      console.log('🔵 [Orders] Таймер сохранения установлен на 2 секунды');
    } else {
      console.log('🔵 [Orders] Нет изменений, таймер не установлен');
    }
  }

  // Вспомогательные методы для сравнения
  private datesEqual(date1: any, date2: any): boolean {
    const d1 = date1 instanceof Date ? date1 : new Date(date1);
    const d2 = date2 instanceof Date ? date2 : new Date(date2);
    return d1.getTime() !== d2.getTime();
  }

  private async savePendingUpdates() {
    console.log('🟢 [Orders] Сохранение изменений, количество:', this.pendingUpdates.size);
    
    if (this.pendingUpdates.size === 0) {
      console.log('🔵 [Orders] Нет изменений для сохранения');
      return;
    }

    const updates = Array.from(this.pendingUpdates.entries());
    console.log(updates);
    this.pendingUpdates.clear();

    let allSuccessful = true;
    
    for (const [orderId, update] of updates) {
      console.log('🟢 [Orders] Сохранение заказа:', orderId, update);
      try {
        const success = await this.viewModel.updateOrder(orderId, update);
        if (success) {
          console.log('✅ [Orders] Заказ успешно обновлен:', orderId);
          
          // Обновляем оригинальные данные после успешного сохранения
          const currentOriginalOrders = this.originalOrders();
          const updatedOriginals = currentOriginalOrders.map(o => {
            if (o.id === orderId) {
              return { ...o, ...update };
            }
            return o;
          });
          this.originalOrders.set(updatedOriginals);
        } else {
          allSuccessful = false;
          console.error('🔴 [Orders] Не удалось обновить заказ:', orderId);
        }
      } catch (err) {
        allSuccessful = false;
        console.error('🔴 [Orders] Ошибка при обновлении заказа:', orderId, err);
      }
    }
    
    if (allSuccessful) {
      // Перезагружаем данные с сервера для синхронизации
      console.log('🔄 [Orders] Перезагрузка данных после сохранения');
      await this.loadOrders();
    }
    
    this.updateUrl();
  }

  private updateUrl() {
    console.log('🔵 [Orders] updateUrl вызван');
    const params = this.searchParams();
    const queryParams: any = {};
    if (params.id) {
      queryParams.id = params.id;
    }
    
    const currentSection = this.route.snapshot.queryParams['section'];
    if (currentSection) {
      queryParams.section = currentSection;
      console.log('🔵 [Orders] Сохранен параметр section:', currentSection);
    }
    
    console.log('🔵 [Orders] Обновление URL с параметрами:', queryParams);
    this.router.navigate([], {
      relativeTo: this.route,
      queryParams,
      queryParamsHandling: 'merge',
      replaceUrl: true
    });
  }

  onSearch(id?: string) {
    this.searchParams.set({ id: id || undefined });
    this.updateUrl();
    this.loadOrders();
  }

  clearError() {
    this.viewModel.clearError();
  }
}
