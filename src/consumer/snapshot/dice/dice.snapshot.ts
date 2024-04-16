import { Injectable, OnApplicationBootstrap } from '@nestjs/common';
import { ContractFactoryAbstract } from 'src/core/abstract/contract-factory/contract-factory.abstract';
import { IDataServices } from 'src/core/abstract/data-services/data-service.abstract';
import { ILoggerFactory } from 'src/core/abstract/logger/logger-factory.abstract';
import { ILogger } from 'src/core/abstract/logger/logger.abstract';
import { DiceService } from 'src/use-case/games/dice/dice.service';

@Injectable()
export class DiceSnapshotService implements OnApplicationBootstrap {
    private logger: ILogger;

    onApplicationBootstrap() {
        if (process.env.CONSTANT_ENABLE_DICE === 'True') {
            this.availableRoundSnapshot();
        }
    }

    constructor(
        private readonly db: IDataServices,
        private readonly dice: DiceService,
        private readonly factory: ContractFactoryAbstract,
        private readonly logFactory: ILoggerFactory,
    ) {
        this.logger = this.logFactory.diceLogger;
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
                        // await this.dice.setCronjob(change.doc);
                    }
                }
            },
        );
    }
}
