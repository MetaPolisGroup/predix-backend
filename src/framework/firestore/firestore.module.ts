import { Module } from '@nestjs/common';
import { IDataServices } from 'src/core/abstracts/data-services/data-service.abstract';
import { FirestoreDataServices } from './firestore-dataservices';

@Module({
  providers: [
    {
      provide: IDataServices,
      useClass: FirestoreDataServices,
    },
  ],
  exports: [IDataServices],
})
export class FirestoreModule {}
