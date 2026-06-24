import { OrderDto, OrderSuccessResponse as ApiOrderSuccessResponse, OrderUpdateDto, OrderEnumDto } from '../../api/generated/model/models';
import { Order, OrderCreate, OrderUpdate, OrderSuccessResponse, OrderStatus } from '../../models/order.model';

export class OrderAdapter {
  static toOrder(dto: OrderDto): Order {
    return {
      id: dto.id || '',
      time: dto.time ? new Date(dto.time) : new Date(),
      status: this.enumToStatus(dto.status),
      employeeId: dto.employeeId,
      tableId: dto.tableId
    };
  }

  static toOrderDto(order: OrderCreate | OrderUpdate): OrderDto {
    const dto: OrderDto = {};
    
    // Include id only if it's provided (for create with pre-generated ID)
    if ('id' in order && order.id !== undefined) {
      dto.id = order.id;
    }
    
    if ('time' in order && order.time !== undefined) {
      if (order.time instanceof Date) {
        dto.time = order.time.toISOString();
      } else {
        dto.time = order.time;
      }
    }
    
    if ('status' in order && order.status !== undefined) {
      dto.status = this.statusToEnum(order.status);
    }
    
    if ('employeeId' in order && order.employeeId !== undefined) {
      dto.employeeId = order.employeeId;
    }
    
    if ('tableId' in order && order.tableId !== undefined) {
      dto.tableId = order.tableId;
    }
    
    return dto;
  }

  static toOrderUpdateDto(order: OrderUpdate): OrderUpdateDto {
    const dto: OrderUpdateDto = {};
    
    if (order.time !== undefined) {
      if (order.time instanceof Date) {
        dto.time = order.time.toISOString();
      } else {
        dto.time = order.time;
      }
    }
    
    if (order.status !== undefined) {
      dto.status = this.statusToEnum(order.status);
    }
    
    if (order.employeeId !== undefined) {
      dto.employeeId = order.employeeId;
    }
    
    if (order.tableId !== undefined) {
      dto.tableId = order.tableId;
    }
    
    return dto;
  }

  static toOrderSuccessResponse(response: ApiOrderSuccessResponse): OrderSuccessResponse {
    return {
      message: response.message || '',
      id: response.id || ''
    };
  }

  // Convert OrderEnumDto to OrderStatus
  private static enumToStatus(enumValue?: OrderEnumDto): OrderStatus {
    // Map numeric enum to string status
    // 0 = new, 1 = in_progress, 2 = ready, 3 = completed/cancelled
    const mapping: Record<number, OrderStatus> = {
      0: 'new',
      1: 'in_progress',
      2: 'ready',
      3: 'completed' // OrderEnumDto only has 0, 1, 2, 3
    };
    
    return enumValue !== undefined ? (mapping[enumValue] || 'new') : 'new';
  }

  // Convert OrderStatus to OrderEnumDto
  private static statusToEnum(status: OrderStatus): OrderEnumDto {
    const mapping: Record<OrderStatus, OrderEnumDto> = {
      'new': 0,
      'in_progress': 1,
      'ready': 2,
      'completed': 3,
      'cancelled': 3 // OrderEnumDto only has 0, 1, 2, 3, using 3 for cancelled
    };
    
    return mapping[status] || 0;
  }
}

