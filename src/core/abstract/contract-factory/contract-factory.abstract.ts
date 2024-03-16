import { AlchemyProvider, Contract, NonceManager } from 'ethers';

export abstract class ContractFactoryAbstract {
  // Firestore

  abstract predictionContract: Contract;

  abstract tokenContract: Contract;

  abstract marketContract: Contract;

  abstract diceContract: Contract;

  abstract nftContract: Contract;

  abstract aggregatorContract: Contract;

  abstract faucetContract: Contract;

  abstract provider: AlchemyProvider;

  abstract signer: NonceManager;
}
