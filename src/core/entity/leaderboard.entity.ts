import { LeaderBoardUser } from './user.enity';

export class Leaderboard {
  id?: string;

  user_list: { 
    
    leaderboard: LeaderBoardUser; 
    
    user_id: string; 
    
  }[];

  type: LeaderBoardType;

  updated_at: number;
}

export type LeaderBoardType = 'Total BNB' | 'Rounds Played' | 'Net Winnings' | 'Win Rate';
