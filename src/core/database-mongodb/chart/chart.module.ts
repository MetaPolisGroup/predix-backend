import { Module } from '@nestjs/common';
import { ChartRepository } from './chart.repository';
import { MongooseModule } from '@nestjs/mongoose/dist/mongoose.module';
import { ChartSchema } from './chart.schema';

@Module({
  imports: [
    MongooseModule.forFeature([
      {
        name: 'charts',
        schema: ChartSchema,
      },
    ]),
  ],
  providers: [ChartRepository],
  exports: [ChartRepository],
})
export class ChartMongoModule {}
