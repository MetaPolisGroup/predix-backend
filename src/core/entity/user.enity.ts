export class User {
  id?: string;

  user_address?: string;

  point: number;

  email: string;

  ip: string;

  nickname?: string;

  leaderboard?: LeaderBoardUser;

  user_tree_belong?: string[];

  created_at: number;

  updated_at: number;

  type: UserType;
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

  total_bnb: number;

  win_rate: number;
}
