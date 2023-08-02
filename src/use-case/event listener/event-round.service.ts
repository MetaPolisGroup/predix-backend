/* eslint-disable @typescript-eslint/no-unsafe-assignment */
import { Injectable, Logger, NotFoundException, OnApplicationBootstrap } from '@nestjs/common';
import { ethers } from 'ethers';
import constant from 'src/configuration';
import { ContractFactoryAbstract } from 'src/core/abstract/contract-factory/contract-factory.abstract';
import { IDataServices } from 'src/core/abstract/data-services/data-service.abstract';
import { Bet, BetStatus, Position } from 'src/core/entity/bet.entity';
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
      // Consts
      const preferences = await this.db.preferenceRepo.getFirstValueCollectionData();
      const now = Math.round(new Date().getTime() / 1000);

      // Update round
      if (preferences) {
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
          closeTimestamp: now + preferences.interval_seconds * 2,
          lockTimestamp: now + preferences.interval_seconds,
          closed: false,
          locked: false,
          cancel: false,
          delele: false,
        };
        await this.db.predictionRepo.upsertDocumentData(epoch.toString(), round);
      }

      // Log
      this.Logger.log(`Round ${epoch.toString()} has started !`);
    });
  }

  async listenRoundLock() {
    await this.factory.predictionContract.on('LockRound', async (epoch: bigint, roundId: bigint, price: bigint) => {
      const round = await this.db.predictionRepo.getFirstValueCollectionDataByConditions([
        {
          field: 'epoch',
          operator: '==',
          value: parseInt(epoch.toString()),
        },
      ]);

      // Update round
      if (round) {
        round.lockOracleId = parseInt(roundId.toString());
        round.lockPrice = parseInt(price.toString());
        round.lockTimestamp = Math.round(new Date().getTime() / 1000);
        round.locked = true;

        await this.db.predictionRepo.upsertDocumentData(round.epoch.toString(), round);
      }

      // Update bets
      const bets = await this.db.betRepo.getCollectionDataByConditions([
        {
          field: 'epoch',
          operator: '==',
          value: parseInt(epoch.toString()),
        },
      ]);

      // Change bets's status to live
      if (bets) {
        for (const bet of bets) {
          await this.db.betRepo.upsertDocumentData(bet.id, {
            round: round ? round : null,
            status: 'Live',
          });
        }
      }

      // Log
      this.Logger.log(`Round ${epoch.toString()} has locked !`);

      if (!round) {
        this.Logger.error(`Round ${epoch.toString()} not found from DB when locked on chain !`);
      }
    });
  }

  async listenRoundEnd() {
    await this.factory.predictionContract.on('EndRound', async (epoch: bigint, roundId: bigint, price: bigint) => {
      const round = await this.db.predictionRepo.getFirstValueCollectionDataByConditions([
        {
          field: 'epoch',
          operator: '==',
          value: parseInt(epoch.toString()),
        },
      ]);

      // Update round
      if (round) {
        round.closeOracleId = parseInt(roundId.toString());
        round.closePrice = parseInt(price.toString());
        round.closeTimestamp = Math.round(new Date().getTime() / 1000);
        round.closed = true;
        round.cancel = round.totalAmount > 0 ? false : true;

        await this.db.predictionRepo.upsertDocumentData(round.epoch.toString(), round);
      } else {
        this.Logger.error(`Round ${epoch.toString()} not found from DB when end on chain !`);
      }

      //Update bets
      const bets = await this.db.betRepo.getCollectionDataByConditions([
        {
          field: 'epoch',
          operator: '==',
          value: parseInt(epoch.toString()),
        },
      ]);

      const calculateResult = (bet: Bet, round: Prediction): BetStatus => {
        const r = round.closePrice - round.lockPrice;
        let result: BetStatus;

        if ((r > 0 && bet.position === 'UP') || (r < 0 && bet.position === 'DOWN')) {
          result = 'Win';
          if (bet.refund > 0) {
            result = 'Winning Refund';
          }
        } else {
          result = 'Lose';
          if (bet.refund > 0) {
            result = 'Refund';
          }
        }

        return result;
      };

      // Update bet status & round
      if (bets) {
        for (const bet of bets) {
          bet.round = round ? round : null;
          bet.status = 'Refund';

          // Calculate result if bet amount > 0
          if (round && bet.amount > 0) {
            bet.status = calculateResult(bet, round);
          }

          await this.db.betRepo.upsertDocumentData(bet.id, bet);

          // Handle commission
          await this.handleMoney.handlePoint(bet.amount, bet.user_address);
        }
      }

      // Log
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
