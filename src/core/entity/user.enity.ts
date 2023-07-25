export class User {
  id?: string;

  password: string;

  user_address?: string;

  point: number;

  email: string;

  ip: string;

  nickname?: string;

  leaderboard: LeaderBoard;

  user_tree_belong?: string[];

  created_at: number;

  updated_at: number;

  type: UserType;
}

export type UserType = 'Admin' | 'Normal';

export class LeaderBoard {
  round_played: number;

  round_winning: number;

  round_losing: number;

  net_winnings: number;

  total_bnb: number;

  win_rate: number;
}
