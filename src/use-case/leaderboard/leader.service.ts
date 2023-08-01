import { Injectable } from '@nestjs/common';
import constant from 'src/configuration';
import { IDataServices } from 'src/core/abstract/data-services/data-service.abstract';

@Injectable()
export class LeaderboardService {
  constructor(private readonly db: IDataServices) {}

  listenLeaderboard() {
    this.db.predictionRepo.listenToChangesWithConditionsOrigin([{ field: 'closed', operator: '==', value: true }], async matchs => {
      for (const match of matchs) {
        if (match.type === 'added') {
          await this.updateLeaderboard(match.doc.epoch);
        }
      }
    });
  }

  async updateLeaderboard(round: number) {
    const betslips = await this.db.betRepo.getCollectionDataByConditions([{ field: 'epoch', operator: '==', value: round }]);
    if (betslips) {
      for (const betslip of betslips) {
        const user = await this.db.userRepo.getFirstValueCollectionDataByConditions([
          { field: 'user_address', operator: '==', value: betslip.user_address },
        ]);
        if (user) {
          user.leaderboard.round_played += 1;
          if (betslip.status === 'Win') {
            user.leaderboard.round_winning += 1;
            user.leaderboard.total_amount += betslip.amount;
            user.leaderboard.net_winnings += betslip.winning_amount;
          } else if (betslip.status === 'Lose') {
            user.leaderboard.net_winnings -= betslip.amount;
            user.leaderboard.total_amount += betslip.amount;
          }
          user.leaderboard.win_rate = (user.leaderboard.round_winning / user.leaderboard.round_played) * 100;
          await this.db.userRepo.upsertDocumentData(user.id, user);
          await this.winRate();
          await this.roundPlayed();
          await this.netWinnings();
          await this.totalBnb();
        }
      }
    }
  }

  async winRate() {
    const users = await this.db.userRepo.getCollectionDataByConditionsOrderByStartAfterAndLimit(
      [],
      [
        {
          field: 'leaderboard.win_rate',
          option: 'desc',
        },
      ],
      null,
      200,
    );
    const user_lists = [];
    if (users) {
      for (const user of users) {
        const leaderboard = {
          user_id: user.id,
          nickname: user.nickname,
          leaderboard: user.leaderboard,
        };
        user_lists.push(leaderboard);
      }

      await this.db.leaderboardRepo.upsertDocumentData(constant.LEADERBOARD.WIN_RATE, {
        user_lists,
        type: constant.LEADERBOARD.WIN_RATE,
        id: constant.LEADERBOARD.WIN_RATE,
        updated_at: new Date().getTime(),
      });
    }
  }

  async roundPlayed() {
    const users = await this.db.userRepo.getCollectionDataByConditionsAndOrderBy(
      [],
      [
        {
          field: 'leaderboard.round_played',
          option: 'desc',
        },
      ],
    );
    const user_lists = [];
    if (users) {
      for (const user of users) {
        const leaderboard = {
          user_id: user.id,
          nickname: user.nickname,
          leaderboard: user.leaderboard,
        };
        user_lists.push(leaderboard);
      }

      await this.db.leaderboardRepo.upsertDocumentData(constant.LEADERBOARD.ROUND_PLAYED, {
        user_lists,
        type: constant.LEADERBOARD.ROUND_PLAYED,
        id: constant.LEADERBOARD.ROUND_PLAYED,
        updated_at: new Date().getTime(),
      });
    }
  }

  async netWinnings() {
    const users = await this.db.userRepo.getCollectionDataByConditionsOrderByStartAfterAndLimit(
      [],
      [
        {
          field: 'leaderboard.net_winnings',
          option: 'desc',
        },
      ],
      null,
      200,
    );
    const user_lists = [];
    if (users) {
      for (const user of users) {
        const leaderboard = {
          user_id: user.id,
          nickname: user.nickname,
          leaderboard: user.leaderboard,
        };
        user_lists.push(leaderboard);
      }
      await this.db.leaderboardRepo.upsertDocumentData(constant.LEADERBOARD.NET_WINNINGS, {
        user_lists,
        type: constant.LEADERBOARD.NET_WINNINGS,
        id: constant.LEADERBOARD.NET_WINNINGS,
        updated_at: new Date().getTime(),
      });
    }
  }

  async totalBnb() {
    const users = await this.db.userRepo.getCollectionDataByConditionsOrderByStartAfterAndLimit(
      [],
      [
        {
          field: 'leaderboard.total_amount',
          option: 'desc',
        },
      ],
      null,
      200,
    );

    const user_lists = [];
    if (users) {
      for (const user of users) {
        const leaderboard = {
          user_id: user.id,
          nickname: user.nickname,
          leaderboard: user.leaderboard,
        };
        user_lists.push(leaderboard);
      }

      await this.db.leaderboardRepo.upsertDocumentData(constant.LEADERBOARD.TOTAL_BNB, {
        user_lists,
        type: constant.LEADERBOARD.TOTAL_BNB,
        id: constant.LEADERBOARD.TOTAL_BNB,
        updated_at: new Date().getTime(),
      });
    }
  }
}
