import { Injectable, Logger, OnApplicationBootstrap } from '@nestjs/common';
import { ContractFactoryAbstract } from 'src/core/abstract/contract-factory/contract-factory.abstract';
import { IDataServices } from 'src/core/abstract/data-services/data-service.abstract';
import { DiceService } from 'src/use-case/dice/dice.service';

@Injectable()
export class DiceSnapshotService implements OnApplicationBootstrap {
  private logger: Logger;

  onApplicationBootstrap() {
    if (process.env.CONSTANT_ENABLE_DICE === 'True') {
      this.availableRoundSnapshot();
    }
  }

  constructor(private readonly db: IDataServices, private readonly dice: DiceService, private readonly factory: ContractFactoryAbstract) {
    this.logger = new Logger(DiceSnapshotService.name);
  }

  availableRoundSnapshot() {
    this.db.diceRepo.listenToChangesWithConditionsAndOrderBy(
      [
        {
          field: 'closed',
          operator: '==',
          value: false,
        },
        {
          field: 'cancel',
          operator: '==',
          value: false,
        },
      ],
      [
        {
          field: 'epoch',
          option: 'desc',
        },
      ],
      async changes => {

        for (const change of changes) {

          if (change.type === 'added') {

            await this.dice.setCronjob(change.doc);
          }
        }
      },
    );
  }
}
