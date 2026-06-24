export interface Order {
  id: string;
  time: Date;
  status: OrderStatus;
  employeeId?: string;
  tableId?: string;
}

export type OrderStatus = 'new' | 'in_progress' | 'ready' | 'completed' | 'cancelled';

export interface OrderCreate {
  id?: string; // Optional, will be generated if not provided
  time?: Date | string;
  status?: OrderStatus;
  employeeId?: string;
  tableId?: string;
}

export interface OrderUpdate {
  time?: Date | string;
  status?: OrderStatus;
  employeeId?: string;
  tableId?: string;
}

export interface OrderSuccessResponse {
  message: string;
  id: string;
}

