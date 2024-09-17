import { ERROR_MESSAGES, SUCCESS_MESSAGES } from '../utils/constants/message';
import { ApiResponse } from '../utils/responses/api-response.dto';
import { UpdateUserDto } from './dto/userDto';
import { UserService } from './user.service';
import { UserRepository } from './repo/user.repository';
import { ResponseService } from '../utils/responses/ResponseService';
import { Test, TestingModule } from '@nestjs/testing';
import { User } from './entities/user.entity';

describe('UserService', () => {
  let userService: UserService;
  let userRepository: UserRepository;
  let responseService: ResponseService;

  const mockUserRepository = {
    updateUser: jest.fn(),
    softDeleteUser: jest.fn(),
    findUser: jest.fn(),
  };

  const mockResponseService = {
    success: jest.fn(),
    error: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UserService,
        { provide: UserRepository, useValue: mockUserRepository },
        { provide: ResponseService, useValue: mockResponseService },
      ],
    }).compile();

    userService = module.get<UserService>(UserService);
    userRepository = module.get<UserRepository>(UserRepository);
    responseService = module.get<ResponseService>(ResponseService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('updateUser', () => {
    it('should update the user successfully', async () => {
      const id = '1';
      const userData: UpdateUserDto = { name: 'Updated User' };

      jest.spyOn(userRepository, 'updateUser').mockResolvedValue(new User());
      jest.spyOn(responseService, 'success').mockReturnValue({
        message: SUCCESS_MESSAGES.USER_UPDATED_SUCCESSFULLY,
        statusCode: 204,
        success: true,
      });

      const result = await userService.updateUser(id, userData);
      expect(result).toEqual({
        message: SUCCESS_MESSAGES.USER_UPDATED_SUCCESSFULLY,
        statusCode: 204,
        success: true,
      });
    });

    it('should handle update user error', async () => {
      const id = '1';
      const userData: UpdateUserDto = { name: 'Updated User' };

      jest
        .spyOn(userRepository, 'updateUser')
        .mockRejectedValue(new Error('Some error'));
      jest.spyOn(responseService, 'error').mockReturnValue({
        message: ERROR_MESSAGES.USER_UPDATE_FAILED,
        statusCode: 500,
        success: false,
      });

      const result = await userService.updateUser(id, userData);
      expect(result).toEqual({
        message: ERROR_MESSAGES.USER_UPDATE_FAILED,
        statusCode: 500,
        success: false,
      });
    });
  });

  describe('softDeleteUser', () => {
    it('should return success response if user is successfully soft deleted', async () => {
      const req = { user: { id: 'user-id' } };
      jest.spyOn(userRepository, 'softDeleteUser').mockResolvedValue(true);
      jest.spyOn(responseService, 'success').mockReturnValue({
        statusCode: 200,
        message: SUCCESS_MESSAGES.USER_DELETED_SUCCESSFULLY,
        success: true,
      });

      const result: ApiResponse = await userService.softDeleteUser(req as any);

      expect(result).toEqual({
        statusCode: 200,
        message: SUCCESS_MESSAGES.USER_DELETED_SUCCESSFULLY,
        success: true,
      });
      expect(userRepository.softDeleteUser).toHaveBeenCalledWith('user-id');
      expect(responseService.success).toHaveBeenCalledWith(
        SUCCESS_MESSAGES.USER_DELETED_SUCCESSFULLY,
      );
    });

    it('should return error response if user deletion fails', async () => {
      const req = { user: { id: 'user-id' } };
      jest.spyOn(userRepository, 'softDeleteUser').mockResolvedValue(false);
      jest.spyOn(responseService, 'error').mockReturnValue({
        statusCode: 500,
        message: ERROR_MESSAGES.USER_DELETION_FAILED,
        success: false,
      });

      const result: ApiResponse = await userService.softDeleteUser(req as any);

      expect(result).toEqual({
        statusCode: 500,
        message: ERROR_MESSAGES.USER_DELETION_FAILED,
        success: false,
      });
      expect(userRepository.softDeleteUser).toHaveBeenCalledWith('user-id');
      expect(responseService.error).toHaveBeenCalledWith(
        ERROR_MESSAGES.USER_DELETION_FAILED,
        500,
      );
    });

    it('should return error response if an exception occurs', async () => {
      const req = { user: { id: 'user-id' } };
      jest
        .spyOn(userRepository, 'softDeleteUser')
        .mockRejectedValue(new Error('Some error'));
      jest.spyOn(responseService, 'error').mockReturnValue({
        statusCode: 500,
        message: ERROR_MESSAGES.USER_DELETION_FAILED,
        success: false,
      });

      const result: ApiResponse = await userService.softDeleteUser(req as any);

      expect(result).toEqual({
        statusCode: 500,
        message: ERROR_MESSAGES.USER_DELETION_FAILED,
        success: false,
      });
      expect(userRepository.softDeleteUser).toHaveBeenCalledWith('user-id');
      expect(responseService.error).toHaveBeenCalledWith(
        ERROR_MESSAGES.USER_DELETION_FAILED,
        500,
      );
    });
  });
});
