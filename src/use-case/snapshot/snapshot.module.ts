import { Module } from '@nestjs/common';
import { PredictionSnapshotService } from './prediction/prediction.snapshot';
import { PredictionModule } from '../prediction/prediction.module';
import { PreferenceSnapshotService } from './prediction/preference.snapshot';
import { DiceSnapshotService } from './dice/dice.snapshot';
import { DiceModule } from '../dice/dice.module';

@Module({
  providers: [PredictionSnapshotService, PreferenceSnapshotService, DiceSnapshotService],
  controllers: [],
  imports: [PredictionModule, DiceModule],
  exports: [],
})
export class SnapshotModule {}
