/* eslint-disable @typescript-eslint/no-unsafe-argument */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
import { Injectable, OnApplicationBootstrap } from '@nestjs/common';
import { ContractFactoryAbstract } from 'src/core/abstract/contract-factory/contract-factory.abstract';
import { PredictionOnChain } from 'src/core/entity/prediction.enity';
import { HelperService } from '../../helper/helper.service';
import { ILoggerFactory } from 'src/core/abstract/logger/logger-factory.abstract';
import { ILogger } from 'src/core/abstract/logger/logger.abstract';
import { ContractGenericAbstract } from 'src/core/abstract/contract-factory/contract-generic.abstract';
import { IDataServices } from 'src/core/abstract/data-services/data-service.abstract';

@Injectable()
export class PredixOperatorContract implements OnApplicationBootstrap {
    private logger: ILogger;

    private contract: ContractGenericAbstract;

    constructor(
        private readonly factory: ContractFactoryAbstract,
        private readonly helper: HelperService,
        private readonly logFactory: ILoggerFactory,
        private readonly db: IDataServices,
    ) {
        this.logger = this.logFactory.predictionLogger;
        this.contract = this.factory.predictionContract;
    }

    onApplicationBootstrap() {
        //
    }

    async excuteRound(roundId: number, price: number) {
        if (!(await this.isExecutable()) || (await this.isPaused())) {
            return;
        }
        return this._executeRound(roundId, price);
    }

    async excuteRoundAndWait(roundId: number, price: number) {
        if (!(await this.isExecutable())) {
            return;
        }
        const hash = await this._executeRound(roundId, price);
        return this.contract.waitForTransaction(hash);
    }

    private async _executeRound(roundId: number, price: number) {
        return this.contract.executeContract('executeRound', roundId.toString(), price.toString());
    }

    async genesisLockRound(roundId: number, price: number) {
        if (!(await this.isGenesisStart()) || (await this.isPaused())) {
            return;
        }

        return this._genesisLockRound(roundId, price);
    }

    async genesisLockRoundAndWait(roundId: number, price: number) {
        if (!(await this.isGenesisStart())) {
            return;
        }

        const hash = await this._genesisLockRound(roundId, price);
        return this.contract.waitForTransaction(hash);
    }

    private async _genesisLockRound(roundId: number, price: number) {
        return this.contract.executeContract('genesisLockRound', roundId.toString(), price.toString());
    }

    private async _pause() {
        return this.contract.executeContract('pause');
    }

    async getCurrentEpoch() {
        const round = await this.contract.readContract('currentEpoch');
        return parseInt(round);
    }

    async isExecutable() {
        // Genesis start
        const isGenesisStart = await this.isGenesisStart();

        if (!isGenesisStart) {
            this.logger.warn("Predix contract isn't GenesisStart !");
            return false;
        }

        // Genesis lock
        const isGenesisLock = await this.isGenesisLock();

        if (!isGenesisLock) {
            this.logger.warn("Predix contract isn't GenesisLock !");
            return false;
        }

        return true;
    }

    async isRoundBettale(epoch: number) {
        const currentEpoch = await this.getCurrentEpoch();

        if (currentEpoch === epoch) {
            return true;
        }

        return false;
    }

    async getRound(epoch: number) {
        const roundFromChain = await this.contract.readContract('rounds', epoch.toString());

        const round: PredictionOnChain = {
            epoch: +roundFromChain[0].toString(),
            startTimestamp: +roundFromChain[1].toString(),
            lockTimestamp: +roundFromChain[2].toString(),
            closeTimestamp: +roundFromChain[3].toString(),
            lockPrice: this.helper.formatChainlinkPrice(roundFromChain[4]),
            closePrice: this.helper.formatChainlinkPrice(roundFromChain[5]),
            lockOracleId: +roundFromChain[6].toString(),
            closeOracleId: +roundFromChain[7].toString(),
            total_amount: this.helper.toEtherNumber(roundFromChain[8]),
            up_amount: this.helper.toEtherNumber(roundFromChain[9]),
            down_amount: this.helper.toEtherNumber(roundFromChain[10]),
        };

        return round;
    }

    subcribeToEvent(eventName: string, callback: (...agrs: any[]) => Promise<void> | void) {
        this.contract.subcribeToEvent(eventName, callback);
    }

    unSubcribeToEvent(eventName: string, callback: (...agrs: any[]) => Promise<void> | void) {
        this.contract.unsubcribeToEvent(eventName, callback);
    }

    async isGenesisStart() {
        return (await this.contract.readContract('genesisStartOnce')) as boolean;
    }

    async isGenesisLock() {
        return (await this.contract.readContract('genesisStartOnce')) as boolean;
    }

    async isPaused() {
        const paused = await this.contract.readContract('paused');
        if (paused) {
            this.logger.log('Predix contract is paused !');
        }
        return paused as boolean;
    }

    async getIntervalSecond() {
        return (await this.contract.readContract('intervalSeconds')) as number;
    }

    async getTreasuryFee() {
        return (await this.contract.readContract('treasuryFee')) as number;
    }
}
