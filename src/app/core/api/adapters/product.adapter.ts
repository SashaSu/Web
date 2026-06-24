import { ProductDto, ProductSuccessResponse as ApiProductSuccessResponse } from '../../api/generated/model/models';
import { Product, ProductCreate, ProductUpdate, ProductSuccessResponse } from '../../models/product.model';

export class ProductAdapter {
  static toProduct(dto: ProductDto): Product {
    return {
      id: dto.id || '',
      name: dto.name || '',
      quantity: dto.quantity || 0,
      expDate: dto.expDate ? new Date(dto.expDate) : new Date()
    };
  }

  static toProductDto(product: ProductCreate | ProductUpdate): ProductDto {
    const dto: ProductDto = {};
    
    // Include id only if it's provided (for create with pre-generated ID)
    if ('id' in product && product.id !== undefined) {
      dto.id = product.id;
    }
    
    if ('name' in product && product.name !== undefined) {
      dto.name = product.name;
    }
    if ('quantity' in product && product.quantity !== undefined) {
      dto.quantity = product.quantity;
    }
    if ('expDate' in product && product.expDate !== undefined) {
      // Convert Date to ISO string if needed
      if (product.expDate instanceof Date) {
        dto.expDate = product.expDate.toISOString().split('T')[0]; // YYYY-MM-DD format
      } else {
        dto.expDate = product.expDate;
      }
    }
    
    return dto;
  }

  static toProductSuccessResponse(response: ApiProductSuccessResponse): ProductSuccessResponse {
    return {
      message: response.message || '',
      id: response.id || ''
    };
  }
}

