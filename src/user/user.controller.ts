import { Body, Controller, Delete, Patch, Req, UseGuards } from '@nestjs/common';
import { UserService } from './user.service';
import { ApiResponse } from '../utils/responses/api-response.dto';
import { AuthenticationGuard } from '../auth/guard/authenticaton.guard';
import { CustomRequest } from '../utils/interface/type';
import { UpdateUserDto } from './dto/userDto';

/**
 * Controller to manage user-related operations.
 * @version 1
 */
@Controller({ path: 'user', version: '1' })
export class UserController {
    constructor(private userService: UserService) { }

    /**
     * Endpoint to update user information.
     * @returns A promise that resolves to an ApiResponse indicating the result of the update operation.
     */
    @UseGuards(AuthenticationGuard)
    @Patch('/updateUser')
    async updateUser(@Req() req: CustomRequest, @Body() data: UpdateUserDto): Promise<ApiResponse> {
        // Extract user ID from the request object
        const id = req.user.id;
        return this.userService.updateUser(id, data);
    }

    /**
     * Endpoint to soft delete a user.
     * @returns A promise that resolves to an ApiResponse indicating the result of the delete operation.
     */
    @UseGuards(AuthenticationGuard)
    @Delete('/delete')
    async deleteUser(@Req() req: CustomRequest): Promise<ApiResponse> {
        return await this.userService.softDeleteUser(req);
    }
}
