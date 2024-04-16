import {
    CollectionReference,
    DocumentData,
    Firestore,
    Query,
    QueryDocumentSnapshot,
    UpdateData,
    WhereFilterOp,
} from '@google-cloud/firestore';
import { collectionsName } from 'src/configuration/type/firebase/firebase.type';
import { IGenericRepository } from 'src/core/abstract/data-services/generic-repository.abstract';
import { DocumentChange, DocumentChangeOrigin } from 'src/core/abstract/data-services/snapshot/Query.abstract';
import { CustomLogger } from '../logger/logger.framework';
import { Generic } from 'src/core/entity/generic.entity';

export class FirestoreGenericRepository<T extends Generic> implements IGenericRepository<T> {
    readonly collectionRef: CollectionReference<T>;

    private Logger: CustomLogger;

    constructor(
        readonly firestore: Firestore,
        readonly collectionName: collectionsName,
    ) {
        this.collectionRef = this.firestore.collection(this.collectionName) as CollectionReference<T>;
        this.Logger = new CustomLogger('Firebase', 'EA3323');
    }

    private queryBuilder(query: Query<T>, conditions: { field: string; operator: WhereFilterOp; value: any }[]) {
        for (const condition of conditions) {
            query = query.where(condition.field, condition.operator, condition.value);
        }

        return query;
    }

    private orderBysBuilder(query: Query<T>, orderBys: { field: string; option?: 'asc' | 'desc' }[]) {
        for (const orderBy of orderBys) {
            query = query.orderBy(orderBy.field, orderBy.option);
        }

        return query;
    }

    private fixDataFromCollection(collectionSnapshot: QueryDocumentSnapshot<T>[]): T[] {
        const data = collectionSnapshot.map(doc => {
            if (!doc.data().id) {
                const documentData = doc.data();
                documentData.id = doc.id;
                return documentData;
            }

            return doc.data();
        });

        return data;
    }

    getDocumentRef(documentId: string): any {
        const documentRef = this.collectionRef.doc(documentId);

        return documentRef;
    }

    // Get
    async getCollectionData(): Promise<T[]> {
        const collectionSnapshot = await this.collectionRef.get();
        if (collectionSnapshot.docs) {
            return null;
        }

        const data = this.fixDataFromCollection(collectionSnapshot.docs);

        return data;
    }

    async getCollectionDataByConditions(
        conditions: { field: string; operator: WhereFilterOp; value: any }[],
    ): Promise<T[]> {
        let query: Query<T> = this.collectionRef;

        for (const condition of conditions) {
            query = query.where(condition.field, condition.operator, condition.value);
        }

        const collectionSnapshot = await query.get();
        if (collectionSnapshot.empty) {
            return null;
        }

        const data = this.fixDataFromCollection(collectionSnapshot.docs);

        return data;
    }

    async getFirstValueCollectionData(): Promise<T> {
        const collectionSnapshot = await this.collectionRef.get();
        if (collectionSnapshot.empty) {
            return null;
        }

        const data = this.fixDataFromCollection(collectionSnapshot.docs);

        if (data) {
            return data.length > 0 ? data[0] : null;
        }
    }

    async getFirstValueCollectionDataByConditions(
        conditions: { field: string; operator: WhereFilterOp; value: any }[],
    ): Promise<T> {
        const data = await this.getCollectionDataByConditions(conditions);
        if (data) {
            return data.length > 0 ? data[0] : null;
        }

        return null;
    }

    async getCollectionDataByConditionsAndOrderBy(
        conditions: { field: string; operator: WhereFilterOp; value: any }[],
        orderBys: { field: string; option?: 'asc' | 'desc' }[],
    ): Promise<T[]> {
        let query: Query<T> = this.collectionRef;

        query = this.queryBuilder(query, conditions);

        query = this.orderBysBuilder(query, orderBys);

        const collectionSnapshot = await query.get();
        if (collectionSnapshot.empty) {
            return null;
        }

        const data = this.fixDataFromCollection(collectionSnapshot.docs);

        return data;
    }

    async getCollectionDataByConditionsOrderByStartAfterAndLimit(
        conditions: { field: string; operator: WhereFilterOp; value: any }[],
        orderBys: { field: string; option?: 'asc' | 'desc' }[],
        startAfter: T,
        limit: number,
    ): Promise<T[]> {
        let query: Query<T> = this.collectionRef;

        query = this.queryBuilder(query, conditions);

        query = this.orderBysBuilder(query, orderBys);

        let tmp;
        if (startAfter) {
            tmp = await this.collectionRef.doc(startAfter.id).get();
        }

        const collectionSnapshot = startAfter
            ? await query.startAfter(tmp).limit(limit).get()
            : await query.limit(limit).get();
        if (collectionSnapshot.empty) {
            return null;
        }

        const data = this.fixDataFromCollection(collectionSnapshot.docs);

        return data;
    }

