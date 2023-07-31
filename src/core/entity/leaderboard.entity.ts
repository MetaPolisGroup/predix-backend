import { LeaderBoardType } from 'src/configuration/type/leaderboard/leaderboard.type';
import { LeaderBoardUser } from './user.enity';

export class Leaderboard {
  id?: string;

  user_list: {
    leaderboard: LeaderBoardUser;

    user_id: string;

    nickname: string;
  }[];

  type: LeaderBoardType;

  updated_at: number;
}
