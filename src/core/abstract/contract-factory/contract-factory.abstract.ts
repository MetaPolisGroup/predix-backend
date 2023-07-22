import { Contract, JsonRpcProvider } from 'ethers';

export abstract class ContractFactoryAbstract {
  // Firestore

  abstract predictionContract: Contract;

  abstract provider: JsonRpcProvider;
}
