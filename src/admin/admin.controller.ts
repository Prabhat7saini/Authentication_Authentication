import { Body, Controller, Get, Param, Patch, Post, UseGuards } from '@nestjs/common';
import { AdminService } from './admin.service';
import { AuthorizationGuard } from '../auth/guard/authorization.guard';
import { AuthenticationGuard } from '../auth/guard/authenticaton.guard';
import { Role } from '../utils/decorators/roles.decorator';
import { ApiResponse } from '../utils/responses/api-response.dto';
import { UpdateUserDto } from '../user/dto/userDto';

/**
 * Controller for handling administrative actions.
 * Includes endpoints for creating roles, managing users, and retrieving user information.
 */
@Controller({ path: 'admin', version: '1' })
export class AdminController {
    constructor(private readonly adminService: AdminService) { }

    /**
     * Endpoint to create a new role.
     * Requires admin authentication and authorization.
     *  role The role to be created.
     * @returns An ApiResponse indicating success or failure.
     */
    @Role('admin')
    @UseGuards(AuthenticationGuard, AuthorizationGuard)
    @Post(`/createRole`)
    async createRoles(@Body() data: { role: string }): Promise<ApiResponse> {
        return this.adminService.createRoles(data.role);
    }

    /**
     * Endpoint to retrieve all users.
     * Requires admin authentication and authorization.
     * @returns An ApiResponse containing a list of all users.
     */
    @Role('admin')
    @UseGuards(AuthenticationGuard, AuthorizationGuard)
    @Get('/getAllUsers')
    async getAllUsers(): Promise<ApiResponse> {
        return this.adminService.getAllUsers();
    }

    /**
     * Endpoint to deactivate a user by their ID.
     * Requires admin authentication and authorization.
     *  data Contains the ID of the user to be deactivated.
     * @returns An ApiResponse indicating success or failure.
     */
    @Role('admin')
    @UseGuards(AuthenticationGuard, AuthorizationGuard)
    @Patch(`/:id/deactivateUser`)
    async deactivateUser(@Param() data: { id: string }): Promise<ApiResponse> {
        const id = data.id;
        return this.adminService.deactivateUser(id);
    }

    /**
     * Endpoint to activate a user by their ID.
     * Requires admin authentication and authorization.
     *  data Contains the ID of the user to be activated.
     * @returns An ApiResponse indicating success or failure.
     */
    @Role('admin')
    @UseGuards(AuthenticationGuard, AuthorizationGuard)
    @Patch(`/:id/activateUser`)
    async activateUser(@Param() data: { id: string }): Promise<ApiResponse> {
        const id = data.id;
        return this.adminService.activateUser(id);
    }

    /**
     * Endpoint for an admin to update user details.
     * Requires admin authentication and authorization.
     *  data Contains the ID of the user to be updated.
     *  userData The new user data to be applied.
     * @returns An ApiResponse indicating success or failure.
     */
    @Role('admin')
    @UseGuards(AuthenticationGuard, AuthorizationGuard)
    @Patch(`/:id/updateUserByadmin`)
    async updateUserByAdmin(@Param() data: { id: string }, @Body() userData: UpdateUserDto): Promise<ApiResponse> {
        const id = data.id;
        return this.adminService.updateUserByAdmin(id, userData);
    }

    /**
     * Endpoint to retrieve a specific user by their ID.
     * Requires admin authentication and authorization.
     * data Contains the ID of the user to be retrieved.
     * @ An ApiResponse containing the user details.
     */
    @Role('admin')
    @UseGuards(AuthenticationGuard, AuthorizationGuard)
    @Get(`/:id/getUser`)
    async getUser(@Param() data: { id: string }): Promise<ApiResponse> {
        const id = data.id;
        return this.adminService.getUser(id);
    }
}
