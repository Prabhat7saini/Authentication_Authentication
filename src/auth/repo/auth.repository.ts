import { Repository } from 'typeorm';
import { User } from '../../user/entities/user.entity';
import { InjectRepository } from '@nestjs/typeorm';
import * as bcrypt from 'bcryptjs';
import { ERROR_MESSAGES, SUCCESS_MESSAGES } from '../../utils/constants/message';
import { AdminSignUpDto, ChangePasswordDto, RegisterDto } from '../dto/authDto';
import { Role } from '../../user/entities/role.entity';
import { BadRequestException, InternalServerErrorException, Logger } from '@nestjs/common';

export class AuthRepository {
    private readonly saltRounds = 10;
    private readonly logger = new Logger(AuthRepository.name);

    constructor(
        @InjectRepository(User)
        private readonly userRepository: Repository<User>,
        @InjectRepository(Role)
        private readonly roleRepository: Repository<Role>,
    ) { }

    /**
     * Registers a new user with the given data.
     *  userData - The data for the user to be registered.
     * @returns The created user entity or an error message.
     */
    async register(userData: RegisterDto): Promise<User | string> {
        const { roleName, password } = userData;

        try {
            // Find the role entity corresponding to the given roleName
            const roleEntity = await this.roleRepository.findOne({ where: { roleName } });
            if (!roleEntity) {
                this.logger.warn(`Role '${roleName}' does not exist.`);
                return ERROR_MESSAGES.ROLE_NOT_FOUND_ERROR(roleName);
            }

            // Hash the user password before saving
            const hashedPassword = await bcrypt.hash(password, this.saltRounds);

            // Create and save the new user
            const user = this.userRepository.create({
                ...userData,
                password: hashedPassword,
                roles: [roleEntity],
            });
            return await this.userRepository.save(user);
        } catch (error) {
            this.logger.error('User registration failed', error.message, error.stack);
            throw new InternalServerErrorException(ERROR_MESSAGES.USER_CREATION_FAILED);
        }
    }

    /**
     * Creates a new admin with the given data.
     *  adminData - The data for the admin to be created.
     * @returns The created admin entity.
     */
    async createAdmin(adminData: AdminSignUpDto): Promise<User> {
        const roleName = 'admin';
        try {
            // Find the role entity for 'admin'
            const roleEntity = await this.roleRepository.findOne({ where: { roleName } });
            if (!roleEntity) {
                this.logger.warn(`Role '${roleName}' does not exist.`);
                throw new BadRequestException('Role does not exist');
            }

            // Hash the admin password before saving
            const hashedPassword = await bcrypt.hash(adminData.password, this.saltRounds);

            // Create and save the new admin
            const user = this.userRepository.create({
                ...adminData,
                password: hashedPassword,
                roles: [roleEntity],
            });
            return await this.userRepository.save(user);
        } catch (error) {
            this.logger.error('Admin creation failed', error.message, error.stack);
            throw new InternalServerErrorException(ERROR_MESSAGES.USER_CREATION_FAILED);
        }
    }


    async changePassword(id: string, passwordChangeData: ChangePasswordDto): Promise<void | string> {
        try {
            const hashedPassword = await bcrypt.hash(passwordChangeData.newPassword,this.saltRounds);

            
            return
        } catch (error) {

        }
    }
}
