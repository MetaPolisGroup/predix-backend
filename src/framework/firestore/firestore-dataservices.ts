import { Injectable, OnApplicationBootstrap } from '@nestjs/common';
import * as admin from 'firebase-admin';

import { FirebaseGenericStorage } from './storage/firebase-storage-generic';
import { Bucket } from '@google-cloud/storage';

import { serviceAccount } from './service-account';
import constant from 'src/configuration';
import { IDataServices } from 'src/core/abstract/data-services/data-service.abstract';

@Injectable()
export class FirestoreDataServices
  implements IDataServices, OnApplicationBootstrap
{
  //Firestore
  firestore: admin.firestore.Firestore;

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
  }
}
