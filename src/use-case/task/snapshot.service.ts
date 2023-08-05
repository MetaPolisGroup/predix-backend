import { Injectable, OnApplicationBootstrap } from '@nestjs/common';
import { LeaderboardService } from '../leaderboard/leader.service';

@Injectable()
export class SnapshotService implements OnApplicationBootstrap {
  constructor(private readonly leaderboardService: LeaderboardService) {}

  onApplicationBootstrap() {
    this.leaderboardService.listenLeaderboard();
  }
}
