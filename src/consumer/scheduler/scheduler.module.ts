import { Module } from '@nestjs/common';
import { ManipulationModule } from 'src/use-case/manipulation/manipulation.module';

@Module({
    imports: [ManipulationModule],
})
export class SchedulerModule {}
