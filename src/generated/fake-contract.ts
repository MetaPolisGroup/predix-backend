import { ContractTransaction, ContractInterface, BytesLike as Arrayish, BigNumberish, Contract } from 'ethers';
import { EthersContractContextV5 } from 'ethereum-abi-types-generator';

export type ContractContext = EthersContractContextV5<
  PredictionContract,
  PredictionContractMethodNames,
  PredictionContractEventsContext,
  PredictionContractEvents
>;

export declare type EventFilter = {
  address?: string;
  topics?: Array<string>;
  fromBlock?: string | number;
  toBlock?: string | number;
};

export interface ContractTransactionOverrides {
  /**
   * The maximum units of gas for the transaction to use
   */
  gasLimit?: number;
  /**
   * The price (in wei) per unit of gas
   */
  gasPrice?: bigint | string | number | Promise<any>;
  /**
   * The nonce to use in the transaction
   */
  nonce?: number;
  /**
   * The amount to send with the transaction (i.e. msg.value)
   */
  value?: bigint | string | number | Promise<any>;
  /**
   * The chain ID (or network ID) to use
   */
  chainId?: number;
}

export interface ContractCallOverrides {
  /**
   * The address to execute the call as
   */
  from?: string;
  /**
   * The maximum units of gas for the transaction to use
   */
  gasLimit?: number;
}

export type PredictionContractEvents =
  | 'BetBear'
  | 'BetBull'
  | 'Claim'
  | 'EndRound'
  | 'LockRound'
  | 'NewAdminAddress'
  | 'NewBufferAndIntervalSeconds'
  | 'NewMinBetAmount'
  | 'NewOperatorAddress'
  | 'NewOracle'
  | 'NewOracleUpdateAllowance'
  | 'NewTreasuryFee'
  | 'OwnershipTransferred'
  | 'Pause'
  | 'Paused'
  | 'RewardsCalculated'
  | 'StartRound'
  | 'TokenRecovery'
  | 'TreasuryClaim'
  | 'Unpause'
  | 'Unpaused';

export interface PredictionContractEventsContext {
  BetBear(...parameters: any): EventFilter;
  BetBull(...parameters: any): EventFilter;
  Claim(...parameters: any): EventFilter;
  EndRound(...parameters: any): EventFilter;
  LockRound(...parameters: any): EventFilter;
  NewAdminAddress(...parameters: any): EventFilter;
  NewBufferAndIntervalSeconds(...parameters: any): EventFilter;
  NewMinBetAmount(...parameters: any): EventFilter;
  NewOperatorAddress(...parameters: any): EventFilter;
  NewOracle(...parameters: any): EventFilter;
  NewOracleUpdateAllowance(...parameters: any): EventFilter;
  NewTreasuryFee(...parameters: any): EventFilter;
  OwnershipTransferred(...parameters: any): EventFilter;
  Pause(...parameters: any): EventFilter;
  Paused(...parameters: any): EventFilter;
  RewardsCalculated(...parameters: any): EventFilter;
  StartRound(...parameters: any): EventFilter;
  TokenRecovery(...parameters: any): EventFilter;
  TreasuryClaim(...parameters: any): EventFilter;
  Unpause(...parameters: any): EventFilter;
  Unpaused(...parameters: any): EventFilter;
}

export type PredictionContractMethodNames =
  | 'new'
  | 'MAX_TREASURY_FEE'
  | 'adminAddress'
  | 'betBear'
  | 'betBull'
  | 'bufferSeconds'
  | 'claim'
  | 'claimTreasury'
  | 'claimable'
  | 'currentEpoch'
  | 'executeRound'
  | 'genesisLockOnce'
  | 'genesisLockRound'
  | 'genesisStartOnce'
  | 'genesisStartRound'
  | 'getUserRounds'
  | 'getUserRoundsLength'
  | 'intervalSeconds'
  | 'ledger'
  | 'minBetAmount'
  | 'operatorAddress'
  | 'oracle'
  | 'oracleLatestRoundId'
  | 'oracleUpdateAllowance'
  | 'owner'
  | 'pause'
  | 'paused'
  | 'recoverToken'
  | 'refundable'
  | 'renounceOwnership'
  | 'rounds'
  | 'setAdmin'
  | 'setBufferAndIntervalSeconds'
  | 'setMinBetAmount'
  | 'setOperator'
  | 'setOracle'
  | 'setOracleUpdateAllowance'
  | 'setTreasuryFee'
  | 'transferOwnership'
  | 'treasuryAmount'
  | 'treasuryFee'
  | 'unpause'
  | 'userBetBear'
  | 'userBetBull'
  | 'userRounds';

