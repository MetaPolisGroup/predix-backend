import { Module } from '@nestjs/common';
import { ChainlinkTaskService } from './chainlink-task.service';
import { LeaderboardModule } from '../leaderboard/leaderboard.module';
import { SnapshotService } from './snapshot.service';
import { PredictionTaskService } from './prediction-task.service';

@Module({
  imports: [LeaderboardModule],
  providers: [ChainlinkTaskService, SnapshotService, PredictionTaskService],
  exports: [ChainlinkTaskService],
})
export class TaskModule {}
