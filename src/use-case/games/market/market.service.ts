/* eslint-disable @typescript-eslint/no-unsafe-argument */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
import { Injectable, OnApplicationBootstrap } from '@nestjs/common';
import { ContractFactoryAbstract } from 'src/core/abstract/contract-factory/contract-factory.abstract';
import { ContractGenericAbstract } from 'src/core/abstract/contract-factory/contract-generic.abstract';
import { IDataServices } from 'src/core/abstract/data-services/data-service.abstract';
import { ILoggerFactory } from 'src/core/abstract/logger/logger-factory.abstract';
import { ILogger } from 'src/core/abstract/logger/logger.abstract';

@Injectable()
export class MarketService implements OnApplicationBootstrap {
    private logger: ILogger;

    private contract: ContractGenericAbstract;

    async onApplicationBootstrap() {}

    constructor(
        private readonly factory: ContractFactoryAbstract,
        private readonly db: IDataServices,
        private readonly logFactory: ILoggerFactory,
    ) {
        this.logger = this.logFactory.marketLogger;
        this.contract = this.factory.marketContract;
    }

    subcribeToEvent(eventName: string, callback: (...agrs: any[]) => Promise<void> | void) {
        this.contract.subcribeToEvent(eventName, callback);
    }

    unSubcribeToEvent(eventName: string, callback: (...agrs: any[]) => Promise<void> | void) {
        // this.contract.createEventListener(eventName, 'off', callback);
    }

    private async _startGame(epoch: number) {
        return this.contract.executeContract('startGame', epoch.toString());
    }

    private async _endGame(epoch: number) {
        return this.contract.executeContract('endGame', epoch.toString());
    }

    async isPaused() {
        const paused = (await this.contract.readContract('paused')) as boolean;

        if (paused) {
            this.logger.log('Market contract is paused !');
        }

        return paused;
    }

    getTreasuryFee() {
        return Number(this.contract.readContract('treasuryFee'));
    }
}
