import { ContractGenericAbstract } from './contract-generic.abstract';

export abstract class ContractMultiWalletsAbstract extends ContractGenericAbstract {
    abstract executeContractByPrivatekey(privateKey: string, functionName: string, ...agrs: any[]): Promise<string>;

    abstract sendTransactionByPrivateKey(privateKey: string, to: string, amount: string): Promise<string>;
}
