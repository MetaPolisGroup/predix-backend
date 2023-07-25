import { Module } from '@nestjs/common';
import { EventBetListener } from './event-bet.service';
import { EventRoundListener } from './event-round.service';
import { EventClaimListener } from './event.claim.service';
import { PredictionModule } from '../prediction/prediction.module';

@Module({
  providers: [EventBetListener, EventRoundListener, EventClaimListener],
  controllers: [],
  imports: [PredictionModule],
  exports: [],
})
export class EventListenerModule {}
