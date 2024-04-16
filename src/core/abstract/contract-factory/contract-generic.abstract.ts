export abstract class ContractGenericAbstract {
    // Firestore

    abstract getAddress(): Promise<string>;

    abstract getContractAddress(): Promise<string>;

    abstract sendTransaction(to: string, amount: string): Promise<string>;

    abstract readContract(functionName: string, ...agrs: string[] | string[][]): Promise<any>;

    abstract providerAction(functionName: string, ...agrs: string[] | string[][]): Promise<any>;

    abstract executeContract(functionName: string, ...agrs: string[] | string[][]): Promise<string>;

    abstract waitForTransaction(hash: string): Promise<number>;

    abstract estimateGas(functionName: string, ...agrs: string[] | string[][]): Promise<bigint>;

    abstract getFeeDataFromProvider(): Promise<{
        gasPrice: bigint;
        maxFeePerGas: bigint;
        maxPriorityFeePerGas: bigint;
    }>;

    abstract getFeeDataFromAlchemy(): Promise<{
        gasPrice: bigint;
        maxFeePerGas: bigint;
        maxPriorityFeePerGas: bigint;
    }>;

    abstract subcribeToEvent(eventName: string, callback: (...agrs) => Promise<void> | void);

    abstract unsubcribeToEvent(eventName: string, callback: (...agrs) => Promise<void> | void);
}
