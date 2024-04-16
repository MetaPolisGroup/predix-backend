import { Injectable, OnApplicationBootstrap } from '@nestjs/common';
import constant from 'src/configuration';
import { ContractFactoryAbstract } from 'src/core/abstract/contract-factory/contract-factory.abstract';
import { ContractMultiWalletsAbstract } from 'src/core/abstract/contract-factory/contract-multiwallets.abstract';
import { ILoggerFactory } from 'src/core/abstract/logger/logger-factory.abstract';
import { ILogger } from 'src/core/abstract/logger/logger.abstract';
import { Wallet } from 'src/core/entity/wallet.entity';
import { HelperService } from 'src/use-case/helper/helper.service';

@Injectable()
export class PreTokenService implements OnApplicationBootstrap {
    private logger: ILogger;

    private contractAddr: string;

    private contract: ContractMultiWalletsAbstract;

    constructor(
        private readonly factory: ContractFactoryAbstract,
        private readonly helper: HelperService,
        private readonly loggerFactory: ILoggerFactory,
    ) {
        this.logger = this.loggerFactory.predictionLogger;
        this.contract = this.factory.tokenContract;
    }

    async onApplicationBootstrap() {
        this.contractAddr = await this.contract.getContractAddress();
    }

    // Read

    async balanceOf(address: string): Promise<number> {
        const balance: bigint = await this.contract.readContract('balanceOf', address);

        return this.helper.toEtherNumber(balance);
    }

    async getContractBalance(): Promise<number> {
        const balance = await this.balanceOf(this.contractAddr);
        return balance;
    }

    async allowance(address: string): Promise<number> {
        const allowance: bigint = await this.contract.readContract('allowance', address, constant.ADDRESS.PREDICTION);
        return this.helper.toEtherNumber(allowance);
    }

    // Write
    async transferAndWait(to: string, amount: number) {
        if (!(await this.isContractEnoughToken(amount))) {
            return;
        }
        const tx = await this._transfer(to, this.helper.toWei(amount));
        await this.contract.waitForTransaction(tx);
    }

    async transferAndWaitByPrivateKey(wallet: Wallet, to: string, amount: number) {
        if (!(await this.isEnoughToken(wallet.address, amount))) {
            return;
        }
        const tx = await this._transferByPrivateKey(wallet.privateKey, to, this.helper.toWei(amount));
        await this.contract.waitForTransaction(tx);
    }

    private async _transfer(to: string, amount: string): Promise<string> {
        return this.contract.executeContract('transfer', to, amount);
    }

    private async _transferByPrivateKey(privateKey: string, to: string, amount: string): Promise<string> {
        return this.contract.executeContractByPrivatekey(privateKey, 'transfer', to, amount);
    }

    //Approve

    async approveByPrivateKey(wallet: Wallet, spender: string, amount: number) {
        if (!(await this.isEnoughToken(wallet.address, amount))) {
            return;
        }

        await this._approve(wallet.privateKey, spender, this.helper.toWei(amount));
    }

    async approveAllTokenToPredixByPrivateKey(wallet: Wallet) {
        if (!(await this.isAnyAmountOfToken(wallet.address))) {
            return;
        }
        const currentBalance = await this.balanceOf(wallet.address);
        await this._approve(wallet.privateKey, constant.ADDRESS.PREDICTION, this.helper.toWei(currentBalance));
    }

    private async _approve(privateKey: string, spender: string, amount: string) {
        return this.contract.executeContractByPrivatekey(privateKey, 'approve', spender, amount);
    }

    //Check

    async isEnoughToken(address: string, amount: number) {
        const balance = await this.balanceOf(address);
        if (balance < amount) {
            this.logger.error(`${address} not enough PRE token to transfer`);
            return false;
        }
        return true;
    }

    async isAnyAmountOfToken(address: string) {
        const balance = await this.balanceOf(address);
        if (balance <= 0) {
            this.logger.error(`${address} PRE token = 0`);
            return false;
        }
        return true;
    }

    async isContractEnoughToken(amount: number) {
        const contractBalance = await this.balanceOf(this.contractAddr);
        if (contractBalance < amount) {
            return false;
        }
        return true;
    }

    async isEnoughAllowance(address: string, amount: number) {
        const contractBalance = await this.allowance(address);
        if (contractBalance < amount) {
            return false;
        }
        return true;
    }
}
