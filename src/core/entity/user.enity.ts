export class User {
  id?: string;

  user_address?: string;

  point: number;

  ip: string;

  nickname?: string;

  leaderboard?: LeaderBoardUser;

  user_tree_belong?: string[];

  user_tree_commissions?: string[];

  created_at: number;

  updated_at: number;

  type: UserType;

  ref: string;
}

export interface IUserToken {
  nickname: string;
  id: string;
}

export type UserType = 'Admin' | 'Normal';

export class LeaderBoardUser {
  round_played: number;

  round_winning: number;

  net_winnings: number;

  win_rate: number;

  total_amount: number;
}
