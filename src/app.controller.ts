/* eslint-disable @typescript-eslint/no-unsafe-assignment */
import { Controller, Get, Req } from '@nestjs/common';
import { AppService } from './app.service';
import { IDataServices } from './core/abstract/data-services/data-service.abstract';
import { ContractFactory, ethers } from 'ethers';
import constant from './configuration';
import { User } from './core/entity/user.enity';
import { UserAuthenService } from './use-case/user/user-authen.service';
import { Request } from 'express';
import { ContractFactoryAbstract } from './core/abstract/contract-factory/contract-factory.abstract';

@Controller()
export class AppController {
  constructor(
    private readonly appService: AppService,
    private readonly db: IDataServices,
    private readonly userService: UserAuthenService,
    private readonly factory: ContractFactoryAbstract,
  ) {}

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
