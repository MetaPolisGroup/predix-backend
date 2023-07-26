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
}
