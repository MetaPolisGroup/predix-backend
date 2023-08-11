import { Module } from '@nestjs/common';
import { databaseProviders } from './database.provider';
import { MongooseModule } from '@nestjs/mongoose';
import { UserRepository } from './user/user.repository';
import { PreferencesRepository } from './preferences/preferences.repository';
import { PredictionRepository } from './prediction/prediction.repository';
import { LeaderboardRepository } from './leaderboard/leaderboard.repository';
import { ChartRepository } from './chart/chart.repository';
import { BetRepository } from './bet/bet.repository';
import { ChainlinkRepository } from './chain-link/chain-link.repository';
import { UserMongoModule } from './user/user.module';
import { PreferencesMongoModule } from './preferences/preferences.module';
import { PredictionMongoModule } from './prediction/prediction.module';
import { LeaderboardMongoModule } from './leaderboard/leaderboard.module';
import { ChartMongoModule } from './chart/chart.module';
import { BetMongoModule } from './bet/bet.module';
import { ChainlinkMongoModule } from './chain-link/chain-link.module';

@Module({
  providers: [
    ...databaseProviders,
    UserMongoModule,
    PreferencesMongoModule,
    PredictionMongoModule,
    LeaderboardMongoModule,
    ChartMongoModule,
    BetMongoModule,
    ChainlinkMongoModule,
  ],
  exports: [
    ...databaseProviders,
    UserMongoModule,
    PreferencesMongoModule,
    PredictionMongoModule,
    LeaderboardMongoModule,
    ChartMongoModule,
    BetMongoModule,
    ChainlinkMongoModule,
  ],
})
export class DatabaseModule {}
