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
    const priceRandom = [24399280000, 24400000000, 24397541869, 24397644724, 24394974000, 24394703900, 24394904985];

    const randomElement = priceRandom[Math.floor(Math.random() * priceRandom.length)];

    const wallet = new ethers.Wallet(process.env.OWNER_ADDRESS_PRIVATEKEY, constant.PROVIDER);

    const predictionContract = new ethers.Contract(constant.ADDRESS.PREDICTION, constant.ABI.PREDICTION, wallet);

    const gasLimit = await predictionContract.executeRound.estimateGas(1, randomElement);
    const gasPrice = await constant.PROVIDER.getFeeData();

    console.log({ gasLimit });
    console.log({ gasPrice });

    await predictionContract.executeRound(100, 1000, {
      gasLimit,
      gasPrice: gasPrice.gasPrice,
    });

    console.log('Cron');
  }
}
