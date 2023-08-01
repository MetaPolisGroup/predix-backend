import { Module } from '@nestjs/common';
import { PredictionSnapshotService } from './prediction/prediction.snapshot';
import { PredictionModule } from '../prediction/prediction.module';
import { PreferenceSnapshotService } from './prediction/preference.snapshot';

@Module({
  providers: [PredictionSnapshotService, PreferenceSnapshotService],
  controllers: [],
  imports: [PredictionModule],
  exports: [],
})
export class SnapshotModule {}
