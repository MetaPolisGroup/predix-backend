import { Generic } from './generic.entity';

export class Chainlink extends Generic {
    price: number;
}

export class ExecuteData {
    roundId: number;

    price: number;
}

export class ChainlinkData {
    roundId: number;

    answer: number;

    started_at: number;

    updated_at: number;

    answered_in_Round: number;
}
