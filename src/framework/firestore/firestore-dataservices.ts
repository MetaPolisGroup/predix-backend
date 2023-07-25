import { Injectable, OnApplicationBootstrap } from '@nestjs/common';
import * as admin from 'firebase-admin';
import { Bucket } from '@google-cloud/storage';
import { serviceAccount } from './service-account';
import constant from 'src/configuration';
import { IDataServices } from 'src/core/abstract/data-services/data-service.abstract';
import { User } from 'src/core/entity/user.enity';
import { FirestoreGenericRepository } from './firestore-generic-repository';
import { CashHistory } from 'src/core/entity/cash-history.enity';
import { PointHistory } from 'src/core/entity/point-history.enity';
import { Prediction } from 'src/core/entity/prediction.enity';
import { Product } from 'src/core/entity/product.entiy';
import { IGenericRepository } from 'src/core/abstract/data-services/generic-repository.abstract';
import { Bet } from 'src/core/entity/bet.entity';
import { Chainlink } from 'src/core/entity/chainlink.entity';
import { Chart } from 'src/core/entity/chart.entity';

@Injectable()
export class FirestoreDataServices implements IDataServices, OnApplicationBootstrap {
  //Firestore
  firestore: admin.firestore.Firestore;

  userRepo: FirestoreGenericRepository<User>;

  betRepo: FirestoreGenericRepository<Bet>;

  chartRepo: FirestoreGenericRepository<Chart>;

  cashHistoryRepoRepo: FirestoreGenericRepository<CashHistory>;

  pointHistoryRepo: FirestoreGenericRepository<PointHistory>;

  predictionRepo: FirestoreGenericRepository<Prediction>;

  productRepo: FirestoreGenericRepository<Product>;

  cashHistoryRepo: FirestoreGenericRepository<CashHistory>;

  chainlinkRepo: FirestoreGenericRepository<Chainlink>;

  constructor() {}

  onApplicationBootstrap(): void {
    const app = admin.initializeApp(
      {
        credential: admin.credential.cert(serviceAccount),
        storageBucket: constant.STORAGE.BUCKET,
      },
      constant.FIREBASE.NAME,
    );
    const firestore = app.firestore();
    firestore.settings({ ignoreUndefinedProperties: true });
    const bucket: Bucket = app.storage().bucket();

    //Firestore
    this.firestore = firestore;

    this.userRepo = new FirestoreGenericRepository<User>(firestore, constant.FIREBASE.COLLECTIONS.USERS);

    this.cashHistoryRepoRepo = new FirestoreGenericRepository<CashHistory>(firestore, constant.FIREBASE.COLLECTIONS.CASH_HISTORIES);

    this.pointHistoryRepo = new FirestoreGenericRepository<PointHistory>(firestore, constant.FIREBASE.COLLECTIONS.POINT_HISTORIES);

    this.predictionRepo = new FirestoreGenericRepository<Prediction>(firestore, constant.FIREBASE.COLLECTIONS.PREDICTIONS);

    this.betRepo = new FirestoreGenericRepository<Bet>(firestore, constant.FIREBASE.COLLECTIONS.BETS);

    this.productRepo = new FirestoreGenericRepository<Product>(firestore, constant.FIREBASE.COLLECTIONS.PRODUCTS);

    this.chartRepo = new FirestoreGenericRepository<Chart>(firestore, constant.FIREBASE.COLLECTIONS.CHARTS);

    this.chainlinkRepo = new FirestoreGenericRepository<Chainlink>(firestore, constant.FIREBASE.COLLECTIONS.CHAINLINKS);
  }
}
