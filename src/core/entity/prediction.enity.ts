export class Prediction {
  epoch: string;

  startTimestamp: number;

  lockTimestamp: number;

  closeTimestamp: number;

  lockOracleId: bigint;

  closeOracleId: bigint;

  lockPrice: bigint;

  closePrice: bigint;

  totalAmount: bigint;

  bullAmount: bigint;

  bearAmount: bigint;

  closed: boolean;

  locked: boolean;

  delele: boolean;
}
