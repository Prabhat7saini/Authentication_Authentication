import { Repository } from 'typeorm';
import { User } from '../entities/user.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { ERROR_MESSAGES, SUCCESS_MESSAGES } from '../../utils/constants/message';
import { UpdateUserDto } from '../dto/userDto';

export class UserRepository extends Repository<User> {
    // Define the number of salt rounds for password hashing
    private readonly saltRounds = 10;

    constructor(
        @InjectRepository(User)
        private userRepository: Repository<User>,
    ) {
        super(
            userRepository.target,
            userRepository.manager,
            userRepository.queryRunner,
        );
    }

    //  Finds a user by email or ID.
    async findUser({ email, id }: { email?: string, id?: string }): Promise<User | null> {
        // Ensure either email or id is provided
        if (!email && !id) {
            throw new Error(ERROR_MESSAGES.REQUIRED_ID_OR_EMAIL);
        }

        // Define the query object with relations to include
        const query: { where: { email?: string; id?: string }, relations: string[] } = { where: {}, relations: ['roles'] };

        // Add email or id to the query object if provided
        if (email) {
            query.where.email = email;
        }
        if (id) {
            query.where.id = id;
        }

        try {
            // Find the user based on the query
            const user = await this.userRepository.findOne(query);
            console.log(user, "find user");

            return user || null;
        } catch (error) {
            if (error.code) {
                console.error('Database error:', error);
                throw new Error(ERROR_MESSAGES.DATABASE_ERROR);
            } else {
                console.error('Unexpected error:', error);
                throw new Error(ERROR_MESSAGES.UNEXPECTED_ERROR);
            }
        }
    }

    /**
     * Updates a user's details.
     * @param {string} id - ID of the user to update.
     * userData - Data to update the user with.
     *  - Returns the updated user.
     */
    async updateUser(id: string, userData: UpdateUserDto): Promise<User> {
        // Ensure the user ID is provided
        if (!id) {
            throw new Error(ERROR_MESSAGES.REQUIRED_ID_OR_EMAIL);
        }

        // Find the user by ID
        const user = await this.findUser({ id });
        if (!user) {
            throw new Error(ERROR_MESSAGES.USER_NOT_FOUND);
        }

        try {
            await this.userRepository.update(id, userData);
            const updatedUser = await this.findUser({ id });
            if (!updatedUser) {
                throw new Error(ERROR_MESSAGES.UNEXPECTED_ERROR);
            }
            return updatedUser;
        } catch (error) {
            throw new Error(ERROR_MESSAGES.USER_UPDATE_FAILED);
        }
    }

    /**
     * Soft deletes a user by setting the `deletedAt` field.
     */
    async softDeleteUser(id: string): Promise<Boolean> {
        try {
            // Execute the soft delete by updating the `deletedAt` field
            const result = await this.userRepository.createQueryBuilder()
                .update(User)
                .set({ deletedAt: new Date() })
                .where('id = :id AND deletedAt IS NULL', { id })
                .execute();

            if (result.affected === 0) {
                console.warn(`User with ID ${id} not found or already deleted.`);
                return false;
            }

            return true;
        } catch (error) {
            console.error('Error during soft delete operation:', error);
            return false;
        }
    }
}
