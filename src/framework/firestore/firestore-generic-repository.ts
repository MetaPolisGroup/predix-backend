import { CollectionReference, DocumentData, Firestore, Query, UpdateData, WhereFilterOp } from '@google-cloud/firestore';
import { Logger } from '@nestjs/common';
import { collectionsName } from 'src/configuration/type/firebase/firebase.type';
import { IGenericRepository } from 'src/core/abstracts/data-services/generic-repository.abstract';
import { DocumentChange, DocumentChangeOrigin } from 'src/core/abstracts/data-services/snapshot/Query.abstract';

export class FirestoreGenericRepository<T extends DocumentData> implements IGenericRepository<T> {
  readonly collectionRef: CollectionReference<T>;

  private Logger: Logger;

  constructor(readonly firestore: Firestore, readonly collectionName: collectionsName) {
    this.collectionRef = this.firestore.collection(this.collectionName) as CollectionReference<T>;
    this.Logger = new Logger(FirestoreGenericRepository.name);
  }

  async getCollectionData(): Promise<T[]> {
    const collectionSnapshot = await this.collectionRef.get();

    if (collectionSnapshot.empty) {
      return null;
    }

    const data = collectionSnapshot.docs.map(doc => doc.data());

    return data;
  }

  async getFirstValueCollectionData(): Promise<T> {
    const collectionSnapshot = await this.collectionRef.get();

    if (collectionSnapshot.empty) {
      return null;
    }

    const data = collectionSnapshot.docs.map(doc => doc.data());

    return data.length > 0 ? data[0] : null;
  }

  async getCollectionDataByConditions(
    conditions: {
      field: string;
      operator: WhereFilterOp;
      value: any;
    }[],
  ): Promise<T[]> {
    let query: Query<DocumentData> = this.collectionRef;
    for (const condition of conditions) {
      query = query.where(condition.field, condition.operator, condition.value);
    }
    const collectionSnapshot = await query.get();

    if (collectionSnapshot.empty) {
      return null;
    }

    const data = collectionSnapshot.docs.map(doc => {
      if (!doc.data().id) {
        const documentData = doc.data();
        documentData.id = doc.id;
        return documentData;
      }
      return doc.data();
    }) as T[];

    return data;
  }

  async getFirstValueCollectionDataByConditions(
    conditions: {
      field: string;
      operator: WhereFilterOp;
      value: any;
    }[],
  ): Promise<T> {
    let query: Query<DocumentData> = this.collectionRef;
    for (const condition of conditions) {
      query = query.where(condition.field, condition.operator, condition.value);
    }
    const collectionSnapshot = await query.get();

    if (collectionSnapshot.empty) {
      return null;
    }

    const data = collectionSnapshot.docs.map(doc => {
      if (!doc.data().id) {
        const documentData = doc.data();
        documentData.id = doc.id;
        return documentData;
      }
      return doc.data();
    }) as T[];

    return data.length > 0 ? data[0] : null;
  }

  async getDocumentData(documentId: string): Promise<T> {
    const documentRef = this.collectionRef.doc(documentId);
    const documentSnapshot = await documentRef.get();

    if (!documentSnapshot.exists) {
      return null;
    }

    return documentSnapshot.data();
  }

  getDocumentRef(documentId: string): any {
    const documentRef = this.collectionRef.doc(documentId);

    return documentRef;
  }

  async createDocumentData(documentData: T): Promise<T> {
    const documentRef = this.collectionRef.doc();
    const id = documentRef.id;
    const document = { id, ...documentData };
    return documentRef.set(document).then(() => document as T);
  }

  async updateDocumentData(documentId: string, documentData: T): Promise<T> {
    const documentRef = this.collectionRef.doc(documentId);

    await documentRef.update(documentData as UpdateData<T>).then(() => ({ id: documentId, ...documentData } as T));
    const result: T = { id: documentId, ...documentData };
    return result;
  }

  async upsertDocumentData(documentId: string, documentData: T | object): Promise<T> {
    const documentRef = this.collectionRef.doc(documentId);
    await documentRef.set(documentData, { merge: true });

    return documentData as T;
  }

  async deleteDocumentData(documentId: string): Promise<void> {
    const documentRef = this.collectionRef.doc(documentId);
    await documentRef.delete();
  }

