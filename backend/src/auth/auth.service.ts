import {
  Injectable,
  UnauthorizedException,
  BadRequestException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { UsersService } from '../users/users.service';
import * as bcrypt from 'bcrypt';
import { LoginDto } from './dto/login.dto';

@Injectable()
export class AuthService {
  constructor(
    private readonly usersService: UsersService,
    private readonly jwtService: JwtService,
  ) {}

  // 🔑 Standard Email + Password Login (with plain text fallback check)
  async login(dto: LoginDto) {
    const user = await this.usersService.findByEmail(dto.email);

    if (!user || !user.password) {
      throw new UnauthorizedException('Invalid email or password');
    }

    // Check bcrypt first, then fallback to direct match (if seeded in plain text)
    let isPasswordValid = await bcrypt.compare(dto.password, user.password);
    if (!isPasswordValid && dto.password === user.password) {
      isPasswordValid = true;
    }

    if (!isPasswordValid) {
      throw new UnauthorizedException('Invalid email or password');
    }

    if (user.status === 'PENDING') {
      throw new UnauthorizedException('Your account is pending approval');
    }

    if (user.status === 'REJECTED') {
      throw new UnauthorizedException('Your account access has been rejected');
    }

    const payload = {
      sub: user.id,
      email: user.email,
      role: user.role,
      status: user.status,
    };

    const token = this.jwtService.sign(payload);

    return { token, user };
  }

  async me(userId: string) {
  return this.usersService.findOne(userId);
}

  // 🌐 Google OAuth Login
  async googleLogin(req: any) {
    if (!req?.user) {
      throw new BadRequestException('No user data received from Google');
    }

    const { googleId, email, firstName, lastName, picture } = req.user;

    // Type as any to prevent Prisma relation type complaints during assignment
    let user: any = await this.usersService.findByGoogleId(googleId);

    if (!user) {
      user = await this.usersService.findByEmail(email);
      if (user) {
        user = await this.usersService.updateGoogleLogin(user.id, {
          googleId,
          firstName,
          lastName,
          picture,
        });
      } else {
        user = await this.usersService.createGoogleUser({
          googleId,
          email,
          firstName,
          lastName,
          picture,
        });
      }
    }

    // Explicit null safety guard for TypeScript
    if (!user) {
      throw new UnauthorizedException('Authentication failed');
    }

    const payload = {
      sub: user.id,
      email: user.email,
      role: user.role,
      status: user.status,
    };

    const token = this.jwtService.sign(payload);

    return { token, user };
  }
}