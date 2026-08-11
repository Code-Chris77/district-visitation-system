import { Module } from "@nestjs/common";
import { PassportModule } from "@nestjs/passport";
import { JwtModule } from "@nestjs/jwt";
import { ConfigModule } from "@nestjs/config";
import { JwtStrategy } from "./jwt.strategy";

import { AuthController } from "./auth.controller";
import { AuthService } from "./auth.service";
import { GoogleStrategy } from "./google.strategy";

import { UsersModule } from "../users/users.module";

@Module({
  imports: [
  ConfigModule,

  UsersModule,

  PassportModule.register({
    session: false,
  }),

  JwtModule.register({
    secret:
      process.env.JWT_SECRET ??
      "superSecretKey123",

    signOptions: {
      expiresIn: "1d",
    },
  }),
],

  controllers: [AuthController],

  providers: [
  AuthService,
  GoogleStrategy,
  JwtStrategy,
],

  exports: [
    AuthService,
    JwtModule,
  ],
})
export class AuthModule {}
