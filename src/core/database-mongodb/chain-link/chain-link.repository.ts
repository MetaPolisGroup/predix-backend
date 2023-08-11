import { Injectable } from '@nestjs/common';
import { BaseRepository } from '../base.repository';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { IChainlink } from './chain-link.schema';

@Injectable()
export class ChainlinkRepository extends BaseRepository<IChainlink> {
  constructor(@InjectModel('chainlink') private readonly chainlinkModel: Model<IChainlink>) {
    super(chainlinkModel);
  }
}
