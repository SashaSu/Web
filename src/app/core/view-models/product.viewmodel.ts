import { Injectable, signal, computed } from '@angular/core';
import { ProductService } from '../services/product.service';
import { Product, ProductCreate, ProductUpdate } from '../models/product.model';

@Injectable({
  providedIn: 'root'
})
export class ProductViewModel {
  private productsSignal = signal<Product[]>([]);
  private loadingSignal = signal<boolean>(false);
  private errorSignal = signal<string | null>(null);

  products = this.productsSignal.asReadonly();
  loading = this.loadingSignal.asReadonly();
  error = this.errorSignal.asReadonly();

  constructor(private productService: ProductService) {}

  async loadProducts(id?: string, name?: string): Promise<void> {
    this.loadingSignal.set(true);
    this.errorSignal.set(null);
    
    try {
      const products = await this.productService.getAllProducts(id, name);
      this.productsSignal.set(products);
    } catch (err: any) {
      this.errorSignal.set(err.message || 'Ошибка при загрузке продуктов');
      this.productsSignal.set([]);
    } finally {
      this.loadingSignal.set(false);
    }
  }

  async loadProduct(id: string): Promise<Product | null> {
    this.loadingSignal.set(true);
    this.errorSignal.set(null);
    
    try {
      const product = await this.productService.getProductById(id);
      // Update product in list if exists
      const products = this.productsSignal();
      const index = products.findIndex(p => p.id === id);
      if (index >= 0) {
        products[index] = product;
        this.productsSignal.set([...products]);
      }
      return product;
    } catch (err: any) {
      this.errorSignal.set(err.message || 'Ошибка при загрузке продукта');
      return null;
    } finally {
      this.loadingSignal.set(false);
    }
  }

  async createProduct(product: ProductCreate): Promise<boolean> {
    this.loadingSignal.set(true);
    this.errorSignal.set(null);
    
    try {
      const response = await this.productService.createProduct(product);
      // Reload products to get the new one with full data
      await this.loadProducts();
      return true;
    } catch (err: any) {
      this.errorSignal.set(err.message || 'Ошибка при создании продукта');
      return false;
    } finally {
      this.loadingSignal.set(false);
    }
  }

  async updateProduct(id: string, product: ProductUpdate): Promise<boolean> {
    this.loadingSignal.set(true);
    this.errorSignal.set(null);
    
    try {
      await this.productService.updateProduct(id, product);
      // Reload products to get updated data
      await this.loadProducts();
      return true;
    } catch (err: any) {
      this.errorSignal.set(err.message || 'Ошибка при обновлении продукта');
      return false;
    } finally {
      this.loadingSignal.set(false);
    }
  }

  async deleteProduct(id: string): Promise<boolean> {
    this.loadingSignal.set(true);
    this.errorSignal.set(null);
    
    try {
      await this.productService.deleteProduct(id);
      // Remove from local state
      const products = this.productsSignal().filter(p => p.id !== id);
      this.productsSignal.set(products);
      return true;
    } catch (err: any) {
      this.errorSignal.set(err.message || 'Ошибка при удалении продукта');
      return false;
    } finally {
      this.loadingSignal.set(false);
    }
  }

  clearError(): void {
    this.errorSignal.set(null);
  }
}

