import { Module } from '@nestjs/common';
import { AdminService } from './admin.service';
import { AdminRepository } from './repo/admin.repository';
import { UserRepository } from 'src/user/repo/user.repository';
import { User } from 'src/user/entities/user.entity';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Admin } from 'typeorm';
import { Role } from '../user/entities/role.entity';
import { AdminController } from './admin.controller';
import { AuthModule } from 'src/auth/auth.module';
import { ResponseService } from 'src/utils/responses/ResponseService';
import { JwtService } from '@nestjs/jwt';

@Module({
  imports: [
    TypeOrmModule.forFeature([User, Role, AdminRepository, UserRepository]),
  ],
  controllers: [AdminController],
  providers: [
    AdminService,
    AdminRepository,
    ResponseService,
    JwtService,
    UserRepository,
  ],
  exports: [AdminRepository, AdminService],
})
export class AdminModule {}
