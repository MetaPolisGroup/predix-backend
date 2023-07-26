import { Injectable } from '@nestjs/common';
import { IDataServices } from 'src/core/abstract/data-services/data-service.abstract';

@Injectable()
export class LeaderboardService {
  constructor(private readonly db: IDataServices) {}

  async updateLeaderboard(round: string) {
    const betslips = await this.db.betRepo.getCollectionDataByConditions([{ field: 'epoch', operator: '==', value: round }]);
    for (const betslip of betslips) {
      const user = await this.db.userRepo.getFirstValueCollectionDataByConditions([
        { field: 'user_address', operator: '==', value: betslip.user_address },
      ]);
      if (user) {
        user.leaderboard.round_played += 1;
        if (betslip.status === 'Win') {
          user.leaderboard.round_winning += 1;
          user.leaderboard.net_winnings += betslip.amount;
        } else if (betslip.status === 'Lose') {
          user.leaderboard.net_winnings -= betslip.amount;
        }
        user.leaderboard.win_rate = (user.leaderboard.round_winning / user.leaderboard.round_played) * 100;
      }
      await this.db.userRepo.upsertDocumentData(user.id, user);
    }
  }

  async winRate() {
    const users = await this.db.userRepo.getCollectionDataByConditions([{ field: 'leaderboard.win_rate', operator: '' }]);
    const user_lists = [];
    for (const user of users) {
      const leaderboard = {
        user_id: user.id,
        leaderboard: user.leaderboard,
      };
      user_lists.push(leaderboard);
    }

    await this.db.leaderboardRepo.upsertDocumentData('Total BNB', {
      user_lists,
      type: 'Total BNB',
      id: 'Total BNB',
      updated_at: new Date().getTime(),
    });
    await this.db.leaderboardRepo.upsertDocumentData('Win Rate', {
      user_lists,
      type: 'Win Rate',
      id: 'Win Rate',
      updated_at: new Date().getTime(),
    });
    await this.db.leaderboardRepo.upsertDocumentData('Round Played', {
      user_lists,
      type: 'Round Played',
      id: 'Round Played',
      updated_at: new Date().getTime(),
    });
    await this.db.leaderboardRepo.upsertDocumentData('Net Winnings', {
      user_lists,
      type: 'Net Winnings',
      id: 'Net Winnings',
      updated_at: new Date().getTime(),
    });
  }
}
