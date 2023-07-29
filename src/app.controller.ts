/* eslint-disable @typescript-eslint/no-unsafe-assignment */
import { Controller, Get } from '@nestjs/common';
import { AppService } from './app.service';
import { IDataServices } from './core/abstract/data-services/data-service.abstract';
import { ethers } from 'ethers';
import constant from './configuration';
import { User } from './core/entity/user.enity';

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
}
