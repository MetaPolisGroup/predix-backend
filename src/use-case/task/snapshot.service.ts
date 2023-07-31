import { Injectable, OnApplicationBootstrap } from '@nestjs/common';
import { IDataServices } from 'src/core/abstract/data-services/data-service.abstract';
import { LeaderboardService } from '../leaderboard/leader.service';

@Injectable()
export class SnapshotService implements OnApplicationBootstrap {
  constructor(private readonly leaderboardService: LeaderboardService) {}

  onApplicationBootstrap() {
    this.leaderboardService.listenLeaderboard();
  }
}
