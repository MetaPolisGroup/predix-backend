import { Injectable } from '@nestjs/common';
import { hash, hashSync } from 'bcrypt';
import { Request } from 'express';
import constant from 'src/configuration';
import { IDataServices } from 'src/core/abstract/data-services/data-service.abstract';
import { CreateUserDto } from 'src/core/dtos/user/user.dto';
import { User } from 'src/core/entity/user.enity';

@Injectable()
export class UserAuthenService {
  constructor(private readonly db: IDataServices) {}

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
      user_address: dto.user_address,
      leaderboard: {
        net_winnings: Math.floor(Math.random() * 100000),
        round_played: Math.floor(Math.random() * 1000),
        round_winning: Math.floor(Math.random() * 1000),
        win_rate: Math.floor(Math.random() * 100),
      },
      point: 0,
      user_tree_belong,
      user_tree_commissions,
      ip: req.ip,
      type: constant.USER.TYPE.NORMAL,
      created_at: new Date().getTime(),
      updated_at: new Date().getTime(),
      nickname: dto.nickname ?? dto.user_address,
      ref: `${process.env.SERVER}/?id=${dto.user_address}`,
    };
    return this.db.userRepo.upsertDocumentData(user.id, user);
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
    const member_tree = [];
    const recommender = await this.db.userRepo.getDocumentData(recommend_id);
    if (!recommender) {
      return [];
    }
    member_tree.push(recommend_id);
    if (recommender.user_tree_belong) {
      for (let i = 0; i < recommender.user_tree_belong.length; i++) {
        member_tree.push(recommender.user_tree_belong[i]);
      }
    }
    return member_tree;
  }
}
