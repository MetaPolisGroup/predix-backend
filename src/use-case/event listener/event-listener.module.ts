import { Module } from '@nestjs/common';
import { EventBetListener } from './event-bet.service';
import { EventRoundListener } from './event-round.service';
import { EventClaimListener } from './event.claim.service';

@Module({
  providers: [EventBetListener, EventRoundListener, EventClaimListener],
  controllers: [],
  imports: [],
  exports: [],
})
export class PredictionModule {}
