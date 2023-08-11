import { Module } from '@nestjs/common';
import { EventBetListener } from './prediction/event-bet.service';
import { EventRoundListener } from './prediction/event-round.service';
import { EventClaimListener } from './prediction/event.claim.service';
import { EventSetListener } from './prediction/event-set.service';
import { PredictionModule } from 'src/use-case/prediction/prediction.module';
import { UserModule } from 'src/use-case/user/user.module';
import { EventMarketBetListener } from './market/event-bet-market.service';
import { EventMarketClaimListener } from './market/event-claim-market.service';
import { EventMarketSetListener } from './market/event-set-market.service';
import { EventMarketRoundListener } from './market/event-round-market.service';
import { BetModule } from '../bet/bet.module';
import { MarketModule } from '../market/market.module';

@Module({
  providers: [
    EventBetListener,
    EventRoundListener,
    EventClaimListener,
    EventSetListener,
    EventMarketBetListener,
    EventMarketClaimListener,
    EventMarketSetListener,
    EventMarketRoundListener,
  ],
  controllers: [],
  imports: [PredictionModule, UserModule, BetModule, MarketModule],
  exports: [],
})
export class EventListenerModule {}
