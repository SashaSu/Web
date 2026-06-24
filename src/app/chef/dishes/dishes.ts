import { Component, OnInit, OnDestroy, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, ActivatedRoute } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { TableComponent } from '../../shared/components/table/table.component';
import { TableData } from '../../shared/models/table-config';
import { DISH_COLUMNS } from '../../shared/models/table-presets';
import { DishViewModel } from '../../core/view-models/dish.viewmodel';
import { Dish } from '../../core/models/dish.model';
import { GuidGenerator } from '../../core/utils/guid-generator';

@Component({
  selector: 'app-dishes',
  imports: [CommonModule, FormsModule, TableComponent],
  templateUrl: './dishes.html',
  styleUrl: './dishes.scss',
})
export class Dishes implements OnInit, OnDestroy {
  columns = DISH_COLUMNS;
  
  dishes = computed(() => this.viewModel.dishes());
  loading = computed(() => this.viewModel.loading());
  error = computed(() => this.viewModel.error());

  private searchParams = signal<{ name?: string }>({});
  
  // Для отслеживания изменений
  private originalDishes = signal<Dish[]>([]);
  private lastEmittedData = signal<Dish[]>([]); // Данные из последнего dataChange

  constructor(
    private viewModel: DishViewModel,
    private router: Router,
    private route: ActivatedRoute
  ) {}

  async ngOnInit() {
    // Read state from URL
    this.route.queryParams.subscribe(async params => {
      const name = params['name'] || undefined;
      this.searchParams.set({ name });
      await this.loadDishes();
    });
  }

  ngOnDestroy() {
    console.log('🔵 [Dishes] ngOnDestroy вызван');
    if (this.saveTimeout) {
      clearTimeout(this.saveTimeout);
      console.log('🔵 [Dishes] Таймер очищен');
    }
    if (this.pendingUpdates.size > 0) {
      console.log('🔵 [Dishes] Сохранение незавершенных изменений перед уничтожением');
      this.savePendingUpdates();
    }
  }

  async loadDishes() {
    console.log('🔵 [Dishes] Загрузка блюд');
    const params = this.searchParams();
    await this.viewModel.loadDishes(params.name);
    
    // Сохраняем оригинальные данные для сравнения
    const currentDishes = this.dishes();
    this.originalDishes.set([...currentDishes]);
    this.lastEmittedData.set([]); // Сбрасываем при загрузке новых данных
    console.log('🟢 [Dishes] Оригинальные данные сохранены:', currentDishes.length, 'блюд');
  }

  private saveTimeout: any = null;
  private pendingUpdates = new Map<string, Partial<Dish>>();

  async addDish() {
    console.log('🔵 [Dishes] addDish вызван');
    const newDish = {
      id: GuidGenerator.generate(),
      name: 'Новое блюдо',
      price: 1,
      calories: 1
    };
    
    console.log('🔵 [Dishes] Создание нового блюда:', newDish);
    const success = await this.viewModel.createDish(newDish);
    console.log('🟢 [Dishes] Результат создания:', success);
    
    if (success) {
      // Обновляем оригинальные данные
      const updatedDishes = this.dishes();
      this.originalDishes.set([...updatedDishes]);
      this.lastEmittedData.set([]); // Сбрасываем
      this.updateUrl();
    }
  }

  async onRowDelete(row: TableData) {
    const id = String(row.id);
    console.log('🗑️ [Dishes] Удаление блюда:', id);
    const success = await this.viewModel.deleteDish(id);
    if (success) {
      await this.loadDishes();
    }
  }

  onDataChange(data: TableData[]) {
    console.log('🔵 [Dishes] onDataChange вызван, количество блюд:', data.length);
    const changedDishes = data as Dish[];
    
    // Сравниваем с оригинальными данными (до редактирования)
    const originalDishes = this.originalDishes();
    
    console.log('🔵 [Dishes] Оригинальных блюд:', originalDishes.length);
    console.log('🔵 [Dishes] Измененных блюд:', changedDishes.length);
    
    // Clear previous timeout
    if (this.saveTimeout) {
      clearTimeout(this.saveTimeout);
      console.log('🔵 [Dishes] Предыдущий таймер очищен');
    }

    // Проверяем, есть ли вообще изменения
    const originalJson = JSON.stringify(originalDishes);
    const changedJson = JSON.stringify(changedDishes);
    console.log('🔵 [Dishes] JSON сравнение:', {
      оригиналы: originalDishes.length,
      изменения: changedDishes.length,
      равны: originalJson === changedJson
    });

    // Collect all changes
    changedDishes.forEach(dish => {
      const original = originalDishes.find(d => d.id === dish.id);
      
      if (original) {
        // Детальное сравнение
        const nameChanged = String(original.name || '') !== String(dish.name || '');
        const priceChanged = this.numbersEqual(original.price, dish.price);
        const caloriesChanged = this.numbersEqual(original.calories, dish.calories);
        
        const hasChanges = nameChanged || priceChanged || caloriesChanged;
        
        if (hasChanges) {
          console.log('✅ [Dishes] Обнаружены изменения для блюда:', dish.id);
          const update: Partial<Dish> = {};
          
          if (nameChanged) {
            update.name = dish.name;
            console.log(`  📝 name: "${original.name}" -> "${dish.name}"`);
          }
          if (priceChanged) {
            update.price = Number(dish.price);
            console.log(`  📝 price: ${original.price} -> ${dish.price}`);
          }
          if (caloriesChanged) {
            update.calories = Number(dish.calories);
            console.log(`  📝 calories: ${original.calories} -> ${dish.calories}`);
          }
          
          if (Object.keys(update).length > 0) {
            console.log('💾 [Dishes] Добавлено в pendingUpdates:', dish.id, update);
            this.pendingUpdates.set(dish.id, update);
          }
        } else {
          console.log('🔵 [Dishes] Нет изменений для блюда:', dish.id);
        }
      } else {
        console.log('🟡 [Dishes] Блюдо не найдено в оригиналах:', dish.id, 'может быть новое блюдо?');
      }
    });

    console.log('🔵 [Dishes] Всего изменений найдено:', this.pendingUpdates.size);
    
    // Сохраняем последние эмитированные данные
    this.lastEmittedData.set([...changedDishes]);

    // Schedule save after 2 seconds of inactivity
    if (this.pendingUpdates.size > 0) {
      this.saveTimeout = setTimeout(() => {
        this.savePendingUpdates();
      }, 2000);
      console.log('🔵 [Dishes] Таймер сохранения установлен на 2 секунды');
    } else {
      console.log('🔵 [Dishes] Нет изменений, таймер не установлен');
    }
  }

