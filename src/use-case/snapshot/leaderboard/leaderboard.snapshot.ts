import { Injectable, OnApplicationBootstrap } from '@nestjs/common';
import { LeaderboardService } from '../../leaderboard/leader.service';
import { IDataServices } from 'src/core/abstract/data-services/data-service.abstract';

@Injectable()
export class LeaderboardSnapshotService implements OnApplicationBootstrap {
  constructor(private readonly leaderboardService: LeaderboardService, private readonly db: IDataServices) { }

  onApplicationBootstrap() {
    this.listenLeaderboard();
  }

  listenLeaderboard() {
    this.db.predictionRepo.listenToChangesWithConditionsAndOrderBy([{ field: 'closed', operator: '==', value: true }], [], async matchs => {
      for (const match of matchs) {
        if (match.type === 'added') {
          await this.leaderboardService.updateLeaderboard(match.doc.epoch);
          await this.leaderboardService.winRate();
          await this.leaderboardService.roundPlayed();
          await this.leaderboardService.netWinnings();
          await this.leaderboardService.totalBnb();
        }
      }
    });
  }
}
