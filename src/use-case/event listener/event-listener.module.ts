import { Module } from '@nestjs/common';
import { EventBetListener } from './event-bet.service';
import { EventRoundListener } from './event-round.service';
import { EventClaimListener } from './event.claim.service';
import { PredictionModule } from '../prediction/prediction.module';
import { EventSetListener } from './event-set.service';
import { UserModule } from '../user/user.module';

@Module({
  providers: [EventBetListener, EventRoundListener, EventClaimListener, EventSetListener],
  controllers: [],
  imports: [PredictionModule, UserModule],
  exports: [],
})
export class EventListenerModule {}
