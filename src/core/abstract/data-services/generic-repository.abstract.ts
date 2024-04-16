import { WhereFilterOp } from 'src/configuration/type/other.type';
import { DocumentChange } from './snapshot/Query.abstract';

type Fields<TObj, TField extends keyof TObj> = TField extends string
    ? TObj[TField] extends object
        ? keyof TObj[TField] extends string
            ? `${TField}.${keyof TObj[TField]}`
            : never
        : TField
    : never;

type Value<TObj, TString extends string> = TString extends keyof TObj
    ? TObj[TString]
    : TString extends `${infer Outer}.${infer Inner}`
      ? Outer extends keyof TObj
          ? Value<TObj[Outer], Inner>
          : never
      : never;

type ConditionArray<T, E extends Fields<T, keyof T>> = { field: E; operator: WhereFilterOp; value: Value<T, E> };

export abstract class IGenericRepository<T> {
    abstract getCollectionData(): Promise<T[]>;

    abstract getFirstValueCollectionData(): Promise<T>;

    abstract getCollectionDataByConditions<E extends Fields<T, keyof T>>(
        conditions: ConditionArray<T, E>[],
    ): Promise<T[]>;

    abstract getFirstValueCollectionDataByConditions<E extends Fields<T, keyof T>>(
        conditions: ConditionArray<T, E>[],
    ): Promise<T>;

    abstract getCollectionDataByConditionsAndOrderBy<E extends Fields<T, keyof T>>(
        conditions: ConditionArray<T, E>[],
        orderBy: { field: string; option: 'asc' | 'desc' }[],
    ): Promise<T[]>;

    abstract getFirstValueCollectionDataByConditionsAndOrderBy<E extends Fields<T, keyof T>>(
        conditions: ConditionArray<T, E>[],
        orderBy: { field: string; option?: 'asc' | 'desc' }[],
    ): Promise<T>;

    abstract getCollectionDataByConditionsOrderByStartAfterAndLimit<E extends Fields<T, keyof T>>(
        conditions: ConditionArray<T, E>[],
        orderBy: { field: string; option: 'asc' | 'desc' }[],
        startAfter: T,
        limit: number,
    ): Promise<T[]>;

    abstract getDocumentData(documentId: string): Promise<T>;

    abstract createDocumentData(documentData: T): Promise<T>;

    abstract updateDocumentData(documentId: string, documentData: T | object): Promise<T>;

    abstract upsertDocumentData(documentId: string, documentData: T | object): Promise<T>;

    abstract upsertDocumentDataWithResult(documentId: string, documentData: T | object);

    abstract deleteDocumentData(documentId: string): Promise<void>;

    abstract deleteDocumentByConditions<E extends Fields<T, keyof T>>(conditions: ConditionArray<T, E>[]): void;

    abstract listenToChanges(callback: (changes: DocumentChange<T>[]) => Promise<void> | void): () => void;

    abstract listenToChangesWithConditions<E extends Fields<T, keyof T>>(
        conditions: ConditionArray<T, E>[],
        callback: (changes: DocumentChange<T>[]) => Promise<void> | void,
    ): () => void;

    abstract listenToChangesWithConditionsAndOrderBy<E extends Fields<T, keyof T>>(
        conditions: ConditionArray<T, E>[],
        orderBys: { field: string; option?: 'asc' | 'desc' }[],
        callback: (changes: DocumentChange<T>[]) => Promise<void> | void,
    ): () => void;

    abstract listenToChangesWithConditionsOrigin<E extends Fields<T, keyof T>>(
        conditions: ConditionArray<T, E>[],
        callback: (changes: DocumentChange<T>[]) => Promise<void> | void,
    ): () => void;

    abstract listenToChangesOnCollection(callback: (changes: DocumentChange<T>[]) => Promise<void> | void): () => void;
}
