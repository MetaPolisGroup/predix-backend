import { Module } from '@nestjs/common';
import { UserService } from './user.service';
import { UserController } from 'src/controller/user.controller';

@Module({
  controllers: [UserController],
  providers: [UserService],
  imports: [],
  exports: [UserService],
})
export class UserModule {}
