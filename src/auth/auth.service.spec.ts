import { Test, TestingModule } from '@nestjs/testing';
import { AuthService } from './auth.service';
import { UserRepository } from '../user/repo/user.repository';
import { ResponseService } from '../utils/responses/ResponseService';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { AuthRepository } from './repo/auth.repository';
import * as bcrypt from 'bcryptjs';
import { AdminSignUpDto, RegisterDto, LoginDto, ChangePasswordDto } from './dto/authDto';
import { User } from '../user/entities/user.entity';

describe('AuthService', () => {
  let service: AuthService;
  let userRepository: UserRepository;
  let responseService: ResponseService;
  let jwtService: JwtService;
  let configService: ConfigService;
  let authRepository: AuthRepository;

  const mockUserRepository = {
    findUser: jest.fn(),
    save: jest.fn(),
  };

  const mockResponseService = {
    success: jest.fn(),
    error: jest.fn(),
  };

  const mockJwtService = {
    signAsync: jest.fn(),
  };

  const mockConfigService = {
    get: jest.fn(),
  };

  const mockAuthRepository = {
    register: jest.fn(),
    createAdmin: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthService,
        { provide: UserRepository, useValue: mockUserRepository },
        { provide: ResponseService, useValue: mockResponseService },
        { provide: JwtService, useValue: mockJwtService },
        { provide: ConfigService, useValue: mockConfigService },
        { provide: AuthRepository, useValue: mockAuthRepository },
      ],
    }).compile();

    service = module.get<AuthService>(AuthService);
    userRepository = module.get<UserRepository>(UserRepository);
    responseService = module.get<ResponseService>(ResponseService);
    jwtService = module.get<JwtService>(JwtService);
    configService = module.get<ConfigService>(ConfigService);
    authRepository = module.get<AuthRepository>(AuthRepository);
  });

  describe('adminRegister', () => {
    it('should register an admin successfully', async () => {
      const adminDto: AdminSignUpDto = { email: 'admin@example.com', password: 'password', name: "jond", age: "12", address: "address" };
      const newUser = new User();
      mockUserRepository.findUser.mockResolvedValue(null);
      mockAuthRepository.createAdmin.mockResolvedValue(newUser);
      mockResponseService.success.mockReturnValue({ message: 'Success', statusCode: 201, success: true, data: newUser });

      const result = await service.adminRegister(adminDto);
      expect(result).toEqual({ message: 'Success', statusCode: 201, success: true, data: newUser });
    });

    it('should return an error if user already exists', async () => {
      const adminDto: AdminSignUpDto = { email: 'admin@example.com', password: 'password', name: "jond", age: "12", address: "address" };
      mockUserRepository.findUser.mockResolvedValue(new User());
      mockResponseService.error.mockReturnValue({ message: 'User already exists', statusCode: 409, success: false });

      const result = await service.adminRegister(adminDto);
      expect(result).toEqual({ message: 'User already exists', statusCode: 409, success: false });
    });

    it('should handle unexpected errors', async () => {
      const adminDto: AdminSignUpDto = { email: 'admin@example.com', password: 'password', name: "jond", age: "12", address: "address" };
      mockUserRepository.findUser.mockRejectedValue(new Error('Database error'));
      mockResponseService.error.mockReturnValue({ message: 'Unexpected error', statusCode: 500, success: false });

      const result = await service.adminRegister(adminDto);
      expect(result).toEqual({ message: 'Unexpected error', statusCode: 500, success: false });
    });
  });

  describe('register', () => {
    it('should register a user successfully', async () => {
      const registerDto: RegisterDto = { email: 'user@example.com', password: 'password', roleName: 'user', name: "jond", age: "12", address: "address" };
      const newUser = new User();
      mockUserRepository.findUser.mockResolvedValue(null);
      mockAuthRepository.register.mockResolvedValue(newUser);
      mockResponseService.success.mockReturnValue({ message: 'Success', statusCode: 201, success: true, data: newUser });

      const result = await service.register(registerDto);
      expect(result).toEqual({ message: 'Success', statusCode: 201, success: true, data: newUser });
    });

    it('should return an error if role does not exist', async () => {
      const registerDto: RegisterDto = { email: 'user@example.com', password: 'password', roleName: 'nonexistent',name:"jond",age:"12",address:"address" };
      mockUserRepository.findUser.mockResolvedValue(null);
      mockAuthRepository.register.mockResolvedValue('Role not found');
      mockResponseService.error.mockReturnValue({ message: 'Role not found', statusCode: 404, success: false });

      const result = await service.register(registerDto);
      expect(result).toEqual({ message: 'Role not found', statusCode: 404, success: false });
    });

    it('should handle unexpected errors', async () => {
      const registerDto: RegisterDto = { email: 'user@example.com', password: 'password', roleName: 'user', name: "jond", age: "12", address: "address" };
      mockUserRepository.findUser.mockRejectedValue(new Error('Database error'));
      mockResponseService.error.mockReturnValue({ message: 'Unexpected error', statusCode: 500, success: false });

      const result = await service.register(registerDto);
      expect(result).toEqual({ message: 'Unexpected error', statusCode: 500, success: false });
    });
  });

  describe('login', () => {
    it('should login successfully and return an access token', async () => {
      const loginDto: LoginDto = { email: 'user@example.com', password: 'password' };
      const existingUser = new User();
      existingUser.password = await bcrypt.hash('password', 12);
      existingUser.isActive = true;
      existingUser.roles = [{ roleName: 'user',id:"123456yhfe5678" }];

      const userWithoutSensitiveData = {
        id: existingUser.id,
        email: existingUser.email,
        roles: existingUser.roles,
      };

      mockUserRepository.findUser.mockResolvedValue(existingUser);
      mockJwtService.signAsync.mockResolvedValue('accessToken');
      mockResponseService.success.mockReturnValue({
        message: 'Success',
        statusCode: 200,
        success: true,
        data: { user: userWithoutSensitiveData, accessToken: 'accessToken' },
      });

      const result = await service.login(loginDto);
      expect(result).toEqual({
        message: 'Success',
        statusCode: 200,
        success: true,
        data: { user: userWithoutSensitiveData, accessToken: 'accessToken' },
      });
    });

    it('should return an error if user is not found', async () => {
      const loginDto: LoginDto = { email: 'user@example.com', password: 'password' };
      mockUserRepository.findUser.mockResolvedValue(null);
      mockResponseService.error.mockReturnValue({ message: 'User not found', statusCode: 404, success: false });

      const result = await service.login(loginDto);
      expect(result).toEqual({ message: 'User not found', statusCode: 404, success: false });
    });

    it('should return an error if password is invalid', async () => {
      const loginDto: LoginDto = { email: 'user@example.com', password: 'wrongPassword' };
      const existingUser = new User();
      existingUser.password = await bcrypt.hash('password', 12);
      mockUserRepository.findUser.mockResolvedValue(existingUser);
      mockResponseService.error.mockReturnValue({ message: 'Invalid credentials', statusCode: 401, success: false });

      const result = await service.login(loginDto);
      expect(result).toEqual({ message: 'Invalid credentials', statusCode: 401, success: false });
    });

    it('should handle unexpected errors', async () => {
      const loginDto: LoginDto = { email: 'user@example.com', password: 'password' };
      mockUserRepository.findUser.mockRejectedValue(new Error('Database error'));
      mockResponseService.error.mockReturnValue({ message: 'Unexpected error', statusCode: 500, success: false });

      const result = await service.login(loginDto);
      expect(result).toEqual({ message: 'Unexpected error', statusCode: 500, success: false });
    });
  });

  describe('changePassword', () => {
    it('should change the password successfully', async () => {
      const changePasswordDto: ChangePasswordDto = { oldPassword: 'password', newPassword: 'newPassword', confirmPassword: 'newPassword' };
      const existingUser = new User();
      existingUser.password = await bcrypt.hash('password', 12);
      mockUserRepository.findUser.mockResolvedValue(existingUser);
      mockUserRepository.save.mockResolvedValue(existingUser);
      mockResponseService.success.mockReturnValue({ message: 'Password changed successfully', statusCode: 200, success: true });

      const result = await service.changePassword({ user: { id: 1 } } as any, changePasswordDto);
      expect(result).toEqual({ message: 'Password changed successfully', statusCode: 200, success: true });
    });

    it('should return an error if old password is invalid', async () => {
      const changePasswordDto: ChangePasswordDto = { oldPassword: 'wrongPassword', newPassword: 'newPassword', confirmPassword: 'newPassword' };
      const existingUser = new User();
      existingUser.password = await bcrypt.hash('password', 12);
      mockUserRepository.findUser.mockResolvedValue(existingUser);
      mockResponseService.error.mockReturnValue({ message: 'Invalid old password', statusCode: 400, success: false });

      const result = await service.changePassword({ user: { id: 1 } } as any, changePasswordDto);
      expect(result).toEqual({ message: 'Invalid old password', statusCode: 400, success: false });
    });

    it('should return an error if passwords do not match', async () => {
      const changePasswordDto: ChangePasswordDto = { oldPassword: 'password', newPassword: 'newPassword', confirmPassword: 'differentNewPassword' };
      const existingUser = new User();
      existingUser.password = await bcrypt.hash('password', 12);
      mockUserRepository.findUser.mockResolvedValue(existingUser);
      mockResponseService.error.mockReturnValue({ message: 'Passwords do not match', statusCode: 400, success: false });

      const result = await service.changePassword({ user: { id: 1 } } as any, changePasswordDto);
      expect(result).toEqual({ message: 'Passwords do not match', statusCode: 400, success: false });
    });

    it('should handle unexpected errors', async () => {
      const changePasswordDto: ChangePasswordDto = { oldPassword: 'password', newPassword: 'newPassword', confirmPassword: 'newPassword' };
      mockUserRepository.findUser.mockRejectedValue(new Error('Database error'));
      mockResponseService.error.mockReturnValue({ message: 'Unexpected error', statusCode: 500, success: false });

      const result = await service.changePassword({ user: { id: 1 } } as any, changePasswordDto);
      expect(result).toEqual({ message: 'Unexpected error', statusCode: 500, success: false });
    });
  });
});
