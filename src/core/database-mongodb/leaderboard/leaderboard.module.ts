import { Module } from '@nestjs/common';
import { LeaderboardRepository } from './leaderboard.repository';
import { MongooseModule } from '@nestjs/mongoose';
import { leaderboardSchema } from './leaderboard.schema';

@Module({
  imports: [
    MongooseModule.forFeature([
      {
        name: 'leaderboard',
        schema: leaderboardSchema,
      },
    ]),
  ],
  providers: [LeaderboardRepository],
  exports: [LeaderboardRepository],
})
export class LeaderboardMongoModule {}
