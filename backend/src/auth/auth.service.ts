import {
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';

import { UsersService } from '../users/users.service';
import { LoginDto } from './dto/login.dto';

@Injectable()
export class AuthService {
  constructor(
    private readonly usersService: UsersService,
    private readonly jwtService: JwtService,
  ) {}

  async login(dto: LoginDto) {
    const user = await this.usersService.findByEmail(dto.email);

    if (!user) {
      throw new UnauthorizedException('Invalid credentials');
    }

   const validPassword = dto.password === user.password;

if (!validPassword) {
  throw new UnauthorizedException('Invalid credentials');
}

    const payload = {
      sub: user.id,
      email: user.email,
      role: user.role,
    };

 const { password, ...safeUser } = user;

return {
  access_token: await this.jwtService.signAsync(payload),
  user: safeUser,
};
  }
}
