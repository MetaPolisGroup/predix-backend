import { Injectable } from '@nestjs/common';
import { BaseRepository } from '../base.repository';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { IChart } from './chart.schema';

@Injectable()
export class ChartRepository extends BaseRepository<IChart> {
  constructor(@InjectModel('charts') private readonly chartModel: Model<IChart>) {
    super(chartModel);
  }
}
