import { Module } from '@nestjs/common';
import { ChainlinkTaskService } from './chainlink/chainlink-task.service';
import { PredictionTaskService } from './prediction/prediction-task.service';

@Module({
    // providers: [ChainlinkTaskService, PredictionTaskService],
})
export class TaskModule {}
