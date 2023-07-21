import { ExecutionContext } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { AuthService } from './auth.service';
export declare class AuthGuard {
    private readonly jwt;
    private readonly authService;
    constructor(jwt: JwtService, authService: AuthService);
    canActivate(context: ExecutionContext): void;
}
