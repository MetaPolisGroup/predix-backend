import { Injectable } from '@nestjs/common';
import { BaseRepository } from '../base.repository';
import { IPreferences } from './preferences.schema';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';

@Injectable()
export class PreferencesRepository extends BaseRepository<IPreferences> {
  constructor(@InjectModel('preferences') private readonly preferencesModel: Model<IPreferences>) {
    super(preferencesModel);
  }
}
