import { Module } from '@nestjs/common';
import { DiceService } from './dice.service';
import { DiceRoundService } from './dice-round.service';

@Module({
  providers: [DiceService, DiceRoundService],
  controllers: [],
  imports: [],
  exports: [DiceService, DiceRoundService],
})
export class DiceModule {}
