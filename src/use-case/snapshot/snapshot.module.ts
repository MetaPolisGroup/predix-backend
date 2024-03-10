import { Module } from '@nestjs/common';
import { PredictionSnapshotService } from './prediction/prediction.snapshot';
import { PredictionModule } from '../prediction/prediction.module';
import { PreferenceSnapshotService } from './prediction/preference.snapshot';
import { DiceSnapshotService } from './dice/dice.snapshot';
import { DiceModule } from '../dice/dice.module';
import { ContractFactoryModule } from 'src/service/contract-factory/contract-factory.module';
import { LeaderboardSnapshotService } from './leaderboard/leaderboard.snapshot';
import { LeaderboardModule } from '../leaderboard/leaderboard.module';

@Module({
  providers: [
    // Leaderboardl
    LeaderboardSnapshotService,

    // Predix
    PredictionSnapshotService,
    PreferenceSnapshotService,

    // Dice
    DiceSnapshotService,
  ],
  controllers: [],
  imports: [ContractFactoryModule, PredictionModule, DiceModule, LeaderboardModule],
  exports: [],
})
export class SnapshotModule { }
