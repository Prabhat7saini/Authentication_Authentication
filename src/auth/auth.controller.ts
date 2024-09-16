import { Body, Controller, Post, Req, UseGuards } from '@nestjs/common';
import { AuthService } from './auth.service';
import { AdminSignUpDto, ChangePasswordDto, LoginDto, RegisterDto } from './dto/authDto';
import { ApiResponse } from 'src/utils/responses/api-response.dto';
import { AuthenticationGuard } from './guard/authenticaton.guard';
import { CustomRequest } from 'src/utils/interface/type';

@Controller({ path: 'auth', version: '1' })
export class AuthController {
    constructor(private readonly authService: AuthService) { }

    /**
     * Endpoint for admin user registration.
     * adminUser - Data transfer object containing admin registration details.
     * @returns ApiResponse - The response from the authService containing the result of the registration.
     */
    @Post(`/signup/admin`)
    async adminRegister(@Body() adminUser: AdminSignUpDto): Promise<ApiResponse> {
        return this.authService.adminRegister(adminUser);
    }

    /**
     * Endpoint for user login.
     * loginData - Data transfer object containing login credentials.
     * @returns ApiResponse - The response from the authService containing the result of the login attempt.
     */
    @Post('/login')
    async login(@Body() loginData: LoginDto): Promise<ApiResponse> {
        return this.authService.login(loginData);
    }

    /**
     * Endpoint for user registration.
     *  userData - Data transfer object containing user registration details.
     * @returns ApiResponse - The response from the authService containing the result of the registration.
     */
    @Post(`/signUp`)
    async Register(@Body() userData: RegisterDto): Promise<ApiResponse> {
        return this.authService.register(userData);
    }

    @UseGuards(AuthenticationGuard)
    @Post(`/change-password`)
    async changePassword(@Req() req: CustomRequest, @Body() userData: ChangePasswordDto): Promise<ApiResponse> {
        return this.authService.changePassword(req, userData);
    }
}
