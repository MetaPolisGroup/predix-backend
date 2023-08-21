import { Injectable, OnApplicationBootstrap } from '@nestjs/common';
import { IMongoDbServices } from 'src/core/abstract/data-services/data-mongodb-service.abstract';
import { BaseRepository } from './base.repository';
import { UserMongo } from '../../core/schema/user.schema';
import { BetMongo } from '../../core/schema/bet.schema';
import { PreferenceMongo } from '../../core/schema/preferences.schema';
import { ChartMongo } from '../../core/schema/chart.schema';
import { ChainlinkMongo } from '../../core/schema/chain-link.schema';
import { LeaderboardMongo } from '../../core/schema/leaderboard.schema';
import { PredictionMongo } from '../../core/schema/prediction.schema';
import { InjectModel } from '@nestjs/mongoose';
import constant from 'src/configuration';
import { Model } from 'mongoose';

@Injectable()
export class MongoDbDataServices implements IMongoDbServices {
  userMongoRepo: BaseRepository<UserMongo>;

  betMongoRepo: BaseRepository<BetMongo>;

  preferenceMongoRepo: BaseRepository<PreferenceMongo>;

  chartMongoRepo: BaseRepository<ChartMongo>;

  chainlinkMongoRepo: BaseRepository<ChainlinkMongo>;

  leaderboardMongoRepo: BaseRepository<LeaderboardMongo>;

  predictionMongoRepo: BaseRepository<PredictionMongo>;

  constructor(
    @InjectModel(constant.FIREBASE.COLLECTIONS.USERS)
    private userRepo: Model<UserMongo>,
    @InjectModel(constant.FIREBASE.COLLECTIONS.BETS)
    private betsRepo: Model<BetMongo>,
    @InjectModel(constant.FIREBASE.COLLECTIONS.PREFERENCES)
    private preferenceRepo: Model<PreferenceMongo>,
    @InjectModel(constant.FIREBASE.COLLECTIONS.PREDICTIONS)
    private predictionRepo: Model<PredictionMongo>,
    @InjectModel(constant.FIREBASE.COLLECTIONS.CHARTS)
    private chartRepo: Model<ChartMongo>,
    @InjectModel(constant.FIREBASE.COLLECTIONS.CHAINLINKS)
    private chainlinkRepo: Model<ChainlinkMongo>,
    @InjectModel(constant.FIREBASE.COLLECTIONS.LEADERBOARD)
    private leaderboardRepo: Model<LeaderboardMongo>,
  ) {
    this.userMongoRepo = new BaseRepository<UserMongo>(this.userRepo);

    this.betMongoRepo = new BaseRepository<BetMongo>(this.betsRepo);

    this.preferenceMongoRepo = new BaseRepository<PreferenceMongo>(this.preferenceRepo);

    this.chartMongoRepo = new BaseRepository<ChartMongo>(this.chartRepo);

    this.chainlinkMongoRepo = new BaseRepository<ChainlinkMongo>(this.chainlinkRepo);

    this.leaderboardMongoRepo = new BaseRepository<LeaderboardMongo>(this.leaderboardRepo);

    this.predictionMongoRepo = new BaseRepository<PredictionMongo>(this.predictionRepo);
  }
}
