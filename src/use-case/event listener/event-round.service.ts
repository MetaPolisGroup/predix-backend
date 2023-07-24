/* eslint-disable @typescript-eslint/no-unsafe-assignment */
import { Injectable, Logger, OnApplicationBootstrap } from '@nestjs/common';
import { ethers } from 'ethers';
import constant from 'src/configuration';
import { ContractFactoryAbstract } from 'src/core/abstract/contract-factory/contract-factory.abstract';
import { IDataServices } from 'src/core/abstract/data-services/data-service.abstract';
import { Round } from 'src/core/interface/round/round.entity';

@Injectable()
export class EventRoundListener implements OnApplicationBootstrap {
  private Logger: Logger;

  async onApplicationBootstrap() {
    await this.listenRoundStart();
    await this.listenRoundLock();
    await this.listenRoundEnd();
    this.Logger = new Logger(EventRoundListener.name);
  }

  constructor(private readonly factory: ContractFactoryAbstract, private readonly db: IDataServices) {}

  async listenRoundStart() {
    await this.factory.predictionContract.on('StartRound', async (epoch: bigint) => {
      const now = Math.round(new Date().getTime() / 1000);
      const round: Round = {
        epoch: epoch.toString(),
        closeOracleId: BigInt(0),
        lockOracleId: BigInt(0),
        bearAmount: BigInt(0),
        bullAmount: BigInt(0),
        totalAmount: BigInt(0),
        closePrice: BigInt(0),
        lockPrice: BigInt(0),
        startTimestamp: now,
        closeTimestamp: now + 300,
        lockTimestamp: now + 300 * 2,
        closed: false,
        locked: false,
        delele: false,
      };

      await this.db.predictionRepo.upsertDocumentData(epoch.toString(), round);

      this.Logger.log(`Round ${epoch.toString()} has started !`);
    });
  }

  async listenRoundLock() {
    await this.factory.predictionContract.on('LockRound', async (epoch: bigint, roundId: bigint, price: bigint) => {
      await this.db.predictionRepo.upsertDocumentData(epoch.toString(), {
        lockOracleId: roundId,
        lockPrice: price,
        lockTimestamp: Math.round(new Date().getTime() / 1000),
        locked: true,
      });
      this.Logger.log(`Round ${epoch.toString()} has locked !`);
    });
  }

  async listenRoundEnd() {
    await this.factory.predictionContract.on('EndRound', async (epoch: bigint, roundId: bigint, price: bigint) => {
      await this.db.predictionRepo.upsertDocumentData(epoch.toString(), {
        closeOracleId: roundId,
        closePrice: price,
        closeTimestamp: Math.round(new Date().getTime() / 1000),
        closed: true,
      });

      const round = await this.db.predictionRepo.getFirstValueCollectionDataByConditions([
        {
          field: 'epoch',
          operator: '==',
          value: epoch.toString(),
        },
      ]);

      const bets = await this.db.betRepo.getCollectionDataByConditions([
        {
          field: 'epoch',
          operator: '==',
          value: epoch.toString(),
        },
      ]);

      if (bets) {
        for (const bet of bets) {
          await this.db.betRepo.upsertDocumentData(bet.id, {
            round,
          });
        }
      }

      setTimeout(async () => {
        console.log('ok');

        await this.executeRound();
      }, 300000);

      this.Logger.log(`Round ${epoch.toString()} has ended !`);
    });
  }

  async executeRound() {
    const priceRandom = [
      24399280000, 24400000000, 24397541869, 24397644724, 24394974000, 24394703900, 24394904985, 24398765000, 24398850000, 24397123000,
      24397240000, 24395230000, 24395100000, 24395185000,
    ];

    const randomElement = priceRandom[Math.floor(Math.random() * priceRandom.length)];

    const wallet = new ethers.Wallet(process.env.OWNER_ADDRESS_PRIVATEKEY, constant.PROVIDER);

    const predictionContract = new ethers.Contract(constant.ADDRESS.PREDICTION, constant.ABI.PREDICTION, wallet);

    const gasLimit = await predictionContract.executeRound.estimateGas(1, randomElement);
    const gasPrice = await constant.PROVIDER.getFeeData();

    console.log({ gasLimit });
    console.log({ gasPrice });

    const executeRoundTx = await predictionContract.executeRound(1, randomElement, {
      gasLimit,
      gasPrice: gasPrice.gasPrice,
      maxFeePerGas: gasPrice.maxFeePerGas,
      maxPriorityFeePerGas: gasPrice.maxPriorityFeePerGas,
    });

    this.Logger.log(`New round executed !`);
  }
}
