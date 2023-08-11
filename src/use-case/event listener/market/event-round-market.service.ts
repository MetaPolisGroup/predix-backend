/* eslint-disable @typescript-eslint/no-unsafe-assignment */
import { Injectable, Logger, OnApplicationBootstrap } from '@nestjs/common';
import { ContractFactoryAbstract } from 'src/core/abstract/contract-factory/contract-factory.abstract';
import { IDataServices } from 'src/core/abstract/data-services/data-service.abstract';
import { BetMarketService } from 'src/use-case/bet/market/bet-market.service';
import { MarketRoundService } from 'src/use-case/market/market-round.service';

@Injectable()
export class EventMarketRoundListener implements OnApplicationBootstrap {
  private Logger: Logger;

  async onApplicationBootstrap() {
    if (process.env.CONSTANT_ENABLE === 'True') {
      await this.listenRoundStart();
      await this.listenRoundEnd();
      await this.listenCutBetRound();
    }
  }

  constructor(
    private readonly factory: ContractFactoryAbstract,
    private readonly db: IDataServices,
    private readonly marketRound: MarketRoundService,
    private readonly betMarket: BetMarketService,
  ) {
    this.Logger = new Logger(EventMarketRoundListener.name);
  }

  async listenRoundStart() {
    await this.factory.marketContract.on('StartGame', async (epoch: bigint) => {
      // Consts
      await this.marketRound.createNewRound(epoch);
    });
  }

  async listenRoundEnd() {
    await this.factory.marketContract.on('EndGame', async (epoch: bigint, result: bigint) => {
      // Update round
      await this.marketRound.updateEndRound(epoch, result);

      // Update Bet
      await this.betMarket.updateBetWhenRoundIsEnded(epoch);
    });
  }

  async listenCutBetRound() {
    await this.factory.marketContract.on('CutBet', async (epoch: bigint, amount: bigint) => {
      const a = parseInt(amount.toString());
      const result = await this.db.marketRepo.upsertDocumentDataWithResult(epoch.toString(), {
        bearAmount: a,
        bullAmount: a,
        totalAmount: a * 2,
      });

      this.Logger.log(`Cut bet round ${epoch.toString()}, total bet ${a * 2} !`);
    });
  }
}
