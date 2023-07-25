import { IDataServices } from 'src/core/abstract/data-services/data-service.abstract';

export class UserService {
  constructor(private readonly db: IDataServices) {}

  async leaderBoard(round: string) {
    const betslips = await this.db.betRepo.getCollectionDataByConditions([{ field: 'epoch', operator: '==', value: round }]);
    for (const betslip of betslips) {
      const user = await this.db.userRepo.getFirstValueCollectionDataByConditions([
        { field: 'user_address', operator: '==', value: betslip.user_address },
      ]);
      if (user) {
        user.leaderboard.round_played += 1;
        if (betslip.status === 'Winning') {
          user.leaderboard.round_winning += 1;
          user.leaderboard.net_winnings += betslip.amount;
        } else if (betslip.status === 'Losing') {
          user.leaderboard.round_losing += 1;
          user.leaderboard.net_winnings -= betslip.amount;
        }
        user.leaderboard.win_rate = (user.leaderboard.round_winning / user.leaderboard.round_played) * 100;
      }
    }
  }
}
