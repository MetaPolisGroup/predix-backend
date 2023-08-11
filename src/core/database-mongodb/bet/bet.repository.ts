import { Injectable } from '@nestjs/common';
import { BaseRepository } from '../base.repository';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { IBet } from './bet.schema';

@Injectable()
export class BetRepository extends BaseRepository<IBet> {
  constructor(@InjectModel('bets') private readonly betModel: Model<IBet>) {
    super(betModel);
  }
}
