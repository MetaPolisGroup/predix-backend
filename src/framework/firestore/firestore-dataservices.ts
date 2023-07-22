import { Injectable, OnApplicationBootstrap } from '@nestjs/common';
import * as admin from 'firebase-admin';
import { Bucket } from '@google-cloud/storage';
import { serviceAccount } from './service-account';
import constant from 'src/configuration';
import { IDataServices } from 'src/core/abstract/data-services/data-service.abstract';
import { Bet } from 'src/core/interface/bet/bet.entity';
import { Round } from 'src/core/interface/round/round.entity';
import { FirestoreGenericRepository } from './firestore-generic-repository';
import { User } from 'src/core/interface/user/user.interface';

@Injectable()
export class FirestoreDataServices implements IDataServices, OnApplicationBootstrap {
  //Firestore
  firestore: admin.firestore.Firestore;

  betRepo: FirestoreGenericRepository<Bet>;

  roundRepo: FirestoreGenericRepository<Round>;

  userRepo: FirestoreGenericRepository<User>;

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

    //Repos
    this.betRepo = new FirestoreGenericRepository(firestore, 'bets');
    this.roundRepo = new FirestoreGenericRepository(firestore, 'rounds');
    this.userRepo = new FirestoreGenericRepository(firestore, 'users');
  }
}
