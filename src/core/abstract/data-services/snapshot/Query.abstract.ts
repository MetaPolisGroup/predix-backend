export type DocumentChangeType = 'added' | 'removed' | 'modified';

export class DocumentChange<T> {
  readonly type?: DocumentChangeType;

  doc: T;

  readonly oldIndex?: number;

  readonly newIndex?: number;
}

export class DocumentChangeOrigin<T> extends DocumentChange<T> {}
