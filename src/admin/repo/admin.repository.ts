import { Repository } from 'typeorm';
import { User } from '../../user/entities/user.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { ERROR_MESSAGES } from '../../utils/constants/message';
import { Role } from '../../user/entities/role.entity';
import { InternalServerErrorException, Logger } from '@nestjs/common';
import { UserRepository } from '../../user/repo/user.repository';
import { ResponseService } from '../../utils/responses/ResponseService';
import { UpdateUserDto } from '../../user/dto/userDto';

export class AdminRepository {
  private readonly saltRounds = 10;
  private readonly logger = new Logger(AdminRepository.name);

  constructor(
    @InjectRepository(User)
    private readonly adminRepository: Repository<User>,
    @InjectRepository(Role)
    private readonly roleRepository: Repository<Role>,
    private readonly userRepository: UserRepository,
    private readonly responseService: ResponseService,
  ) {}

  /*
   * Creates a new role if it does not already exist.
   * role - The name of the role to be created.
   * @returns A string message if the role already exists or throws an InternalServerErrorException on failure.
   */
  async createRoles(role: string): Promise<void | string> {
    try {
      const existingRole = await this.roleRepository.findOne({
        where: { roleName: role },
      });
      if (existingRole) {
        this.logger.warn(`Role ${role} already exists.`);
        return ERROR_MESSAGES.ROLE_ALREADY_EXISTS;
      }

      const newRole = this.roleRepository.create({ roleName: role });
      await this.roleRepository.save(newRole);
    } catch (error) {
      this.logger.error(
        'An unexpected error occurred while creating role:',
        error.message,
      );
      throw new InternalServerErrorException(error.message);
    }
  }

  /*
   * Retrieves all users with the 'user' role.
   * @returns An array of users with the 'user' role or an error message if the role is not found.
   */
  async getAllUsers(): Promise<User[] | string> {
    try {
      const roleName = 'user';
      const role = await this.roleRepository.findOne({ where: { roleName } });

      if (!role) {
        this.logger.warn(`Role ${roleName} not found.`);
        return ERROR_MESSAGES.ROLE_NOT_FOUND_ERROR(roleName);
      }

      const users = await this.adminRepository
        .createQueryBuilder('user')
        .innerJoinAndSelect('user.roles', 'role')
        .where('role.id = :roleId', { roleId: role.id })
        .getMany();
      return users;
    } catch (error) {
      this.logger.error(
        'An unexpected error occurred while fetching users:',
        error.message,
      );
      throw new InternalServerErrorException(error.message);
    }
  }

  /*
   * Deactivates a user by setting their 'isActive' status to false.
   * @param id - The ID of the user to be deactivated.
   * @returns A message indicating whether the user was deactivated or not found.
   */
  async deactivateUser(id: string): Promise<void | string> {
    try {
      const result = await this.userRepository
        .createQueryBuilder()
        .update(User)
        .set({ isActive: false })
        .where('id = :id AND isActive = true', { id })
        .execute();

      if (result.affected === 0) {
        this.logger.warn(`User with ID ${id} not found or already inactive.`);
        return ERROR_MESSAGES.NOT_FOUND_OR_INACTIVE(id);
      }
    } catch (error) {
      this.logger.error(
        `Failed to deactivate user with ID ${id}: ${error.message}`,
      );
      throw new InternalServerErrorException(error.message);
    }
  }

  /*
   * Activates a user by setting their 'isActive' status to true.
   * @param id - The ID of the user to be activated.
   * @returns A message indicating whether the user was activated or not found.
   */
  async activateUser(id: string): Promise<void | string> {
    try {
      const result = await this.userRepository
        .createQueryBuilder()
        .update(User)
        .set({ isActive: true })
        .where('id = :id AND isActive = false', { id })
        .execute();

      if (result.affected === 0) {
        this.logger.warn(`User with ID ${id} not found or already active.`);
        return ERROR_MESSAGES.NOT_FOUND_OR_ACTIVE(id);
      }
    } catch (error) {
      this.logger.error(
        `Failed to activate user with ID ${id}: ${error.message}`,
      );
      throw new InternalServerErrorException(error.message);
    }
  }

  /*
   * Updates user information, but prevents updates to admin users.
   * @param id - The ID of the user to be updated.
   * userData - The new user data to be applied.
   * @returns The updated user or an error message if the user is not found or is an admin.
   */
  async updateUserByAdmin(
    id: string,
    userData: UpdateUserDto,
  ): Promise<User | string> {
    try {
      const user = await this.userRepository.findUser({ id });

      if (!user.isActive) {
        this.logger.warn(
          `You are not update the user details because the user are not active`,
        );
        return ERROR_MESSAGES.NOT_ALLOWED_TO_UPDATE_INACTIVE_USER;
      }
      if (!user) {
        this.logger.warn(
          `inside the update by admin User with ID ${id} not found.`,
        );
        return ERROR_MESSAGES.USER_NOT_FOUND;
      }
      if (user.roles[0].roleName === 'admin') {
        this.logger.warn(`Update not allowed for admin user `);
        return ERROR_MESSAGES.ADMIN_UPDATE_NOT_ALLOWED;
      }

      await this.userRepository.update(id, userData);

      const updatedUser = await this.userRepository.findUser({ id });
      this.logger.log(`User with ID ${id} updated successfully.`);
      return updatedUser;
    } catch (error) {
      this.logger.error(
        `Failed to update user with ID ${id}: ${error.message}`,
      );
      throw new InternalServerErrorException(error.message);
    }
  }

  async getUserById(id: string): Promise<User> {
    try {
      const user = await this.userRepository.findUser({ id });
      if (user) {
        delete user.refreshToken;
        delete user.password;
        delete user.deletedAt;
      }
      return user;
    } catch (error) {
      // this.logger.error('Error fetching users:', error);
      throw new Error(ERROR_MESSAGES.USER_FETCH_FAILED);
    }
  }
}
