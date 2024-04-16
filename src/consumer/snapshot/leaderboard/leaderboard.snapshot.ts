import { Injectable, OnApplicationBootstrap } from '@nestjs/common';
import { LeaderboardService } from '../../../use-case/leaderboard/leader.service';
import { IDataServices } from 'src/core/abstract/data-services/data-service.abstract';

@Injectable()
export class LeaderboardSnapshotService implements OnApplicationBootstrap {
    constructor(
        private readonly leaderboardService: LeaderboardService,
        private readonly db: IDataServices,
    ) {}

    onApplicationBootstrap() {
        // this.listenLeaderboard();
    }

    listenLeaderboard() {
        const now = parseInt((new Date().getTime() / 1000).toString());
        this.db.predictionRepo.listenToChangesWithConditionsAndOrderBy(
            [
                { field: 'closed', operator: '==', value: true },
                { field: 'closeTimestamp', operator: '>=', value: now },
            ],
            [],
            async matches => {
                for (const match of matches) {
                    if (match.type === 'added') {
                        await this.leaderboardService.updateLeaderboard(match.doc.epoch);
                        await this.leaderboardService.winRate();
                        await this.leaderboardService.roundPlayed();
                        await this.leaderboardService.netWinnings();
                        await this.leaderboardService.totalBnb();
                    }
                }
            },
        );
    }
}
