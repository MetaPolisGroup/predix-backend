import { Injectable } from '@nestjs/common';
import { Request } from 'express';
import constant from 'src/configuration';
import { IDataServices } from 'src/core/abstract/data-services/data-service.abstract';
import { CreateUserDto } from 'src/core/dtos/user/user.dto';
import { User } from 'src/core/entity/user.enity';

@Injectable()
export class UserService {
  constructor(private readonly db: IDataServices) {}

  async create(dto: CreateUserDto, req: Request): Promise<User> {
    const user_tree_belong = await this.partnerTree(dto.recommend_id);
    const user: User = {
      id: dto.account_id,
      email: '',
      point: 0,
      user_tree_belong,
      ip: req.ip,
      type: constant.USER.TYPE.NORMAL,
      created_at: new Date().getTime(),
      updated_at: new Date().getTime(),
      nickname: dto.account_id,
    };
    return this.db.userRepo.createDocumentData(user);
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
  }
}
