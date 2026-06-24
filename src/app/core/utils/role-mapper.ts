import { EmployeeEnumDto } from '../api/generated/model/employee-enum-dto';
import { UserRole } from '../../shared/models/user-role';

export class RoleMapper {
  static enumToRole(enumValue: EmployeeEnumDto): UserRole | null {
    // Map numeric enum to string role
    // 0 = admin, 1 = manager, 2 = chef, 3 = waiter (example mapping)
    const mapping: Record<number, UserRole> = {
      0: 'admin',
      1: 'manager',
      2: 'chef',
      3: 'waiter'
    };
    
    return mapping[enumValue] || null;
  }

  static roleToEnum(role: UserRole): EmployeeEnumDto | null {
    const mapping: Record<UserRole, EmployeeEnumDto> = {
      'admin': 0,
      'manager': 1,
      'chef': 2,
      'waiter': 3
    };
    
    return mapping[role] || null;
  }
}

