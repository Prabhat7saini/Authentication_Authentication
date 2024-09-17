import { CanActivate, ExecutionContext, Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import { Observable } from 'rxjs';

@Injectable()
export class AuthenticationGuard implements CanActivate {
  constructor(
    private jwtService: JwtService,
    private readonly config: ConfigService,
  ) {}

  canActivate(
    context: ExecutionContext,
  ): boolean | Promise<boolean> | Observable<boolean> {
    try {
      // console.log(`in side the authentication guard service`)
      const JWT_SECRET = this.config.get<string>('JWT_SECRET');
      const request = context.switchToHttp().getRequest();
      const token = request.headers.authorization?.split(' ')[1];
      if (!token) {
        return false;
      }

      const payload = this.jwtService.verify(token, { secret: JWT_SECRET });
      request.user = payload;
      return true;
    } catch (error) {
      return false;
    }
  }
}
