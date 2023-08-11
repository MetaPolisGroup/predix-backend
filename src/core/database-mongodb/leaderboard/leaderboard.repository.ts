import { Injectable } from '@nestjs/common';
import { BaseRepository } from '../base.repository';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { ILeaderboard } from './leaderboard.schema';

@Injectable()
export class LeaderboardRepository extends BaseRepository<ILeaderboard> {
  constructor(@InjectModel('leaderboard') private readonly leaderboardModel: Model<ILeaderboard>) {
    super(leaderboardModel);
  }
}
