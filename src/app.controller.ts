/* eslint-disable @typescript-eslint/no-unsafe-assignment */
import { Controller, Get } from '@nestjs/common';
import { AppService } from './app.service';
import { IDataServices } from './core/abstract/data-services/data-service.abstract';
import { ethers } from 'ethers';
import constant from './configuration';

@Controller()
export class AppController {
  constructor(private readonly appService: AppService, private readonly db: IDataServices) {}

  @Get()
  async getHello() {
    const signer = new ethers.Wallet(process.env.OWNER_ADDRESS_PRIVATEKEY, constant.PROVIDER);
    const amount = 10;
    let message = ethers.solidityPacked(['uint256'], [amount]);
    message = ethers.solidityPackedKeccak256(['bytes'], [message]);
    const arrayIfy = ethers.getBytes(message);
    const sig = await signer.signMessage(arrayIfy);
    return sig;
  }

  @Get('fix-data')
  async testQueryFirestore() {
    // const users = await this.db.userRepo.getCollectionData();
    // if (users) {
    //   for (const user of users) {
    //     user.leaderboard = {
    //       net_winnings: Math.floor(Math.random() * 100000),
    //       round_played: Math.floor(Math.random() * 1000),
    //       round_winning: Math.floor(Math.random() * 1000),
    //       total_bnb: Math.floor(Math.random() * 100000),
    //       win_rate: Math.floor(Math.random() * 100),
    //     };

    //     await this.db.userRepo.upsertDocumentData(user.id, { leaderboard: user.leaderboard });
    //   }
    // }

    const users1 = await this.db.userRepo.getCollectionDataByConditionsOrderByStartAfterAndLimit(
      [],
      [{ field: 'leaderboard.net_winnings', option: 'desc' }],
      null,
      10
    );

    const users2 = await this.db.userRepo.getCollectionDataByConditionsOrderByStartAfterAndLimit(
      [],
      [{ field: 'leaderboard.net_winnings', option: 'desc' }],
      users1[users1.length - 1],
      10
    );

    if (users1 && users2) {
      return {
        length: users1.length,
        value1: users1.map(user => {
          return {
            user_id: user.id,
            leaderboard: user.leaderboard
          }
        }),
        value2: users2.map(user => {
          return {
            user_id: user.id,
            leaderboard: user.leaderboard
          }
        }),
      };
    }

    return false;
  }
}
