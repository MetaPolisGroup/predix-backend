import { Generic } from './generic.entity';

export class Market extends Generic {
    // Infos
    epoch: number;

    include: boolean;

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
}
