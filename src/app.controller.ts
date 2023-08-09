/* eslint-disable @typescript-eslint/no-unsafe-assignment */
import { Controller, Get, Req } from '@nestjs/common';
import { IDataServices } from './core/abstract/data-services/data-service.abstract';
import { User } from './core/entity/user.enity';
import { UserAuthenService } from './use-case/user/user-authen.service';
import { Request } from 'express';
import { ContractFactoryAbstract } from './core/abstract/contract-factory/contract-factory.abstract';
import { LeaderboardService } from './use-case/leaderboard/leader.service';
import { PredictionService } from './use-case/prediction/prediction.service';
import { ethers } from 'ethers';
import constant from './configuration';

@Controller()
export class AppController {
  constructor(
    private readonly db: IDataServices,
    private readonly userService: UserAuthenService,
    private readonly factory: ContractFactoryAbstract,
    private readonly leaderboard: LeaderboardService,
    private readonly prediction: PredictionService,
  ) {}

  @Get()
  async test() {
    const users = await this.db.userRepo.getCollectionData();
    for (const user of users) {
      await this.db.userRepo.upsertDocumentData(user.id, {
        leaderboard: { net_winnings: 0, round_played: 0, round_winning: 0, total_amount: 0, win_rate: 0 },
        point: 0,
      });
    }
  }

  @Get('execute')
  async ex() {
    await this.prediction.executeRound();
  }

  @Get('mint')
  async mint() {
    const wallet = new ethers.Wallet(process.env.OWNER_ADDRESS_PRIVATEKEY, constant.PROVIDER);

    const token = new ethers.Contract(constant.ADDRESS.TOKEN, constant.ABI.TOKEN, wallet);

    const gasLimit = await token.mint.estimateGas('0xdC4E9AEEB3A9D78C370888eE62710e87568743D6', '5000000000000000000000');
    const gasPrice = await this.factory.provider.getFeeData();

    const executeRoundTx = await token.mint('0xdC4E9AEEB3A9D78C370888eE62710e87568743D6', '5000000000000000000000', {
      gasLimit,
      gasPrice: gasPrice.gasPrice,
      maxFeePerGas: gasPrice.maxFeePerGas,
      maxPriorityFeePerGas: gasPrice.maxPriorityFeePerGas,
    });

    const executeRound = await this.factory.provider.waitForTransaction(executeRoundTx.hash as string);

    // Execute round success
    if (executeRound.status === 1) {
      console.log(`execute successfully!`);
    }

    // Execute round failed
    else {
      console.log(` executed failed! `);
    }
  }

  @Get('unpause')
  async unpause() {
    const gasLimit = await this.factory.predictionAdminContract.unpause.estimateGas();
    const gasPrice = await this.factory.provider.getFeeData();

    const executeRoundTx = await this.factory.predictionAdminContract.unpause({
      gasLimit,
      gasPrice: gasPrice.gasPrice,
      maxFeePerGas: gasPrice.maxFeePerGas,
      maxPriorityFeePerGas: gasPrice.maxPriorityFeePerGas,
    });

    const executeRound = await this.factory.provider.waitForTransaction(executeRoundTx.hash as string);

    // Execute round success
    if (executeRound.status === 1) {
      console.log(`execute successfully!`);
    }

    // Execute round failed
    else {
      console.log(` executed failed! `);
    }
  }

  @Get('pause')
  async pause() {
    const gasLimit = await this.factory.predictionAdminContract.pause.estimateGas();
    const gasPrice = await this.factory.provider.getFeeData();

    const executeRoundTx = await this.factory.predictionAdminContract.pause({
      gasLimit,
      gasPrice: gasPrice.gasPrice,
      maxFeePerGas: gasPrice.maxFeePerGas,
      maxPriorityFeePerGas: gasPrice.maxPriorityFeePerGas,
    });

    const executeRound = await this.factory.provider.waitForTransaction(executeRoundTx.hash as string);

    // Execute round success
    if (executeRound.status === 1) {
      console.log(`execute successfully!`);
    }

    // Execute round failed
    else {
      console.log(` executed failed! `);
    }
  }

  @Get('fix-data')
  async testQueryFirestore() {
    const me: User = await this.db.userRepo.getDocumentData('0xf3284BBF9Ebc7C05d2750FbF1232903cA33BF22C');

    const users = await this.db.userRepo.getCollectionDataByConditions([
      { field: 'user_tree_commissions', operator: 'array-contains', value: me.id },
    ]);
    if (users) {
      const arr: User[] = [];
      users.map(user => {
        if (user.user_tree_belong[0] === me.id) {
          arr.push(user);
        }
      });

      // return arr.map(item => item.id);

      return users.map(user => user.id);
    }

    return false;
  }

  @Get('/example-user')
  async exampleUser(@Req() req: Request) {
    const users = await this.db.userRepo.getCollectionData();
    for (let i = 0; i < 1000; i++) {
      const user = users[Math.floor(Math.random() * users.length)];
      await this.userService.create({ user_address: `test${i}`, nickname: `test${i}`, recommend_id: user.id }, req);
    }
  }

  @Get('/change-example-user')
  async changeExampleUser(@Req() req: Request) {
    const users = await this.db.userRepo.getCollectionData();
    for (const user of users) {
      for (let i = 0; i <= user.user_tree_belong.length; i++) {
        if (user.user_tree_belong[i] === '0x5f84f858895BCC8261f1723B93D2C26a8cF16738') {
          user.user_tree_belong[i] = '0xFf8b990Dd2d6Fb35fF627C01173958Eda197518A';
        }
      }
      for (let i = 0; i <= user.user_tree_commissions.length; i++) {
        if (user.user_tree_commissions[i] === '0x5f84f858895BCC8261f1723B93D2C26a8cF16738') {
          user.user_tree_commissions[i] = '0xFf8b990Dd2d6Fb35fF627C01173958Eda197518A';
        }
      }
      user.ref = '0xFf8b990Dd2d6Fb35fF627C01173958Eda197518A';
      await this.db.userRepo.upsertDocumentData(user.id, user);
    }
  }
}
