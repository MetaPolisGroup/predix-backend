import { JwtService } from '@nestjs/jwt';
export declare class AuthService {
    private readonly jwt;
    constructor(jwt: JwtService);
    validateToken(req: Request): Promise<boolean>;
    generateAccessTokenUser(id: string, nickname: string): string;
}
