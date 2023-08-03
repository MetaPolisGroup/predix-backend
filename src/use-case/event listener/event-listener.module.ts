import { Module } from '@nestjs/common';
import { EventBetListener } from './event-bet.service';
import { EventRoundListener } from './event-round.service';
import { EventClaimListener } from './event.claim.service';
import { PredictionModule } from '../prediction/prediction.module';
import { EventSetListener } from './event-set.service';
import { UserModule } from '../user/user.module';
import { BetPredictionModule } from '../bet/prediction/bet-prediction.module';

@Module({
  providers: [EventBetListener, EventRoundListener, EventClaimListener, EventSetListener],
  controllers: [],
  imports: [PredictionModule, UserModule, BetPredictionModule],
  exports: [],
})
export class EventListenerModule {}
