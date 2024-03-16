import { Body, Controller, Get, Param, Post, Query, Req } from '@nestjs/common';
import { Request } from 'express';
import { ContractFactoryAbstract } from 'src/core/abstract/contract-factory/contract-factory.abstract';
import { FaucetDto } from 'src/core/dtos/user/faucet.dto';
import { CreateUserDto } from 'src/core/dtos/user/user.dto';
import { User } from 'src/core/entity/user.enity';
import { HelperService } from 'src/use-case/helper/helper.service';
import { UserAuthenService } from 'src/use-case/user/user-authen.service';
import { UserService } from 'src/use-case/user/user.service';

@Controller('user')
export class UserController {
  constructor(
    private readonly userAuthService: UserAuthenService,
    private readonly helper: HelperService,
    private readonly userService: UserService,
    private readonly factory: ContractFactoryAbstract
  ) { }

  @Post('/create')
  async createByRef(@Body() dto: CreateUserDto, @Req() req: Request) {
    return await this.userAuthService.create(dto, req);
  }

  @Post('/faucet')
  async faucet(@Body() dto: FaucetDto) {
    await this.helper.executeContract(this.factory.faucetContract, "drip", undefined, undefined, undefined, undefined, undefined, undefined, dto.address);
    return true
  }
}
