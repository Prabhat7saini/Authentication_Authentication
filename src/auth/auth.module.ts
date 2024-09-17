import { Module } from '@nestjs/common';
import { JwtModule, JwtService } from '@nestjs/jwt';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { AuthenticationGuard } from './guard/authenticaton.guard';
import { AuthService } from './auth.service';
import { AuthController } from './auth.controller';
import { UserModule } from 'src/user/user.module';
import { AdminModule } from 'src/admin/admin.module';
import { UserRepository } from 'src/user/repo/user.repository';
import { AdminRepository } from 'src/admin/repo/admin.repository';
import { ResponseService } from 'src/utils/responses/ResponseService';
import { AuthorizationGuard } from './guard/authorization.guard';
import { AuthRepository } from './repo/auth.repository';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from '../user/entities/user.entity';
import { Role } from '../user/entities/role.entity';

@Module({
  imports: [
    UserModule,
    AdminModule,
    ConfigModule.forRoot(), // Ensure ConfigModule is imported
    JwtModule.registerAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: async (configService: ConfigService) => ({
        secret: configService.get<string>('JWT_SECRET'),
        signOptions: { expiresIn: '60m' },
      }),
    }),
    TypeOrmModule.forFeature([User, Role, AuthRepository, UserRepository]),
  ],
  providers: [
    AuthService,
    ResponseService,
    AuthenticationGuard,
    JwtService,
    AuthorizationGuard,
    AuthRepository,
  ],
  controllers: [AuthController],
  exports: [AuthService, AuthenticationGuard, AuthorizationGuard], // Export if needed elsewhere
})
export class AuthModule {}
