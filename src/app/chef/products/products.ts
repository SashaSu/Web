import { Component, OnInit, OnDestroy, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, ActivatedRoute } from '@angular/router';
import { FormsModule } from '@angular/forms';
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
  
  // Для отслеживания изменений
  private originalProducts = signal<Product[]>([]);
  private lastEmittedData = signal<Product[]>([]);

  constructor(
    private viewModel: ProductViewModel,
    private router: Router,
    private route: ActivatedRoute
  ) {}

  async ngOnInit() {
    // Read state from URL
    this.route.queryParams.subscribe(async params => {
      const id = params['id'] || undefined;
      const name = params['name'] || undefined;
      this.searchParams.set({ id, name });
      await this.loadProducts();
    });
  }

  ngOnDestroy() {
    console.log('🔵 [Products] ngOnDestroy вызван');
    if (this.saveTimeout) {
      clearTimeout(this.saveTimeout);
      console.log('🔵 [Products] Таймер очищен');
    }
    if (this.pendingUpdates.size > 0) {
      console.log('🔵 [Products] Сохранение незавершенных изменений перед уничтожением');
      this.savePendingUpdates();
    }
  }

  async loadProducts() {
    console.log('🔵 [Products] Загрузка продуктов');
    const params = this.searchParams();
    await this.viewModel.loadProducts(params.id, params.name);
    
    // Сохраняем оригинальные данные для сравнения
    const currentProducts = this.products();
    this.originalProducts.set([...currentProducts]);
    this.lastEmittedData.set([]);
    console.log('🟢 [Products] Оригинальные данные сохранены:', currentProducts.length, 'продуктов');
  }

  private saveTimeout: any = null;
  private pendingUpdates = new Map<string, Partial<Product>>();

  async addProduct() {
    console.log('🔵 [Products] addProduct вызван');
    const newProduct = {
      id: GuidGenerator.generate(),
      name: 'Новый продукт',
      quantity: 1, // Positive default value
      expDate: new Date()
    };
    
    console.log('🔵 [Products] Создание нового продукта:', newProduct);
    const success = await this.viewModel.createProduct(newProduct);
    console.log('🟢 [Products] Результат создания:', success);
    
    if (success) {
      // Обновляем оригинальные данные
      const updatedProducts = this.products();
      this.originalProducts.set([...updatedProducts]);
      this.lastEmittedData.set([]);
      this.updateUrl();
    }
  }

  async onRowDelete(row: TableData) {
    const id = String(row.id);
    console.log('🗑️ [Products] Удаление продукта:', id);
    const success = await this.viewModel.deleteProduct(id);
    if (success) {
      await this.loadProducts();
    }
  }

  onDataChange(data: TableData[]) {
    console.log('🔵 [Products] onDataChange вызван, количество продуктов:', data.length);
    const changedProducts = data as Product[];
    
    // Сравниваем с оригинальными данными
    const originalProducts = this.originalProducts();
    
    console.log('🔵 [Products] Оригинальных продуктов:', originalProducts.length);
    console.log('🔵 [Products] Измененных продуктов:', changedProducts.length);
    
    // Clear previous timeout
    if (this.saveTimeout) {
      clearTimeout(this.saveTimeout);
      console.log('🔵 [Products] Предыдущий таймер очищен');
    }

    // Collect all changes
    changedProducts.forEach(product => {
      const original = originalProducts.find(p => p.id === product.id);
      
      if (original) {
        // Детальное сравнение
        const nameChanged = String(original.name || '') !== String(product.name || '');
        const quantityChanged = this.numbersEqual(original.quantity, product.quantity);
        const expDateChanged = this.datesEqual(original.expDate, product.expDate);
        
        const hasChanges = nameChanged || quantityChanged || expDateChanged;
        
        if (hasChanges) {
          console.log('✅ [Products] Обнаружены изменения для продукта:', product.id);
          const update: Partial<Product> = {};
          
          if (nameChanged) {
            update.name = product.name;
            console.log(`  📝 name: "${original.name}" -> "${product.name}"`);
          }
          if (quantityChanged) {
            update.quantity = Number(product.quantity);
            console.log(`  📝 quantity: ${original.quantity} -> ${product.quantity}`);
          }
          if (expDateChanged) {
            update.expDate = product.expDate instanceof Date ? product.expDate : new Date(product.expDate);
            console.log(`  📝 expDate: ${original.expDate} -> ${product.expDate}`);
          }
          
          if (Object.keys(update).length > 0) {
            console.log('💾 [Products] Добавлено в pendingUpdates:', product.id, update);
            this.pendingUpdates.set(product.id, update);
          }
        } else {
          console.log('🔵 [Products] Нет изменений для продукта:', product.id);
        }
      } else {
        console.log('🟡 [Products] Продукт не найден в оригиналах:', product.id, 'может быть новый продукт?');
      }
    });

    console.log('🔵 [Products] Всего изменений найдено:', this.pendingUpdates.size);
    
    // Сохраняем последние эмитированные данные
    this.lastEmittedData.set([...changedProducts]);

    // Schedule save after 2 seconds of inactivity
    if (this.pendingUpdates.size > 0) {
      this.saveTimeout = setTimeout(() => {
        this.savePendingUpdates();
      }, 2000);
      console.log('🔵 [Products] Таймер сохранения установлен на 2 секунды');
    } else {
      console.log('🔵 [Products] Нет изменений, таймер не установлен');
    }
  }

  // Вспомогательные методы для сравнения
  private numbersEqual(num1: any, num2: any): boolean {
    const n1 = Number(num1) || 0;
    const n2 = Number(num2) || 0;
    return Math.abs(n1 - n2) > 0.0001;
  }

  private datesEqual(date1: any, date2: any): boolean {
    const d1 = date1 instanceof Date ? date1 : new Date(date1);
    const d2 = date2 instanceof Date ? date2 : new Date(date2);
    return d1.getTime() !== d2.getTime();
  }

  private async savePendingUpdates() {
    console.log('🟢 [Products] Сохранение изменений, количество:', this.pendingUpdates.size);
    
    if (this.pendingUpdates.size === 0) {
      console.log('🔵 [Products] Нет изменений для сохранения');
      return;
    }

    const updates = Array.from(this.pendingUpdates.entries());
    console.log(updates);
    this.pendingUpdates.clear();

    let allSuccessful = true;
    
    for (const [productId, update] of updates) {
      console.log('🟢 [Products] Сохранение продукта:', productId, update);
      try {
        const success = await this.viewModel.updateProduct(productId, update);
        if (success) {
          console.log('✅ [Products] Продукт успешно обновлен:', productId);
          
          // Обновляем оригинальные данные после успешного сохранения
          const currentOriginalProducts = this.originalProducts();
          const updatedOriginals = currentOriginalProducts.map(p => {
            if (p.id === productId) {
              return { ...p, ...update };
            }
            return p;
          });
          this.originalProducts.set(updatedOriginals);
        } else {
          allSuccessful = false;
          console.error('🔴 [Products] Не удалось обновить продукт:', productId);
        }
      } catch (err) {
        allSuccessful = false;
        console.error('🔴 [Products] Ошибка при обновлении продукта:', productId, err);
      }
    }
    
    if (allSuccessful) {
      // Перезагружаем данные с сервера для синхронизации
      console.log('🔄 [Products] Перезагрузка данных после сохранения');
      await this.loadProducts();
    }
    
    this.updateUrl();
  }

  private updateUrl() {
    console.log('🔵 [Products] updateUrl вызван');
    const params = this.searchParams();
    const queryParams: any = {};
    if (params.id) {
      queryParams.id = params.id;
    }
    if (params.name) {
      queryParams.name = params.name;
    }
    
    const currentSection = this.route.snapshot.queryParams['section'];
    if (currentSection) {
      queryParams.section = currentSection;
      console.log('🔵 [Products] Сохранен параметр section:', currentSection);
    }
    
    console.log('🔵 [Products] Обновление URL с параметрами:', queryParams);
    this.router.navigate([], {
      relativeTo: this.route,
      queryParams,
      queryParamsHandling: 'merge',
      replaceUrl: true
    });
  }

  onSearch(id?: string, name?: string) {
    this.searchParams.set({ id: id || undefined, name: name || undefined });
    this.updateUrl();
    this.loadProducts();
  }

  clearError() {
    this.viewModel.clearError();
  }
}
