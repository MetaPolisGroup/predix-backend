import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';

import { User, IUserToken } from 'src/core/entity/user.enity';

@Injectable()
export class AuthService {
    constructor(private readonly jwt: JwtService) {}

    async validateToken(req: Request) {
        const token = req.headers['authorization'] as string;
        const verify = await this.jwt.verifyAsync<IUserToken>(token);
        if (verify) {
            let user: User;

            if (user) {
                if (user.id == verify.id && user.nickname == verify.nickname) {
                    return true;
                } else {
                    throw new UnauthorizedException('Token is wrong');
                }
            } else {
                throw new UnauthorizedException('Token is wrong');
            }
        } else {
            throw new UnauthorizedException('Token is wrong');
        }
    }

    generateAccessTokenUser(id: string, nickname: string) {
        const token: IUserToken = {
            id,
            nickname,
        };
        return this.jwt.sign(token);
    }
}