  deleteDocumentByConditions(conditions: { field: string; operator: WhereFilterOp; value: any }[]): void {
    let query: Query<DocumentData> = this.collectionRef;
    for (const condition of conditions) {
      query = query.where(condition.field, condition.operator, condition.value);
    }

    query
      .get()
      .then(snapshot => {
        snapshot.forEach(doc => {
          doc.ref
            .delete()
            .then(() => {
              this.Logger.log(`Document with ID ${doc.id} successfully deleted`);
            })
            .catch(error => {
              this.Logger.error(`Error deleting document with ID ${doc.id}:`, error);
            });
        });
      })
      .catch(error => {
        this.Logger.error('Error getting documents:', error);
      });
  }

  listenToChangesWithConditions(
    conditions: {
      field: string;
      operator: WhereFilterOp;
      value: any;
    }[],
    callback: (changes: DocumentChange<T>[]) => Promise<void>,
  ): void {
    let query: Query<T> = this.collectionRef;
    if (conditions) {
      for (const condition of conditions) {
        query = query.where(condition.field, condition.operator, condition.value);
      }
    }

    if (!query) {
      return null;
    }

    // eslint-disable-next-line @typescript-eslint/no-misused-promises
    query.onSnapshot(async s => {
      const result = s.docChanges().map(change => {
        const data: DocumentChange<T> = {
          doc: change.doc.data(),

          newIndex: change.newIndex,
          oldIndex: change.oldIndex,
          type: change.type,
        };

        return data;
      });

      await callback(result);
    });
  }

  listenToChangesWithConditionsOrigin(
    conditions: {
      field: string;
      operator: WhereFilterOp;
      value: any;
    }[],
    callback: (changes: DocumentChangeOrigin<T>[]) => Promise<void>,
  ): Promise<void> {
    let query: Query<T> = this.collectionRef;
    if (conditions) {
      for (const condition of conditions) {
        query = query.where(condition.field, condition.operator, condition.value);
      }
    }

    if (!query) {
      return null;
    }
    query.onSnapshot(async s => {
      const result = s.docs.map(change => {
        const data: DocumentChangeOrigin<T> = {
          doc: change.data(),
        };

        return data;
      });
      await callback(result);
    });
  }

  listenToChangesOnCollection(callback: (changes: DocumentChange<T>[]) => Promise<void>): void {
    const query: Query<T> = this.collectionRef;

    let result: DocumentChange<T>[];
    query.onSnapshot(async s => {
      result = s.docChanges().map(change => {
        const data: DocumentChange<T> = {
          doc: change.doc.data(),
          newIndex: change.newIndex,
          oldIndex: change.oldIndex,
          type: change.type,
        };
        return data;
      });
      await callback(result);
    });
  }

  async getCollectionDataByConditionsAndOrderBy(
    conditions: {
      field: string;
      operator: WhereFilterOp;
      value: any;
    }[],
    orderBys: {
      field: string;
      option?: 'asc' | 'desc';
    }[],
  ): Promise<T[]> {
    let query: Query<DocumentData> = this.collectionRef;
    
    for (const condition of conditions) {
      query = query.where(condition.field, condition.operator, condition.value);
    }
    for (const orderBy of orderBys) {
      query = query.orderBy(orderBy.field, orderBy.option);
    }

    const collectionSnapshot = await query.get();
    if (collectionSnapshot.empty) {
      return null;
    }

    const data = collectionSnapshot.docs.map(doc => {
      if (!doc.data().id) {
        const documentData = doc.data();
        documentData.id = doc.id;
        return documentData;
      }
      return doc.data();
    }) as T[];

    return data;
  }

  async getCollectionDataFirstValueAndOrderBy(
    orderBy: {
      field: string;
      option?: 'asc' | 'desc';
    }[],
  ): Promise<T> {
    let query: Query<DocumentData> = this.collectionRef;

    if (orderBy) {
      for (const ob of orderBy) {
        query = query.orderBy(ob.field, ob?.option);
      }
    }

    const querySnapshot = await query.get();
    const data = querySnapshot.docs.map(doc => doc.data()) as T[];
    return data.length > 0 ? data[0] : null;
  }
}
