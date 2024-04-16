import { Injectable, OnApplicationBootstrap } from '@nestjs/common';
import { ILoggerFactory } from 'src/core/abstract/logger/logger-factory.abstract';
import { ILogger } from 'src/core/abstract/logger/logger.abstract';
import { WalletRequestsSnapshot } from './request/wallet-requests.snapshot';

@Injectable()
export class WalletSnapshotCenter implements OnApplicationBootstrap {
    private logger: ILogger;

    private cron: {
        [id: string]: boolean;
    } = {};

    constructor(
        private readonly logFactory: ILoggerFactory,
        private readonly walletRequest: WalletRequestsSnapshot,
    ) {
        this.logger = this.logFactory.predictionLogger;
    }

    onApplicationBootstrap() {
        // Request
        if (process.env.CONSTANT_ENABLE === 'True') {
            this.walletRequest.ethRefundRequestListener();
            this.walletRequest.approvalRequestListener();
            this.walletRequest.tokenRefundRequestListener();
        }
    }
}
