import { Module } from '@nestjs/common';
import { UserService } from './user.service';
import { UserRepository } from './repo/user.repository';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from './entities/user.entity';
import { Role } from './entities/role.entity';
import { ResponseService } from 'src/utils/responses/ResponseService';

@Module({
  imports: [TypeOrmModule.forFeature([User, Role, UserRepository])],
  providers: [UserService, UserRepository, ResponseService],
  exports: [UserRepository, UserService],
})
export class UserModule {}
