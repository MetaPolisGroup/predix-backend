import { Body, Controller, Get, Param, Post, Query, Req } from '@nestjs/common';
import { Request } from 'express';
import { ContractFactoryAbstract } from 'src/core/abstract/contract-factory/contract-factory.abstract';
import { FaucetDto } from 'src/core/dtos/user/faucet.dto';
import { CreateUserDto } from 'src/core/dtos/user/user.dto';
import { User } from 'src/core/entity/user.enity';
import { FaucetService } from 'src/use-case/faucet/faucet.service';
import { HelperService } from 'src/use-case/helper/helper.service';
import { UserAuthenService } from 'src/use-case/user/user-authen.service';

@Controller('user')
export class UserController {
    constructor(
        private readonly userAuthService: UserAuthenService,
        private readonly faucet: FaucetService,
        private readonly helper: HelperService,
        private readonly factory: ContractFactoryAbstract,
    ) {}

    @Post('/create')
    async createByRef(@Body() dto: CreateUserDto, @Req() req: Request) {
        return this.userAuthService.create(dto, req);
    }

    @Post('/faucet')
    async userFaucet(@Body() dto: FaucetDto) {
        const status = await this.faucet.drip(dto.address);
        if (status === 1) {
            return true;
        }
        return false;
    }
}
