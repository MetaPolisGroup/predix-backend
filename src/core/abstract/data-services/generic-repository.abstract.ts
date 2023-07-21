import { WhereFilterOp } from 'src/configuration/type/other.type';
import { DocumentChange } from './snapshot/Query.abstract';

export abstract class IGenericRepository<T> {
  abstract getCollectionData(): Promise<T[]>;

  abstract getFirstValueCollectionData(): Promise<T>;

  abstract getCollectionDataByConditions(
    conditions: { field: string; operator: WhereFilterOp; value: any }[],
  ): Promise<T[]>;

  abstract getFirstValueCollectionDataByConditions(
    conditions: { field: string; operator: WhereFilterOp; value: any }[],
  ): Promise<T>;

  abstract getDocumentData(documentId: string): Promise<T>;

  abstract getDocumentRef(documentId: string): any;

  abstract createDocumentData(documentData: T): Promise<T>;

  abstract updateDocumentData(documentId: string, documentData: T): Promise<T>;

  abstract upsertDocumentData(
    documentId: string,
    documentData: T | object,
  ): Promise<T>;

  abstract deleteDocumentData(documentId: string);

  abstract deleteDocumentByConditions(
    conditions: { field: string; operator: WhereFilterOp; value: any }[],
  );

  abstract getCollectionDataByConditionsAndOrderBy(
    conditions: { field: string; operator: WhereFilterOp; value: any }[],
    orderBy: {
      field: string;
      option: 'asc' | 'desc';
    }[],
  ): // startAfterDoc?: T
  Promise<T[]>;

  abstract getCollectionDataFirstValueAndOrderBy(
    orderBy: {
      field: string;
      option?: 'asc' | 'desc';
    }[],
  ): Promise<T>;
}
