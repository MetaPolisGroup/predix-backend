import { Module } from "@nestjs/common";
import { UserService } from "./user.service";
import { MongooseModule } from "@nestjs/mongoose";
import { User, UserSchema } from "src/core/schema/user.schema";
import { UserController } from "src/controller/user.controller";

@Module({
  controllers: [UserController],
  providers: [UserService],
  imports: [MongooseModule.forFeature([{ name: "User", schema: UserSchema }])],
  exports: [UserService],
})
export class UserModule {}
