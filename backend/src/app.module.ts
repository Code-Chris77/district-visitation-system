import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';

import { PrismaModule } from './prisma/prisma.module';
import { UsersModule } from './users/users.module';
import { AuthModule } from './auth/auth.module';
import { MembersModule } from './members/members.module';
import { LocalsModule } from './locals/locals.module';
import { VisitationsModule } from './visitations/visitations.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),

    PrismaModule,

    UsersModule,

    AuthModule,

    MembersModule,

    LocalsModule,

    VisitationsModule,
  ],
})
export class AppModule {}
