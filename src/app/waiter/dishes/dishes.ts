import { Component, OnInit, OnDestroy, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, ActivatedRoute } from '@angular/router';
import { TableComponent } from '../../shared/components/table/table.component';
import { TableData } from '../../shared/models/table-config';
import { DISH_COLUMNS } from '../../shared/models/table-presets';
import { DishViewModel } from '../../core/view-models/dish.viewmodel';
import { Dish } from '../../core/models/dish.model';
import { GuidGenerator } from '../../core/utils/guid-generator';

@Component({
  selector: 'app-dishes',
  imports: [CommonModule, TableComponent],
  templateUrl: './dishes.html',
  styleUrl: './dishes.scss',
})
export class Dishes implements OnInit, OnDestroy {
  columns = DISH_COLUMNS;
  
  dishes = computed(() => this.viewModel.dishes());
  loading = computed(() => this.viewModel.loading());
  error = computed(() => this.viewModel.error());

  private searchParams = signal<{ name?: string }>({});
  private saveTimeout: any = null;
  private pendingUpdates = new Map<string, Partial<Dish>>();

  constructor(
    private viewModel: DishViewModel,
    private router: Router,
    private route: ActivatedRoute
  ) {}

  async ngOnInit() {
    this.route.queryParams.subscribe(async params => {
      const name = params['name'] || undefined;
      this.searchParams.set({ name });
      await this.loadDishes();
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

  async loadDishes() {
    const params = this.searchParams();
    await this.viewModel.loadDishes(params.name);
  }

  addDish() {
    const newDish: Dish = {
      id: GuidGenerator.generate(),
      name: 'Новое блюдо',
      price: 1,
      calories: 1,
      products: []
    };
    this.viewModel.createDish(newDish);
  }

  async onRowDelete(row: TableData) {
    const id = String(row.id);
    console.log('🗑️ [Waiter Dishes] Удаление блюда:', id);
    const success = await this.viewModel.deleteDish(id);
    if (success) {
      await this.loadDishes();
    }
  }

  onDataChange(data: TableData[]) {
    const changed = data as Dish[];
    const originals = this.dishes();

    if (this.saveTimeout) {
      clearTimeout(this.saveTimeout);
    }

    changed.forEach(dish => {
      const original = originals.find(d => d.id === dish.id);
      if (original) {
        const nameChanged = String(original.name || '') !== String(dish.name || '');
        const priceChanged = Number(original.price || 0) !== Number(dish.price || 0);
        const caloriesChanged = Number(original.calories || 0) !== Number(dish.calories || 0);
        if (nameChanged || priceChanged || caloriesChanged) {
          const update: Partial<Dish> = {};
          if (nameChanged) update.name = dish.name;
          if (priceChanged) update.price = Number(dish.price);
          if (caloriesChanged) update.calories = Number(dish.calories);
          this.pendingUpdates.set(dish.id, update);
        }
      }
    });

    if (this.pendingUpdates.size > 0) {
      this.saveTimeout = setTimeout(() => this.savePendingUpdates(), 1500);
    }
  }

  private async savePendingUpdates() {
    if (this.pendingUpdates.size === 0) return;
    const updates = Array.from(this.pendingUpdates.entries());
    this.pendingUpdates.clear();
    for (const [id, update] of updates) {
      await this.viewModel.updateDish(id, update);
    }
    this.updateUrl();
  }

  private updateUrl() {
    const params = this.searchParams();
    const queryParams: any = {};
    if (params.name) queryParams.name = params.name;
    this.router.navigate([], {
      relativeTo: this.route,
      queryParams,
      queryParamsHandling: 'merge',
      replaceUrl: true
    });
  }
}
