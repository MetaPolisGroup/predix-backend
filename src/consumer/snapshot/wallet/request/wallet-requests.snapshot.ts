import { Injectable, OnApplicationBootstrap } from '@nestjs/common';
import { IDataServices } from 'src/core/abstract/data-services/data-service.abstract';
import { DocumentChange } from 'src/core/abstract/data-services/snapshot/Query.abstract';
import { ILoggerFactory } from 'src/core/abstract/logger/logger-factory.abstract';
import { ILogger } from 'src/core/abstract/logger/logger.abstract';
import { Wallet } from 'src/core/entity/wallet.entity';
import { FaucetService } from 'src/use-case/faucet/faucet.service';
import { NativeTokenService } from 'src/use-case/token/native-token/native-token.service';
import { PreTokenService } from 'src/use-case/token/pre-token/pre-token.service';
import { WalletService } from 'src/use-case/wallet/wallet.service';

@Injectable()
export class WalletRequestsSnapshot implements OnApplicationBootstrap {
    private logger: ILogger;

    constructor(
        private readonly db: IDataServices,
        private readonly preTokenService: PreTokenService,
        private readonly nativeTokenService: NativeTokenService,
        private readonly walletService: WalletService,
        private readonly faucetService: FaucetService,
        private readonly loggerFactory: ILoggerFactory,
    ) {
        this.logger = this.loggerFactory.predictionLogger;
    }

    onApplicationBootstrap() {}

    public ethRefundRequestListener() {
        return this.ethRefundRequestSnapshot(async change => {
            const wallet = change.doc;
            await this.faucetService.faucetEthByPrivateKeyAndWait(wallet);
            await this.walletService.finishEthRefundRequest(wallet.address);
        });
    }

    public tokenRefundRequestListener() {
        return this.tokenRefundRequestSnapshot(async change => {
            const wallet = change.doc;
            await this.faucetService.faucetTokenByPrivateKeyAndWait(wallet);
            await this.walletService.finishTokenRefundRequest(wallet.address);
        });
    }

    public approvalRequestListener() {
        return this.approvalRequestSnapshot(async change => {
            const wallet = change.doc;
            await this.preTokenService.approveAllTokenToPredixByPrivateKey(wallet);
            await this.walletService.finishApprovalRequest(wallet.address);
        });
    }

    private ethRefundRequestSnapshot(callback: (change: DocumentChange<Wallet>) => Promise<void> | void) {
        return this.db.walletRepo.listenToChangesWithConditions(
            [
                {
                    field: 'eth_refund_request',
                    operator: '==',
                    value: true,
                },
            ],

            changes => {
                for (const change of changes) {
                    callback(change);
                }
            },
        );
    }

    private tokenRefundRequestSnapshot(callback: (changes: DocumentChange<Wallet>) => Promise<void> | void) {
        return this.db.walletRepo.listenToChangesWithConditions(
            [
                {
                    field: 'token_refund_request',
                    operator: '==',
                    value: true,
                },
            ],

            changes => {
                for (const change of changes) {
                    callback(change);
                }
            },
        );
    }

    private approvalRequestSnapshot(callback: (changes: DocumentChange<Wallet>) => Promise<void> | void) {
        return this.db.walletRepo.listenToChangesWithConditions(
            [
                {
                    field: 'approve_request',
                    operator: '==',
                    value: true,
                },
            ],

            changes => {
                for (const change of changes) {
                    callback(change);
                }
            },
        );
    }
}
