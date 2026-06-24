import { LoginRequestDTO, LoginResponseDto } from '../../api/generated/model/models';
import { LoginRequest, LoginResponse } from '../../models/auth.model';

export class AuthAdapter {
  static toLoginRequestDto(request: LoginRequest): LoginRequestDTO {
    return {
      username: request.username,
      password: request.password
    };
  }

  static toLoginResponse(dto: LoginResponseDto): LoginResponse {
    return {
      token: dto.token || ''
    };
  }
}

