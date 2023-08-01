import { Contract, JsonRpcProvider } from 'ethers';

export abstract class ContractFactoryAbstract {
  // Firestore

  abstract predictionContract: Contract;

  abstract predictionAdminContract: Contract;

  abstract aggregatorContract: Contract;

  abstract provider: JsonRpcProvider;
}
