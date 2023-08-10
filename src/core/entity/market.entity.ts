export class Market {
  // Infos
  epoch: number;

  startTimestamp: number;

  closeTimestamp: number;

  result: 'Up' | 'Down ' | 'Waiting';

  // Amounts

  totalAmount: number;

  bullAmount: number;

  bearAmount: number;

  // States
  cancel: boolean;

  closed: boolean;

  delele: boolean;
}
