import { OnApplicationBootstrap } from '@nestjs/common';
import * as admin from 'firebase-admin';
import { IDataServices } from 'src/core/abstract/data-services/data-service.abstract';
import { User } from 'src/core/entity/user.enity';
import { FirestoreGenericRepository } from './firestore-generic-repository';
import { CashHistory } from 'src/core/entity/cash-history.enity';
import { PointHistory } from 'src/core/entity/point-history.enity';
import { Prediction } from 'src/core/entity/prediction.enity';
import { Product } from 'src/core/entity/product.entiy';
import { IGenericRepository } from 'src/core/abstract/data-services/generic-repository.abstract';
export declare class FirestoreDataServices implements IDataServices, OnApplicationBootstrap {
    firestore: admin.firestore.Firestore;
    userRepo: FirestoreGenericRepository<User>;
    cashHistoryRepoRepo: FirestoreGenericRepository<CashHistory>;
    pointHistoryRepo: FirestoreGenericRepository<PointHistory>;
    predictionRepo: FirestoreGenericRepository<Prediction>;
    productRepo: FirestoreGenericRepository<Product>;
    constructor();
    cashHistoryRepo: IGenericRepository<CashHistory>;
    onApplicationBootstrap(): void;
}
