import { Component, OnInit, OnDestroy, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, ActivatedRoute } from '@angular/router';
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
  private saveTimeout: any = null;
  private pendingUpdates = new Map<string, Partial<Order>>();

  constructor(
    private viewModel: OrderViewModel,
    private router: Router,
    private route: ActivatedRoute
  ) {}

  async ngOnInit() {
    this.route.queryParams.subscribe(async params => {
      const id = params['id'] || undefined;
      this.searchParams.set({ id });
      await this.loadOrders();
    });
  }

  ngOnDestroy() {
    if (this.saveTimeout) {
      clearTimeout(this.saveTimeout);
    }
    if (this.pendingUpdates.size > 0) {
      this.savePendingUpdates();
    }
  }

  async loadOrders() {
    const params = this.searchParams();
    await this.viewModel.loadOrders(params.id);
  }

  addOrder() {
    const newOrder: Order = {
      id: GuidGenerator.generate(),
      time: new Date(),
      status: 'new' as OrderStatus
    };
    this.viewModel.createOrder(newOrder);
  }

  async onRowDelete(row: TableData) {
    const id = String(row.id);
    console.log('🗑️ [Admin Orders] Удаление заказа:', id);
    const success = await this.viewModel.deleteOrder(id);
    if (success) {
      await this.loadOrders();
    }
  }

  onDataChange(data: TableData[]) {
    const changed = data as Order[];
    const originals = this.orders();

    if (this.saveTimeout) {
      clearTimeout(this.saveTimeout);
    }

    changed.forEach(order => {
      const original = originals.find(o => o.id === order.id);
      if (original) {
        const timeChanged = this.datesNotEqual(original.time, order.time);
        const statusChanged = original.status !== order.status;
        if (timeChanged || statusChanged) {
          const update: Partial<Order> = {};
          if (timeChanged) update.time = order.time instanceof Date ? order.time : new Date(order.time);
          if (statusChanged) update.status = order.status as OrderStatus;
          this.pendingUpdates.set(order.id, update);
        }
      }
    });

    if (this.pendingUpdates.size > 0) {
      this.saveTimeout = setTimeout(() => this.savePendingUpdates(), 1500);
    }
  }

  private datesNotEqual(a: any, b: any): boolean {
    const d1 = a instanceof Date ? a : new Date(a);
    const d2 = b instanceof Date ? b : new Date(b);
    return d1.getTime() !== d2.getTime();
  }

  private async savePendingUpdates() {
    if (this.pendingUpdates.size === 0) return;
    const updates = Array.from(this.pendingUpdates.entries());
    this.pendingUpdates.clear();
    for (const [id, update] of updates) {
      await this.viewModel.updateOrder(id, update);
    }
    this.updateUrl();
  }

  private updateUrl() {
    const params = this.searchParams();
    const queryParams: any = {};
    if (params.id) queryParams.id = params.id;
    this.router.navigate([], {
      relativeTo: this.route,
      queryParams,
      queryParamsHandling: 'merge',
      replaceUrl: true
    });
  }
}
