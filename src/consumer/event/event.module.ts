import { Module } from '@nestjs/common';
import { EventBetListener } from './prediction/event-bet.service';
import { EventRoundListener } from './prediction/event-round.service';
import { EventClaimListener } from './prediction/event.claim.service';
import { EventSetListener } from './prediction/event-set.service';

import { UserModule } from 'src/use-case/user/user.module';
import { EventMarketBetListener } from './market/event-bet-market.service';
import { EventMarketClaimListener } from './market/event-claim-market.service';
import { EventMarketSetListener } from './market/event-set-market.service';
import { EventMarketRoundListener } from './market/event-round-market.service';

import { EventDiceBetListener } from './dice/event-bet-dice.service';
import { EventDiceClaimListener } from './dice/event.claim-dice.service';
import { EventDiceRoundListener } from './dice/event-round-dice.service';
import { EventDiceSetListener } from './dice/event-set-dice.service';
import { BetModule } from 'src/use-case/bet/bet.module';
import { DiceModule } from 'src/use-case/games/dice/dice.module';
import { MarketModule } from 'src/use-case/games/market/market.module';
import { PredictionModule } from 'src/use-case/games/prediction/prediction.module';
import { StatisticModule } from 'src/use-case/statistic/statistic.module';
import { CommissionModule } from 'src/use-case/commission/commission.module';

@Module({
    providers: [
        // Predix
        EventBetListener,
        EventRoundListener,
        EventClaimListener,
        EventSetListener,

        // Market
        EventMarketBetListener,
        EventMarketClaimListener,
        EventMarketSetListener,
        EventMarketRoundListener,

        // Dice
        EventDiceBetListener,
        EventDiceClaimListener,
        EventDiceRoundListener,
        EventDiceSetListener,
    ],
    controllers: [],
    imports: [PredictionModule, UserModule, BetModule, MarketModule, DiceModule, StatisticModule, CommissionModule],
    exports: [],
})
export class EventListenerModule {}
