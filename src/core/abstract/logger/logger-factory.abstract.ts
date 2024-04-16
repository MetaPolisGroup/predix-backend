import { ILogger } from './logger.abstract';

export abstract class ILoggerFactory {
    abstract readonly predictionLogger: ILogger;

    abstract readonly diceLogger: ILogger;

    abstract readonly marketLogger: ILogger;

    abstract readonly chainlinkLogger: ILogger;
}
