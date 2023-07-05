import { Injectable, UnauthorizedException } from "@nestjs/common";
import { JwtService } from "@nestjs/jwt";
import { User } from "src/core/schema/user.schema";
import { IUserToken } from "src/core/interface/user/user.interface";

@Injectable()
export class AuthService {
  constructor(private readonly jwt: JwtService) {}

  async validateToken(req: Request) {
    const token = req.headers["authorization"] as string;
    const verify = await this.jwt.verifyAsync<IUserToken>(token);
    if (verify) {
      let user: User;

      if (user) {
        if (user.id == verify.id && user.nickname == verify.nickname) {
          delete user.password;
          return true;
        } else {
          throw new UnauthorizedException("Token is wrong");
        }
      } else {
        throw new UnauthorizedException("Token is wrong");
      }
    } else {
      throw new UnauthorizedException("Token is wrong");
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
