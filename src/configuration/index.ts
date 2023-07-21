import { collectionNames } from './constant';
import { Path } from './constant/storage';
import { userType } from './constant/user';

const constant = {
  STORAGE_PATH: Path,
  FIREBASE: {
    NAME: 'FirestoreDataservices',
    COLLECTIONS: collectionNames,
  },
  REVENUE_SHARE: 5,
  REVENUE_SHARE_USER: 0,
  COMMISSIONS: 0,
  STORAGE: {
    ACTION: 'read' as 'read' | 'write' | 'delete' | 'resumable',
    EXPIRED_DATE: {
      DAY: 17,
      MONTH: 5,
      YEAR: 2030,
    },
    BUCKET: 'gs://c300amg-d8509.appspot.com',
  },
  USER: {
    TYPE: userType,
  },
};
export default constant;
