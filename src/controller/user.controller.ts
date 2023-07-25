import { Body, Controller, Param, Post, Req } from '@nestjs/common';
import { Request } from 'express';
import { CreateUserDto } from 'src/core/dtos/user/user.dto';
import { User } from 'src/core/entity/user.enity';
import { UserService } from 'src/use-case/user/user.service';

@Controller('user')
export class UserController {
  constructor(private readonly userService: UserService) {}

  @Post('/create/: id')
  async createByRef(@Body() dto: CreateUserDto, @Param('id') id: string, @Req() req: Request) {
    return this.userService.create(dto, req, id);
  }

  @Post('/create/')
  async create(@Body() dto: CreateUserDto, @Req() req: Request) {
    return this.userService.create(dto, req);
  }
}
