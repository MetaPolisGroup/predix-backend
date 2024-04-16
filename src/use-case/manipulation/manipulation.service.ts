import { Injectable } from '@nestjs/common';
import { IDataServices } from 'src/core/abstract/data-services/data-service.abstract';
import { ILogger } from 'src/core/abstract/logger/logger.abstract';
import { Decision, Manipulation, Prophecy, ProphecyHandlers } from 'src/core/entity/manipulation.entity';
import { HelperService } from '../helper/helper.service';
import { Position } from 'src/configuration/type';
import { Bet } from 'src/core/entity/bet.entity';
import { Prediction } from 'src/core/entity/prediction.enity';
import { ManipulationUsecases } from './manipulation.usecases';
import { BotPreferences } from 'src/core/entity/preferences.entity';

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
        return round;
    }

    private prophecyHandler(phophecy: Prophecy) {
        return (botPosition: Position) => {
            const key: `${Prophecy}-${Position}` = `${phophecy}-${botPosition}`;

            return this.prophecyHandlers[key];
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

    calculateBotPosition(botBetsDown: Bet[], botBetsUp: Bet[]) {
        const totalBotBetsDown = this.getTotalBets(botBetsDown);
        const totalBotBetsUp = this.getTotalBets(botBetsUp);
        const excess = totalBotBetsUp - totalBotBetsDown;
        let position: Position;
        if (excess > 0) {
            position = 'UP';
        } else if (excess < 0) {
            position = 'DOWN';
        }

        return position;
    }

    private getTotalBets(bets: Bet[], index = 0, total = 0): number {
        if (!bets || index >= bets.length) {
            return total;
        }
        const bet = bets[index];
        total += bet.amount - bet.refund;

        return this.getTotalBets(bets, index + 1, total);
    }

    private randomFromZeroToZeroPointFive(): number {
        const randomNumber = Math.floor(Math.random() * 50000000); // Generate random number between 0 and 50000000 (inclusive)
        const randomWith8DecimalPlaces = randomNumber / 100000000; // Divide by 100000000 to get number between 0 and 0.5 with 8 decimal places
        return +randomWith8DecimalPlaces.toFixed(8);
    }
}
