import { Module } from '@nestjs/common';
import { LeaderboardService } from './leader.service';

@Module({
  imports: [],
  providers: [LeaderboardService],
  controllers: [],
  exports: [LeaderboardService],
})
export class LeaderboardModule {}