  // Вспомогательный метод для сравнения чисел
  private numbersEqual(num1: any, num2: any): boolean {
    const n1 = Number(num1) || 0;
    const n2 = Number(num2) || 0;
    return Math.abs(n1 - n2) > 0.0001; // Учитываем погрешность для чисел с плавающей точкой
  }

  private async savePendingUpdates() {
    console.log('🟢 [Dishes] Сохранение изменений, количество:', this.pendingUpdates.size);
    
    if (this.pendingUpdates.size === 0) {
      console.log('🔵 [Dishes] Нет изменений для сохранения');
      return;
    }

    const updates = Array.from(this.pendingUpdates.entries());
    console.log(updates);
    this.pendingUpdates.clear();

    let allSuccessful = true;
    
    for (const [dishId, update] of updates) {
      console.log('🟢 [Dishes] Сохранение блюда:', dishId, update);
      try {
        const success = await this.viewModel.updateDish(dishId, update);
        if (success) {
          console.log('✅ [Dishes] Блюдо успешно обновлено:', dishId);
          
          // Обновляем оригинальные данные после успешного сохранения
          const currentOriginalDishes = this.originalDishes();
          const updatedOriginals = currentOriginalDishes.map(d => {
            if (d.id === dishId) {
              return { ...d, ...update };
            }
            return d;
          });
          this.originalDishes.set(updatedOriginals);
        } else {
          allSuccessful = false;
          console.error('🔴 [Dishes] Не удалось обновить блюдо:', dishId);
        }
      } catch (err) {
        allSuccessful = false;
        console.error('🔴 [Dishes] Ошибка при обновлении блюда:', dishId, err);
      }
    }
    
    if (allSuccessful) {
      // Перезагружаем данные с сервера для синхронизации
      console.log('🔄 [Dishes] Перезагрузка данных после сохранения');
      await this.loadDishes();
    }
    
    this.updateUrl();
  }

  private updateUrl() {
    console.log('🔵 [Dishes] updateUrl вызван');
    const params = this.searchParams();
    const queryParams: any = {};
    if (params.name) {
      queryParams.name = params.name;
    }
    
    const currentSection = this.route.snapshot.queryParams['section'];
    if (currentSection) {
      queryParams.section = currentSection;
      console.log('🔵 [Dishes] Сохранен параметр section:', currentSection);
    }
    
    console.log('🔵 [Dishes] Обновление URL с параметрами:', queryParams);
    this.router.navigate([], {
      relativeTo: this.route,
      queryParams,
      queryParamsHandling: 'merge',
      replaceUrl: true
    });
  }

  onSearch(name: string) {
    this.searchParams.set({ name: name || undefined });
    this.updateUrl();
    this.loadDishes();
  }

  clearError() {
    this.viewModel.clearError();
  }

  // Добавьте этот метод для отладки
  debugData() {
    console.log('🔍 [DEBUG] Текущее состояние:');
    console.log('  - dishes():', this.dishes().length, 'блюд');
    console.log('  - originalDishes():', this.originalDishes().length, 'блюд');
    console.log('  - lastEmittedData():', this.lastEmittedData().length, 'блюд');
    console.log('  - pendingUpdates:', this.pendingUpdates.size);
    
    if (this.dishes().length > 0) {
      console.log('  - Пример блюда из dishes():', this.dishes()[0]);
    }
    if (this.originalDishes().length > 0) {
      console.log('  - Пример блюда из originalDishes():', this.originalDishes()[0]);
    }
    if (this.lastEmittedData().length > 0) {
      console.log('  - Пример блюда из lastEmittedData():', this.lastEmittedData()[0]);
    }
  }
}