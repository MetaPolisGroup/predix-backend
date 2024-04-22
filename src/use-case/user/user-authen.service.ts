import { Injectable } from '@nestjs/common';
import { Request } from 'express';
import constant from 'src/configuration';
import { IDataServices } from 'src/core/abstract/data-services/data-service.abstract';
import { CreateUserDto } from 'src/core/dtos/user/user.dto';
import { User } from 'src/core/entity/user.enity';
import { HelperService } from '../helper/helper.service';

@Injectable()
export class UserAuthenService {
    constructor(
        private readonly db: IDataServices,
        private readonly helper: HelperService,
    ) {}

    async create(dto: CreateUserDto, req: Request): Promise<User> {
        let user_tree_belong = [];
        let user_tree_commissions = [];
        const checkUser = await this.db.userRepo.getDocumentData(dto.user_address);
        if (checkUser) {
            return checkUser;
        }
        if (dto.recommend_id) {
            user_tree_belong = await this.memberTreeBelong(dto.recommend_id);
            user_tree_commissions = await this.memberTreeCommissions(dto.recommend_id);
        }
        const user: User = {
            id: dto.user_address,
            address: dto.user_address,
            leaderboard: {
                net_winnings: 0,
                round_played: 0,
                round_winning: 0,
                win_rate: 0,
                total_amount: 0,
            },
            commission: 0,
            average_bet_amount: 0,
            net: 0,
            total_bets: 0,
            total_bets_lost: 0,
            total_bets_amount: 0,
            total_bets_won: 0,
            total_betsDown: 0,
            total_betsDown_amount: 0,
            total_betsDown_lost: 0,
            total_betsDown_won: 0,
            total_betsUp: 0,
            total_betsUp_lost: 0,
            total_betsUp_amount: 0,
            total_betsUp_won: 0,
            total_claimed_amount: 0,
            total_claimed_times: 0,
            total_commission_claimed_amount: 0,
            total_commission_claimed_times: 0,
            win_rate: 0,
            user_tree_belong,
            user_tree_commissions,
            ip: req.ip,
            type: constant.USER.TYPE.NORMAL,
            created_at: this.helper.getNowTimeStampsSeconds(),
            updated_at: this.helper.getNowTimeStampsSeconds(),
            nickname: dto.nickname ?? dto.user_address,
            ref: `${dto.recommend_id}`,
        };
        await this.db.userRepo.upsertDocumentData(user.id, user);
        delete user.id;
    }

    async memberTreeCommissions(recommend_id: string) {
        const member_tree = [];
        const recommender = await this.db.userRepo.getDocumentData(recommend_id);
        if (!recommender) {
            return [];
        }
        member_tree.push(recommend_id);
        if (recommender.user_tree_belong) {
            for (let i = 0; i < recommender.user_tree_belong.length; i++) {
                if (i < 2 && recommender.user_tree_belong[i]) {
                    member_tree.push(recommender.user_tree_belong[i]);
                }
            }
        }
        return member_tree;
    }

    async memberTreeBelong(recommend_id: string) {
        const member_tree: string[] = [];
        const recommender = await this.db.userRepo.getDocumentData(recommend_id);
        if (!recommender) return member_tree;
        member_tree.push(recommend_id);
        if (recommender.user_tree_belong) {
            for (let i = 0; i < recommender.user_tree_belong.length; i++) {
                member_tree.push(recommender.user_tree_belong[i]);
            }
        }
        return member_tree;
    }
}
