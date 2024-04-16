import { Module } from '@nestjs/common';
import { ChainlinkService } from './chainlink.service';

@Module({
    providers: [ChainlinkService],
    exports: [ChainlinkService],
})
export class ChainlinkModule {}
