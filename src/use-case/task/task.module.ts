import { Module } from '@nestjs/common';
import { TaskService } from './task.service';
import { LeaderboardModule } from '../leaderboard/leaderboard.module';
import { SnapshotService } from './snapshot.service';

@Module({
  imports: [LeaderboardModule],
  providers: [TaskService, SnapshotService],
  exports: [TaskService],
})
export class TaskModule {}
