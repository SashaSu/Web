import { Component, OnInit, OnDestroy, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, ActivatedRoute } from '@angular/router';
import { TableComponent } from '../../shared/components/table/table.component';
import { TableData } from '../../shared/models/table-config';
import { PRODUCT_COLUMNS } from '../../shared/models/table-presets';
import { ProductViewModel } from '../../core/view-models/product.viewmodel';
import { Product } from '../../core/models/product.model';
import { GuidGenerator } from '../../core/utils/guid-generator';

@Component({
  selector: 'app-products',
  imports: [CommonModule, FormsModule, TableComponent],
  templateUrl: './products.html',
  styleUrl: './products.scss',
})
export class Products implements OnInit, OnDestroy {
  columns = PRODUCT_COLUMNS;
  
  products = computed(() => this.viewModel.products());
  loading = computed(() => this.viewModel.loading());
  error = computed(() => this.viewModel.error());

  private searchParams = signal<{ id?: string; name?: string }>({});
  private saveTimeout: any = null;
  private pendingUpdates = new Map<string, Partial<Product>>();

  constructor(
    private viewModel: ProductViewModel,
    private router: Router,
    private route: ActivatedRoute
  ) {}

  async ngOnInit() {
    this.route.queryParams.subscribe(async params => {
      const id = params['id'] || undefined;
      const name = params['name'] || undefined;
      this.searchParams.set({ id, name });
      await this.loadProducts();
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

  async loadProducts() {
    const params = this.searchParams();
    await this.viewModel.loadProducts(params.id, params.name);
  }

  addProduct() {
    const newProduct: Product = {
      id: GuidGenerator.generate(),
      name: 'Новый продукт',
      quantity: 1,
      expDate: new Date()
    };
    this.viewModel.createProduct(newProduct);
  }

  async onRowDelete(row: TableData) {
    const id = String(row.id);
    console.log('🗑️ [Manager Products] Удаление продукта:', id);
    const success = await this.viewModel.deleteProduct(id);
    if (success) {
      await this.loadProducts();
    }
  }

  onDataChange(data: TableData[]) {
    const changed = data as Product[];
    const originals = this.products();

    if (this.saveTimeout) {
      clearTimeout(this.saveTimeout);
    }

    changed.forEach(product => {
      const original = originals.find(p => p.id === product.id);
      if (original) {
        const nameChanged = String(original.name || '') !== String(product.name || '');
        const quantityChanged = Number(original.quantity || 0) !== Number(product.quantity || 0);
        const dateChanged = this.datesNotEqual(original.expDate, product.expDate);
        if (nameChanged || quantityChanged || dateChanged) {
          const update: Partial<Product> = {};
          if (nameChanged) update.name = product.name;
          if (quantityChanged) update.quantity = Number(product.quantity);
          if (dateChanged) update.expDate = product.expDate instanceof Date ? product.expDate : new Date(product.expDate);
          this.pendingUpdates.set(product.id, update);
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
      await this.viewModel.updateProduct(id, update);
    }
    this.updateUrl();
  }

  private updateUrl() {
    const params = this.searchParams();
    const queryParams: any = {};
    if (params.id) queryParams.id = params.id;
    if (params.name) queryParams.name = params.name;
    this.router.navigate([], {
      relativeTo: this.route,
      queryParams,
      queryParamsHandling: 'merge',
      replaceUrl: true
    });
  }
}