export interface BetBearEventEmittedResponse {
  sender: string;
  epoch: BigNumberish;
  amount: BigNumberish;
}

export interface BetBullEventEmittedResponse {
  sender: string;
  epoch: BigNumberish;
  amount: BigNumberish;
}

export interface ClaimEventEmittedResponse {
  sender: string;
  epoch: BigNumberish;
  amount: BigNumberish;
}

export interface EndRoundEventEmittedResponse {
  epoch: BigNumberish;
  roundId: BigNumberish;
  price: BigNumberish;
}

export interface LockRoundEventEmittedResponse {
  epoch: BigNumberish;
  roundId: BigNumberish;
  price: BigNumberish;
}

export interface NewAdminAddressEventEmittedResponse {
  admin: string;
}
export interface NewBufferAndIntervalSecondsEventEmittedResponse {
  bufferSeconds: BigNumberish;
  intervalSeconds: BigNumberish;
}
export interface NewMinBetAmountEventEmittedResponse {
  epoch: BigNumberish;
  minBetAmount: BigNumberish;
}
export interface NewOperatorAddressEventEmittedResponse {
  operator: string;
}
export interface NewOracleEventEmittedResponse {
  oracle: string;
}
export interface NewOracleUpdateAllowanceEventEmittedResponse {
  oracleUpdateAllowance: BigNumberish;
}
export interface NewTreasuryFeeEventEmittedResponse {
  epoch: BigNumberish;
  treasuryFee: BigNumberish;
}
export interface OwnershipTransferredEventEmittedResponse {
  previousOwner: string;
  newOwner: string;
}
export interface PauseEventEmittedResponse {
  epoch: BigNumberish;
}
export interface PausedEventEmittedResponse {
  account: string;
}
export interface RewardsCalculatedEventEmittedResponse {
  epoch: BigNumberish;
  treasuryAmount: BigNumberish;
}
export interface StartRoundEventEmittedResponse {
  epoch: BigNumberish;
}
export interface TokenRecoveryEventEmittedResponse {
  token: string;
  amount: BigNumberish;
}
export interface TreasuryClaimEventEmittedResponse {
  amount: BigNumberish;
}
export interface UnpauseEventEmittedResponse {
  epoch: BigNumberish;
}
export interface UnpausedEventEmittedResponse {
  account: string;
}
export interface BetinfoResponse {
  position: number;
  0: number;
  amount: bigint;
  1: bigint;
  refund: bigint;
  2: bigint;
  claimed: boolean;
  3: boolean;
}
export interface GetUserRoundsResponse {
  result0: bigint[];
  0: bigint[];
  result1: BetinfoResponse[];
  1: BetinfoResponse[];
  result2: bigint;
  2: bigint;
  length: 3;
}
export interface LedgerResponse {
  position: number;
  0: number;
  amount: bigint;
  1: bigint;
  refund: bigint;
  2: bigint;
  claimed: boolean;
  3: boolean;
  length: 4;
}
export interface RoundsResponse {
  epoch: bigint;
  0: bigint;
  startTimestamp: bigint;
  1: bigint;
  lockTimestamp: bigint;
  2: bigint;
  closeTimestamp: bigint;
  3: bigint;
  lockPrice: bigint;
  4: bigint;
  closePrice: bigint;
  5: bigint;
  lockOracleId: bigint;
  6: bigint;
  closeOracleId: bigint;
  7: bigint;
  totalAmount: bigint;
  8: bigint;
  bullAmount: bigint;
  9: bigint;
  bearAmount: bigint;
  10: bigint;
  oracleCalled: boolean;
  11: boolean;
  length: 12;
}

