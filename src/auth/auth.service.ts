import { Injectable, Logger, BadRequestException, InternalServerErrorException } from '@nestjs/common';
import { UserRepository } from 'src/user/repo/user.repository';
import { AdminSignUpDto, LoginDto, RegisterDto } from './dto/authDto';
import { ResponseService } from '../utils/responses/ResponseService';
import { ERROR_MESSAGES, SUCCESS_MESSAGES } from '../utils/constants/message';
import { ApiResponse } from '../utils/responses/api-response.dto';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcryptjs';
import { AuthRepository } from './repo/auth.repository';

@Injectable()
export class AuthService {
    private readonly logger = new Logger(AuthService.name);

    constructor(
        private readonly userRepository: UserRepository,
        private readonly responseService: ResponseService,
        private readonly jwt: JwtService,
        private readonly config: ConfigService,
        private readonly authRepository: AuthRepository
    ) { }

    /**
     * Registers a new admin user.
     *  adminUser - The details of the admin to be registered.
     * @returns An ApiResponse indicating the result of the registration operation.
     */
    async adminRegister(adminUser: AdminSignUpDto): Promise<ApiResponse> {
        try {
            // Check if an admin with the given email already exists
            const existingUser = await this.userRepository.findUser({ email: adminUser.email });
            if (existingUser) {
                return this.responseService.error(ERROR_MESSAGES.USER_ALREADY_EXISTS, 409);
            }

            // Create and save the new admin user
            const user = await this.authRepository.createAdmin(adminUser);
            return this.responseService.success(SUCCESS_MESSAGES.USER_CREATED_SUCCESSFULLY, 201, user);
        } catch (error) {
            this.logger.error('Admin registration failed', error.message, error.stack);
            return this.responseService.error(ERROR_MESSAGES.UNEXPECTED_ERROR, 500);
        }
    }

    /**
     * Registers a new user.
     * userData - The details of the user to be registered.
     * @returns An ApiResponse indicating the result of the registration operation.
     */
    async register(userData: RegisterDto): Promise<ApiResponse> {
        try {
            // Prevent registration of users with the role 'admin'
            if (userData.roleName === 'admin') {
                return this.responseService.error(ERROR_MESSAGES.REGISTER_NOT_ALLOWED, 403);
            }

            // Check if a user with the given email already exists
            const existingUser = await this.userRepository.findUser({ email: userData.email });
            if (existingUser) {
                return this.responseService.error(ERROR_MESSAGES.USER_ALREADY_EXISTS, 409);
            }

            // Register the new user
            const user = await this.authRepository.register(userData);
            if (typeof user === 'string') {
                return this.responseService.error(user);
            }
            return this.responseService.success(SUCCESS_MESSAGES.USER_CREATED_SUCCESSFULLY, 201, user);
        } catch (error) {
            this.logger.error('User registration failed', error.message, error.stack);
            return this.responseService.error(ERROR_MESSAGES.UNEXPECTED_ERROR, 500);
        }
    }

    /**
     * Logs in a user and generates an access token.
     * loginData - The login credentials (email and password) for authentication.
     * @returns An ApiResponse with the login result and access token if successful.
     */
    async login(loginData: LoginDto): Promise<ApiResponse> {
        try {
            const { email, password } = loginData;

            // Find the user by email
            const existingUser = await this.userRepository.findUser({ email });
            if (!existingUser) {
                return this.responseService.error(ERROR_MESSAGES.USER_NOT_FOUND, 404);
            }

            // Check if the user account is active
            if (!existingUser.isActive) {
                return this.responseService.error(ERROR_MESSAGES.USER_INACTIVE, 400);
            }

            // Verify the provided password
            const isPasswordValid = await bcrypt.compare(password, existingUser.password);
            if (!isPasswordValid) {
                return this.responseService.error(ERROR_MESSAGES.INVALID_CREDENTIALS, 401);
            }

            // Prepare the user object excluding sensitive data
            const { password: _, isActive, deletedAt,refreshToken,...userWithoutSensitiveData } = existingUser;

         
            const payload = { id: existingUser.id, role: existingUser.roles[0].roleName };

            const accessToken = await this.generateToken(payload, '60m');
            return this.responseService.success(SUCCESS_MESSAGES.USER_LOGIN_SUCCESSFULLY, 200, { user: userWithoutSensitiveData, accessToken });
        } catch (error) {
            this.logger.error('Login failed', error.message, error.stack);
            return this.responseService.error(ERROR_MESSAGES.UNEXPECTED_ERROR, 500);
        }
    }

    /**
     * Generates a JWT token.
     * @param payload - The payload to be encoded in the JWT token.
     * @param expiresIn - The expiration time of the token (e.g., '60m').
     * @returns The generated JWT token as a string.
     */
    private async generateToken(payload: object, expiresIn: string): Promise<string> {
        try {
            return this.jwt.signAsync(payload, {
                secret: this.config.get<string>('JWT_SECRET'),
                expiresIn,
            });
        } catch (error) {
            this.logger.error('Token generation failed', error.message, error.stack);
            throw new InternalServerErrorException('Failed to generate token');
        }
    }
}
