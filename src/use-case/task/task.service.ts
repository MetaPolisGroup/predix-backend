/* eslint-disable @typescript-eslint/no-unsafe-assignment */
import { Injectable } from '@nestjs/common';
import { Cron } from '@nestjs/schedule';
import { ethers } from 'ethers';
import constant from 'src/configuration';

@Injectable()
export class TaskService {
  constructor() {}

  // @Cron('* */5 * * * *')
  // async executeRound() {
  //   const priceRandom = [24399280000, 24400000000, 24397541869, 24397644724, 24394974000, 24394703900, 24394904985];

  //   const randomElement = priceRandom[Math.floor(Math.random() * priceRandom.length)];

  //   const wallet = new ethers.Wallet(process.env.OWNER_ADDRESS_PRIVATEKEY, constant.PROVIDER);

  //   const predictionContract = new ethers.Contract(constant.ADDRESS.PREDICTION, constant.ABI.PREDICTION, wallet);

  //   const gasLimit = await predictionContract.executeRound.estimateGas(randomElement);
  //   const gasPrice = await constant.PROVIDER.getFeeData();

  //   console.log({ gasLimit });

  //   console.log({ gasPrice });
  //   await predictionContract.executeRound(100, 1000, {
  //     gasLimit,
  //     gasPrice,
  //   });

  //   console.log('Cron');
  // }
}
