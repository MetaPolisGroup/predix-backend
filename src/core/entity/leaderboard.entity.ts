import { LeaderBoardType } from 'src/configuration/type/leaderboard/leaderboard.type';
import { LeaderBoardUser } from './user.enity';
import { Generic } from './generic.entity';

export class Leaderboard extends Generic {
    user_list: {
        leaderboard: LeaderBoardUser;

        user_id: string;

        nickname: string;
    }[];

    type: LeaderBoardType;
}
