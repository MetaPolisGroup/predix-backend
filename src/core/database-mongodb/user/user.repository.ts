import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { BaseRepository } from '../base.repository';
import { IUser } from './user.schema';

@Injectable()
export class UserRepository extends BaseRepository<IUser> {
  constructor(
    @InjectModel('users')
    private readonly usersModel: Model<IUser>,
  ) {
    super(usersModel);
  }
}
