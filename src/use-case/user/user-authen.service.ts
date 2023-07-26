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

  async create(dto: CreateUserDto, req: Request, recommend_id?: string): Promise<User> {
    let user_tree_belong = [];
    const checkUser = await this.db.userRepo.getDocumentData(dto.user_address);
    if (checkUser) {
      return checkUser;
    }
    if (recommend_id) {
      user_tree_belong = await this.partnerTree(recommend_id);
    }
    const user: User = {
      id: dto.user_address,
      user_address: dto.user_address,
      leaderboard: {
        round_played: 0,
        round_winning: 0,
        net_winnings: 0,
        win_rate: 0,
      },
      point: 0,
      user_tree_belong,
      ip: req.ip,
      type: constant.USER.TYPE.NORMAL,
      created_at: new Date().getTime(),
      updated_at: new Date().getTime(),
      nickname: dto.nickname ?? dto.user_address,
      ref: `${process.env.SERVER}/user/create/?id=${dto.user_address}`,
    };
    return this.db.userRepo.upsertDocumentData(user.id, user);
  }

  async partnerTree(recommend_id: string) {
    const partner_tree = [];
    const recommender = await this.db.userRepo.getDocumentData(recommend_id);
    if (!recommender) {
      return [];
    }
    partner_tree.push(recommend_id);
    if (recommender.user_tree_belong) {
      for (let i = 0; i < recommender.user_tree_belong.length; i++) {
        if (i < 2 && recommender.user_tree_belong[i]) {
          partner_tree.push(recommender.user_tree_belong[i]);
        }
      }
    }
    return partner_tree;
  }
}
