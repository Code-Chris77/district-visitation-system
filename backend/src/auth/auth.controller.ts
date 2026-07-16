import { Controller, Get } from '@nestjs/common';

@Controller('auth')
export class AuthController {
  @Get('health')
  health() {
    return {
      message: 'Authentication module working',
    };
  }
}
