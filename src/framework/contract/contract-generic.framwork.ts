/* eslint-disable @typescript-eslint/no-unsafe-argument */
import { OnApplicationBootstrap } from '@nestjs/common';
import {
    AlchemyProvider,
    Contract,
    ContractEventPayload,
    FeeData,
    NonceManager,
    Provider,
    ethers,
    parseEther,
} from 'ethers';
import { ContractGenericAbstract } from 'src/core/abstract/contract-factory/contract-generic.abstract';
import { Alchemy, Network } from 'alchemy-sdk';

export class ContractGeneric implements ContractGenericAbstract, OnApplicationBootstrap {
    protected alchemy: Alchemy;

    protected contract: Contract;

    protected signer: NonceManager;

    protected provider: AlchemyProvider | Provider;

    protected contractAddress: string;

    protected abi: string;

    constructor(contractAddress: string, abi: string, privateKey: string, provider: Provider | AlchemyProvider) {
        this.abi = abi;
        this.contractAddress = contractAddress;
        this.provider = provider;
        this.signer = this.getWallet(privateKey);
        this.contract = new ethers.Contract(contractAddress, abi, this.signer);
        this.alchemy = this.getAlchemyClient();
    }

    async onApplicationBootstrap() {}

    async executeContract(functionName: string, ...agrs: string[]) {
        // const { maxPriorityFeePerGas, maxFeePerGas } = await this.getFeeDataFromAlchemy();
        const { maxPriorityFeePerGas, maxFeePerGas } = await this.getFeeDataFromProvider();
        const gasLimit = await this.estimateGas(functionName, ...agrs);
        const nonce = await this.signer.getNonce('pending');

        const tx = await this.contract[functionName](...agrs, {
            gasLimit,
            nonce,
            maxFeePerGas,
            maxPriorityFeePerGas,
        });

        return tx.hash as string;
    }

    async readContract(functionName: string, ...agrs: string[]): Promise<any> {
        const result = await this.contract[functionName](...agrs);

        return result;
    }

    async sendTransaction(to: string, value: string) {
        const { hash } = await this.signer.sendTransaction({
            to,
            value: parseEther(value),
        });

        return hash;
    }

    async providerAction(functionName: string, ...agrs: string[]): Promise<any> {
        const results = await this.provider[functionName](...agrs);

        return results;
    }

    async getFeeDataFromAlchemy() {
        const { gasPrice, maxFeePerGas, maxPriorityFeePerGas } = await this.alchemy.core.getFeeData();

        const feeData = {
            gasPrice: gasPrice.toBigInt(),
            maxFeePerGas: maxFeePerGas.toBigInt(),
            maxPriorityFeePerGas: maxPriorityFeePerGas.toBigInt(),
        } as FeeData;

        return feeData;
    }

    async estimateGas(functionName: string, ...agrs: string[]) {
        const gasLimit = await this.contract[functionName].estimateGas(...agrs);
        return gasLimit;
    }

    async getFeeDataFromProvider(): Promise<FeeData> {
        const gasPrice = await this.provider.getFeeData();
        return gasPrice;
    }

    isValidTransactionHash(hash) {
        // Check if the hash is a 64-character hexadecimal string
        if (!hash || typeof hash !== 'string' || hash.length !== 66 || !/^0x[0-9a-fA-F]{64}$/.test(hash)) {
            return false;
        }
        // Check if the hash starts with '0x'
        if (hash.substring(0, 2) !== '0x') {
            return false;
        }
        return true;
    }

    async waitForTransaction(hash: string) {
        if (!this.isValidTransactionHash(hash)) {
            return;
        }
        const { status } = await this.provider.waitForTransaction(hash);
        return status;
    }

    subcribeToEvent(eventName: string, callback: (...agrs) => Promise<void> | void) {
        this.contract.on(eventName, async (...args: any[]) => {
            const index = args.findIndex(element => element instanceof ContractEventPayload);

            if (index !== -1) {
                const removedElements = args.splice(index, 1);
                const payload: ContractEventPayload = removedElements[0]; // The removed ContractEventPayload
                return callback?.(...args, payload.log.transactionHash);
            }

            return callback?.(...args);
        });
    }

    unsubcribeToEvent(eventName: string, callback: (...agrs) => Promise<void> | void) {
        this.contract.off(eventName, async (...args: any[]) => {
            const index = args.findIndex(element => element instanceof ContractEventPayload);

            if (index !== -1) {
                const removedElements = args.splice(index, 1);
                const payload: ContractEventPayload = removedElements[0]; // The removed ContractEventPayload
                return callback?.(...args, payload.log.transactionHash);
            }

            return callback?.(...args);
        });
    }

    async getAddress() {
        return this.signer?.getAddress();
    }

    async getContractAddress() {
        return this.contract?.getAddress();
    }

    protected getWallet(privateKey: string) {
        const wallet = new ethers.Wallet(privateKey, this.provider);
        const signer = new ethers.NonceManager(wallet);
        return signer;
    }

    protected getAlchemyClient() {
        const settings = {
            apiKey: process.env.ALCHEMY_API_KEY,
            network: Network.BASE_SEPOLIA,
        };

        const alchemy = new Alchemy(settings);
        return alchemy;
    }
}
