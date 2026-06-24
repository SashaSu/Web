export interface DishProduct {
  productId: string;
  productName: string;
  quantity: number;
}

export interface Dish {
  id: string;
  name: string;
  price: number;
  calories: number;
  products: DishProduct[];
}

export interface DishCreate {
  id?: string; // Optional, will be generated if not provided
  name: string;
  price: number;
  calories: number;
  products?: DishProduct[];
}

export interface DishUpdate {
  name?: string;
  price?: number;
  calories?: number;
  products?: DishProduct[];
}

export interface DishSuccessResponse {
  message: string;
  id: string;
}

