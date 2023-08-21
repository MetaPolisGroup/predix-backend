import { Module } from '@nestjs/common';
import { databaseProviders } from './database.provider';
import { MongooseModule } from '@nestjs/mongoose';
import { IMongoDbServices } from 'src/core/abstract/data-services/data-mongodb-service.abstract';
import { MongoDbDataServices } from './mongodb-dataservices';
import { UserSchema } from '../../core/schema/user.schema';
import constant from 'src/configuration';
import { PredictionSchema } from '../../core/schema/prediction.schema';
import { BetSchema } from '../../core/schema/bet.schema';
import { PreferencesSchema } from '../../core/schema/preferences.schema';
import { LeaderboardSchema } from '../../core/schema/leaderboard.schema';
import { ChainLinkSchema } from '../../core/schema/chain-link.schema';
import { ChartSchema } from '../../core/schema/chart.schema';

@Module({
  imports: [
    MongooseModule.forFeature([
      {
        name: constant.FIREBASE.COLLECTIONS.USERS,
        schema: UserSchema,
      },
      {
        name: constant.FIREBASE.COLLECTIONS.BETS,
        schema: BetSchema,
      },
      {
        name: constant.FIREBASE.COLLECTIONS.PREFERENCES,
        schema: PreferencesSchema,
      },
      {
        name: constant.FIREBASE.COLLECTIONS.LEADERBOARD,
        schema: LeaderboardSchema,
      },
      {
        name: constant.FIREBASE.COLLECTIONS.CHAINLINKS,
        schema: ChainLinkSchema,
      },
      {
        name: constant.FIREBASE.COLLECTIONS.CHARTS,
        schema: ChartSchema,
      },
      {
        name: constant.FIREBASE.COLLECTIONS.PREDICTIONS,
        schema: PredictionSchema,
      },
    ]),
  ],
  providers: [
    ...databaseProviders,

    {
      provide: IMongoDbServices,
      useClass: MongoDbDataServices,
    },
  ],
  exports: [...databaseProviders, IMongoDbServices],
})
export class DatabaseModule {}
