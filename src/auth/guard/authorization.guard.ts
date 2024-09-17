import { CanActivate, ExecutionContext, ForbiddenException, Injectable } from "@nestjs/common";
import { Reflector } from "@nestjs/core";
import { Observable } from "rxjs";
import { ROLES_KEY } from "../../utils/decorators/roles.decorator";
import { ERROR_MESSAGES } from "../../utils/constants/message";

@Injectable()
export class AuthorizationGuard implements CanActivate {
    constructor(private readonly reflection: Reflector) { }
    canActivate(context: ExecutionContext): boolean | Promise<boolean> | Observable<boolean> {
        try {
            const request = context.switchToHttp().getRequest();
            // console.log(`request: ${request.user.role}`)
            const requiredRole = this.reflection.get(ROLES_KEY, context.getHandler());
          

            if (requiredRole !== request.user.role) {
                throw new ForbiddenException(ERROR_MESSAGES.ACCESS_DENIED)
            }

            return true
        } catch (error) {
            // console.log(`error in side the user authorization`, error.message);
            throw error;
        }

    }
}