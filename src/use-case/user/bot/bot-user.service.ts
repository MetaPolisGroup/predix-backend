import { Injectable, OnApplicationBootstrap } from '@nestjs/common';
import constant from 'src/configuration';
import { IDataServices } from 'src/core/abstract/data-services/data-service.abstract';
import { User } from 'src/core/entity/user.enity';
import { HelperService } from 'src/use-case/helper/helper.service';

@Injectable()
export class BotUserService implements OnApplicationBootstrap {
    constructor(
        private readonly db: IDataServices,
        private readonly helper: HelperService,
    ) {}

    async onApplicationBootstrap() {}

    async getAllBotAccounts() {
        const fakeBotUsers = await this.db.userRepo.getCollectionDataByConditions([
            {
                field: 'type',
                operator: '==',
                value: constant.USER.TYPE.BOT,
            },
        ]);

        return fakeBotUsers;
    }

    async createFakeBotAccount(userAddress: string) {
        const checkUser = await this.db.userRepo.getDocumentData(userAddress);
        if (checkUser) {
            return;
        }

        // const user: User = {
        //     id: userAddress,
        //     address: userAddress,
        //     leaderboard: {
        //         net_winnings: 0,
        //         round_played: 0,
        //         round_winning: 0,
        //         win_rate: 0,
        //         total_amount: 0,
        //     },
        //     commission: 0,
        //     user_tree_belong: [],
        //     user_tree_commissions: [],
        //     ip: '',
        //     type: constant.USER.TYPE.FAKEBOT,
        //     created_at: new Date().getTime(),
        //     updated_at: new Date().getTime(),
        //     nickname: this.helper.randomName(),
        //     ref: null,
        // };
        // await this.db.userRepo.upsertDocumentData(user.id, user);
    }
}
