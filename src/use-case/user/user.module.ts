import { Module } from '@nestjs/common';
import { UserAuthenService } from './user-authen.service';
import { UserController } from 'src/controller/user.controller';
import { UserService } from './user.service';
import { UserHandleMoney } from './user-handle-money.service';

@Module({
  controllers: [UserController],
  providers: [UserAuthenService, UserService, UserHandleMoney],
  imports: [],
  exports: [UserAuthenService, UserHandleMoney],
})
export class UserModule { }
