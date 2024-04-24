import { Injectable, OnApplicationBootstrap } from '@nestjs/common';
import { Request } from 'express';
import constant from 'src/configuration';
import { IDataServices } from 'src/core/abstract/data-services/data-service.abstract';
import { CreateUserDto } from 'src/core/dtos/user/user.dto';
import { User, UserType } from 'src/core/entity/user.enity';
import { HelperService } from '../helper/helper.service';

@Injectable()
export class UserAuthenService implements OnApplicationBootstrap {
    constructor(
        private readonly db: IDataServices,
        private readonly helper: HelperService,
    ) {}

    async onApplicationBootstrap() {
        // await this.reConstructData();
    }

    async reConstructData() {
        const users = await this.db.userRepo.getCollectionData();
        if (users) {
            for (const user of users) {
                const { address, nickname, type, user_tree_belong, user_tree_commissions, ip, ref } = user;
                const newUser = this._createUser(
                    address,
                    nickname,
                    type,
                    ref,
                    user_tree_belong,
                    user_tree_commissions,
                    ip,
                );
                await this.db.userRepo.deleteDocumentData(user.id);
                await this.db.userRepo.upsertDocumentData(newUser.address, newUser);
            }
        }
    }

    async create(dto: CreateUserDto, req: Request): Promise<User> {
        let user_tree_belong: string[] = [];
        let user_tree_commissions: string[] = [];
        const checkUser = await this.db.userRepo.getDocumentData(dto.user_address);
        if (checkUser) {
            return checkUser;
        }
        if (dto.recommend_id) {
            user_tree_belong = await this.memberTreeBelong(dto.recommend_id);
            user_tree_commissions = await this.memberTreeCommissions(dto.recommend_id);
        }
        const user: User = this._createUser(
            dto.user_address,
            dto.nickname,
            'Normal',
            dto.recommend_id,
            user_tree_belong,
            user_tree_commissions,
            req.ip,
        );
        await this.db.userRepo.upsertDocumentData(user.id, user);
        delete user.id;
    }

    _createUser(
        address: string,
        nickname: string,
        type: UserType,
        recommend_id: string,
        user_tree_belong: string[] = [],
        user_tree_commissions: string[] = [],
        ip: string,
    ) {
        const user: User = {
            id: address,
            address,
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
            // total
            total_bets: 0,
            total_bets_amount: 0,

            total_bets_won: 0,
            total_won_amount: 0,

            total_bets_lost: 0,
            total_lost_amount: 0,

            // down
            total_betsDown: 0,
            total_betsDown_amount: 0,
            total_betsDown_lost: 0,
            total_betsDown_won: 0,
            total_betsDown_lost_amount: 0,
            total_betsDown_won_amount: 0,

            // down
            total_betsUp: 0,
            total_betsUp_lost: 0,
            total_betsUp_won: 0,
            total_betsUp_lost_amount: 0,
            total_betsUp_won_amount: 0,
            total_betsUp_amount: 0,

            // commission
            total_claimed_amount: 0,
            total_claimed_times: 0,
            total_commission_claimed_amount: 0,
            total_commission_claimed_times: 0,

            win_rate: 0,
            user_tree_belong,
            user_tree_commissions,
            ip,
            type,
            created_at: this.helper.getNowTimeStampsSeconds(),
            updated_at: this.helper.getNowTimeStampsSeconds(),
            nickname: nickname ?? address,
            ref: recommend_id ?? '',
        };
        return user;
    }

    async memberTreeCommissions(recommend_id: string) {
        const member_tree: string[] = [];
        const recommender = await this.db.userRepo.getDocumentData(recommend_id);
        if (!recommender) {
            return member_tree;
        }
        member_tree;
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
