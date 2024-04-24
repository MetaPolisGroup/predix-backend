import { Module } from '@nestjs/common';
import { UserAuthenService } from './user-authen.service';
import { UserController } from 'src/controller/user.controller';
import { BotUserService } from './bot/bot-user.service';
import { FaucetModule } from '../faucet/faucet.module';
import { UserUsecaseService } from './user.service';

@Module({
    controllers: [UserController],
    providers: [UserAuthenService, UserUsecaseService, BotUserService],
    imports: [FaucetModule],
    exports: [UserAuthenService, BotUserService, UserUsecaseService],
})
export class UserModule {}
