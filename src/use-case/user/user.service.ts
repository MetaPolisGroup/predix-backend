import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Request } from 'express';
import mongoose from 'mongoose';
import { User } from 'src/core/schema/user.schema';

@Injectable()
export class UserService {
  constructor(
    @InjectModel(User.name)
    private readonly user: mongoose.Model<User>,
  ) {}

  async create(data: User, req: Request): Promise<User> {
    data.ip = req.ip;
    data.created_at = new Date().getTime();
    data.updated_at = new Date().getTime();
    return this.user.create(data);
  }
}
