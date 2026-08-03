import {
  Body,
  Controller,
  Get,
  Post,
  Req,
  Res,
  UseGuards,
  HttpCode,
  HttpStatus,
} from "@nestjs/common";
import { AuthGuard } from "@nestjs/passport";

import { AuthService } from "./auth.service";
import { JwtAuthGuard } from "./jwt-auth.guard";
import { LoginDto } from "./dto/login.dto";

@Controller("auth")
export class AuthController {
  constructor(
    private readonly authService: AuthService,
  ) {}

  // ==========================================
  // EMAIL LOGIN
  // ==========================================

  @HttpCode(HttpStatus.OK)
  @Post("login")
  async login(@Body() dto: LoginDto) {
    return this.authService.login(dto);
  }

  // ==========================================
  // CURRENT USER
  // ==========================================

  @UseGuards(JwtAuthGuard)
  @Get("me")
  async me(@Req() req: any) {
    return this.authService.me(req.user.id);
  }

  // ==========================================
  // GOOGLE LOGIN
  // ==========================================

  @Get("google")
  @UseGuards(AuthGuard("google"))
  async googleLogin() {}

  // ==========================================
  // GOOGLE CALLBACK
  // ==========================================

  @Get("google/callback")
  @UseGuards(AuthGuard("google"))
  async googleCallback(
    @Req() req: any,
    @Res() res: any,
  ) {
    const result =
      await this.authService.googleLogin(req);

    const frontend =
      process.env.FRONTEND_URL ??
      "http://localhost:3000";

    return res.redirect(
      `${frontend}/auth/callback?token=${result.token}`,
    );
  }
}