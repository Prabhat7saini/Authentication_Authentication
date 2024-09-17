// src/constants/messages.ts

export const ERROR_MESSAGES = {
    REQUIRED_ID_OR_EMAIL: 'Either email or id is required',
    DATABASE_ERROR: 'An error occurred while retrieving the user',
    UNEXPECTED_ERROR_CREATE_USER: 'An unexpected error occurred while retrieving the user',
    USER_ALREADY_EXISTS: 'A user with this email already exists',
    USER_CREATION_FAILED: 'An unexpected error occurred while creating the user',
    USER_UPDATE_FAILED: 'An unexpected error occurred while updating the user',
    USER_FETCH_FAILED: 'Unable to fetch users at the moment. Please try again later.',
    USER_NOT_FOUND: 'User not found',
    ID_REQUIRED: 'Id is required',
    USER_DELETION_FAILED: 'An unexpected error occurred while deleting the user',
    USER_NOT_FOUND_BY_ID: (id: string) => `User with id ${id} not found`,
    UNEXPECTED_ERROR: 'An unexpected error occurred',
    INVALID_CREDENTIALS: 'Invalid credentials',
    TOKEN_NOT_FOUND: 'Token not found',
    USER_INACTIVE:"Your account is inactive. Please contact support or reactivate your account.",
    ROLE_REQUIRED:"Role is required",
    ROLE_ALREADY_EXISTS: 'Role already exists',
    NOT_FOUND_OR_INACTIVE: (id: string) => `User with id ${id} not found or already inactive`,
    NOT_FOUND_OR_ACTIVE: (id: string) => `User with id ${id} not found or already active`,
    ADMIN_UPDATE_NOT_ALLOWED:"You are not allowed to update admin",
    REGISTER_NOT_ALLOWED: 'You are not allowed to register as an admin.',
    ROLE_NOT_FOUND_ERROR: (roleName: string) => `Role with name ${roleName} not found`,
    INVALID_OLD_PASSWORD:"The password for the user is invalid",
    PASSWORDS_DO_NOT_MATCH:"The passwords for the user password and confirm password are not the same",
    NOT_ALLOWED_TO_UPDATE_INACTIVE_USER:"`You are not update the user details because the user are not active`"

};

export const SUCCESS_MESSAGES = {
    USER_CREATED_SUCCESSFULLY: 'User created successfully',
    USER_UPDATED_SUCCESSFULLY: 'User updated successfully',
    USER_DELETED_SUCCESSFULLY: 'User successfully deleted',
    USER_FETCHED_SUCCESSFULLY: 'User successfully fetched',
    USER_LOGIN_SUCCESSFULLY: 'User Login Successfully',
    ROLE_CREATED_SUCCESSFULLY: 'Role created successfully',
    USERS_FETCHED_SUCCESSFULLY:"Users successfully fetched",
    USER_DEACTIVATED:"USER DEACTIVATED successfully",
    USER_ACTIVATED:"USER ACTIVATED successfully", 
    PASSWORD_CHANGED:"User Password Change successfully",
};
