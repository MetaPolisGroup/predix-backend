import { Injectable } from '@nestjs/common';
import { BaseRepository } from '../base.repository';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { IPrediction } from './prediction.schema';

@Injectable()
export class PredictionRepository extends BaseRepository<IPrediction> {
  constructor(@InjectModel('predictions') private readonly predictionsModel: Model<IPrediction>) {
    super(predictionsModel);
  }
}
