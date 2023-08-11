import { Module } from '@nestjs/common';
import { PredictionRepository } from './prediction.repository';
import { MongooseModule } from '@nestjs/mongoose';
import { PredictionSchema } from './prediction.schema';

@Module({
  imports: [
    MongooseModule.forFeature([
      {
        name: 'predictions',
        schema: PredictionSchema,
      },
    ]),
  ],
  providers: [PredictionRepository],
  exports: [PredictionRepository],
})
export class PredictionMongoModule {}
