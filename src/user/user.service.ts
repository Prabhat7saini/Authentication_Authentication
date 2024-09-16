import { Injectable, Req } from '@nestjs/common';
import { UserRepository } from './repo/user.repository';
import { UpdateUserDto } from './dto/userDto';
import { ApiResponse } from '../utils/responses/api-response.dto';
import { ResponseService } from '../utils/responses/ResponseService';
import { CustomRequest } from '../utils/interface/type';
import { ERROR_MESSAGES, SUCCESS_MESSAGES } from '../utils/constants/message';

@Injectable()
export class UserService {
    constructor(
        private readonly userRepository: UserRepository,
        private readonly responseService: ResponseService
    ) { }

    /**
     * Updates a user's information based on their ID.
     * @param id - The ID of the user to update.
     * userData - The updated user data.
     * @returns An ApiResponse indicating success or failure.
     */
    async updateUser(id: string, userData: UpdateUserDto): Promise<ApiResponse> {
        console.log(`Updating user with ID: ${id}`);

        try {

            await this.userRepository.updateUser(id, userData);

            return this.responseService.success(SUCCESS_MESSAGES.USER_UPDATED_SUCCESSFULLY,204);
        } catch (error) {
          
            console.error(`Error updating user with ID: ${id}`, error);
            return this.responseService.error(ERROR_MESSAGES.USER_UPDATE_FAILED, 500);
        }
    }

    /**
     * Soft deletes a user based on the ID extracted from the request.
     * @returns An ApiResponse indicating success or failure.
     */
    async softDeleteUser(@Req() req: CustomRequest): Promise<ApiResponse> {
        const id = req.user.id;



        try {
            // Attempt to soft delete the user in the repository.
            const result = await this.userRepository.softDeleteUser(id);

            if (!result) {
                return this.responseService.error(ERROR_MESSAGES.USER_DELETION_FAILED, 500);
            }

            return this.responseService.success(SUCCESS_MESSAGES.USER_DELETED_SUCCESSFULLY);
        } catch (error) {
         
            console.error('Error during soft delete:', error);
            return this.responseService.error(ERROR_MESSAGES.USER_DELETION_FAILED, 500);
        }
    }
}
