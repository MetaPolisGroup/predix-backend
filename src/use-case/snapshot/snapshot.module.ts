import { Module } from '@nestjs/common';
import { PredictionSnapshotService } from './prediction/prediction.snapshot';
import { PredictionModule } from '../prediction/prediction.module';
import { PreferenceSnapshotService } from './prediction/preference.snapshot';
import { DiceSnapshotService } from './dice/dice.snapshot';
import { DiceModule } from '../dice/dice.module';
import { ContractFactoryModule } from 'src/service/contract-factory/contract-factory.module';

@Module({
  providers: [
    // Predix
    PredictionSnapshotService,
    PreferenceSnapshotService,

    // Dice
    DiceSnapshotService,
  ],
  controllers: [],
  imports: [ContractFactoryModule, PredictionModule, DiceModule],
  exports: [],
})
export class SnapshotModule { }
