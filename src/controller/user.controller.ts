import { Body, Controller, Post, Req } from "@nestjs/common";
import { Request } from "express";
import { User } from "src/core/schema/user.schema";
import { UserService } from "src/use-case/user/user.service";

@Controller("user")
export class UserController {
  constructor(private readonly userService: UserService) {}

  @Post("/create")
  async create(@Body() data: User, @Req() req: Request) {
    return this.userService.create(data, req);
  }
}
