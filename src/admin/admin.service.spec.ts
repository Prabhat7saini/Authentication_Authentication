import { Test, TestingModule } from '@nestjs/testing';
import { AdminService } from './admin.service';
import { AdminRepository } from './repo/admin.repository';
import { ResponseService } from '../utils/responses/ResponseService';
import { ERROR_MESSAGES, SUCCESS_MESSAGES } from '../utils/constants/message'; // Updated path
import { UpdateUserDto } from '../user/dto/userDto';
import {
  ConflictException,
  InternalServerErrorException,
  BadRequestException,
} from '@nestjs/common';

describe('AdminService', () => {
  let service: AdminService;
  let adminRepository: AdminRepository;
  let responseService: ResponseService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AdminService,
        {
          provide: AdminRepository,
          useValue: {
            createRoles: jest.fn(),
            getAllUsers: jest.fn(),
            deactivateUser: jest.fn(),
            activateUser: jest.fn(),
            updateUserByAdmin: jest.fn(),
            getUserById: jest.fn(),
          },
        },
        {
          provide: ResponseService,
          useValue: {
            success: jest.fn(),
            error: jest.fn(),
          },
        },
      ],
    }).compile();

    service = module.get<AdminService>(AdminService);
    adminRepository = module.get<AdminRepository>(AdminRepository);
    responseService = module.get<ResponseService>(ResponseService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('createRoles', () => {
    it('should return error if role is not provided', async () => {
      await service.createRoles('');
      expect(responseService.error).toHaveBeenCalledWith(
        ERROR_MESSAGES.ROLE_REQUIRED,
      );
    });

    it('should return success if role is created successfully', async () => {
      (adminRepository.createRoles as jest.Mock).mockResolvedValue(undefined);
      (responseService.success as jest.Mock).mockReturnValue({
        statusCode: 201,
        message: SUCCESS_MESSAGES.ROLE_CREATED_SUCCESSFULLY,
        success: true,
      });

      const response = await service.createRoles('admin');
      expect(responseService.success).toHaveBeenCalledWith(
        SUCCESS_MESSAGES.ROLE_CREATED_SUCCESSFULLY,
        201,
      );
      expect(response).toEqual({
        statusCode: 201,
        message: SUCCESS_MESSAGES.ROLE_CREATED_SUCCESSFULLY,
        success: true,
      });
    });

    it('should return error if role already exists', async () => {
      // Mock the repository to simulate role already exists scenario
      (adminRepository.createRoles as jest.Mock).mockResolvedValue(
        ERROR_MESSAGES.ROLE_ALREADY_EXISTS,
      );
      (responseService.error as jest.Mock).mockReturnValue({
        statusCode: 400,
        message: ERROR_MESSAGES.ROLE_ALREADY_EXISTS,
        success: false,
      });

      const response = await service.createRoles('existingRole');
      expect(responseService.error).toHaveBeenCalledWith(
        ERROR_MESSAGES.ROLE_ALREADY_EXISTS,
      );
      expect(response).toEqual({
        statusCode: 400,
        message: ERROR_MESSAGES.ROLE_ALREADY_EXISTS,
        success: false,
      });
    });

    it('should return error if an unexpected error occurs', async () => {
      // Mock the repository to throw an unexpected error
      (adminRepository.createRoles as jest.Mock).mockRejectedValue(
        new InternalServerErrorException(
          ERROR_MESSAGES.UNEXPECTED_ERROR_CREATE_USER,
        ),
      );
      (responseService.error as jest.Mock).mockReturnValue({
        statusCode: 500,
        message: ERROR_MESSAGES.UNEXPECTED_ERROR_CREATE_USER,
        success: false,
      });
    });
  });

  describe('getAllUsers', () => {
    it('should return error if fetching users fails', async () => {
      (adminRepository.getAllUsers as jest.Mock).mockRejectedValue(
        new Error(ERROR_MESSAGES.USER_FETCH_FAILED),
      );
      (responseService.error as jest.Mock).mockReturnValue({
        statusCode: 500,
        message: ERROR_MESSAGES.USER_FETCH_FAILED,
        success: false,
      });

      const response = await service.getAllUsers();
      expect(responseService.error).toHaveBeenCalledWith(
        ERROR_MESSAGES.USER_FETCH_FAILED,
        500,
      );
      expect(response).toEqual({
        statusCode: 500,
        message: ERROR_MESSAGES.USER_FETCH_FAILED,
        success: false,
      });
    });

    it('should return success with users data', async () => {
      const users = [{ id: '1', name: 'John Doe' }];
      (adminRepository.getAllUsers as jest.Mock).mockResolvedValue(users);
      (responseService.success as jest.Mock).mockReturnValue({
        statusCode: 200,
        message: SUCCESS_MESSAGES.USERS_FETCHED_SUCCESSFULLY,
        success: true,
        data: users,
      });

      const response = await service.getAllUsers();
      expect(responseService.success).toHaveBeenCalledWith(
        SUCCESS_MESSAGES.USERS_FETCHED_SUCCESSFULLY,
        200,
        users,
      );
      expect(response).toEqual({
        statusCode: 200,
        message: SUCCESS_MESSAGES.USERS_FETCHED_SUCCESSFULLY,
        success: true,
        data: users,
      });
    });
  });

  describe('deactivateUser', () => {
    it('should return error if ID is not provided', async () => {
      const response = await service.deactivateUser('');
      expect(responseService.error).toHaveBeenCalledWith(
        ERROR_MESSAGES.ID_REQUIRED,
      );
    });

    it('should return success if user is deactivated successfully', async () => {
      (adminRepository.deactivateUser as jest.Mock).mockResolvedValue(
        undefined,
      );
      (responseService.success as jest.Mock).mockReturnValue({
        statusCode: 200,
        message: SUCCESS_MESSAGES.USER_DEACTIVATED,
        success: true,
      });

      const response = await service.deactivateUser('1');
      expect(responseService.success).toHaveBeenCalledWith(
        SUCCESS_MESSAGES.USER_DEACTIVATED,
      );
      expect(response).toEqual({
        statusCode: 200,
        message: SUCCESS_MESSAGES.USER_DEACTIVATED,
        success: true,
      });
    });

    it('should return error if deactivating user fails', async () => {
      (adminRepository.deactivateUser as jest.Mock).mockRejectedValue(
        new Error(ERROR_MESSAGES.USER_DELETION_FAILED),
      );
      (responseService.error as jest.Mock).mockReturnValue({
        statusCode: 500,
        message: ERROR_MESSAGES.USER_DELETION_FAILED,
        success: false,
      });

      const response = await service.deactivateUser('1');
      expect(responseService.error).toHaveBeenCalledWith(
        ERROR_MESSAGES.USER_DELETION_FAILED,
        500,
      );
      expect(response).toEqual({
        statusCode: 500,
        message: ERROR_MESSAGES.USER_DELETION_FAILED,
        success: false,
      });
    });
  });

  describe('activateUser', () => {
    it('should return error if ID is not provided', async () => {
      const response = await service.activateUser('');
      expect(responseService.error).toHaveBeenCalledWith(
        ERROR_MESSAGES.ID_REQUIRED,
      );
    });

    it('should return success if user is activated successfully', async () => {
      (adminRepository.activateUser as jest.Mock).mockResolvedValue(undefined);
      (responseService.success as jest.Mock).mockReturnValue({
        statusCode: 200,
        message: SUCCESS_MESSAGES.USER_ACTIVATED,
        success: true,
      });

      const response = await service.activateUser('1');
      expect(responseService.success).toHaveBeenCalledWith(
        SUCCESS_MESSAGES.USER_ACTIVATED,
      );
      expect(response).toEqual({
        statusCode: 200,
        message: SUCCESS_MESSAGES.USER_ACTIVATED,
        success: true,
      });
    });

    it('should return error if activating user fails', async () => {
      (adminRepository.activateUser as jest.Mock).mockRejectedValue(
        new Error(ERROR_MESSAGES.UNEXPECTED_ERROR),
      );
      (responseService.error as jest.Mock).mockReturnValue({
        statusCode: 500,
        message: ERROR_MESSAGES.UNEXPECTED_ERROR,
        success: false,
      });

      const response = await service.activateUser('1');
      expect(responseService.error).toHaveBeenCalledWith(
        ERROR_MESSAGES.UNEXPECTED_ERROR,
        500,
      );
      expect(response).toEqual({
        statusCode: 500,
        message: ERROR_MESSAGES.UNEXPECTED_ERROR,
        success: false,
      });
    });
  });

  describe('updateUserByAdmin', () => {
    it('should return error if ID is not provided', async () => {
      const response = await service.updateUserByAdmin('', {} as UpdateUserDto);
      expect(responseService.error).toHaveBeenCalledWith(
        ERROR_MESSAGES.ID_REQUIRED,
      );
    });

    it('should return success if user is updated successfully', async () => {
      const userData: UpdateUserDto = { name: 'John Doe' };
      const updatedUser = { id: '1', name: 'John Doe' };
      (adminRepository.updateUserByAdmin as jest.Mock).mockResolvedValue(
        updatedUser,
      );
      (responseService.success as jest.Mock).mockReturnValue({
        statusCode: 204,
        message: SUCCESS_MESSAGES.USER_UPDATED_SUCCESSFULLY,
        success: true,
        data: updatedUser,
      });

      const response = await service.updateUserByAdmin('1', userData);
      expect(responseService.success).toHaveBeenCalledWith(
        SUCCESS_MESSAGES.USER_UPDATED_SUCCESSFULLY,
        204,
        updatedUser,
      );
      expect(response).toEqual({
        statusCode: 204,
        message: SUCCESS_MESSAGES.USER_UPDATED_SUCCESSFULLY,
        success: true,
        data: updatedUser,
      });
    });

    it('should return error if updating user fails', async () => {
      const userData: UpdateUserDto = { name: 'John Doe' };
      (adminRepository.updateUserByAdmin as jest.Mock).mockRejectedValue(
        new Error(ERROR_MESSAGES.USER_UPDATE_FAILED),
      );
      (responseService.error as jest.Mock).mockReturnValue({
        statusCode: 500,
        message: ERROR_MESSAGES.USER_UPDATE_FAILED,
        success: false,
      });

      const response = await service.updateUserByAdmin('1', userData);
      expect(responseService.error).toHaveBeenCalledWith(
        ERROR_MESSAGES.USER_UPDATE_FAILED,
        500,
      );
      expect(response).toEqual({
        statusCode: 500,
        message: ERROR_MESSAGES.USER_UPDATE_FAILED,
        success: false,
      });
    });
  });

  describe('getUser', () => {
    it('should return error if ID is not provided', async () => {
      const response = await service.getUser('');
      expect(responseService.error).toHaveBeenCalledWith(
        ERROR_MESSAGES.ID_REQUIRED,
      );
    });

    it('should return success with user data if user is found', async () => {
      const user = { id: '1', name: 'John Doe' };
      (adminRepository.getUserById as jest.Mock).mockResolvedValue(user);
      (responseService.success as jest.Mock).mockReturnValue({
        statusCode: 200,
        message: SUCCESS_MESSAGES.USER_FETCHED_SUCCESSFULLY,
        success: true,
        data: user,
      });

      const response = await service.getUser('1');
      expect(responseService.success).toHaveBeenCalledWith(
        SUCCESS_MESSAGES.USER_FETCHED_SUCCESSFULLY,
        200,
        user,
      );
      expect(response).toEqual({
        statusCode: 200,
        message: SUCCESS_MESSAGES.USER_FETCHED_SUCCESSFULLY,
        success: true,
        data: user,
      });
    });

    it('should return error if user is not found', async () => {
      (adminRepository.getUserById as jest.Mock).mockResolvedValue(null);
      (responseService.error as jest.Mock).mockReturnValue({
        statusCode: 404,
        message: ERROR_MESSAGES.USER_NOT_FOUND_BY_ID('1'),
        success: false,
      });

      const response = await service.getUser('1');
      expect(responseService.error).toHaveBeenCalledWith(
        ERROR_MESSAGES.USER_NOT_FOUND_BY_ID('1'),
        404,
      );
      expect(response).toEqual({
        statusCode: 404,
        message: ERROR_MESSAGES.USER_NOT_FOUND_BY_ID('1'),
        success: false,
      });
    });
  });
});
