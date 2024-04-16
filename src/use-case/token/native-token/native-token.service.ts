import { Injectable, OnApplicationBootstrap } from '@nestjs/common';
import { ContractFactoryAbstract } from 'src/core/abstract/contract-factory/contract-factory.abstract';
import { ContractGenericAbstract } from 'src/core/abstract/contract-factory/contract-generic.abstract';
import { ContractMultiWalletsAbstract } from 'src/core/abstract/contract-factory/contract-multiwallets.abstract';
import { ILoggerFactory } from 'src/core/abstract/logger/logger-factory.abstract';
import { ILogger } from 'src/core/abstract/logger/logger.abstract';
import { Wallet } from 'src/core/entity/wallet.entity';
import { HelperService } from 'src/use-case/helper/helper.service';
import { WalletService } from 'src/use-case/wallet/wallet.service';

@Injectable()
export class NativeTokenService implements OnApplicationBootstrap {
    private contractAddr: string;

    private logger: ILogger;

    private contract: ContractMultiWalletsAbstract;

    constructor(
        private readonly factory: ContractFactoryAbstract,
        private readonly helper: HelperService,
        private readonly loggerFactory: ILoggerFactory,
        private readonly walletService: WalletService,
    ) {
        this.logger = this.loggerFactory.predictionLogger;
        this.contract = this.factory.tokenContract;
    }

    async onApplicationBootstrap() {}

    // Read

    async nativeTokenBalanceOf(address: string): Promise<number> {
        const balance: bigint = await this.contract.providerAction('getBalance', address);
        return this.helper.toEtherNumber(balance);
    }

    async getContractBalance(): Promise<number> {
        const balance = await this.nativeTokenBalanceOf(this.contractAddr);
        return balance;
    }

    // Write

    async transferNativeTokenAndWait(to: string, amount: number) {
        if (!(await this.isContractEnoughEth(amount))) {
            return;
        }
        const hash = await this._transferNativeToken(to, amount.toString());
        await this.contract.waitForTransaction(hash);
    }

    async transferNativeTokenAndWaitByPrivateKey(wallet: Wallet, to: string, amount: number) {
        if (!(await this.isEnoughEth(wallet.address, amount))) {
            this.logger.warn(`${wallet.address} Eth balance insufficient to transfer ${amount} token ! `);
            return;
        }
        const tx = await this._transferNativeTokenByPrivateKey(wallet.privateKey, to, amount.toString());
        await this.contract.waitForTransaction(tx);
    }

    private async _transferNativeToken(to: string, amount: string) {
        return this.contract.sendTransaction(to, amount);
    }

    private async _transferNativeTokenByPrivateKey(privateKey: string, to: string, amount: string) {
        return this.contract.sendTransactionByPrivateKey(privateKey, to, amount);
    }

    //Checks
    async isEnoughEth(address: string, amount: number) {
        const balance = await this.nativeTokenBalanceOf(address);
        if (balance < amount) {
            return false;
        }
        return true;
    }

    async isContractEnoughEth(amount: number) {
        const contractBalance = await this.getContractBalance();
        if (contractBalance < amount) {
            this.logger.error('Eth holder balance insufficient');
            return false;
        }
        return true;
    }
}
