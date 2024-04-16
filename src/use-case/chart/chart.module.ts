import { Module } from '@nestjs/common';
import { ChartService } from './chart.service';

@Module({
    providers: [ChartService],
    controllers: [],
    imports: [],
    exports: [],
})
export class ChartModule {}
