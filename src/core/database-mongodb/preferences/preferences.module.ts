import { Module } from '@nestjs/common';
import { PreferencesRepository } from './preferences.repository';
import { PreferencesSchema } from './preferences.schema';
import { MongooseModule } from '@nestjs/mongoose';

@Module({
  imports: [
    MongooseModule.forFeature([
      {
        name: 'preferences',
        schema: PreferencesSchema,
      },
    ]),
  ],
  providers: [PreferencesRepository],
  exports: [PreferencesRepository],
})
export class PreferencesMongoModule {}
