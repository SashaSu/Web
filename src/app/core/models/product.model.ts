export interface Product {
  id: string;
  name: string;
  quantity: number;
  expDate: Date;
}

export interface ProductCreate {
  id?: string; // Optional, will be generated if not provided
  name: string;
  quantity: number;
  expDate: Date | string;
}

export interface ProductUpdate {
  name?: string;
  quantity?: number;
  expDate?: Date | string;
}

export interface ProductSuccessResponse {
  message: string;
  id: string;
}

