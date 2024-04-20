import { Injectable } from '@nestjs/common';
import { ILogger } from 'src/core/abstract/logger/logger.abstract';
import { Decision, Prophecy, ProphecyHandlers } from 'src/core/entity/manipulation.entity';
import { Position } from 'src/configuration/type';
import { Prediction } from 'src/core/entity/prediction.enity';

@Injectable()
export class ManipulationService {
    private logger: ILogger;

    private prophecyHandlers: ProphecyHandlers = {
        'Lose-DOWN': this.decideUpWillWin.bind(this) as (round: Prediction) => Decision,
        'Lose-UP': this.decideDownWillWin.bind(this) as (round: Prediction) => Decision,
        'Win-DOWN': this.decideDownWillWin.bind(this) as (round: Prediction) => Decision,
        'Win-UP': this.decideUpWillWin.bind(this) as (round: Prediction) => Decision,
        'Draw-DOWN': this.nullHandler.bind(this) as (round: Prediction) => Decision,
        'Draw-UP': this.nullHandler.bind(this) as (round: Prediction) => Decision,
    } as const;

    constructor() {}

    private nullHandler(round: Prediction) {
        return {
            manipulated_closed_price: null,
            position: null,
        };
    }

    private prophecyHandler(phophecy: Prophecy) {
        return (botPosition: Position) => {
            const key: `${Prophecy}-${Position}` = `${phophecy}-${botPosition}`;

            return this.prophecyHandlers[key];
        };
    }

    private decideUpWillWin(round: Prediction) {
        const r = this.randomFromZeroToZeroPointFive();
        const price = +(round.lockPrice + r).toFixed(8);
        return {
            position: 'UP',
            manipulated_closed_price: price,
        };
    }

    private decideDownWillWin(round: Prediction) {
        const r = this.randomFromZeroToZeroPointFive();
        const price = +(round.lockPrice - r).toFixed(8);
        return {
            position: 'DOWN',
            manipulated_closed_price: price,
        };
    }

    decideWinPosition(prophecy_result: Prophecy, bot_position: Position, round: Prediction): Decision {
        if (!bot_position) {
            return {
                manipulated_closed_price: null,
                position: null,
            };
        }
        return this.prophecyHandler(prophecy_result)(bot_position)(round);
    }

    calculateBotPosition(totalBotBetsUp: number, totalBotBetsDown: number) {
        const excess = totalBotBetsUp - totalBotBetsDown;
        let position: Position;
        if (excess > 0) {
            position = 'UP';
        } else if (excess < 0) {
            position = 'DOWN';
        }

        return position;
    }

    private randomFromZeroToZeroPointFive(): number {
        const randomNumber = Math.floor(Math.random() * 50000000); // Generate random number between 0 and 50000000 (inclusive)
        const randomWith8DecimalPlaces = randomNumber / 100000000; // Divide by 100000000 to get number between 0 and 0.5 with 8 decimal places
        return +randomWith8DecimalPlaces.toFixed(8);
    }
}
