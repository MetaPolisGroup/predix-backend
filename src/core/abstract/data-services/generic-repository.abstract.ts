import { WhereFilterOp } from 'src/configuration/type/other.type';
import { DocumentChange } from './snapshot/Query.abstract';

export abstract class IGenericRepository<T> {
  abstract getCollectionData(): Promise<T[]>;

  abstract getFirstValueCollectionData(): Promise<T>;

  abstract getCollectionDataByConditions(conditions: { field: string; operator: WhereFilterOp; value: any }[]): Promise<T[]>;

  abstract getFirstValueCollectionDataByConditions(conditions: { field: string; operator: WhereFilterOp; value: any }[]): Promise<T>;

  abstract getCollectionDataByConditionsAndOrderBy(
    conditions: { field: string; operator: WhereFilterOp; value: any }[],
    orderBy: { field: string; option: 'asc' | 'desc' }[],
  ): Promise<T[]>;

  abstract getFirstValueCollectionDataByConditionsAndOrderBy(
    conditions: { field: string; operator: WhereFilterOp; value: any }[],
    orderBy: { field: string; option?: 'asc' | 'desc' }[],
  ): Promise<T>;

  abstract getCollectionDataByConditionsOrderByStartAfterAndLimit(
    conditions: { field: string; operator: WhereFilterOp; value: any }[],
    orderBy: { field: string; option: 'asc' | 'desc' }[],
    startAfter: T,
    limit: number,
  ): Promise<T[]>;

  abstract getDocumentData(documentId: string): Promise<T>;

  abstract getDocumentRef(documentId: string): any;

  abstract createDocumentData(documentData: T): Promise<T>;

  abstract updateDocumentData(documentId: string, documentData: T): Promise<T>;

  abstract upsertDocumentData(documentId: string, documentData: T | object): Promise<T>;

  abstract upsertDocumentDataWithResult(documentId: string, documentData: T | object);

  abstract deleteDocumentData(documentId: string): Promise<void>;

  abstract deleteDocumentByConditions(conditions: { field: string; operator: WhereFilterOp; value: any }[]): void;

  abstract listenToChangesWithConditions(
    conditions: {
      field: string;
      operator: WhereFilterOp;
      value: any;
    }[],
    callback: (changes: DocumentChange<T>[]) => Promise<void>,
  ): void;

  abstract listenToChangesWithConditionsAndOrderBy(
    conditions: { field: string; operator: WhereFilterOp; value: any }[],
    orderBys: { field: string; option?: 'asc' | 'desc' }[],
    callback: (changes: DocumentChange<T>[]) => Promise<void>,
  ): void;

  abstract listenToChangesWithConditionsOrigin(
    conditions: {
      field: string;
      operator: WhereFilterOp;
      value: any;
    }[],
    callback: (changes: DocumentChange<T>[]) => Promise<void>,
  ): void;

  abstract listenToChangesOnCollection(callback: (changes: DocumentChange<T>[]) => Promise<void>): void;
}
