import { collectionNames } from './constant';
import { Path } from './constant/storage';

const constant = {
  STORAGE_PATH: Path,
  FIREBASE: {
    NAME: 'FirestoreDataservices',
    COLLECTIONS: collectionNames,
  },
  STORAGE: {
    ACTION: 'read' as 'read' | 'write' | 'delete' | 'resumable',
    EXPIRED_DATE: {
      DAY: 17,
      MONTH: 5,
      YEAR: 2030,
    },
    BUCKET: 'gs://c300amg-d8509.appspot.com',
  },
};
export default constant;
