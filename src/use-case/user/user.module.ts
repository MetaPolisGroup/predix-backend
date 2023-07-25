import { Module } from '@nestjs/common';
import { UserAuthenService } from './user-authen.service';
import { UserController } from 'src/controller/user.controller';

@Module({
  controllers: [UserController],
  providers: [UserAuthenService],
  imports: [],
  exports: [UserAuthenService],
})
export class UserModule {}
