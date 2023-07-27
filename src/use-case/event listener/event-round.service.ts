/* eslint-disable @typescript-eslint/no-unsafe-assignment */
import { Injectable, Logger, NotFoundException, OnApplicationBootstrap } from '@nestjs/common';
import { ethers } from 'ethers';
import constant from 'src/configuration';
import { ContractFactoryAbstract } from 'src/core/abstract/contract-factory/contract-factory.abstract';
import { IDataServices } from 'src/core/abstract/data-services/data-service.abstract';
import { Position } from 'src/core/entity/bet.entity';
import { Prediction } from 'src/core/entity/prediction.enity';
import { PredictionService } from '../prediction/prediction.service';
import { UserHandleMoney } from '../user/user-handle-money.service';

@Injectable()
export class EventRoundListener implements OnApplicationBootstrap {
  private Logger: Logger;

  async onApplicationBootstrap() {
    if (process.env.CONSTANT_ENABLE === 'True') {
      await this.listenRoundStart();
      await this.listenRoundLock();
      await this.listenRoundEnd();
      await this.listenCutBetRound();
    }
    this.Logger = new Logger(EventRoundListener.name);
  }

  constructor(
    private readonly prediction: PredictionService,
    private readonly factory: ContractFactoryAbstract,
    private readonly db: IDataServices,
    private readonly handleMoney: UserHandleMoney,
  ) {}

  async listenRoundStart() {
    await this.factory.predictionContract.on('StartRound', async (epoch: bigint) => {
      const now = Math.round(new Date().getTime() / 1000);
      const round: Prediction = {
        epoch: parseInt(epoch.toString()),
        closeOracleId: 0,
        lockOracleId: 0,
        bearAmount: 0,
        bullAmount: 0,
        totalAmount: 0,
        closePrice: 0,
        lockPrice: 0,
        startTimestamp: now,
        closeTimestamp: now + 300 * 2,
        lockTimestamp: now + 300,
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
        lockPrice: parseInt(price.toString()),
        lockTimestamp: Math.round(new Date().getTime() / 1000),
        locked: true,
      });

      const round = await this.db.predictionRepo.getFirstValueCollectionDataByConditions([
        {
          field: 'epoch',
          operator: '==',
          value: parseInt(epoch.toString()),
        },
      ]);

      const bets = await this.db.betRepo.getCollectionDataByConditions([
        {
          field: 'epoch',
          operator: '==',
          value: parseInt(epoch.toString()),
        },
      ]);

      if (bets) {
        for (const bet of bets) {
          await this.db.betRepo.upsertDocumentData(bet.id, {
            round,
            status: 'Live',
          });
        }
      }
      this.Logger.log(`Round ${epoch.toString()} has locked !`);
    });
  }

  async listenRoundEnd() {
    await this.factory.predictionContract.on('EndRound', async (epoch: bigint, roundId: bigint, price: bigint) => {
      await this.db.predictionRepo.upsertDocumentData(epoch.toString(), {
        closeOracleId: roundId,
        closePrice: parseInt(price.toString()),
        closeTimestamp: Math.round(new Date().getTime() / 1000),
        closed: true,
      });

      const bets = await this.db.betRepo.getCollectionDataByConditions([
        {
          field: 'epoch',
          operator: '==',
          value: parseInt(epoch.toString()),
        },
      ]);

      const round = await this.db.predictionRepo.getFirstValueCollectionDataByConditions([
        {
          field: 'epoch',
          operator: '==',
          value: parseInt(epoch.toString()),
        },
      ]);

      if (!round) {
        this.Logger.error(`Round ${epoch.toString()} not found, can't update bet result!`);
      }

      const calculateResult = (): Position => {
        const r = round.closePrice - round.lockPrice;
        if (r > 0) {
          return 'UP';
        } else if (r < 0) {
          return 'DOWN';
        } else {
          return null;
        }
      };

      if (bets) {
        for (const bet of bets) {
          await this.db.betRepo.upsertDocumentData(bet.id, {
            round: round ? round : null,
            status: calculateResult() ? (bet.position === calculateResult() ? 'Win' : 'Lose') : 'Refund',
          });

          // await this.handleMoney.handlePoint(bet.amount, bet.user_address);
        }
      }
      await this.prediction.setCronjob();

      this.Logger.log(`Round ${epoch.toString()} has ended !`);
    });
  }

  async listenCutBetRound() {
    await this.factory.predictionContract.on('CutBet', async (epoch: bigint, amount: bigint) => {
      await this.db.predictionRepo.upsertDocumentData(epoch.toString(), {
        bearAmount: parseInt(amount.toString()),
        bullAmount: parseInt(amount.toString()),
        totalAmount: parseInt(amount.toString()) * 2,
      });

      this.Logger.log(`Cut bet round ${epoch.toString()} !`);
    });
  }
}