export interface PredictionContract {
  /**
   * Payable: false
   * Constant: false
   * StateMutability: nonpayable
   * Type: constructor
   * @param _oracleAddress Type: address, Indexed: false
   * @param _adminAddress Type: address, Indexed: false
   * @param _operatorAddress Type: address, Indexed: false
   * @param _intervalSeconds Type: uint256, Indexed: false
   * @param _bufferSeconds Type: uint256, Indexed: false
   * @param _minBetAmount Type: uint256, Indexed: false
   * @param _oracleUpdateAllowance Type: uint256, Indexed: false
   * @param _treasuryFee Type: uint256, Indexed: false
   */
  'new'(
    _oracleAddress: string,
    _adminAddress: string,
    _operatorAddress: string,
    _intervalSeconds: BigNumberish,
    _bufferSeconds: BigNumberish,
    _minBetAmount: BigNumberish,
    _oracleUpdateAllowance: BigNumberish,
    _treasuryFee: BigNumberish,
    overrides?: ContractTransactionOverrides,
  ): Promise<ContractTransaction>;
  /**
   * Payable: false
   * Constant: true
   * StateMutability: view
   * Type: function
   */
  MAX_TREASURY_FEE(overrides?: ContractCallOverrides): Promise<bigint>;
  /**
   * Payable: false
   * Constant: true
   * StateMutability: view
   * Type: function
   */
  adminAddress(overrides?: ContractCallOverrides): Promise<string>;
  /**
   * Payable: true
   * Constant: false
   * StateMutability: payable
   * Type: function
   * @param epoch Type: uint256, Indexed: false
   */
  betBear(epoch: BigNumberish, overrides?: ContractTransactionOverrides): Promise<ContractTransaction>;
  /**
   * Payable: true
   * Constant: false
   * StateMutability: payable
   * Type: function
   * @param epoch Type: uint256, Indexed: false
   */
  betBull(epoch: BigNumberish, overrides?: ContractTransactionOverrides): Promise<ContractTransaction>;
  /**
   * Payable: false
   * Constant: true
   * StateMutability: view
   * Type: function
   */
  bufferSeconds(overrides?: ContractCallOverrides): Promise<bigint>;
  /**
   * Payable: false
   * Constant: false
   * StateMutability: nonpayable
   * Type: function
   * @param epochs Type: uint256[], Indexed: false
   */
  claim(epochs: BigNumberish[], overrides?: ContractTransactionOverrides): Promise<ContractTransaction>;
  /**
   * Payable: false
   * Constant: false
   * StateMutability: nonpayable
   * Type: function
   */
  claimTreasury(overrides?: ContractTransactionOverrides): Promise<ContractTransaction>;
  /**
   * Payable: false
   * Constant: true
   * StateMutability: view
   * Type: function
   * @param epoch Type: uint256, Indexed: false
   * @param user Type: address, Indexed: false
   */
  claimable(epoch: BigNumberish, user: string, overrides?: ContractCallOverrides): Promise<boolean>;
  /**
   * Payable: false
   * Constant: true
   * StateMutability: view
   * Type: function
   */
  currentEpoch(overrides?: ContractCallOverrides): Promise<bigint>;
  /**
   * Payable: false
   * Constant: false
   * StateMutability: nonpayable
   * Type: function
   * @param currentRoundId Type: uint80, Indexed: false
   * @param currentPrice Type: int256, Indexed: false
   */
  executeRound(
    currentRoundId: BigNumberish,
    currentPrice: BigNumberish,
    overrides?: ContractTransactionOverrides,
  ): Promise<ContractTransaction>;
  /**
   * Payable: false
   * Constant: true
   * StateMutability: view
   * Type: function
   */
  genesisLockOnce(overrides?: ContractCallOverrides): Promise<boolean>;
  /**
   * Payable: false
   * Constant: false
   * StateMutability: nonpayable
   * Type: function
   * @param currentRoundId Type: uint80, Indexed: false
   * @param currentPrice Type: int256, Indexed: false
   */
  genesisLockRound(
    currentRoundId: BigNumberish,
    currentPrice: BigNumberish,
    overrides?: ContractTransactionOverrides,
  ): Promise<ContractTransaction>;
  /**
   * Payable: false
   * Constant: true
   * StateMutability: view
   * Type: function
   */
  genesisStartOnce(overrides?: ContractCallOverrides): Promise<boolean>;
  /**
   * Payable: false
   * Constant: false
   * StateMutability: nonpayable
   * Type: function
   */
  genesisStartRound(overrides?: ContractTransactionOverrides): Promise<ContractTransaction>;
  /**
   * Payable: false
   * Constant: true
   * StateMutability: view
   * Type: function
   * @param user Type: address, Indexed: false
   * @param cursor Type: uint256, Indexed: false
   * @param size Type: uint256, Indexed: false
   */
  getUserRounds(user: string, cursor: BigNumberish, size: BigNumberish, overrides?: ContractCallOverrides): Promise<GetUserRoundsResponse>;
  /**
   * Payable: false
   * Constant: true
   * StateMutability: view
   * Type: function
   * @param user Type: address, Indexed: false
   */
  getUserRoundsLength(user: string, overrides?: ContractCallOverrides): Promise<bigint>;
  /**
   * Payable: false
   * Constant: true
   * StateMutability: view
   * Type: function
   */
  intervalSeconds(overrides?: ContractCallOverrides): Promise<bigint>;
  /**
   * Payable: false
   * Constant: true
   * StateMutability: view
   * Type: function
   * @param parameter0 Type: uint256, Indexed: false
   * @param parameter1 Type: address, Indexed: false
   */
  ledger(parameter0: BigNumberish, parameter1: string, overrides?: ContractCallOverrides): Promise<LedgerResponse>;
  /**
   * Payable: false
   * Constant: true
   * StateMutability: view
   * Type: function
   */
  minBetAmount(overrides?: ContractCallOverrides): Promise<bigint>;
  /**
   * Payable: false
   * Constant: true
   * StateMutability: view
   * Type: function
   */
  operatorAddress(overrides?: ContractCallOverrides): Promise<string>;
  /**
   * Payable: false
   * Constant: true
   * StateMutability: view
   * Type: function
   */
  oracle(overrides?: ContractCallOverrides): Promise<string>;
  /**
   * Payable: false
   * Constant: true
   * StateMutability: view
   * Type: function
   */
  oracleLatestRoundId(overrides?: ContractCallOverrides): Promise<bigint>;
  /**
   * Payable: false
   * Constant: true
   * StateMutability: view
   * Type: function
   */
  oracleUpdateAllowance(overrides?: ContractCallOverrides): Promise<bigint>;
  /**
   * Payable: false
   * Constant: true
   * StateMutability: view
   * Type: function
   */
  owner(overrides?: ContractCallOverrides): Promise<string>;
  /**
   * Payable: false
   * Constant: false
   * StateMutability: nonpayable
   * Type: function
   */
  pause(overrides?: ContractTransactionOverrides): Promise<ContractTransaction>;
  /**
   * Payable: false
   * Constant: true
   * StateMutability: view
   * Type: function
   */
  paused(overrides?: ContractCallOverrides): Promise<boolean>;
  /**
   * Payable: false
   * Constant: false
   * StateMutability: nonpayable
   * Type: function
   * @param _token Type: address, Indexed: false
   * @param _amount Type: uint256, Indexed: false
   */
  recoverToken(_token: string, _amount: BigNumberish, overrides?: ContractTransactionOverrides): Promise<ContractTransaction>;
  /**
   * Payable: false
   * Constant: true
   * StateMutability: view
   * Type: function
   * @param epoch Type: uint256, Indexed: false
   * @param user Type: address, Indexed: false
   */
  refundable(epoch: BigNumberish, user: string, overrides?: ContractCallOverrides): Promise<boolean>;
  /**
   * Payable: false
   * Constant: false
   * StateMutability: nonpayable
   * Type: function
   */
  renounceOwnership(overrides?: ContractTransactionOverrides): Promise<ContractTransaction>;
  /**
   * Payable: false
   * Constant: true
   * StateMutability: view
   * Type: function
   * @param parameter0 Type: uint256, Indexed: false
   */
  rounds(parameter0: BigNumberish, overrides?: ContractCallOverrides): Promise<RoundsResponse>;
  /**
   * Payable: false
   * Constant: false
   * StateMutability: nonpayable
   * Type: function
   * @param _adminAddress Type: address, Indexed: false
   */
  setAdmin(_adminAddress: string, overrides?: ContractTransactionOverrides): Promise<ContractTransaction>;
  /**
   * Payable: false
   * Constant: false
   * StateMutability: nonpayable
   * Type: function
   * @param _bufferSeconds Type: uint256, Indexed: false
   * @param _intervalSeconds Type: uint256, Indexed: false
   */
  setBufferAndIntervalSeconds(
    _bufferSeconds: BigNumberish,
    _intervalSeconds: BigNumberish,
    overrides?: ContractTransactionOverrides,
  ): Promise<ContractTransaction>;
  /**
   * Payable: false
   * Constant: false
   * StateMutability: nonpayable
   * Type: function
   * @param _minBetAmount Type: uint256, Indexed: false
   */
  setMinBetAmount(_minBetAmount: BigNumberish, overrides?: ContractTransactionOverrides): Promise<ContractTransaction>;
  /**
   * Payable: false
   * Constant: false
   * StateMutability: nonpayable
   * Type: function
   * @param _operatorAddress Type: address, Indexed: false
   */
  setOperator(_operatorAddress: string, overrides?: ContractTransactionOverrides): Promise<ContractTransaction>;
  /**
   * Payable: false
   * Constant: false
   * StateMutability: nonpayable
   * Type: function
   * @param _oracle Type: address, Indexed: false
   */
  setOracle(_oracle: string, overrides?: ContractTransactionOverrides): Promise<ContractTransaction>;
  /**
   * Payable: false
   * Constant: false
   * StateMutability: nonpayable
   * Type: function
   * @param _oracleUpdateAllowance Type: uint256, Indexed: false
   */
  setOracleUpdateAllowance(_oracleUpdateAllowance: BigNumberish, overrides?: ContractTransactionOverrides): Promise<ContractTransaction>;
  /**
   * Payable: false
   * Constant: false
   * StateMutability: nonpayable
   * Type: function
   * @param _treasuryFee Type: uint256, Indexed: false
   */
  setTreasuryFee(_treasuryFee: BigNumberish, overrides?: ContractTransactionOverrides): Promise<ContractTransaction>;
  /**
   * Payable: false
   * Constant: false
   * StateMutability: nonpayable
   * Type: function
   * @param newOwner Type: address, Indexed: false
   */
  transferOwnership(newOwner: string, overrides?: ContractTransactionOverrides): Promise<ContractTransaction>;
  /**
   * Payable: false
   * Constant: true
   * StateMutability: view
   * Type: function
   */
  treasuryAmount(overrides?: ContractCallOverrides): Promise<bigint>;
  /**
   * Payable: false
   * Constant: true
   * StateMutability: view
   * Type: function
   */
  treasuryFee(overrides?: ContractCallOverrides): Promise<bigint>;
  /**
   * Payable: false
   * Constant: false
   * StateMutability: nonpayable
   * Type: function
   */
  unpause(overrides?: ContractTransactionOverrides): Promise<ContractTransaction>;
  /**
   * Payable: false
   * Constant: true
   * StateMutability: view
   * Type: function
   * @param parameter0 Type: uint256, Indexed: false
   * @param parameter1 Type: uint256, Indexed: false
   */
  userBetBear(parameter0: BigNumberish, parameter1: BigNumberish, overrides?: ContractCallOverrides): Promise<string>;
  /**
   * Payable: false
   * Constant: true
   * StateMutability: view
   * Type: function
   * @param parameter0 Type: uint256, Indexed: false
   * @param parameter1 Type: uint256, Indexed: false
   */
  userBetBull(parameter0: BigNumberish, parameter1: BigNumberish, overrides?: ContractCallOverrides): Promise<string>;
  /**
   * Payable: false
   * Constant: true
   * StateMutability: view
   * Type: function
   * @param parameter0 Type: address, Indexed: false
   * @param parameter1 Type: uint256, Indexed: false
   */
  userRounds(parameter0: string, parameter1: BigNumberish, overrides?: ContractCallOverrides): Promise<bigint>;
}
