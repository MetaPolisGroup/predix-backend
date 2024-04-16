import { Injectable, OnApplicationBootstrap, OnModuleInit } from '@nestjs/common';
import constant from 'src/configuration';
import { IDataServices } from 'src/core/abstract/data-services/data-service.abstract';
import { Wallet, WalletType } from 'src/core/entity/wallet.entity';

@Injectable()
export class WalletService implements OnApplicationBootstrap, OnModuleInit {
    constructor(private readonly db: IDataServices) {}

    async onModuleInit() {}

    async onApplicationBootstrap() {}

    // Get

    async getWalletByAddress(address: string) {
        const wallet = await this.db.walletRepo.getDocumentData(address);
        return wallet;
    }

    async getAllBotWallets() {
        const wallets = await this.db.walletRepo.getCollectionDataByConditions([
            {
                field: 'type',
                operator: '==',
                value: constant.WALLET.TYPE.BOT,
            },
        ]);
        return wallets;
    }

    async getAllGodWallets() {
        const wallets = await this.db.walletRepo.getCollectionDataByConditions([
            {
                field: 'type',
                operator: '==',
                value: constant.WALLET.TYPE.GOD,
            },
        ]);
        return wallets;
    }

    async getAllWallets() {
        const wallets = await this.db.walletRepo.getCollectionData();
        return wallets;
    }

    //Request

    async requestEthRefund(address: string) {
        await this.db.walletRepo.upsertDocumentData(address, {
            eth_refund_request: true,
        });
    }

    async requestTokenRefund(address: string) {
        await this.db.walletRepo.upsertDocumentData(address, {
            token_refund_request: true,
        });
    }

    async requestApproval(address: string) {
        await this.db.walletRepo.upsertDocumentData(address, {
            approve_request: true,
        });
    }

    // fullfill requests
    async finishEthRefundRequest(address: string) {
        await this.db.walletRepo.upsertDocumentData(address, {
            eth_refund_request: false,
        });
    }

    async finishTokenRefundRequest(address: string) {
        await this.db.walletRepo.upsertDocumentData(address, {
            token_refund_request: false,
        });
    }

    async finishApprovalRequest(address: string) {
        await this.db.walletRepo.upsertDocumentData(address, {
            approve_request: false,
        });
    }

    // Create

    async createBotWallet(address: string, privateKey: string) {
        await this.createWalletAddressId(address, privateKey, constant.WALLET.TYPE.BOT);
    }

    async createGodWallet(address: string, privateKey: string) {
        await this.createWalletAddressId(address, privateKey, constant.WALLET.TYPE.GOD);
    }

    private async createWalletAddressId(address: string, privateKey: string, type: WalletType) {
        const wallet = this.createWalletEntity(address, privateKey, type);

        await this.db.walletRepo.upsertDocumentData(wallet.address, wallet);
    }

    private async createWalletRandomId(address: string, privateKey: string, type: WalletType) {
        const wallet = this.createWalletEntity(address, privateKey, type);

        await this.db.walletRepo.createDocumentData(wallet);
    }

    private createWalletEntity(address: string, privateKey: string, type: WalletType) {
        const wallet: Wallet = {
            address,
            privateKey,
            token_balance: 0,
            eth_balance: 0,
            total_gas_used: 0,
            type,
            approve_request: false,
            eth_refund_request: false,
            token_refund_request: false,
        };

        return wallet;
    }
}