    async getFirstValueCollectionDataByConditionsAndOrderBy(
        conditions: { field: string; operator: WhereFilterOp; value: any }[],
        orderBy: { field: string; option?: 'asc' | 'desc' }[],
    ): Promise<T> {
        const data = await this.getCollectionDataByConditionsAndOrderBy(conditions, orderBy);
        if (data) {
            return data.length > 0 ? data[0] : null;
        }

        return null;
    }

    async getDocumentData(documentId: string): Promise<T> {
        const documentRef = this.collectionRef.doc(documentId);
        const documentSnapshot = await documentRef.get();
        if (!documentSnapshot.exists) {
            return null;
        }

        return documentSnapshot.data();
    }

    // Create
    async createDocumentData(documentData: T): Promise<T> {
        const documentRef = this.collectionRef.doc();
        const id = documentRef.id;
        const document = { id, ...documentData };
        return documentRef.set(document).then(() => document as T);
    }

    // Update & Upsert
    async updateDocumentData(documentId: string, documentData: T): Promise<T> {
        const documentRef = this.collectionRef.doc(documentId);
        await documentRef.update(documentData as UpdateData<T>).then(() => ({ id: documentId, ...documentData }) as T);
        const result: T = { id: documentId, ...documentData };
        return result;
    }

    async upsertDocumentData(documentId: string, documentData: T | object): Promise<T> {
        const documentRef = this.collectionRef.doc(documentId);

        await documentRef.set(documentData, { merge: true });
        return documentData as T;
    }

    async upsertDocumentDataWithResult(documentId: string, documentData: T | object) {
        const documentRef = this.collectionRef.doc(documentId);
        const result = await documentRef.set(documentData, { merge: true });
        return result;
    }

    // Delete
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

    // Listen

    listenToChanges(callback: (changes: DocumentChange<T>[]) => Promise<void> | void): () => void {
        const unSubcribe = this.collectionRef.onSnapshot(async s => {
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

        return unSubcribe;
    }

    listenToChangesWithConditions(
        conditions: { field: string; operator: WhereFilterOp; value: any }[],
        callback: (changes: DocumentChange<T>[]) => Promise<void> | void,
    ): () => void {
        let query: Query<T> = this.collectionRef;
        if (conditions) {
            query = this.queryBuilder(query, conditions);
        }
        if (!query) {
            return null;
        }

        const unSubcribe = query.onSnapshot(async s => {
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

        return unSubcribe;
    }

    listenToChangesWithConditionsAndOrderBy(
        conditions: { field: string; operator: WhereFilterOp; value: any }[],
        orderBys: { field: string; option?: 'asc' | 'desc' }[],
        callback: (changes: DocumentChange<T>[]) => Promise<void> | void,
    ): () => void {
        let query: Query<T> = this.collectionRef;
        if (conditions) {
            query = this.queryBuilder(query, conditions);
        }

        if (orderBys) {
            query = this.orderBysBuilder(query, orderBys);
        }

        if (!query) {
            return null;
        }

        const unSubcribe = query.onSnapshot(async s => {
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

        return unSubcribe;
    }

    listenToChangesWithConditionsOrigin(
        conditions: { field: string; operator: WhereFilterOp; value: any }[],
        callback: (changes: DocumentChangeOrigin<T>[]) => Promise<void> | void,
    ): () => void {
        let query: Query<T> = this.collectionRef;
        if (conditions) {
            query = this.queryBuilder(query, conditions);
        }
        if (!query) {
            return null;
        }

        const unSubcribe = query.onSnapshot(async s => {
            const result = s.docs.map(change => {
                const data: DocumentChangeOrigin<T> = {
                    doc: change.data(),
                };

                return data;
            });
            await callback(result);
        });

        return unSubcribe;
    }

    listenToChangesOnCollection(callback: (changes: DocumentChange<T>[]) => Promise<void> | void): () => void {
        const query: Query<T> = this.collectionRef;
        let result: DocumentChange<T>[];
        const unSubcribe = query.onSnapshot(async s => {
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

        return unSubcribe;
    }
}
