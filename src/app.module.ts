import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { DatabaseModule } from './database/database.module';
import { ConfigModule } from '@nestjs/config';
import { UserController } from './user/user.controller';
import { UserService } from './user/user.service';
import { UserModule } from './user/user.module';
import { AuthController } from './auth/auth.controller';
import { AuthModule } from './auth/auth.module';
import { AdminController } from './admin/admin.controller';
import { AdminModule } from './admin/admin.module';
import { JwtService } from '@nestjs/jwt';
import { ResponseService } from './utils/responses/ResponseService';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: '.local.env',
    }),
    DatabaseModule,
    UserModule,
    AuthModule,
    AdminModule,
  ],
  controllers: [AppController, UserController, AuthController, AdminController],
  providers: [AppService, JwtService, ResponseService],
})
export class AppModule {}
