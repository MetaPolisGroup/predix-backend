import { Injectable, OnApplicationBootstrap } from '@nestjs/common';
import { ContractFactoryAbstract } from 'src/core/abstract/contract-factory/contract-factory.abstract';
import { IDataServices } from 'src/core/abstract/data-services/data-service.abstract';
import { Round } from 'src/core/interface/round/round.entity';

@Injectable()
export class EventRoundListener implements OnApplicationBootstrap {
  async onApplicationBootstrap() {
    await this.listenRoundStart();
    await this.listenRoundLock();
    await this.listenRoundEnd();
  }

  constructor(private readonly factory: ContractFactoryAbstract, private readonly db: IDataServices) {}

  async listenRoundStart() {
    await this.factory.predictionContract.on('StartRound', async (epoch: bigint) => {
      const round: Round = {
        epoch: epoch.toString(),
        closeOracleId: BigInt(0),
        lockOracleId: BigInt(0),
        bearAmount: BigInt(0),
        bullAmount: BigInt(0),
        totalAmount: BigInt(0),
        closePrice: BigInt(0),
        lockPrice: BigInt(0),
        startTimestamp: new Date().getTime(),
        closeTimestamp: null,
        lockTimestamp: null,
        closed: false,
        locked: false,
        delele: false,
      };

      await this.db.roundRepo.upsertDocumentData(epoch.toString(), round);
    });
  }

  async listenRoundLock() {
    await this.factory.predictionContract.on('LockRound', async (epoch: bigint, roundId: bigint, price: bigint) => {
      await this.db.roundRepo.upsertDocumentData(epoch.toString(), {
        lockOracleId: roundId,
        lockPrice: price,
        lockTimestamp: new Date().getTime(),
        locked: true,
      });
    });
  }

  async listenRoundEnd() {
    await this.factory.predictionContract.on('EndRound', async (epoch: bigint, roundId: bigint, price: bigint) => {
      await this.db.roundRepo.upsertDocumentData(epoch.toString(), {
        closeOracleId: roundId,
        closePrice: price,
        closeTimestamp: new Date().getTime(),
        closed: true,
      });

      const round = await this.db.roundRepo.getFirstValueCollectionDataByConditions([
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

      for (const bet of bets) {
        await this.db.betRepo.upsertDocumentData(bet.id, {
          round,
        });
      }
    });
  }
}
