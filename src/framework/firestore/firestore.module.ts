import { Module } from '@nestjs/common';
import { FirestoreDataServices } from './firestore-dataservices';
import { IDataServices } from 'src/core/abstract/data-services/data-service.abstract';

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
