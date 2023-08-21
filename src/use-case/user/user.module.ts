import { Module } from '@nestjs/common';
import { UserAuthenService } from './user-authen.service';
import { UserController } from 'src/controller/user.controller';
import { UserService } from './user.service';
import { UserHandleMoney } from './user-handle-money.service';
import { DatabaseModule } from 'src/framework/database-mongodb/database.module';

@Module({
  controllers: [UserController],
  providers: [UserAuthenService, UserService, UserHandleMoney],
  imports: [DatabaseModule],
  exports: [UserAuthenService, UserHandleMoney],
})
export class UserModule {}
