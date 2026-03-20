import { UserRole } from '../entities/user.entity';
import { User } from '../entities/user.entity';

export class AuthResponseDto {
  user: {
    id: string;
    email: string;
    name: string;
    phone: string | null;
    role: UserRole;
    fishingPoints: number;
  };
  accessToken: string;
  refreshToken: string;
  expiresIn: number;

  constructor(
    user: User,
    accessToken: string,
    refreshToken: string,
    expiresInSeconds: number,
  ) {
    this.user = {
      id: user.id,
      email: user.email,
      name: user.name,
      phone: user.phone,
      role: user.role,
      fishingPoints: user.fishingPoints,
    };
    this.accessToken = accessToken;
    this.refreshToken = refreshToken;
    this.expiresIn = expiresInSeconds;
  }
}

