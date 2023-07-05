import { Module } from "@nestjs/common";
import { JwtModule } from "@nestjs/jwt";
import { AuthService } from "./auth.service";
import { AuthGuard } from "./auth.guard";

@Module({
  controllers: [],
  providers: [AuthService, AuthGuard],
  imports: [JwtModule.register({ global: true, secret: "ponzi" })],
  exports: [AuthService, AuthGuard],
})
export class AuthModule {}
