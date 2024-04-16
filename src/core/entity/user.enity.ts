import { Generic } from './generic.entity';

export class User extends Generic {
    address: string;

    total_bets: number;

    total_bets_won: number;

    total_bets_lost: number;

    total_bets_mmount: number;

    total_betsUp: number;

    total_betsUp_won: number;

    total_betsUp_lost: number;

    total_betsUp_mmount: number;

    total_betsDown: number;

    total_betsDown_won: number;

    total_betsDown_lost: number;

    total_betsDown_amount: number;

    total_claimed_times: number;

    total_claimed_amount: number;

    commission: number;

    total_commission_claimed_times: number;

    total_commission_claimed_amount: number;

    win_rate: number;

    average_bet_amount: number;

    net: number;

    ip: string;

    nickname?: string;

    leaderboard?: LeaderBoardUser;

    user_tree_belong?: string[];

    user_tree_commissions?: string[];

    type: UserType;

    ref: string;
}

export interface IUserToken {
    nickname: string;
    id: string;
}

export type UserType = 'Admin' | 'Normal' | 'Bot' | 'God';

export class LeaderBoardUser {
    round_played: number;

    round_winning: number;

    net_winnings: number;

    win_rate: number;

    total_amount: number;
}
