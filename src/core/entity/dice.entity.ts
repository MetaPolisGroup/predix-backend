import { Generic } from './generic.entity';

export class Dice extends Generic {
    epoch: number;

    include: boolean;

    startTimestamp: number;

    closeTimestamp: number;

    //   Result
    dice1: number;

    dice2: number;

    dice3: number;

    sum: number;

    // Amounts
    totalAmount: number;

    bullAmount: number;

    bearAmount: number;

    //   States
    cancel: boolean;

    closed: boolean;
}
