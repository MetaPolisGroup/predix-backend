import { CollectionReference, DocumentData, Firestore, WhereFilterOp } from '@google-cloud/firestore';
import { collectionsName } from 'src/configuration/type/firebase/firebase.type';
import { IGenericRepository } from 'src/core/abstracts/data-services/generic-repository.abstract';
import { DocumentChange, DocumentChangeOrigin } from 'src/core/abstracts/data-services/snapshot/Query.abstract';
export declare class FirestoreGenericRepository<T extends DocumentData> implements IGenericRepository<T> {
    readonly firestore: Firestore;
    readonly collectionName: collectionsName;
    readonly collectionRef: CollectionReference<T>;
    private Logger;
    constructor(firestore: Firestore, collectionName: collectionsName);
    getCollectionData(): Promise<T[]>;
    getFirstValueCollectionData(): Promise<T>;
    getCollectionDataByConditions(conditions: {
        field: string;
        operator: WhereFilterOp;
        value: any;
    }[]): Promise<T[]>;
    getFirstValueCollectionDataByConditions(conditions: {
        field: string;
        operator: WhereFilterOp;
        value: any;
    }[]): Promise<T>;
    getDocumentData(documentId: string): Promise<T>;
    getDocumentRef(documentId: string): any;
    createDocumentData(documentData: T): Promise<T>;
    updateDocumentData(documentId: string, documentData: T): Promise<T>;
    upsertDocumentData(documentId: string, documentData: T | object): Promise<T>;
    deleteDocumentData(documentId: string): Promise<void>;
    deleteDocumentByConditions(conditions: {
        field: string;
        operator: WhereFilterOp;
        value: any;
    }[]): void;
    listenToChangesWithConditions(conditions: {
        field: string;
        operator: WhereFilterOp;
        value: any;
    }[], callback: (changes: DocumentChange<T>[]) => Promise<void>): void;
    listenToChangesWithConditionsOrigin(conditions: {
        field: string;
        operator: WhereFilterOp;
        value: any;
    }[], callback: (changes: DocumentChangeOrigin<T>[]) => Promise<void>): Promise<void>;
    listenToChangesOnCollection(callback: (changes: DocumentChange<T>[]) => Promise<void>): void;
    getCollectionDataByConditionsAndOrderBy(conditions: {
        field: string;
        operator: WhereFilterOp;
        value: any;
    }[], orderBys: {
        field: string;
        option?: 'asc' | 'desc';
    }[]): Promise<T[]>;
    getCollectionDataFirstValueAndOrderBy(orderBy: {
        field: string;
        option?: 'asc' | 'desc';
    }[]): Promise<T>;
}
