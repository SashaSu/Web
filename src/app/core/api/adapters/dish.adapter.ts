import { DishDto, DishProductDto, DishSuccessResponse as ApiDishSuccessResponse } from '../../api/generated/model/models';
import { Dish, DishProduct, DishCreate, DishUpdate, DishSuccessResponse } from '../../models/dish.model';
import { AddProductToDishDto, UpdateQuantityDto } from '../../api/generated/model/models';

export class DishAdapter {
  static toDish(dto: DishDto): Dish {
    return {
      id: dto.id || '',
      name: dto.name || '',
      price: dto.price || 0,
      calories: dto.calories || 0,
      products: dto.products?.map(p => this.toDishProduct(p)) || []
    };
  }

  static toDishProduct(dto: DishProductDto): DishProduct {
    return {
      productId: dto.productId || '',
      productName: dto.productName || '',
      quantity: dto.quantity || 0
    };
  }

  static toDishDto(dish: DishCreate | DishUpdate): DishDto {
    const dto: DishDto = {};
    
    // Include id only if it's provided (for create with pre-generated ID)
    if ('id' in dish && dish.id !== undefined) {
      dto.id = dish.id;
    }
    
    if ('name' in dish && dish.name !== undefined) {
      dto.name = dish.name;
    }
    if ('price' in dish && dish.price !== undefined) {
      dto.price = dish.price;
    }
    if ('calories' in dish && dish.calories !== undefined) {
      dto.calories = dish.calories;
    }
    if (dish.products !== undefined) {
      dto.products = dish.products.map(p => this.toDishProductDto(p));
    }
    
    return dto;
  }

  static toDishProductDto(product: DishProduct): DishProductDto {
    return {
      productId: product.productId,
      productName: product.productName,
      quantity: product.quantity
    };
  }

  static toAddProductToDishDto(productId: string, quantity: number): AddProductToDishDto {
    return {
      productId,
      quantity
    };
  }

  static toUpdateQuantityDto(quantity: number): UpdateQuantityDto {
    return {
      quantity
    };
  }

  static toDishSuccessResponse(response: ApiDishSuccessResponse): DishSuccessResponse {
    return {
      message: response.message || '',
      id: response.id || ''
    };
  }
}

