import { Injectable } from '@nestjs/common';
import constant from 'src/configuration';
import { IDataServices } from 'src/core/abstract/data-services/data-service.abstract';

@Injectable()
export class LeaderboardService {
    constructor(private readonly db: IDataServices) {}

    async updateLeaderboard(round: number) {
        const betslips = await this.db.betRepo.getCollectionDataByConditions([
            { field: 'epoch', operator: '==', value: round },
        ]);

        if (!betslips) {
            return;
        }

        for (const betslip of betslips) {
            const user = await this.db.userRepo.getFirstValueCollectionDataByConditions([
                {
                    field: 'address',
                    operator: '==',
                    value: betslip.user_address,
                },
            ]);

            if (user) {
                let { net_winnings, round_played, round_winning, total_amount, win_rate } = user.leaderboard;
                round_played += 1;
                total_amount += betslip.amount;

                if (betslip.status === constant.BET.STATUS.WIN) {
                    round_winning += 1;
                    net_winnings += betslip.winning_amount;
                } else if (betslip.status === constant.BET.STATUS.LOSE) {
                    net_winnings -= betslip.amount;
                }

                if (round_played !== 0 && round_winning !== 0) {
                    win_rate = (round_winning / round_played) * 100;
                } else {
                    win_rate = 0;
                }
                await this.db.userRepo.upsertDocumentData(user.id, {
                    leaderboard: {
                        net_winnings,
                        round_played,
                        round_winning,
                        total_amount,
                        win_rate,
                    },
                });
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
        const user_list = [];
        if (users) {
            for (const user of users) {
                const leaderboard = {
                    user_id: user.id,
                    nickname: user.nickname,
                    leaderboard: user.leaderboard,
                };
                user_list.push(leaderboard);
            }

            await this.db.leaderboardRepo.upsertDocumentData(constant.LEADERBOARD.WIN_RATE, {
                user_list,
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
        const user_list = [];
        if (users) {
            for (const user of users) {
                const leaderboard = {
                    user_id: user.id,
                    nickname: user.nickname,
                    leaderboard: user.leaderboard,
                };
                user_list.push(leaderboard);
            }

            await this.db.leaderboardRepo.upsertDocumentData(constant.LEADERBOARD.ROUND_PLAYED, {
                user_list,
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
        const user_list = [];
        if (users) {
            for (const user of users) {
                const leaderboard = {
                    user_id: user.id,
                    nickname: user.nickname,
                    leaderboard: user.leaderboard,
                };
                user_list.push(leaderboard);
            }
            await this.db.leaderboardRepo.upsertDocumentData(constant.LEADERBOARD.NET_WINNINGS, {
                user_list,
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

        const user_list = [];
        if (users) {
            for (const user of users) {
                const leaderboard = {
                    user_id: user.id,
                    nickname: user.nickname,
                    leaderboard: user.leaderboard,
                };
                user_list.push(leaderboard);
            }

            await this.db.leaderboardRepo.upsertDocumentData(constant.LEADERBOARD.TOTAL_BNB, {
                user_list,
                type: constant.LEADERBOARD.TOTAL_BNB,
                id: constant.LEADERBOARD.TOTAL_BNB,
                updated_at: new Date().getTime(),
            });
        }
    }
}
