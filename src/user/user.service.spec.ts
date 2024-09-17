import { Test, TestingModule } from '@nestjs/testing';
import { UserService } from './user.service';
import { UserRepository } from './repo/user.repository';
import { ResponseService } from '../utils/responses/ResponseService';
import { UpdateUserDto } from './dto/userDto';
import { User } from '../user/entities/user.entity';
import { ERROR_MESSAGES, SUCCESS_MESSAGES } from '../utils/constants/message';


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

      jest.spyOn(userRepository, 'updateUser').mockRejectedValue(new Error('Some error'));
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

  // describe('softDeleteUser', () => {
  //   it('should soft delete the user successfully', async () => {
  //     const req: CustomRequest = {
  //       user: { id: '1', role: 'user' },
  //       headers: {}, // Provide default mock implementations
  //       params: {},
  //       query: {},
  //       body: {},
  //       method: 'GET',
  //       url: '/',
  //       // Add other properties as needed
  //     };

  //     jest.spyOn(userRepository, 'softDeleteUser').mockResolvedValue(true);
  //     jest.spyOn(responseService, 'success').mockReturnValue({
  //       message: SUCCESS_MESSAGES.USER_DELETED_SUCCESSFULLY,
  //       statusCode: 200,
  //       success: true,
  //     });

  //     const result = await userService.softDeleteUser(req);
  //     expect(result).toEqual({
  //       message: SUCCESS_MESSAGES.USER_DELETED_SUCCESSFULLY,
  //       statusCode: 200,
  //       success: true,
  //     });
  //   });

  //   it('should handle soft delete user error', async () => {
  //     const req: CustomRequest = {
  //       user: { id: '1', role: 'user' },
  //       headers: {}, // Provide default mock implementations
  //       params: {},
  //       query: {},
  //       body: {},
  //       method: 'GET',
  //       url: '/',
  //       // Add other properties as needed
  //     };

  //     jest.spyOn(userRepository, 'softDeleteUser').mockResolvedValue(false);
  //     jest.spyOn(responseService, 'error').mockReturnValue({
  //       message: ERROR_MESSAGES.USER_DELETION_FAILED,
  //       statusCode: 500,
  //       success: false,
  //     });

  //     const result = await userService.softDeleteUser(req);
  //     expect(result).toEqual({
  //       message: ERROR_MESSAGES.USER_DELETION_FAILED,
  //       statusCode: 500,
  //       success: false,
  //     });
  //   });
  // });
});
