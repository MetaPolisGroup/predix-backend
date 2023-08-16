import { BaseRepository } from 'src/framework/database-mongodb/base.repository';
import { BetMongo } from 'src/core/schema/bet.schema';
import { UserMongo } from 'src/core/schema/user.schema';
import { PreferenceMongo } from 'src/core/schema/preferences.schema';
import { ChartMongo } from 'src/core/schema/chart.schema';
import { ChainlinkMongo } from 'src/core/schema/chain-link.schema';
import { LeaderboardMongo } from 'src/core/schema/leaderboard.schema';
import { PredictionMongo } from 'src/core/schema/prediction.schema';

export abstract class IMongoDbServices {
  // Mongo
  abstract userMongoRepo: BaseRepository<UserMongo>;

  abstract betMongoRepo: BaseRepository<BetMongo>;

  abstract preferenceMongoRepo: BaseRepository<PreferenceMongo>;

  abstract chartMongoRepo: BaseRepository<ChartMongo>;

  abstract chainlinkMongoRepo: BaseRepository<ChainlinkMongo>;

  abstract leaderboardMongoRepo: BaseRepository<LeaderboardMongo>;

  //  Games
  abstract predictionMongoRepo: BaseRepository<PredictionMongo>;
}
