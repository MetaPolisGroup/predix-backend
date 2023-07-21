import { OnApplicationBootstrap } from '@nestjs/common';
import * as admin from 'firebase-admin';
import { IDataServices } from 'src/core/abstract/data-services/data-service.abstract';
export declare class FirestoreDataServices implements IDataServices, OnApplicationBootstrap {
    firestore: admin.firestore.Firestore;
    constructor();
    onApplicationBootstrap(): void;
}
