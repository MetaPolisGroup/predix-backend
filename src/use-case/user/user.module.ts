import { Module } from "@nestjs/common";
import { UserService } from "./user.service";

@Module({
  controllers: [],
  providers: [UserService],
  imports: [],
  exports: [UserService],
})
export class UserModule {}
