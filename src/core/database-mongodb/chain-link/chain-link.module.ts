import { Module } from '@nestjs/common';
import { ChainlinkRepository } from './chain-link.repository';
import { MongooseModule } from '@nestjs/mongoose';
import { ChainLinkSchema } from './chain-link.schema';

@Module({
  imports: [
    MongooseModule.forFeature([
      {
        name: 'chainlink',
        schema: ChainLinkSchema,
      },
    ]),
  ],
  providers: [ChainlinkRepository],
  exports: [ChainlinkRepository],
})
export class ChainlinkMongoModule {}
