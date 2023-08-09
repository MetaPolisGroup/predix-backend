import { Module } from '@nestjs/common';
import { EventBetListener } from './event-bet.service';
import { EventRoundListener } from './event-round.service';
import { EventClaimListener } from './event.claim.service';
import { EventSetListener } from './event-set.service';
import { BetPredictionModule } from 'src/use-case/bet/prediction/bet-prediction.module';
import { PredictionModule } from 'src/use-case/prediction/prediction.module';
import { UserModule } from 'src/use-case/user/user.module';

@Module({
  providers: [EventBetListener, EventRoundListener, EventClaimListener, EventSetListener],
  controllers: [],
  imports: [PredictionModule, UserModule, BetPredictionModule],
  exports: [],
})
export class EventListenerModule {}
