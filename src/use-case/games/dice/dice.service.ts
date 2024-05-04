/* eslint-disable @typescript-eslint/no-unsafe-argument */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
import { Injectable, OnApplicationBootstrap } from '@nestjs/common';
import { ContractFactoryAbstract } from 'src/core/abstract/contract-factory/contract-factory.abstract';
import { Dice } from 'src/core/entity/dice.entity';
import { Prediction } from 'src/core/entity/prediction.enity';
import { HelperService } from '../../helper/helper.service';
import { ILoggerFactory } from 'src/core/abstract/logger/logger-factory.abstract';
import { ILogger } from 'src/core/abstract/logger/logger.abstract';
import { ContractGenericAbstract } from 'src/core/abstract/contract-factory/contract-generic.abstract';
import { CronJob } from 'src/core/types/cronjob.type';

@Injectable()
export class DiceService implements OnApplicationBootstrap {
    private cronJobs: { [id: string]: CronJob } = {};

    private logger: ILogger;

    private contract: ContractGenericAbstract;

    async onApplicationBootstrap() {}

    constructor(
        private readonly factory: ContractFactoryAbstract,
        private readonly helper: HelperService,
        private readonly logFactory: ILoggerFactory,
    ) {
        this.logger = this.logFactory.diceLogger;
        this.contract = this.factory.diceContract;
    }

    async newRoundHandler(newRound: Dice) {
        if (!(await this.isGenesisEnd())) {
            if (this.helper.isInThePast(newRound.closeTimestamp)) {
                this.genesisEndRoundWithRandomValue();
                return;
            }

            this.schedulesGenesisEndRoundWithRandomValue(newRound);
            return;
        }

        if ((await this.isExecutable()) && this.helper.isInThePast(newRound.closeTimestamp)) {
            this.executeRoundWithRandomValue();
            return;
        }

        this.schedulesExecuteRoundWithRandomValue(newRound);
    }

    private schedulesGenesisEndRoundWithRandomValue({ closeTimestamp, epoch }: Dice) {
        const date = new Date((closeTimestamp + 2) * 1000);
        this.cronJobs[epoch] = this.helper.createCronJob(date, async () => {
            await this.genesisEndRoundWithRandomValue();
            this.cronJobs[epoch] = null;
        });

        this.logger.log(`Cronjob execute round ${epoch} have been set at ${date.getHours()}:${date.getMinutes()}`);
    }

    private schedulesExecuteRoundWithRandomValue({ closeTimestamp, epoch }: Dice) {
        const date = new Date((closeTimestamp + 2) * 1000);
        this.cronJobs[epoch] = this.helper.createCronJob(date, async () => {
            await this.executeRoundWithRandomValue();
            this.cronJobs[epoch] = null;
        });

        this.logger.log(`Cronjob execute round ${epoch} have been set at ${date.getHours()}:${date.getMinutes()}`);
    }

    private async genesisEndRoundWithRandomValue() {
        const d1 = this.helper.randomNumber(1, 6);
        const d2 = this.helper.randomNumber(1, 6);
        const d3 = this.helper.randomNumber(1, 6);

        if (!d1 || !d2 || !d3) {
            this.logger.warn('Get dice failed !');
            return;
        }

        return this._genesisEndRound(d1, d2, d3);
    }

    private async executeRoundWithRandomValue() {
        const d1 = this.helper.randomNumber(1, 6);
        const d2 = this.helper.randomNumber(1, 6);
        const d3 = this.helper.randomNumber(1, 6);

        if (!d1 || !d2 || !d3) {
            this.logger.warn('Get dice failed !');
            return;
        }

        return this._executeRound(d1, d2, d3);
    }

    private async _genesisEndRound(d1: number, d2: number, d3: number) {
        if (await this.isPaused()) {
            return;
        }
        return this.contract.executeContract('genesisLockRound', d1.toString(), d2.toString(), d3.toString());
    }

    private async _executeRound(d1: number, d2: number, d3: number) {
        if (await this.isPaused()) {
            return;
        }
        return this.contract.executeContract('genesisEndRound', d1.toString(), d2.toString(), d3.toString());
    }

    private async _getRound(epoch: number) {
        return this.contract.readContract('rounds', epoch.toString());
    }

    async getCurrentEpoch() {
        return Number(await this.contract.readContract('currentEpoch'));
    }

    async getRoundFromChain(epoch: number): Promise<Dice> {
        const roundFromChain = await this._getRound(epoch);

        const currentEpoch = await this.getCurrentEpoch();
        const round: Dice = {
            include: false,
            epoch: +roundFromChain[0].toString(),
            startTimestamp: +roundFromChain[1].toString(),
            closeTimestamp: +roundFromChain[2].toString(),
            dice1: +roundFromChain[3].toString(),
            dice2: +roundFromChain[4].toString(),
            dice3: +roundFromChain[5].toString(),
            sum: +roundFromChain[6].toString(),
            totalAmount: +roundFromChain[7].toString(),
            bullAmount: +roundFromChain[8].toString(),
            bearAmount: +roundFromChain[9].toString(),
            closed: roundFromChain[10],
            deleted: false,
            cancel: false,
        };

        round.cancel = (round.closed && round.totalAmount <= 0) || (!round.closed && round.epoch < currentEpoch);

        return round;
    }

    subcribeToEvent(eventName: string, callback: (...agrs: any[]) => Promise<void> | void) {
        this.contract.subcribeToEvent(eventName, callback);
    }

    unSubcribeToEvent(eventName: string, callback: (...agrs: any[]) => Promise<void> | void) {
        // this.contract.createEventListener(eventName, 'off', callback);
    }

    async isExecutable() {
        // Genesis start
        const isGenesisStart = await this.isGenesisStart();

        if (!isGenesisStart) {
            this.logger.warn("Predix contract isn't GenesisStart !");
            return false;
        }

        // Genesis lock
        const isGenesisLock = await this.isGenesisEnd();

        if (!isGenesisLock) {
            this.logger.warn("Predix contract isn't GenesisLock !");
            return false;
        }

        return true;
    }

    async isSchedulable({ epoch }: Prediction) {
        if (!(await this.isExecutable())) {
            return;
        }

        if (this.cronJobs[epoch]?.running) {
            const date = this.cronJobs[epoch].date;
            this.logger.log(
                `Cronjob execute round ${epoch} have already set at ${date.getHours()}:${date.getMinutes()} !`,
            );
            return false;
        }

        return true;
    }

    async isGenesisStart() {
        return this.contract.readContract('genesisStartOnce');
    }

    async isGenesisEnd() {
        return this.contract.readContract('genesisStartOnce');
    }

    async isPaused() {
        const paused = await this.contract.readContract('paused');
        if (paused) {
            this.logger.log('Dice contract is paused !');
        }
        return paused;
    }

    async getIntervalSecond() {
        return this.contract.readContract('intervalSeconds');
    }

    async getTreasuryFee() {
        return this.contract.readContract('treasuryFee');
    }
}
