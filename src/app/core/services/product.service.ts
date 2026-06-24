import { Injectable } from '@angular/core';
import { BaseApiService } from './base-api.service';
import { ProductAdapter } from '../api/adapters/product.adapter';
import { Product, ProductCreate, ProductUpdate, ProductSuccessResponse } from '../models/product.model';
import { ProductDto } from '../api/generated/model/models';

@Injectable({
  providedIn: 'root'
})
export class ProductService extends BaseApiService {
  async getAllProducts(id?: string, name?: string): Promise<Product[]> {
    const queryString = this.buildQueryString({ id, name });
    const dtos = await this.fetchRequest<ProductDto[]>(`/products${queryString}`);
    return dtos.map(dto => ProductAdapter.toProduct(dto));
  }

  async getProductById(id: string): Promise<Product> {
    const dto = await this.fetchRequest<ProductDto>(`/products?id=${id}`);
    return ProductAdapter.toProduct(dto);
  }

  async createProduct(product: ProductCreate): Promise<ProductSuccessResponse> {
    const dto = ProductAdapter.toProductDto(product);
    const response = await this.fetchRequest<{ message?: string; id?: string }>(`/products`, {
      method: 'POST',
      body: JSON.stringify(dto)
    });
    return ProductAdapter.toProductSuccessResponse(response);
  }

  async updateProduct(id: string, product: ProductUpdate): Promise<void> {
    // Include id in the update DTO for PUT request
    const productWithId: ProductUpdate & { id: string } = { ...product, id };
    const dto = ProductAdapter.toProductDto(productWithId);
    await this.fetchRequest<void>(`/products`, {
      method: 'PUT',
      body: JSON.stringify(dto)
    });
  }

  async deleteProduct(id: string): Promise<void> {
    await this.fetchRequest<void>(`/products/${id}`, {
      method: 'DELETE'
    });
  }
}

