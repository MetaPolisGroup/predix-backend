export type DocumentChangeType = 'added' | 'removed' | 'modified';
export declare class DocumentChange<T> {
    readonly type?: DocumentChangeType;
    doc: T;
    readonly oldIndex?: number;
    readonly newIndex?: number;
}
export declare class DocumentChangeOrigin<T> extends DocumentChange<T> {
}
