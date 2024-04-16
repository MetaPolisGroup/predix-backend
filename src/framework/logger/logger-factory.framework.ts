import { ILoggerFactory } from 'src/core/abstract/logger/logger-factory.abstract';
import { CustomLogger } from './logger.framework';
import { Injectable } from '@nestjs/common';

@Injectable()
export class LoggerFactory implements ILoggerFactory {
    readonly predictionLogger: CustomLogger;

    readonly diceLogger: CustomLogger;

    readonly marketLogger: CustomLogger;

    readonly chainlinkLogger: CustomLogger;

    constructor() {
        this.predictionLogger = new CustomLogger('Predix', 'EFAF49');
        this.diceLogger = new CustomLogger('Dice', '983E2D');
        this.marketLogger = new CustomLogger('Market', '7B76B1');
        this.chainlinkLogger = new CustomLogger('Chainlink', 'EA3323');
    }
}
