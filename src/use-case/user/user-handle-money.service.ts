import { BadRequestException, Injectable } from '@nestjs/common';
import constant from 'src/configuration';
import { IDataServices } from 'src/core/abstract/data-services/data-service.abstract';

@Injectable()
export class UserHandleMoney {
  constructor(private readonly db: IDataServices) {}

  async handlePoint(amount: number, user_id: string) {
    const user = await this.db.userRepo.getDocumentData(user_id);
    let total_revenue_share = 3;
    let revenue_share = 0;
    if (!user) {
      return true;
    }
    for (let i = 0; i < user.user_tree_belong.length; i++) {
      const recommend_id = user.user_tree_belong[i];
      const recommend = await this.db.userRepo.getDocumentData(recommend_id);
      if (recommend) {
        switch (i) {
          case 0:
            revenue_share = 1.2;
            total_revenue_share -= 1.2;
            break;
          case 1:
            revenue_share = 0.2;
            total_revenue_share -= 0.2;
            break;
          case 2:
            revenue_share = 0.1;
            total_revenue_share -= 0.1;
            break;
        }
        const after_point = amount * revenue_share + recommend.point;
        await this.db.userRepo.upsertDocumentData(recommend_id, { point: after_point });
      }
    }
    const recommend = await this.db.userRepo.getFirstValueCollectionDataByConditions([
      { field: 'type', operator: '==', value: constant.USER.TYPE.ADMIN },
    ]);
    const after_point = amount * total_revenue_share + recommend.point;
    await this.db.userRepo.upsertDocumentData(recommend.id, { point: after_point });
    return true;
  }
}
