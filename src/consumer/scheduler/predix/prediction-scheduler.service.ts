import { Injectable } from '@nestjs/common';
import { Prediction } from 'src/core/entity/prediction.enity';

import { HelperService } from 'src/use-case/helper/helper.service';
import { ContractFactoryAbstract } from 'src/core/abstract/contract-factory/contract-factory.abstract';
import { ILogger } from 'src/core/abstract/logger/logger.abstract';
import { ILoggerFactory } from 'src/core/abstract/logger/logger-factory.abstract';
import { CronJob } from 'src/core/types/cronjob.type';
import { ExecuteData } from 'src/core/entity/chainlink.entity';
import { ManipulationService } from 'src/use-case/manipulation/manipulation.service';
import { PredictionRoundService } from '../../../use-case/games/prediction/prediction-round.service';
import { ChainlinkService } from 'src/use-case/chainlink/chainlink.service';
import { PredixOperatorContract } from 'src/use-case/contracts/predix/prediction-operator.service';
import { ManipulationUsecases } from 'src/use-case/manipulation/manipulation.usecases';

@Injectable()
export class PredictionSchedulerService {
    private logger: ILogger;

    public roundCronJobs: { [id: string]: CronJob } = {};

    constructor(
        private readonly predixOperator: PredixOperatorContract,
        private readonly predixRound: PredictionRoundService,
        private readonly helper: HelperService,
        private readonly factory: ContractFactoryAbstract,
        private readonly loggerFactory: ILoggerFactory,
        private readonly predixManipulation: ManipulationService,
        private readonly predixManipulationUsecase: ManipulationUsecases,
        private readonly chainlink: ChainlinkService,
    ) {
        this.logger = this.loggerFactory.predictionLogger;
    }

    async newRoundHandler(newRound: Prediction) {
        if (!(await this.predixOperator.isGenesisLock())) {
            if (this.helper.isInThePast(newRound.lockTimestamp)) {
                this.genesisLockRound();
                return;
            }

            this.schedulesGenesisLock(newRound);
            return;
        }

        if (!(await this.predixOperator.isExecutable())) {
            return;
        }

        if (this.helper.isInThePast(newRound.lockTimestamp)) {
            this.executeRound();
            return;
        }

        if (!(await this.isSchedulable(newRound))) {
            return;
        }

        this.schedulesExecuteRound(newRound);
    }

    // Normal
    private schedulesExecuteRound({ lockTimestamp, epoch }: Prediction) {
        const date = new Date((lockTimestamp + 2) * 1000);
        this.roundCronJobs[epoch] = this.helper.createCronJob(date, async () => {
            await this.executeRound();
            this.roundCronJobs[epoch] = null;
        });
        this.logger.log(
            `Cronjob execute round ${epoch} have been set at ${date.getHours()}:${date.getMinutes()}:${date.getSeconds()}`,
        );
    }

    private schedulesGenesisLock({ lockTimestamp, epoch }: Prediction) {
        const date = new Date(lockTimestamp * 1000);
        this.roundCronJobs[epoch] = this.helper.createCronJob(date, async () => {
            await this.genesisLockRound();
            this.roundCronJobs[epoch] = null;
        });
        this.logger.log(
            `Cronjob Genesis lock round ${epoch} have been set at ${date.getHours()}:${date.getSeconds()}:${date.getSeconds()}`,
        );
    }

    private async executeRound() {
        const { price, roundId } = await this.getExecuteData();
        this.predixOperator.excuteRound(roundId, price);
    }

    private async genesisLockRound() {
        const { price, roundId } = await this.getExecuteData();

        this.predixOperator.genesisLockRound(roundId, price);
    }

    private async getExecuteData(): Promise<ExecuteData> {
        const liveround = await this.predixRound.getCurrentLiveRound();
        const prophecyData = await this.predixManipulationUsecase.getProphecyPrice(liveround);

        if (prophecyData) {
            return prophecyData;
        }

        const chainLinkPrice = await this.chainlink.getChainLinkExecutionData();

        return chainLinkPrice;
    }

    // Checks
    private async isSchedulable({ epoch }: Prediction) {
        if (!(await this.predixOperator.isExecutable())) {
            return;
        }

        if (this.roundCronJobs[epoch]?.running) {
            const date = this.roundCronJobs[epoch].date;
            this.logger.log(
                `Cronjob execute round ${epoch} have already set at ${date.getHours()}:${date.getMinutes()} !`,
            );
            return false;
        }

        return true;
    }
}
