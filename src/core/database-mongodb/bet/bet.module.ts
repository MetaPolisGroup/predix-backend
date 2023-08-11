import { Module } from '@nestjs/common';
import { BetRepository } from './bet.repository';
import { MongooseModule } from '@nestjs/mongoose';
import { BetSchema } from './bet.schema';

@Module({
  imports: [
    MongooseModule.forFeature([
      {
        name: 'bets',
        schema: BetSchema,
      },
    ]),
  ],
  providers: [BetRepository],
  exports: [BetRepository],
})
export class BetMongoModule {}
